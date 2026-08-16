import { NextResponse } from 'next/server';
import { scrapeLinkedInProfile } from '@/lib/scraper';
import { LinkedInProfile } from '@/types';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!url.includes('linkedin.com/in/')) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn profile URL' },
        { status: 400 }
      );
    }

    let profile: LinkedInProfile;
    
    try {
      profile = await scrapeLinkedInProfile(url);
    } catch (scrapeError) {
      console.error('Scraping failed, using fallback:', scrapeError);
      
      profile = {
        id: extractProfileId(url),
        fullName: 'LinkedIn User',
        headline: 'Professional',
        summary: '',
        location: '',
        profileUrl: url,
        experiences: [],
        education: [],
        skills: [],
      };
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

function extractProfileId(url: string): string {
  const match = url.match(/\/in\/([^/]+)/);
  return match ? match[1] : 'unknown';
}
