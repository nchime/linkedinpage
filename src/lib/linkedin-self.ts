import puppeteer, { Browser, Page } from 'puppeteer';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdir, readdir, readFile, rm } from 'fs/promises';
import * as cheerio from 'cheerio';
import { LinkedInProfile } from '@/types';
import { parseLinkedInPdf } from '@/lib/pdf-parser';
import { parseLinkedInHtml } from '@/lib/scraper';
import { ensureDataDir, clearSession, hasSavedSession, CHROME_PROFILE_DIR } from '@/lib/linkedin-session';

export class LinkedInNotLoggedInError extends Error {
  constructor() {
    super('LinkedIn session not found or expired. Please log in again.');
    this.name = 'LinkedInNotLoggedInError';
  }
}

export class LinkedInPdfUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LinkedInPdfUnavailableError';
  }
}

const LOGIN_TIMEOUT_MS = 3 * 60 * 1000;
const PDF_DOWNLOAD_TIMEOUT_MS = 90 * 1000;
const OWN_PROFILE_URL = 'https://www.linkedin.com/in/me/';

let lock: Promise<void> = Promise.resolve();

async function withLinkedInBrowser<T>(fn: () => Promise<T>): Promise<T> {
  const prev = lock;
  let release!: () => void;
  lock = new Promise<void>((resolve) => { release = resolve; });
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchBrowser(headless: boolean): Promise<Browser> {
  return puppeteer.launch({
    headless,
    userDataDir: CHROME_PROFILE_DIR,
    defaultViewport: headless ? { width: 1280, height: 900 } : null,
    args: headless ? [] : ['--start-maximized'],
  });
}

async function hasLiAtCookie(page: Page): Promise<boolean> {
  const cookies = await page.cookies();
  return cookies.some((c) => c.name === 'li_at');
}

async function isAuthWall(page: Page): Promise<boolean> {
  const url = page.url();
  if (url.includes('authwall') || url.includes('/login')) return true;
  return !(await hasLiAtCookie(page));
}

export async function loginToLinkedIn(): Promise<{ loggedIn: boolean; canceled?: boolean }> {
  return withLinkedInBrowser(async () => {
    await ensureDataDir();

    const browser = await launchBrowser(false);
    let windowClosed = false;
    browser.on('disconnected', () => { windowClosed = true; });

    try {
      const page = await browser.newPage();
      await page.goto('https://www.linkedin.com/', {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });

      if (await hasLiAtCookie(page)) {
        return { loggedIn: true };
      }

      const deadline = Date.now() + LOGIN_TIMEOUT_MS;
      while (Date.now() < deadline) {
        if (windowClosed) return { loggedIn: false, canceled: true };
        if (await hasLiAtCookie(page)) return { loggedIn: true };
        await sleep(500);
      }

      return { loggedIn: false };
    } finally {
      await browser.close().catch(() => {});
    }
  });
}

export async function logoutLinkedIn(): Promise<boolean> {
  return withLinkedInBrowser(async () => {
    await clearSession();
    return !(await hasSavedSession());
  });
}

export async function fetchOwnProfile(): Promise<LinkedInProfile> {
  return withLinkedInBrowser(async () => {
    await ensureDataDir();

    const browser = await launchBrowser(true);
    const downloadDir = join(tmpdir(), `linkedin-pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(downloadDir, { recursive: true });

    try {
      const page = await browser.newPage();
      const client = await page.createCDPSession();
      await client.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadDir,
      });

      await page.goto(OWN_PROFILE_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });

      if (await isAuthWall(page)) {
        throw new LinkedInNotLoggedInError();
      }

      try {
        await triggerSaveToPdf(page);
        const pdfPath = await waitForPdfDownload(downloadDir, PDF_DOWNLOAD_TIMEOUT_MS);
        const buffer = await readFile(pdfPath);
        return await parseLinkedInPdf(buffer);
      } catch (pdfError) {
        if (pdfError instanceof LinkedInNotLoggedInError) throw pdfError;
        const html = await page.content();
        const $ = cheerio.load(html);
        const profile = parseLinkedInHtml($, page.url());
        if (profile.fullName === 'Unknown' && profile.experiences.length === 0 && profile.education.length === 0) {
          throw new LinkedInPdfUnavailableError(
            '프로필 PDF를 생성하지 못했고 HTML 파싱에도 실패했습니다. 잠시 후 다시 시도해 주세요.'
          );
        }
        return profile;
      }
    } finally {
      await browser.close().catch(() => {});
      await rm(downloadDir, { recursive: true, force: true }).catch(() => {});
    }
  });
}

async function triggerSaveToPdf(page: Page): Promise<void> {
  await clickMoreButton(page);
  await clickMenuAction(page, ['PDF로 저장', 'Save to PDF']);
}

async function clickMoreButton(page: Page): Promise<void> {
  await page.waitForSelector('[id*="Topcard"]', { timeout: 30_000 });

  const clicked = await page.evaluate(() => {
    const card = document.querySelector('[id*="Topcard"]');
    const scope = card || document;
    const btn = [...scope.querySelectorAll('button')].find((b) => {
      const label = b.getAttribute('aria-label') || '';
      const text = (b.textContent || '').trim();
      return label.includes('더보기')
        || label.includes('More actions')
        || label.includes('More')
        || text === '더보기'
        || text === 'More';
    });
    if (!btn) return false;
    btn.scrollIntoView({ block: 'center' });
    (btn as HTMLElement).click();
    return true;
  });

  if (!clicked) {
    throw new LinkedInPdfUnavailableError('More/더보기 button not found on profile page');
  }
}

async function clickMenuAction(page: Page, texts: string[]): Promise<void> {
  await page.waitForSelector('div[role="menu"]', { timeout: 10_000 });

  const clicked = await page.evaluate((targets) => {
    for (const menu of [...document.querySelectorAll('div[role="menu"]')]) {
      const item = [...menu.querySelectorAll('[role="menuitem"]')].find((i) => {
        const itemText = (i.textContent || '').trim();
        const label = i.getAttribute('aria-label') || '';
        return targets.some((t: string) => itemText.includes(t) || label.includes(t));
      });
      if (item) {
        (item as HTMLElement).click();
        return true;
      }
    }
    return false;
  }, texts);

  if (!clicked) {
    throw new LinkedInPdfUnavailableError(`Menu item "${texts.join('", "')}" not found`);
  }
}

async function waitForPdfDownload(dir: string, timeoutMs: number): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const files = await readdir(dir);
    const pdf = files.find(
      (f) => f.toLowerCase().endsWith('.pdf') && !f.toLowerCase().endsWith('.crdownload')
    );
    if (pdf) return join(dir, pdf);
    await sleep(500);
  }
  throw new LinkedInPdfUnavailableError('Timed out waiting for profile PDF download');
}