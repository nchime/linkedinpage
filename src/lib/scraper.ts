import { LinkedInProfile } from '@/types';
import * as cheerio from 'cheerio';

export async function scrapeLinkedInProfile(url: string): Promise<LinkedInProfile> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn profile: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const profile = parseLinkedInHtml($, url);
    return profile;
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
    throw error;
  }
}

export function parseLinkedInHtml($: cheerio.CheerioAPI, url: string): LinkedInProfile {
  const profileUrl = url.replace(/\/$/, '');
  
  const name = $('h1.text-heading-xlarge').first().text().trim() || 
               $('h1').first().text().trim() ||
               'Unknown';

  const headline = $('div.text-body-medium.break-words').first().text().trim() ||
                   $('div.text-body-medium').first().text().trim() ||
                   '';

  const location = $('span.text-body-small.inline.t-black--light.break-words').first().text().trim() ||
                   $('span.t-black--light').first().text().trim() ||
                   '';

  const summary = $('section.summary .inline-show-more-text').text().trim() ||
                  $('section.about .pv-about__summary-text').text().trim() ||
                  '';

  const experiences: LinkedInProfile['experiences'] = [];
  $('section#experience li').each((index, element) => {
    const $el = $(element);
    const title = $el.find('span[aria-hidden="true"]').first().text().trim();
    const company = $el.find('span.t-14.t-normal').first().text().trim();
    const dateRange = $el.find('span.pv-entity__date-range span[aria-hidden="true"]').text().trim();
    const description = $el.find('p.pv-entity__description').text().trim();
    
    if (title || company) {
      const dates = parseDateRange(dateRange);
      experiences.push({
        id: `exp-${index}`,
        title: title || 'Unknown Position',
        company: company || 'Unknown Company',
        startDate: dates.start,
        endDate: dates.end,
        current: dateRange.toLowerCase().includes('present'),
        description: description || '',
      });
    }
  });

  const education: LinkedInProfile['education'] = [];
  $('section#education li').each((index, element) => {
    const $el = $(element);
    const school = $el.find('span[aria-hidden="true"]').first().text().trim();
    const degree = $el.find('span.t-14.t-normal').first().text().trim();
    const dateRange = $el.find('span.pv-entity__date-range span[aria-hidden="true"]').text().trim();
    
    if (school) {
      const dates = parseDateRange(dateRange);
      education.push({
        id: `edu-${index}`,
        school: school || 'Unknown School',
        degree: degree || '',
        field: '',
        startDate: dates.start,
        endDate: dates.end,
      });
    }
  });

  const skills: LinkedInProfile['skills'] = [];
  $('section#skills li').each((index, element) => {
    const $el = $(element);
    const skillName = $el.find('span[aria-hidden="true"]').first().text().trim();
    
    if (skillName) {
      skills.push({
        id: `skill-${index}`,
        name: skillName,
        endorsements: 0,
      });
    }
  });

  return {
    id: extractProfileId(url),
    fullName: name,
    headline: headline,
    summary: summary,
    location: location,
    profileUrl: profileUrl,
    experiences: experiences,
    education: education,
    skills: skills,
  };
}

function parseDateRange(dateRange: string): { start: string; end: string } {
  const datePattern = /(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4}|Present)/i;
  const match = dateRange.match(datePattern);
  
  if (match) {
    return {
      start: formatDate(match[1]),
      end: match[2].toLowerCase() === 'present' ? '' : formatDate(match[2]),
    };
  }
  
  return { start: '', end: '' };
}

function formatDate(dateStr: string): string {
  const months: Record<string, string> = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };
  
  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    const month = months[parts[0].toLowerCase().slice(0, 3)] || '01';
    const year = parts[1];
    return `${year}-${month}`;
  }
  
  return dateStr;
}

function extractProfileId(url: string): string {
  const match = url.match(/\/in\/([^/]+)/);
  return match ? match[1] : 'unknown';
}
