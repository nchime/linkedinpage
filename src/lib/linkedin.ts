import { LinkedInProfile } from '@/types';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export class LinkedInService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getProfile(profileId: string): Promise<LinkedInProfile> {
    const response = await fetch(`${LINKEDIN_API_BASE}/people/${profileId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'LinkedIn-Version': '202401',
      },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformProfile(data);
  }

  async getProfileByEmail(email: string): Promise<LinkedInProfile> {
    const response = await fetch(
      `${LINKEDIN_API_BASE}/people?q=email&email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'LinkedIn-Version': '202401',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.statusText}`);
    }

    const data = await response.json();
    const profileId = data.elements?.[0]?.id;
    
    if (!profileId) {
      throw new Error('Profile not found');
    }

    return this.getProfile(profileId);
  }

  private transformProfile(data: Record<string, unknown>): LinkedInProfile {
    return {
      id: (data.id as string) || '',
      fullName: `${(data.firstName as string) || ''} ${(data.lastName as string) || ''}`.trim(),
      headline: (data.headline as string) || '',
      summary: (data.summary as string) || '',
      location: ((data.location as Record<string, unknown>)?.name as string) || '',
      profileUrl: `https://www.linkedin.com/in/${(data.vanityName as string) || data.id}`,
      avatarUrl: ((data.profilePicture as Record<string, unknown>)?.displayImage as string) || undefined,
      experiences: this.transformExperiences(data.positions as Record<string, unknown>[] || []),
      education: this.transformEducation(data.educations as Record<string, unknown>[] || []),
      skills: this.transformSkills(data.skills as Record<string, unknown>[] || []),
    };
  }

  private transformExperiences(positions: Record<string, unknown>[]): LinkedInProfile['experiences'] {
    return (positions || []).map((pos, index) => ({
      id: `exp-${index}`,
      company: (pos.companyName as string) || '',
      title: (pos.title as string) || '',
      startDate: this.formatDate(pos.startDate as Record<string, number>),
      endDate: pos.endDate ? this.formatDate(pos.endDate as Record<string, number>) : undefined,
      current: !pos.endDate,
      description: (pos.description as string) || '',
      location: (pos.location as string) || undefined,
    }));
  }

  private transformEducation(educations: Record<string, unknown>[]): LinkedInProfile['education'] {
    return (educations || []).map((edu, index) => ({
      id: `edu-${index}`,
      school: (edu.schoolName as string) || '',
      degree: (edu.degreeName as string) || '',
      field: (edu.fieldOfStudy as string) || '',
      startDate: this.formatDate(edu.startDate as Record<string, number>),
      endDate: this.formatDate(edu.endDate as Record<string, number>),
      description: (edu.description as string) || undefined,
    }));
  }

  private transformSkills(skills: Record<string, unknown>[]): LinkedInProfile['skills'] {
    return (skills || []).map((skill, index) => ({
      id: `skill-${index}`,
      name: (skill.name as string) || '',
      endorsements: (skill.endorsementsCount as number) || 0,
    }));
  }

  private formatDate(date: Record<string, number> | undefined): string {
    if (!date) return '';
    const year = date.year || new Date().getFullYear();
    const month = date.month || 1;
    return `${year}-${String(month).padStart(2, '0')}`;
  }
}

export function extractLinkedInUrl(input: string): string | null {
  const patterns = [
    /linkedin\.com\/in\/([a-zA-Z0-9_-]+)/,
    /linkedin\.com\/pub\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function validateLinkedInUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+/.test(url);
}
