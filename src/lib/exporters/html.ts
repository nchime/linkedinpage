import { ResumeData, LinkedInProfile, SectionConfig } from '@/types';
import {
  getMainSections,
  getSidebarSections,
  getOrderedSections,
  isTwoColumn,
  isMinimal,
} from '@/lib/templates';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '&#96;');
}

interface Palette {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

interface Fonts {
  heading: string;
  body: string;
}

function defaultTitle(type: SectionConfig['type']): string {
  const map: Partial<Record<SectionConfig['type'], string>> = {
    summary: 'About',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    certifications: 'Certifications',
    projects: 'Projects',
    languages: 'Languages',
    contact: 'Contact',
    header: 'Profile',
  };
  return map[type] || 'Profile';
}

function renderSection(
  type: SectionConfig['type'],
  section: SectionConfig,
  profile: LinkedInProfile,
  inSidebar: boolean
): string {
  const title = escapeHtml(section.title || defaultTitle(type));

  switch (type) {
    case 'header':
      return `
        <header class="preview-header">
          <h1 class="name">${escapeHtml(profile.fullName)}</h1>
          ${profile.headline ? `<p class="headline">${escapeHtml(profile.headline)}</p>` : ''}
          ${[profile.location, profile.email, profile.phone].filter(Boolean).length ? `
            <p class="contact-line">${[profile.location, profile.email, profile.phone]
              .filter((v): v is string => Boolean(v)).map(escapeHtml).join(' · ')}</p>
          ` : ''}
        </header>`;
    case 'contact':
      return `
        <section class="preview-section">
          <h2 class="section-title sidebar">${title}</h2>
          <div class="contact-block">
            ${profile.email ? `<p>${escapeHtml(profile.email)}</p>` : ''}
            ${profile.phone ? `<p>${escapeHtml(profile.phone)}</p>` : ''}
            ${profile.location ? `<p>${escapeHtml(profile.location)}</p>` : ''}
            ${profile.profileUrl ? `<p>${escapeHtml(profile.profileUrl)}</p>` : ''}
          </div>
        </section>`;
    case 'summary':
      return `
        <section class="preview-section">
          <h2 class="section-title">${title}</h2>
          <p class="summary">${escapeHtml(profile.summary)}</p>
        </section>`;
    case 'experience':
      return `
        <section class="preview-section">
          <h2 class="section-title">${title}</h2>
          ${profile.experiences.map((exp) => `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${escapeHtml(exp.title)}</span>
                <span class="item-date">${escapeHtml(exp.startDate)} - ${exp.current ? 'Present' : escapeHtml(exp.endDate || 'Present')}</span>
              </div>
              <div class="item-company">${escapeHtml(exp.company)}</div>
              ${exp.location ? `<div class="item-location">${escapeHtml(exp.location)}</div>` : ''}
              ${exp.description ? `<p class="item-description">${escapeHtml(exp.description)}</p>` : ''}
            </div>
          `).join('')}
        </section>`;
    case 'education':
      return `
        <section class="preview-section">
          <h2 class="section-title">${title}</h2>
          ${profile.education.map((edu) => `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${escapeHtml(edu.degree || '')}${edu.field ? ` in ${escapeHtml(edu.field)}` : ''}</span>
                <span class="item-date">${escapeHtml(edu.startDate)} - ${escapeHtml(edu.endDate)}</span>
              </div>
              <div class="item-company">${escapeHtml(edu.school)}</div>
            </div>
          `).join('')}
        </section>`;
    case 'skills':
      if (inSidebar) {
        return `
          <section class="preview-section">
            <h2 class="section-title sidebar">${title}</h2>
            <ul class="skill-list">
              ${profile.skills.map((skill) => `<li>${escapeHtml(skill.name)}</li>`).join('')}
            </ul>
          </section>`;
      }
      return `
        <section class="preview-section">
          <h2 class="section-title">${title}</h2>
          <div class="skills">
            ${profile.skills.map((skill) => `<span class="skill">${escapeHtml(skill.name)}</span>`).join('')}
          </div>
        </section>`;
    case 'certifications':
      return `
        <section class="preview-section">
          <h2 class="section-title${inSidebar ? ' sidebar' : ''}">${title}</h2>
          ${profile.certifications?.map((cert) => `
            <div class="item">
              <div class="item-title">${escapeHtml(cert.name)}</div>
              ${cert.issuer ? `<div class="item-company">${escapeHtml(cert.issuer)}</div>` : ''}
              ${cert.issueDate ? `<div class="item-date">${escapeHtml(cert.issueDate)}</div>` : ''}
            </div>
          `).join('')}
        </section>`;
    case 'projects':
      return `
        <section class="preview-section">
          <h2 class="section-title">${title}</h2>
          ${profile.projects?.map((project) => `
            <div class="item">
              <div class="item-title">${escapeHtml(project.name)}</div>
              ${project.url ? `<div class="item-company">${escapeHtml(project.url)}</div>` : ''}
              ${project.description ? `<p class="item-description">${escapeHtml(project.description)}</p>` : ''}
            </div>
          `).join('')}
        </section>`;
    default:
      return '';
  }
}

function renderColumn(sections: SectionConfig[], profile: LinkedInProfile, inSidebar: boolean): string {
  return sections
    .map((section) => renderSection(section.type, section, profile, inSidebar))
    .join('');
}

export function generateHtml(data: ResumeData): string {
  const { profile, template, options } = data;
  const tc = template?.config;
  const colors: Palette = {
    primary: options?.colors?.primary || tc?.colors?.primary || '#2563EB',
    secondary: options?.colors?.secondary || tc?.colors?.secondary || '#64748B',
    background: options?.colors?.background || tc?.colors?.background || '#FFFFFF',
    text: options?.colors?.text || tc?.colors?.text || '#1E293B',
  };
  const fonts: Fonts = {
    heading: options?.fonts?.heading || tc?.fonts?.heading || 'Inter',
    body: options?.fonts?.body || tc?.fonts?.body || 'Inter',
  };

  const twoColumn = isTwoColumn(template);
  const minimal = isMinimal(template);
  const sidebarWidth = tc?.sidebarWidth || '32%';

  const headerSection = getOrderedSections(template).find((s) => s.type === 'header');
  const mainSections = getMainSections(template).filter((s) => s.type !== 'header');
  const sidebarSections = getSidebarSections(template);

  const headerHtml = headerSection
    ? renderSection('header', headerSection, profile, false)
    : '';

  const bodyHtml = twoColumn
    ? `
      <div class="layout">
        <aside class="sidebar" style="width:${sidebarWidth};">
          ${renderColumn(sidebarSections, profile, true)}
        </aside>
        <main class="main">
          ${renderColumn(mainSections, profile, false)}
        </main>
      </div>`
    : renderColumn(mainSections, profile, false);

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${fonts.body}, sans-serif; color: ${colors.text}; line-height: 1.6; }
    .container { max-width: ${minimal ? '620px' : '860px'}; margin: 0 auto; padding: 40px; background: ${colors.background}; }
    .layout { display: flex; gap: 32px; }
    .sidebar { flex: none; }
    .main { flex: 1; min-width: 0; }
    .preview-header { margin-bottom: 28px; ${minimal ? 'text-align: center;' : ''} }
    .name { font-family: ${fonts.heading}, sans-serif; font-size: ${minimal ? '2.4em' : '2.8em'}; font-weight: 700; color: ${colors.text}; letter-spacing: -0.02em; }
    .headline { color: ${colors.secondary}; margin-top: 6px; }
    .contact-line { color: ${colors.secondary}; font-size: 0.9em; margin-top: 6px; }
    .preview-section { margin-bottom: 24px; }
    .section-title { font-family: ${fonts.heading}, sans-serif; font-size: 1.05em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: ${colors.secondary}; margin-bottom: 12px; ${minimal ? 'text-align: center;' : ''} }
    .section-title.sidebar { color: ${colors.primary}; }
    .item { margin-bottom: 12px; }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 3px; }
    .item-title { font-weight: 600; color: ${colors.text}; }
    .item-date { color: ${colors.secondary}; font-size: 0.85em; white-space: nowrap; }
    .item-company { color: ${colors.primary}; font-weight: 500; }
    .item-location { color: ${colors.secondary}; font-size: 0.85em; }
    .item-description { margin-top: 4px; font-size: 0.92em; color: ${colors.text}; }
    .summary { color: ${colors.text}; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill { background: ${colors.primary}15; color: ${colors.primary}; padding: 4px 12px; border-radius: 15px; font-size: 0.88em; }
    .skill-list { list-style: none; }
    .skill-list li { padding: 3px 0; font-size: 0.92em; }
    .contact-block { font-size: 0.92em; word-break: break-all; }
    .contact-block p { padding: 2px 0; }
    @media print { body { print-color-adjust: exact; } }
  `;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(profile.fullName)} - ${escapeHtml(template?.name || 'Resume')}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    ${headerHtml}
    ${bodyHtml}
  </div>
</body>
</html>`;

  return html;
}