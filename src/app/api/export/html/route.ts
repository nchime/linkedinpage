import { NextResponse } from 'next/server';
import { generateHtml } from '@/lib/exporters/html';
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

    const html = generateHtml(data);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': contentDisposition(data.profile.fullName, 'html'),
      },
    });
  } catch (error) {
    console.error('HTML export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate HTML' },
      { status: 500 }
    );
  }
}
