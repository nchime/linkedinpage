import { NextResponse } from 'next/server';
import { hasSavedSession } from '@/lib/linkedin-session';

export async function GET() {
  const loggedIn = await hasSavedSession();
  return NextResponse.json({ loggedIn });
}
