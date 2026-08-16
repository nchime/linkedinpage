import { NextResponse } from 'next/server';
import { generateDocx } from '@/lib/exporters/docx';
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

    const docxBuffer = await generateDocx(data);
    
    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': contentDisposition(data.profile.fullName, 'docx'),
      },
    });
  } catch (error) {
    console.error('DOCX export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate DOCX' },
      { status: 500 }
    );
  }
}
