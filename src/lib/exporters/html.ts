import { ResumeData } from '@/types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '&#96;');
}

export function generateHtml(data: ResumeData): string {
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
  
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${fonts.body}, sans-serif; color: ${colors.text}; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px; background: ${colors.background}; }
    .header { margin-bottom: 32px; text-align: center; }
    .section-label { font-size: 1.1em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${colors.secondary}; margin-bottom: 16px; }
    .name { font-family: ${fonts.heading}, sans-serif; font-size: 3em; font-weight: 700; color: ${colors.text}; margin-bottom: 16px; letter-spacing: -0.02em; }
    .contact-line { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; font-size: 0.9em; color: ${colors.secondary}; }
    .contact-line a { color: ${colors.primary}; text-decoration: none; }
    .contact-line a:hover { text-decoration: underline; }
    .contact-line .separator { color: ${colors.secondary}; }
    .section { margin-bottom: 25px; }
    .section-title { font-family: ${fonts.heading}, sans-serif; font-size: 1.4em; color: ${colors.primary}; border-bottom: 1px solid ${colors.secondary}; padding-bottom: 5px; margin-bottom: 15px; }
    .experience-item, .education-item { margin-bottom: 15px; }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
    .item-title { font-weight: bold; color: ${colors.text}; }
    .item-date { color: ${colors.secondary}; font-size: 0.9em; }
    .item-company { color: ${colors.primary}; font-weight: 500; }
    .item-location { color: ${colors.secondary}; font-size: 0.9em; }
    .item-description { margin-top: 5px; color: ${colors.text}; }
    .skills { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill { background: ${colors.primary}15; color: ${colors.primary}; padding: 5px 12px; border-radius: 15px; font-size: 0.9em; }
    .summary { color: ${colors.text}; margin-bottom: 10px; }
  `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(profile.fullName)} - Resume</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    <header class="header">
      <p class="section-label">Career Profile</p>
      <h1 class="name">${escapeHtml(profile.fullName)}</h1>
      <div class="contact-line">
        ${profile.email ? `<a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>` : ''}
        ${profile.email && profile.headline ? `<span class="separator">·</span>` : ''}
        ${profile.headline ? `<span>${escapeHtml(profile.headline)}</span>` : ''}
      </div>
    </header>

    ${profile.summary && options?.sections?.exclude?.includes('summary') !== true ? `
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary">${escapeHtml(profile.summary)}</p>
    </section>
    ` : ''}

    ${profile.experiences?.length > 0 && options?.sections?.exclude?.includes('experience') !== true ? `
    <section class="section">
      <h2 class="section-title">Work Experience</h2>
      ${profile.experiences.map(exp => `
        <div class="experience-item">
          <div class="item-header">
            <span class="item-title">${escapeHtml(exp.title)}</span>
            <span class="item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}</span>
          </div>
          <div class="item-company">${escapeHtml(exp.company)}</div>
          ${exp.location ? `<div class="item-location">📍 ${escapeHtml(exp.location)}</div>` : ''}
          ${exp.description ? `<p class="item-description">${escapeHtml(exp.description)}</p>` : ''}
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${profile.education?.length > 0 && options?.sections?.exclude?.includes('education') !== true ? `
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${profile.education.map(edu => `
        <div class="education-item">
          <div class="item-header">
            <span class="item-title">${escapeHtml(edu.degree || '')}${edu.field ? ` in ${escapeHtml(edu.field)}` : ''}</span>
            <span class="item-date">${edu.startDate || ''} - ${edu.endDate || ''}</span>
          </div>
          <div class="item-company">${escapeHtml(edu.school)}</div>
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${profile.skills?.length > 0 && options?.sections?.exclude?.includes('skills') !== true ? `
    <section class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills">
        ${profile.skills.map(skill => `<span class="skill">${escapeHtml(skill.name)}</span>`).join('')}
      </div>
    </section>
    ` : ''}

    ${(profile.certifications?.length ?? 0) > 0 && options?.sections?.exclude?.includes('certifications') !== true ? `
    <section class="section">
      <h2 class="section-title">Certifications</h2>
      <div class="certifications">
        ${profile.certifications!.map(cert => `
          <div class="experience-item">
            <div class="item-title">${escapeHtml(cert.name)}</div>
            ${cert.issuer ? `<div class="item-company">${escapeHtml(cert.issuer)}</div>` : ''}
            ${cert.issueDate ? `<div class="item-date">${cert.issueDate}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}
  </div>
</body>
</html>`;

  return html;
}
