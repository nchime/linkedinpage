import { LinkedInProfile, Experience, Education, Skill, Certification } from '@/types';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

import pdfTextExtract from 'pdf-text-extract';

export async function parseLinkedInPdf(buffer: Buffer): Promise<LinkedInProfile> {
  const tmpPath = join(tmpdir(), `linkedin-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);
  
  try {
    await writeFile(tmpPath, buffer);
    const text = await extractTextFromFile(tmpPath);
    return parseProfileFromText(text);
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

function extractTextFromFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    pdfTextExtract(filePath, (err: Error | null, pages: string[]) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(pages.join('\n'));
    });
  });
}

export function parseProfileFromText(text: string): LinkedInProfile {
  const lines = text.split('\n').filter(l => l.trim());

  return {
    id: extractProfileId(text),
    fullName: extractName(lines),
    headline: extractHeadline(lines),
    summary: extractSummary(text),
    location: extractLocation(text),
    profileUrl: extractProfileUrl(text),
    experiences: extractExperiences(text),
    education: extractEducation(text),
    skills: extractSkills(text),
    certifications: extractCertifications(text),
  };
}

function extractProfileId(text: string): string {
  const match = text.match(/linkedin\.com\/in\/([^\/\s\?]+)/i);
  return match ? match[1] : 'unknown';
}

function extractName(lines: string[]): string {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 2) continue;
    
    // Skip headers and known sections
    if (trimmed.match(/^(?:linkedin|profile|connection|about|experience|education|skills|contact|accomplishment|간단프로필|대표 보유기술|Certifications|경력|학력|연락처)/i)) {
      continue;
    }
    
    // Skip phone numbers (start with digits)
    if (/^\d/.test(trimmed)) continue;
    
    // Skip email addresses
    if (/@/.test(trimmed)) continue;
    
    // Skip URLs
    if (/^(?:www\.|http)/i.test(trimmed)) continue;
    
    // Skip lines with parentheses like "(Mobile)"
    if (/^\(.+\)$/.test(trimmed)) continue;
    
    // Valid name: Korean characters or English letters, reasonable length
    if (trimmed.length >= 2 && trimmed.length <= 30) {
      // Korean name (2-4 chars) or English name
      if (/^[가-힣]{2,5}$/.test(trimmed) || /^[A-Za-z\s]{2,30}$/.test(trimmed)) {
        return trimmed;
      }
    }
  }
  return 'Unknown';
}

function extractHeadline(lines: string[]): string {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/(?:Engineer|Developer|Manager|Director|Lead|Architect|Consultant|Specialist|디렉터|매니저|연구원|부장|수석|팀장)/i)) {
      // The -layout export merges the left-column email and right-column
      // headline onto one row; keep only the right-column portion.
      if (line.includes('@')) {
        const parts = line.split(/\s{3,}/);
        if (parts.length > 1) return parts.pop()!.trim();
      }
      return line;
    }
  }
  if (lines.length > 1) {
    return lines[1].trim();
  }
  return '';
}

function extractSummary(text: string): string {
  const lines = text.split('\n');

  // Korean exports render "간단프로필" as a right-column header. Depending on
  // the export layout it may sit alone on a line or share a row with the
  // left-column contact/skills content, so match it anywhere in the line.
  const headerIdx = lines.findIndex(l => l.includes('간단프로필'));

  // English exports render the About section as a single column.
  if (headerIdx === -1) {
    const match = text.match(/(?:About|Summary)\s*\n([\s\S]*?)(?=\n\s*(?:Experience|Education|Skills|Contact|Accomplishments|Licenses|Certifications)\b)/i);
    return match ? match[1].replace(/\s*\n\s*/g, ' ').trim() : '';
  }

  // The intro text sits in the right column, interleaved with the left-column
  // skills/certifications on the same rows. Slice each line at the header's
  // column offset to keep only the intro text.
  const column = lines[headerIdx].indexOf('간단프로필');
  const rightColumn = column >= 5;
  const frags: string[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // NOTE: JS \b is ASCII-only, so it never matches after Korean characters.
    // Use a negative lookahead so Korean and English section headers both stop.
    const sectionStart = /^(?:주요 기술\s*Spec|경력|학력|간단프로필|대표 보유기술|Certifications|Experience|Education|Skills|Contact|Accomplishments)(?![가-힣A-Za-z0-9])/i;

    if (rightColumn) {
      const slice = line.slice(Math.min(column, line.length)).trim();
      if (!slice) continue;
      if (sectionStart.test(slice)) break;
      frags.push(slice);
    } else {
      const trimmed = line.trim();
      if (sectionStart.test(trimmed)) break;
      frags.push(trimmed);
    }
  }

  return frags.join(' ').trim();
}

function extractLocation(text: string): string {
  const patterns = [
    /대한민국\s+[^\n]+/,
    /Seoul,?\s*Republic\s*of\s*Korea/i,
    /(?:서울|인천|경기|부산|대구|광주|대전|울산|세종)[^\n]*/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim().substring(0, 100);
    }
  }
  return '';
}

function extractProfileUrl(text: string): string {
  const match = text.match(/(https?:\/\/[^\s]*linkedin\.com\/in\/[^\s\?]+)/i);
  return match ? match[1] : '';
}

function isDateLine(line: string): boolean {
  return /\d{4}년?\s*\d{1,2}월?\s*[-–]\s*(?:Present|현재|\d{4}년?\s*\d{1,2}월?)/i.test(line)
    || /\d{4}\.\d{1,2}\s*[-–]\s*(?:Present|현재|\d{4}\.\d{1,2})/i.test(line)
    || /\w+\s+\d{4}\s*[-–]\s*(?:Present|현재|\w+\s+\d{4})/i.test(line);
}

function isDescriptionLine(line: string): boolean {
  return /^-\s/.test(line) 
    || /^\[주요 수행 업무\]/.test(line)
    || /^Page\s+\d+\s+of\s+\d+$/i.test(line)
    || /개발환경\s*[:：]/.test(line)
    || /역할\s*[:：]/.test(line)
    || /관련회사\s*[:：]/.test(line)
    || /특허\s*[:：]/.test(line);
}

function isLocationLine(line: string): boolean {
  return /대한민국|Seoul|Republic|서울|인천|경기|부산|대구|광주|대전|울산|세종|강남|서초/i.test(line)
    && !/\d{4}/.test(line);
}

function extractExperiences(text: string): Experience[] {
  const experiences: Experience[] = [];
  
  const section = text.match(/(?:경력|Experience)\s*\n([\s\S]*?)(?=\n(?:학력|Education|Skills|Contact|Accomplishments|$))/i);
  if (!section) return experiences;

  const sectionText = section[1];
  const lines = sectionText.split('\n').filter(l => l.trim());
  
  const dateLineIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (isDateLine(lines[i].trim())) {
      dateLineIndices.push(i);
    }
  }
  
  for (let d = 0; d < dateLineIndices.length; d++) {
    const dateLineIdx = dateLineIndices[d];
    const nextDateIdx = d + 1 < dateLineIndices.length ? dateLineIndices[d + 1] : lines.length;
    
    const dateLine = lines[dateLineIdx].trim();
    const dateMatch = dateLine.match(/(\d{4}년?\s*\d{1,2}월?)\s*[-–]\s*(Present|현재|\d{4}년?\s*\d{1,2}월?)/i)
      || dateLine.match(/(\d{4}\.\d{1,2})\s*[-–]\s*(Present|현재|\d{4}\.\d{1,2})/i)
      || dateLine.match(/(\w+\s+\d{4})\s*[-–]\s*(Present|현재|\w+\s+\d{4})/i);
    
    if (!dateMatch) continue;
    
    const isPresent = dateMatch[2].toLowerCase() === 'present' || dateMatch[2] === '현재';
    
    const beforeDate: string[] = [];
    for (let i = dateLineIdx - 1; i >= 0 && beforeDate.length < 2; i--) {
      const line = lines[i].trim();
      if (!line || isDateLine(line)) break;
      if (isDescriptionLine(line)) continue;
      if (isLocationLine(line)) continue;
      beforeDate.unshift(line);
    }
    
    let company = '';
    let title = '';
    let location = '';
    
    if (beforeDate.length >= 2) {
      company = beforeDate[0];
      title = beforeDate[1];
    } else if (beforeDate.length === 1) {
      title = beforeDate[0];
    }
    
    const descLines: string[] = [];
    for (let i = dateLineIdx + 1; i < nextDateIdx; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (isLocationLine(line)) {
        if (!location) location = line;
        continue;
      }
      if (/^\[주요 수행 업무\]/.test(line)) continue;
      if (/^Page\s+\d+\s+of\s+\d+$/i.test(line)) continue;
      descLines.push(line);
    }
    
    const description = joinSplitLines(descLines).trim();
    
    if (company || title) {
      experiences.push({
        id: `exp-${experiences.length}`,
        company,
        title,
        startDate: dateMatch[1],
        endDate: isPresent ? '' : dateMatch[2],
        current: isPresent,
        description,
        location: location || undefined,
      });
    }
  }

  return experiences;
}

function joinSplitLines(lines: string[]): string {
  const result: string[] = [];
  let current = '';
  
  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (current) result.push(current);
      current = line;
    } else if (current && (current.endsWith('-') || (!current.endsWith('.') && !current.endsWith(')') && !/[가-힣]$/.test(current)))) {
      current += line;
    } else if (current) {
      current += ' ' + line;
    } else {
      current = line;
    }
  }
  
  if (current) result.push(current);
  return result.join('\n');
}

function extractEducation(text: string): Education[] {
  const education: Education[] = [];
  
  const section = text.match(/(?:학력|Education)\s*\n([\s\S]*?)(?=\n(?:Skills|Contact|Accomplishments|$))/i);
  if (!section) return education;

  const sectionText = section[1];
  const lines = sectionText.split('\n').filter(l => l.trim());
  
  let current: Partial<Education> | null = null;
  
  const saveEducation = () => {
    if (current && current.school) {
      education.push({
        id: `edu-${education.length}`,
        school: current.school,
        degree: current.degree || '',
        field: current.field || '',
        startDate: current.startDate || '',
        endDate: current.endDate || '',
      });
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    const dateMatch = trimmed.match(/\((\d{4})\s*-\s*(\d{4})\)/);
    const dateMatch2 = trimmed.match(/(\d{4})\s*[-–]\s*(\d{4})/);
    
    const foundDate = dateMatch || dateMatch2;
    
    if (foundDate) {
      saveEducation();
      
      const beforeDate = trimmed.replace(foundDate[0], '').trim();
      const parts = parseEducationSchoolDegree(beforeDate);
      
      current = {
        school: parts.school,
        degree: parts.degree,
        field: parts.field,
        startDate: foundDate[1],
        endDate: foundDate[2],
      };
      continue;
    }

    if (!current) {
      const parts = parseEducationSchoolDegree(trimmed);
      if (parts.school) {
        current = {
          school: parts.school,
          degree: parts.degree,
          field: parts.field,
        };
      }
      continue;
    }

    if (!current.school) {
      current.school = trimmed;
    } else if (!current.degree) {
      const parts = parseEducationSchoolDegree(trimmed);
      current.degree = parts.degree || trimmed;
      current.field = parts.field;
    }
  }

  saveEducation();

  return education;
}

function parseEducationSchoolDegree(text: string): { school: string; degree: string; field: string } {
  if (!text) return { school: '', degree: '', field: '' };

  const commaMatch = text.match(/^(.+?),\s*(.+)$/);
  if (commaMatch) {
    return { school: commaMatch[1].trim(), degree: commaMatch[2].trim(), field: '' };
  }

  const fieldMatch = text.match(/^(.+?)(?:\s*,\s*|\s+)(?:전공|학과|학부)\s*(.+)?$/i);
  if (fieldMatch) {
    return { school: fieldMatch[1].trim(), degree: '', field: fieldMatch[2]?.trim() || '' };
  }

  return { school: text, degree: '', field: '' };
}

function extractSkills(text: string): Skill[] {
  const skills: Skill[] = [];
  
  // Try to extract from "대표 보유기술" section (left column - simple skills)
  const simpleSkills = extractSimpleSkills(text);
  skills.push(...simpleSkills);
  
  // Try to extract from "주요 기술 Spec" section (right column - detailed specs)
  const specSkills = extractSpecSkills(text);
  skills.push(...specSkills);
  
  // Deduplicate by name
  const seen = new Set<string>();
  return skills.filter(skill => {
    if (seen.has(skill.name.toLowerCase())) return false;
    seen.add(skill.name.toLowerCase());
    return true;
  });
}

function extractSimpleSkills(text: string): Skill[] {
  const skills: Skill[] = [];
  const lines = text.split('\n');
  
  let inLeftColumn = false;
  const leftColumnItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect start of left column (대표 보유기술)
    if (/대표 보유기술/.test(line)) {
      inLeftColumn = true;
      // Extract items from same line (before the right column content)
      const match = line.match(/대표 보유기술\s+(.+?)(?:\s{10,}|주요 기술)/i);
      if (match) {
        const items = match[1].trim().split(/\s{2,}/).filter(s => s.length > 0);
        leftColumnItems.push(...items);
      }
      continue;
    }
    
    // Detect end of left column (Certifications or 경력)
    if (inLeftColumn && /Certifications|경력|학력/.test(line)) {
      inLeftColumn = false;
      continue;
    }
    
    // Collect left column items (they appear at the start of lines with large gaps)
    if (inLeftColumn && line.trim()) {
      // Left column items are typically short and followed by large spaces
      const leftPart = line.match(/^(\S+(?:\s+\S+)?)(?:\s{5,}|$)/);
      if (leftPart && leftPart[1].trim().length > 0 && leftPart[1].trim().length < 30) {
        const item = leftPart[1].trim();
        // Filter out headers and non-skill items
        if (!item.match(/^(?:대표|보유|기술|Spec|Certifications|경력|학력|주요)/i)) {
          leftColumnItems.push(item);
        }
      }
    }
  }
  
  // Convert to skills
  for (const item of leftColumnItems) {
    if (item.length > 0 && item.length < 30) {
      skills.push({
        id: `skill-${skills.length}`,
        name: item,
        endorsements: 0,
      });
    }
  }
  
  return skills;
}

function extractSpecSkills(text: string): Skill[] {
  const skills: Skill[] = [];
  
  // Match the right column "주요 기술 Spec" section
  const specMatch = text.match(/주요 기술 Spec[-\s]*([\s\S]*?)(?=\n\s*\n|\n경력|\n학력)/i);
  if (specMatch) {
    const specText = specMatch[1];
    const lines = specText.split('\n').filter(l => l.trim());
    
    let currentCategory = '';
    for (const line of lines) {
      const trimmed = line.trim().replace(/&amp;/g, '&');
      
      // Match category - items pattern like "Architecture - MSA, REST API,"
      const categoryMatch = trimmed.match(/^([A-Za-z\s&]+)\s*[-–]\s*(.+?)$/);
      if (categoryMatch) {
        currentCategory = categoryMatch[1].trim();
        const items = categoryMatch[2].split(',').map(s => s.trim()).filter(s => s.length > 0);
        for (const item of items) {
          if (item.length > 1) {
            skills.push({
              id: `skill-${skills.length}`,
              name: `${currentCategory}: ${item.replace(/&amp;/g, '&')}`,
              endorsements: 0,
            });
          }
        }
      } else if (currentCategory && trimmed && !trimmed.match(/^(?:주요|기술|Spec)/i)) {
        // Continuation of previous category
        const items = trimmed.split(',').map(s => s.trim()).filter(s => s.length > 0);
        for (const item of items) {
          if (item.length > 1) {
            skills.push({
              id: `skill-${skills.length}`,
              name: `${currentCategory}: ${item.replace(/&amp;/g, '&')}`,
              endorsements: 0,
            });
          }
        }
      }
    }
  }
  
  return skills;
}

function extractCertifications(text: string): Certification[] {
  const certifications: Certification[] = [];
  
  // Known certification patterns (multiline) are the most reliable signal for
  // wrapped names that span multiple extracted lines.
  const foundNames: string[] = [];
  const certPatterns = [
    /Architecting with Google Kubernetes\s+Engine:\s*(?:Workloads|Foundations)/gi,
    /Google Cloud Platform\s+Fundamentals:\s*Core Infrastructure/gi,
    /Google Cloud\s+(?:Professional|Associate)\s+[A-Z][A-Za-z\s]+(?:Engineer|Architect|Developer)|Google Cloud\s+Associate\s+[A-Za-z\s]+/gi,
    /DEVCON\s+\d{4}\s+참가증/g,
    /정보(?:처리|관리)기사\s*\d*급/g,
  ];
  
  for (const pattern of certPatterns) {
    for (const match of text.matchAll(pattern)) {
      const name = match[0].replace(/\s+/g, ' ').trim();
      if (name.length > 3) {
        foundNames.push(name);
      }
    }
  }
  
  // Column-based extraction for the "Certifications" section (LinkedIn PDF
  // exports render it in the left column, interleaved with the right column).
  const items = mergeCertificationFragments(extractCertificationFragments(text));
  
  const seen = new Set<string>();
  const add = (name: string) => {
    const clean = name.replace(/\s+/g, ' ').replace(/&amp;/g, '&').trim();
    if (!clean || clean.length < 3 || clean.length > 150) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    certifications.push({
      id: `cert-${certifications.length}`,
      name: clean,
      issuer: '',
      issueDate: '',
    });
  };
  
  for (const name of foundNames) add(name);
  for (const item of items) add(item);
  
  return certifications;
}

function extractCertificationFragments(text: string): string[] {
  const lines = text.split('\n');
  const startIdx = lines.findIndex(l => /^\s*Certifications/.test(l));
  if (startIdx === -1) return [];
  
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^(?:경력|학력)$/.test(trimmed)
      || (/^(?:Education|Experience|Skills|Contact|Accomplishments)\b/.test(trimmed) && trimmed.length < 50)) {
      endIdx = i;
      break;
    }
  }
  
  const zoneLines = lines.slice(startIdx, endIdx);
  const columnStart = detectRightColumnStart(zoneLines);
  
  const fragments: string[] = [];
  for (let i = startIdx + 1; i < endIdx; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const leading = (line.match(/^ */) || [''])[0].length;
    if (leading >= columnStart) continue;
    
    const candidate = columnStart === Infinity ? line.trim() : line.slice(0, columnStart).trim();
    if (!candidate) continue;
    
    if (/^Page\s+\d+\s+of\s+\d+$/i.test(candidate)) continue;
    if (/^(?:Certifications|대표\s*보유\s*기술|주요\s*기술|Spec)/i.test(candidate)) continue;
    if (/^[-•&]/.test(candidate)) continue;
    
    // Right-column "주요 기술 Spec" lists are comma-separated and dense.
    if (candidate.split(',').length >= 3) continue;
    if (candidate.length < 3 || candidate.length > 40) continue;
    
    fragments.push(candidate);
  }
  
  return fragments;
}

function detectRightColumnStart(lines: string[]): number {
  const counts = new Map<number, number>();
  
  for (const line of lines) {
    const candidates: number[] = [];
    const leading = (line.match(/^ */) || [''])[0].length;
    if (leading >= 30) candidates.push(leading);
    
    const gapRe = / {3,}/g;
    let m;
    while ((m = gapRe.exec(line))) {
      const start = m.index + m[0].length;
      if (start > 4 && start < line.length) candidates.push(start);
    }
    
    for (const c of candidates) {
      counts.set(c, (counts.get(c) || 0) + 1);
    }
  }
  
  let columnStart = Infinity;
  let best = 0;
  for (const [pos, count] of counts.entries()) {
    if (count > best) {
      best = count;
      columnStart = pos;
    }
  }
  
  // Only trust the column split when it's well supported and plausibly wide.
  if (best < 2 || columnStart < 10) return Infinity;
  return columnStart;
}

function mergeCertificationFragments(fragments: string[]): string[] {
  const items: string[] = [];
  let prev = '';
  
  for (const frag of fragments) {
    if (!items.length) {
      items.push(frag);
      prev = frag;
      continue;
    }
    
    // A fragment continues the previous certificate when it looks like a
    // wrapped line: starts lowercase, or completes a "Category: Name" title.
    const isContinuation = /^[a-z]/.test(frag)
      || (frag.includes(':') && !prev.includes(':') && prev.length >= 12 && frag.length <= 45);
    
    if (isContinuation) {
      items[items.length - 1] += ' ' + frag;
    } else {
      items.push(frag);
    }
    prev = frag;
  }
  
  return items;
}
