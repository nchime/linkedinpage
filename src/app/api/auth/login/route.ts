import { NextResponse } from 'next/server';
import { loginToLinkedIn } from '@/lib/linkedin-self';

export const maxDuration = 300;

export async function POST() {
  try {
    const result = await loginToLinkedIn();
    return NextResponse.json(result);
  } catch (error) {
    console.error('LinkedIn login error:', error);
    return NextResponse.json(
      { loggedIn: false, error: 'Failed to start LinkedIn login' },
      { status: 500 }
    );
  }
}
