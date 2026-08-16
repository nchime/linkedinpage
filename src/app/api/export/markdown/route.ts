import { NextResponse } from 'next/server';
import { generateMarkdown } from '@/lib/exporters/markdown';
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

    const markdown = generateMarkdown(data);
    
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': contentDisposition(data.profile.fullName, 'md'),
      },
    });
  } catch (error) {
    console.error('Markdown export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate markdown' },
      { status: 500 }
    );
  }
}
