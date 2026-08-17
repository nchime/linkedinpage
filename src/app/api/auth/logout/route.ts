import { NextResponse } from 'next/server';
import { logoutLinkedIn } from '@/lib/linkedin-self';

export async function POST() {
  try {
    const loggedOut = await logoutLinkedIn();
    return NextResponse.json({ loggedIn: false, loggedOut });
  } catch (error) {
    console.error('LinkedIn logout error:', error);
    return NextResponse.json(
      { loggedIn: true, error: 'Failed to log out' },
      { status: 500 }
    );
  }
}