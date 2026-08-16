import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TabStopType, TabStopPosition } from 'docx';
import { ResumeData } from '@/types';

export async function generateDocx(data: ResumeData): Promise<Buffer> {
  const { profile, options } = data;
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: profile.fullName,
          bold: true,
          size: 32,
          font: 'Arial',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: profile.headline,
          size: 24,
          color: '666666',
          font: 'Arial',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    })
  );

  if (profile.location) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: profile.location,
            size: 20,
            color: '888888',
            font: 'Arial',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  const contactParts: string[] = [];
  if (profile.email) contactParts.push(profile.email);
  if (profile.phone) contactParts.push(profile.phone);
  contactParts.push(profile.profileUrl);

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contactParts.join(' | '),
          size: 18,
          color: '888888',
          font: 'Arial',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB' },
      },
      spacing: { after: 200 },
    })
  );

  if (profile.summary && options?.sections?.exclude?.includes('summary') !== true) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 24,
            color: '2563EB',
            font: 'Arial',
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: profile.summary,
            size: 20,
            font: 'Arial',
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  if (profile.experiences.length > 0 && options?.sections?.exclude?.includes('experience') !== true) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'WORK EXPERIENCE',
            bold: true,
            size: 24,
            color: '2563EB',
            font: 'Arial',
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    for (const exp of profile.experiences) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: 22,
              font: 'Arial',
            }),
          ],
          spacing: { before: 100, after: 50 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company,
              size: 20,
              color: '2563EB',
              font: 'Arial',
            }),
            new TextRun({
              text: ` | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}`,
              size: 20,
              color: '666666',
              font: 'Arial',
            }),
          ],
          spacing: { after: 50 },
        })
      );

      if (exp.location) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.location,
                size: 18,
                color: '888888',
                font: 'Arial',
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.description,
              size: 20,
              font: 'Arial',
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  if (profile.education.length > 0 && options?.sections?.exclude?.includes('education') !== true) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 24,
            color: '2563EB',
            font: 'Arial',
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    for (const edu of profile.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
              bold: true,
              size: 22,
              font: 'Arial',
            }),
          ],
          spacing: { before: 100, after: 50 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.school,
              size: 20,
              color: '2563EB',
              font: 'Arial',
            }),
            new TextRun({
              text: ` | ${edu.startDate} - ${edu.endDate}`,
              size: 20,
              color: '666666',
              font: 'Arial',
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  if (profile.skills.length > 0 && options?.sections?.exclude?.includes('skills') !== true) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 24,
            color: '2563EB',
            font: 'Arial',
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: profile.skills.map((s) => s.name).join(' • '),
            size: 20,
            font: 'Arial',
          }),
        ],
        spacing: { after: 200 },
      })
    );
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
