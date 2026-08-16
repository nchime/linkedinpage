import PptxGenJS from 'pptxgenjs';
import { ResumeData, LinkedInProfile, SectionConfig } from '@/types';
import { getOrderedSections } from '@/lib/templates';

interface Ctx {
  slide: PptxGenJS.Slide;
  colors: { primary: string; secondary: string; text: string };
  fonts: { heading: string; body: string };
  y: number;
}

function heading(ctx: Ctx, title: string) {
  ctx.slide.addText(title, {
    x: 0.5,
    y: ctx.y,
    w: 9,
    h: 0.3,
    fontSize: 12,
    fontFace: ctx.fonts.heading,
    color: ctx.colors.primary.replace('#', ''),
    bold: true,
  });
  ctx.y += 0.35;
}

function renderSection(type: SectionConfig['type'], profile: LinkedInProfile, ctx: Ctx) {
  switch (type) {
    case 'summary':
      if (profile.summary) {
        heading(ctx, 'PROFESSIONAL SUMMARY');
        ctx.slide.addText(profile.summary, {
          x: 0.5,
          y: ctx.y,
          w: 9,
          h: 0.8,
          fontSize: 10,
          fontFace: ctx.fonts.body,
          color: ctx.colors.text.replace('#', ''),
          valign: 'top',
        });
        ctx.y += 0.9;
      }
      break;
    case 'experience':
      heading(ctx, 'WORK EXPERIENCE');
      for (const exp of profile.experiences.slice(0, 3)) {
        ctx.slide.addText(exp.title, {
          x: 0.5,
          y: ctx.y,
          w: 6,
          h: 0.25,
          fontSize: 11,
          fontFace: ctx.fonts.body,
          color: ctx.colors.text.replace('#', ''),
          bold: true,
        });
        ctx.slide.addText(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}`, {
          x: 7,
          y: ctx.y,
          w: 2.5,
          h: 0.25,
          fontSize: 9,
          fontFace: ctx.fonts.body,
          color: ctx.colors.secondary.replace('#', ''),
          align: 'right',
        });
        ctx.y += 0.25;
        ctx.slide.addText(exp.company, {
          x: 0.5,
          y: ctx.y,
          w: 9,
          h: 0.2,
          fontSize: 10,
          fontFace: ctx.fonts.body,
          color: ctx.colors.primary.replace('#', ''),
        });
        ctx.y += 0.25;
      }
      ctx.y += 0.1;
      break;
    case 'education':
      heading(ctx, 'EDUCATION');
      for (const edu of profile.education) {
        ctx.slide.addText(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`, {
          x: 0.5,
          y: ctx.y,
          w: 9,
          h: 0.25,
          fontSize: 11,
          fontFace: ctx.fonts.body,
          color: ctx.colors.text.replace('#', ''),
          bold: true,
        });
        ctx.y += 0.25;
        ctx.slide.addText(`${edu.school} | ${edu.startDate} - ${edu.endDate}`, {
          x: 0.5,
          y: ctx.y,
          w: 9,
          h: 0.2,
          fontSize: 9,
          fontFace: ctx.fonts.body,
          color: ctx.colors.secondary.replace('#', ''),
        });
        ctx.y += 0.25;
      }
      ctx.y += 0.1;
      break;
    case 'skills':
      heading(ctx, 'SKILLS');
      ctx.slide.addText(profile.skills.map((s) => s.name).join(' • '), {
        x: 0.5,
        y: ctx.y,
        w: 9,
        h: 0.4,
        fontSize: 10,
        fontFace: ctx.fonts.body,
        color: ctx.colors.text.replace('#', ''),
      });
      ctx.y += 0.5;
      break;
    case 'certifications':
      heading(ctx, 'CERTIFICATIONS');
      ctx.slide.addText(
        (profile.certifications || []).map((c) => c.name).join('\n'),
        {
          x: 0.5,
          y: ctx.y,
          w: 9,
          h: 0.8,
          fontSize: 10,
          fontFace: ctx.fonts.body,
          color: ctx.colors.text.replace('#', ''),
          valign: 'top',
        }
      );
      ctx.y += 0.9;
      break;
    case 'projects':
      heading(ctx, 'PROJECTS');
      ctx.slide.addText(
        (profile.projects || []).map((p) => p.name).join('\n'),
        {
          x: 0.5,
          y: ctx.y,
          w: 9,
          h: 0.8,
          fontSize: 10,
          fontFace: ctx.fonts.body,
          color: ctx.colors.text.replace('#', ''),
          valign: 'top',
        }
      );
      ctx.y += 0.9;
      break;
    case 'contact':
      break;
  }
}

export async function generatePptx(data: ResumeData): Promise<Buffer> {
  const { profile, template, options } = data;
  const tc = template?.config;
  const colors = {
    primary: options?.colors?.primary || tc?.colors?.primary || '#2563EB',
    secondary: options?.colors?.secondary || tc?.colors?.secondary || '#64748B',
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
  slide.background = { color: (options?.colors?.background || tc?.colors?.background || '#FFFFFF').replace('#', '') };

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

  const contactParts = [profile.location, profile.email, profile.phone].filter(Boolean);
  if (contactParts.length) {
    slide.addText(contactParts.join(' | '), {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.3,
      fontSize: 10,
      fontFace: fonts.body,
      color: colors.secondary.replace('#', ''),
    });
  }

  slide.addShape(pptx.ShapeType.line, {
    x: 0.5,
    y: 1.7,
    w: 9,
    h: 0,
    line: { color: colors.primary.replace('#', ''), width: 1 },
  });

  const ctx: Ctx = { slide, colors, fonts, y: 1.9 };

  const sections = getOrderedSections(template).filter((s) => s.type !== 'header');
  for (const section of sections) {
    renderSection(section.type, profile, ctx);
  }

  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer as Buffer;
}