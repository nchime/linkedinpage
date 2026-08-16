import PptxGenJS from 'pptxgenjs';
import { ResumeData } from '@/types';

export async function generatePptx(data: ResumeData): Promise<Buffer> {
  const { profile, template, options } = data;
  const tc = template?.config;
  const colors = {
    primary: options?.colors?.primary || tc?.colors?.primary || '#2563EB',
    secondary: options?.colors?.secondary || tc?.colors?.secondary || '#64748B',
    background: options?.colors?.background || tc?.colors?.background || '#FFFFFF',
    text: options?.colors?.text || tc?.colors?.text || '#1E293B',
  };
  const fonts = {
    heading: options?.fonts?.heading || tc?.fonts?.heading || 'Inter',
    body: options?.fonts?.body || tc?.fonts?.body || 'Inter',
  };

  const pptx = new PptxGenJS();
  
  pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 });
  pptx.layout = 'CUSTOM';

  const slide = pptx.addSlide();

  slide.background = { color: colors.background.replace('#', '') };

  slide.addText(profile.fullName, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    fontFace: fonts.heading,
    color: colors.primary.replace('#', ''),
    bold: true,
  });

  slide.addText(profile.headline, {
    x: 0.5,
    y: 0.9,
    w: 9,
    h: 0.4,
    fontSize: 14,
    fontFace: fonts.body,
    color: colors.secondary.replace('#', ''),
  });

  if (profile.location) {
    slide.addText(profile.location, {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.3,
      fontSize: 11,
      fontFace: fonts.body,
      color: colors.secondary.replace('#', ''),
    });
  }

  const contactParts: string[] = [];
  if (profile.email) contactParts.push(profile.email);
  if (profile.phone) contactParts.push(profile.phone);
  
  if (contactParts.length > 0) {
    slide.addText(contactParts.join(' | '), {
      x: 0.5,
      y: 1.6,
      w: 9,
      h: 0.3,
      fontSize: 10,
      fontFace: fonts.body,
      color: colors.secondary.replace('#', ''),
    });
  }

  slide.addShape(pptx.ShapeType.line, {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 0,
    line: { color: colors.primary.replace('#', ''), width: 1 },
  });

  let yPos = 2.2;

  if (profile.summary && options?.sections?.exclude?.includes('summary') !== true) {
    slide.addText('PROFESSIONAL SUMMARY', {
      x: 0.5,
      y: yPos,
      w: 9,
      h: 0.3,
      fontSize: 12,
      fontFace: fonts.heading,
      color: colors.primary.replace('#', ''),
      bold: true,
    });
    yPos += 0.35;

    slide.addText(profile.summary, {
      x: 0.5,
      y: yPos,
      w: 9,
      h: 0.8,
      fontSize: 10,
      fontFace: fonts.body,
      color: colors.text.replace('#', ''),
      valign: 'top',
    });
    yPos += 0.9;
  }

  if (profile.experiences.length > 0 && options?.sections?.exclude?.includes('experience') !== true) {
    slide.addText('WORK EXPERIENCE', {
      x: 0.5,
      y: yPos,
      w: 9,
      h: 0.3,
      fontSize: 12,
      fontFace: fonts.heading,
      color: colors.primary.replace('#', ''),
      bold: true,
    });
    yPos += 0.35;

    for (const exp of profile.experiences.slice(0, 3)) {
      slide.addText(exp.title, {
        x: 0.5,
        y: yPos,
        w: 6,
        h: 0.25,
        fontSize: 11,
        fontFace: fonts.body,
        color: colors.text.replace('#', ''),
        bold: true,
      });

      slide.addText(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}`, {
        x: 7,
        y: yPos,
        w: 2.5,
        h: 0.25,
        fontSize: 9,
        fontFace: fonts.body,
        color: colors.secondary.replace('#', ''),
        align: 'right',
      });
      yPos += 0.25;

      slide.addText(exp.company, {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.2,
        fontSize: 10,
        fontFace: fonts.body,
        color: colors.primary.replace('#', ''),
      });
      yPos += 0.25;
    }
    yPos += 0.1;
  }

  if (profile.skills.length > 0 && options?.sections?.exclude?.includes('skills') !== true) {
    slide.addText('SKILLS', {
      x: 0.5,
      y: yPos,
      w: 9,
      h: 0.3,
      fontSize: 12,
      fontFace: fonts.heading,
      color: colors.primary.replace('#', ''),
      bold: true,
    });
    yPos += 0.35;

    slide.addText(profile.skills.map((s) => s.name).join(' • '), {
      x: 0.5,
      y: yPos,
      w: 9,
      h: 0.4,
      fontSize: 10,
      fontFace: fonts.body,
      color: colors.text.replace('#', ''),
    });
  }

  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer as Buffer;
}
