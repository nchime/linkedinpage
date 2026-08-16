import { NextResponse } from 'next/server';
import { contentDisposition } from '@/lib/utils';
import { ResumeData } from '@/types';

export async function POST(request: Request) {
  try {
    const data: ResumeData = await request.json();
    
    if (!data.profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    const jsonData = JSON.stringify(data, null, 2);
    
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': contentDisposition(data.profile.fullName, 'json'),
      },
    });
  } catch (error) {
    console.error('JSON export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate JSON' },
      { status: 500 }
    );
  }
}
