import { ResumeData, LinkedInProfile, SectionConfig } from '@/types';
import { getOrderedSections } from '@/lib/templates';

function renderSection(type: SectionConfig['type'], profile: LinkedInProfile): string {
  const out: string[] = [];

  switch (type) {
    case 'summary':
      if (profile.summary) {
        out.push('## About', '', profile.summary, '');
      }
      break;
    case 'experience':
      out.push('## Experience', '');
      for (const exp of profile.experiences) {
        out.push(`### ${exp.title}`);
        out.push(`**${exp.company}** | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}`);
        if (exp.location) out.push(`📍 ${exp.location}`);
        out.push('');
        out.push(exp.description);
        out.push('');
      }
      break;
    case 'education':
      out.push('## Education', '');
      for (const edu of profile.education) {
        out.push(`### ${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`);
        out.push(`**${edu.school}** | ${edu.startDate} - ${edu.endDate}`);
        out.push('');
      }
      break;
    case 'skills':
      out.push('## Skills', '', profile.skills.map((s) => s.name).join(' • '), '');
      break;
    case 'certifications':
      if (profile.certifications?.length) {
        out.push('## Certifications', '');
        for (const cert of profile.certifications) {
          out.push(`- ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ''}${cert.issueDate ? ` - ${cert.issueDate}` : ''}`);
        }
        out.push('');
      }
      break;
    case 'projects':
      if (profile.projects?.length) {
        out.push('## Projects', '');
        for (const project of profile.projects) {
          out.push(`### ${project.name}`);
          if (project.url) out.push(`🔗 ${project.url}`);
          if (project.description) out.push('', project.description);
          out.push('');
        }
      }
      break;
    case 'contact':
      break;
  }

  return out.join('\n');
}

export function generateMarkdown(data: ResumeData): string {
  const { profile, template } = data;
  const sections: string[] = [];

  sections.push(`# ${profile.fullName}`);
  if (profile.headline) sections.push(`**${profile.headline}**`);
  const contactLine = [profile.location, profile.email, profile.phone, profile.profileUrl].filter(Boolean);
  if (contactLine.length) sections.push(contactLine.join(' | '));
  sections.push('');

  const ordered = getOrderedSections(template).filter((s) => s.type !== 'header');
  for (const section of ordered) {
    sections.push(renderSection(section.type, profile));
  }

  return sections.join('\n');
}