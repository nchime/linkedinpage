import { LinkedInProfile } from '@/types';

export function parseLinkedInExport(data: string, format: 'csv' | 'json'): LinkedInProfile {
  if (format === 'json') {
    return parseJsonExport(data);
  }
  return parseCsvExport(data);
}

function parseJsonExport(data: string): LinkedInProfile {
  try {
    const json = JSON.parse(data);
    
    const location = typeof json.location === 'object' 
      ? (json.location?.name || '') 
      : (json.location || json.geoLocation || '');
    
    return {
      id: json.id || json.vanityName || 'unknown',
      fullName: `${json.firstName || ''} ${json.lastName || ''}`.trim() || 'Unknown',
      headline: json.headline || json.description || '',
      summary: json.summary || json.about || '',
      location: location,
      profileUrl: json.vanityName 
        ? `https://www.linkedin.com/in/${json.vanityName}` 
        : `https://www.linkedin.com/in/${json.id || 'unknown'}`,
      experiences: parseExperiences(json.positions || json.experience || []),
      education: parseEducation(json.educations || json.education || []),
      skills: parseSkills(json.skills || []),
    };
  } catch (error) {
    console.error('JSON parse error:', error);
    throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseCsvExport(data: string): LinkedInProfile {
  const lines = data.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCsvLine(line));

  const profile: LinkedInProfile = {
    id: 'unknown',
    fullName: '',
    headline: '',
    summary: '',
    location: '',
    profileUrl: '',
    experiences: [],
    education: [],
    skills: [],
  };

  for (const row of rows) {
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header.toLowerCase().trim()] = row[index] || '';
    });

    if (item['first name'] || item['last name']) {
      profile.fullName = `${item['first name'] || ''} ${item['last name'] || ''}`.trim();
    }
    
    if (item['headline'] || item['title']) {
      profile.headline = item['headline'] || item['title'] || '';
    }
    
    if (item['summary'] || item['about']) {
      profile.summary = item['summary'] || item['about'] || '';
    }
    
    if (item['location'] || item['city']) {
      profile.location = item['location'] || item['city'] || '';
    }

    if (item['company'] || item['position']) {
      profile.experiences.push({
        id: `exp-${profile.experiences.length}`,
        company: item['company'] || '',
        title: item['position'] || item['title'] || '',
        startDate: item['started on'] || item['start date'] || '',
        endDate: item['ended on'] || item['end date'] || '',
        current: !item['ended on'] && !item['end date'],
        description: item['description'] || '',
      });
    }

    if (item['school'] || item['degree']) {
      profile.education.push({
        id: `edu-${profile.education.length}`,
        school: item['school'] || '',
        degree: item['degree'] || '',
        field: item['field of study'] || '',
        startDate: item['start date'] || '',
        endDate: item['end date'] || '',
      });
    }

    if (item['skill'] || item['name']) {
      const skillName = item['skill'] || item['name'] || '';
      if (skillName && !profile.skills.find(s => s.name === skillName)) {
        profile.skills.push({
          id: `skill-${profile.skills.length}`,
          name: skillName,
          endorsements: parseInt(item['endorsements'] || '0', 10) || 0,
        });
      }
    }
  }

  return profile;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseExperiences(data: Record<string, unknown>[]): LinkedInProfile['experiences'] {
  return data.map((item, index) => ({
    id: `exp-${index}`,
    company: (item.companyName as string) || (item.company as string) || '',
    title: (item.title as string) || (item.position as string) || '',
    startDate: formatDate(item.startDate as string) || formatDate(item.startedOn as string) || '',
    endDate: formatDate(item.endDate as string) || formatDate(item.endedOn as string) || '',
    current: !item.endDate && !item.endedOn,
    description: (item.description as string) || '',
    location: (item.location as string) || '',
  }));
}

function parseEducation(data: Record<string, unknown>[]): LinkedInProfile['education'] {
  return data.map((item, index) => ({
    id: `edu-${index}`,
    school: (item.schoolName as string) || (item.school as string) || '',
    degree: (item.degreeName as string) || (item.degree as string) || '',
    field: (item.fieldOfStudy as string) || (item.field as string) || '',
    startDate: formatDate(item.startDate as string) || '',
    endDate: formatDate(item.endDate as string) || '',
    description: (item.description as string) || '',
  }));
}

function parseSkills(data: Record<string, unknown>[]): LinkedInProfile['skills'] {
  return data.map((item, index) => ({
    id: `skill-${index}`,
    name: (item.name as string) || (item.skill as string) || '',
    endorsements: (item.endorsementsCount as number) || (item.endorsements as number) || 0,
  }));
}

function formatDate(date: unknown): string {
  if (!date) return '';
  
  if (typeof date === 'object' && date !== null) {
    const dateObj = date as Record<string, unknown>;
    const year = dateObj.year as number;
    const month = dateObj.month as number;
    if (year) {
      return month ? `${year}-${String(month).padStart(2, '0')}` : `${year}`;
    }
    return '';
  }
  
  const dateStr = String(date);
  
  if (/^\d{4}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 7);
  }
  
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
