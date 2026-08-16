import { join } from 'path';
import { mkdir, access } from 'fs/promises';

export const LINKEDIN_DATA_DIR = join(process.cwd(), '.linkedin');
export const CHROME_PROFILE_DIR = join(LINKEDIN_DATA_DIR, 'chrome-profile');

export async function ensureDataDir(): Promise<void> {
  await mkdir(LINKEDIN_DATA_DIR, { recursive: true });
}

export async function hasSavedSession(): Promise<boolean> {
  try {
    await access(CHROME_PROFILE_DIR);
    return true;
  } catch {
    return false;
  }
}