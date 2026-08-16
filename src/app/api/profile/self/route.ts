import { NextResponse } from 'next/server';
import { fetchOwnProfile, LinkedInNotLoggedInError } from '@/lib/linkedin-self';

export const maxDuration = 300;

export async function POST() {
  try {
    const profile = await fetchOwnProfile();
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof LinkedInNotLoggedInError) {
      return NextResponse.json(
        { error: error.message, needsLogin: true },
        { status: 401 }
      );
    }
    console.error('Own profile fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch your profile' },
      { status: 500 }
    );
  }
}
