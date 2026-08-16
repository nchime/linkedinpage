import { NextResponse } from 'next/server';
import { generatePptx } from '@/lib/exporters/pptx';
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

    const pptxBuffer = await generatePptx(data);
    
    return new NextResponse(new Uint8Array(pptxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': contentDisposition(data.profile.fullName, 'pptx'),
      },
    });
  } catch (error) {
    console.error('PPTX export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PPTX' },
      { status: 500 }
    );
  }
}
