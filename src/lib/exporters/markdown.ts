import { ResumeData } from '@/types';

export function generateMarkdown(data: ResumeData): string {
  const { profile, options } = data;
  const sections: string[] = [];

  sections.push(`# ${profile.fullName}`);
  sections.push(`**${profile.headline}**`);
  
  if (profile.location) {
    sections.push(`📍 ${profile.location}`);
  }
  
  sections.push('');

  if (profile.email) {
    sections.push(`📧 ${profile.email}`);
  }
  
  if (profile.phone) {
    sections.push(`📱 ${profile.phone}`);
  }
  
  sections.push(`🔗 [LinkedIn Profile](${profile.profileUrl})`);
  sections.push('');

  if (profile.summary && options?.sections?.exclude?.includes('summary') !== true) {
    sections.push('## Professional Summary');
    sections.push('');
    sections.push(profile.summary);
    sections.push('');
  }

  if (profile.experiences.length > 0 && options?.sections?.exclude?.includes('experience') !== true) {
    sections.push('## Work Experience');
    sections.push('');
    
    for (const exp of profile.experiences) {
      sections.push(`### ${exp.title}`);
      sections.push(`**${exp.company}** | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}`);
      
      if (exp.location) {
        sections.push(`📍 ${exp.location}`);
      }
      
      sections.push('');
      sections.push(exp.description);
      sections.push('');
    }
  }

  if (profile.education.length > 0 && options?.sections?.exclude?.includes('education') !== true) {
    sections.push('## Education');
    sections.push('');
    
    for (const edu of profile.education) {
      sections.push(`### ${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`);
      sections.push(`**${edu.school}** | ${edu.startDate} - ${edu.endDate}`);
      sections.push('');
    }
  }

  if (profile.skills.length > 0 && options?.sections?.exclude?.includes('skills') !== true) {
    sections.push('## Skills');
    sections.push('');
    sections.push(profile.skills.map((s) => s.name).join(' • '));
    sections.push('');
  }

  if (profile.certifications && profile.certifications.length > 0 && options?.sections?.exclude?.includes('certifications') !== true) {
    sections.push('## Certifications');
    sections.push('');
    for (const cert of profile.certifications) {
      sections.push(`- ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ''}${cert.issueDate ? ` - ${cert.issueDate}` : ''}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}
