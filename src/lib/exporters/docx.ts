import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
import { ResumeData, LinkedInProfile, SectionConfig } from '@/types';
import { getOrderedSections } from '@/lib/templates';

const PRIMARY = '2563EB';
const SECONDARY = '666666';
const MUTED = '888888';

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: title, bold: true, size: 22, color: PRIMARY, font: 'Arial' })],
    spacing: { before: 200, after: 100 },
  });
}

function renderHeader(profile: LinkedInProfile): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(
    new Paragraph({
      children: [new TextRun({ text: profile.fullName, bold: true, size: 32, font: 'Arial' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );
  if (profile.headline) {
    out.push(
      new Paragraph({
        children: [new TextRun({ text: profile.headline, size: 24, color: SECONDARY, font: 'Arial' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 },
      })
    );
  }
  const contactParts = [profile.location, profile.email, profile.phone, profile.profileUrl].filter(Boolean);
  if (contactParts.length) {
    out.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join(' | '), size: 18, color: MUTED, font: 'Arial' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }
  out.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: PRIMARY } },
      spacing: { after: 200 },
    })
  );
  return out;
}

function renderSection(type: SectionConfig['type'], profile: LinkedInProfile, showExperienceDetails: boolean, minimal: boolean): Paragraph[] {
  const out: Paragraph[] = [];

  switch (type) {
    case 'summary':
      if (profile.summary) {
        out.push(sectionHeading('PROFESSIONAL SUMMARY'));
        out.push(
          new Paragraph({
            children: [new TextRun({ text: profile.summary, size: 20, font: 'Arial' })],
            spacing: { after: 200 },
          })
        );
      }
      break;
    case 'experience':
      out.push(sectionHeading('WORK EXPERIENCE'));
      if (minimal) {
        for (const exp of profile.experiences) {
          out.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.title, bold: true, size: 22, font: 'Arial' }),
                exp.company ? new TextRun({ text: ` · ${exp.company}`, size: 20, color: PRIMARY, font: 'Arial' }) : undefined,
                new TextRun({
                  text: ` | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}`,
                  size: 18,
                  color: SECONDARY,
                  font: 'Arial',
                }),
              ].filter((t): t is TextRun => Boolean(t)),
              spacing: { after: 100 },
            })
          );
        }
        break;
      }
      for (const exp of profile.experiences) {
        out.push(
          new Paragraph({
            children: [new TextRun({ text: exp.title, bold: true, size: 22, font: 'Arial' })],
            spacing: { before: 100, after: 50 },
          })
        );
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.company, size: 20, color: PRIMARY, font: 'Arial' }),
              new TextRun({
                text: ` | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}`,
                size: 20,
                color: SECONDARY,
                font: 'Arial',
              }),
            ],
            spacing: { after: 50 },
          })
        );
        if (showExperienceDetails && exp.location) {
          out.push(
            new Paragraph({
              children: [new TextRun({ text: exp.location, size: 18, color: MUTED, font: 'Arial' })],
              spacing: { after: 50 },
            })
          );
        }
        if (showExperienceDetails) {
          out.push(
            new Paragraph({
              children: [new TextRun({ text: exp.description, size: 20, font: 'Arial' })],
              spacing: { after: 100 },
            })
          );
        }
      }
      break;
    case 'education':
      out.push(sectionHeading('EDUCATION'));
      for (const edu of profile.education) {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`, bold: true, size: 22, font: 'Arial' }),
            ],
            spacing: { before: 100, after: 50 },
          })
        );
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.school, size: 20, color: PRIMARY, font: 'Arial' }),
              new TextRun({ text: ` | ${edu.startDate} - ${edu.endDate}`, size: 20, color: SECONDARY, font: 'Arial' }),
            ],
            spacing: { after: 100 },
          })
        );
      }
      break;
    case 'skills':
      out.push(sectionHeading('SKILLS'));
      out.push(
        new Paragraph({
          children: [
            new TextRun({ text: profile.skills.map((s) => s.name).join(' • '), size: 20, font: 'Arial' }),
          ],
          spacing: { after: 200 },
        })
      );
      break;
    case 'certifications':
      out.push(sectionHeading('CERTIFICATIONS'));
      for (const cert of profile.certifications || []) {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name, size: 20, font: 'Arial' }),
              cert.issuer ? new TextRun({ text: ` (${cert.issuer})`, size: 20, color: PRIMARY, font: 'Arial' }) : undefined,
            ].filter((t): t is TextRun => Boolean(t)),
            spacing: { after: 50 },
          })
        );
      }
      break;
    case 'projects':
      out.push(sectionHeading('PROJECTS'));
      for (const project of profile.projects || []) {
        out.push(
          new Paragraph({
            children: [new TextRun({ text: project.name, bold: true, size: 22, font: 'Arial' })],
            spacing: { before: 100, after: 50 },
          })
        );
        if (project.description) {
          out.push(
            new Paragraph({
              children: [new TextRun({ text: project.description, size: 20, font: 'Arial' })],
              spacing: { after: 100 },
            })
          );
        }
      }
      break;
    case 'contact':
      // contact already rendered in the header block
      break;
  }

  return out;
}

export async function generateDocx(data: ResumeData): Promise<Buffer> {
  const { profile, template } = data;
  const children: Paragraph[] = [];
  const showExperienceDetails = template?.config?.showExperienceDescription ?? true;
  const minimal = template?.layout === 'minimal';

  children.push(...renderHeader(profile));

  const sections = getOrderedSections(template).filter((s) => s.type !== 'header');
  for (const section of sections) {
    children.push(...renderSection(section.type, profile, showExperienceDetails, minimal));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}