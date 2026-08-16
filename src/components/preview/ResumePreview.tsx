'use client';

import { useResumeStore } from '@/lib/store';
import { LinkedInProfile } from '@/types';
import { SectionConfig } from '@/types';
import {
  getOrderedSections,
  getMainSections,
  getSidebarSections,
  isTwoColumn,
  isMinimal,
} from '@/lib/templates';

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

function renderSection(
  type: SectionConfig['type'],
  section: SectionConfig,
  profile: LinkedInProfile,
  colors: Palette,
  fonts: Fonts,
  inSidebar: boolean
) {
  const title = section.title || defaultTitle(type);

  switch (type) {
    case 'summary':
      return (
        <section className="mb-6" key={section.id}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: colors.secondary }}>
            {title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.text }}>{profile.summary}</p>
        </section>
      );
    case 'experience':
      return (
        <section className="mb-6" key={section.id}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: colors.secondary }}>
            {title}
          </h2>
          <div className="space-y-4">
            {profile.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="font-semibold" style={{ color: colors.text }}>{exp.title}</h3>
                  <span className="text-xs whitespace-nowrap" style={{ color: colors.secondary }}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate || 'Present'}
                  </span>
                </div>
                <p className="text-sm" style={{ color: colors.primary }}>{exp.company}</p>
                {exp.location && (
                  <p className="text-xs" style={{ color: colors.secondary }}>{exp.location}</p>
                )}
                {exp.description && (
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: colors.text }}>{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    case 'education':
      return (
        <section className="mb-6" key={section.id}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: colors.secondary }}>
            {title}
          </h2>
          <div className="space-y-3">
            {profile.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="font-semibold" style={{ color: colors.text }}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </h3>
                  <span className="text-xs whitespace-nowrap" style={{ color: colors.secondary }}>
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="text-sm" style={{ color: colors.primary }}>{edu.school}</p>
              </div>
            ))}
          </div>
        </section>
      );
    case 'skills':
      if (inSidebar) {
        return (
          <section className="mb-6" key={section.id}>
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: colors.secondary }}>
              {title}
            </h2>
            <ul className="space-y-1">
              {profile.skills.map((skill) => (
                <li key={skill.id} className="text-sm" style={{ color: colors.text }}>{skill.name}</li>
              ))}
            </ul>
          </section>
        );
      }
      return (
        <section className="mb-6" key={section.id}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: colors.secondary }}>
            {title}
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 rounded-full text-sm"
                style={{ background: `${colors.primary}15`, color: colors.primary }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      );
    case 'certifications':
      return (
        <section className="mb-6" key={section.id}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: colors.secondary }}>
            {title}
          </h2>
          <div className="space-y-2">
            {profile.certifications?.map((cert) => (
              <div key={cert.id}>
                <h3 className="text-sm font-medium" style={{ color: colors.text }}>{cert.name}</h3>
                {cert.issuer && <p className="text-xs" style={{ color: colors.primary }}>{cert.issuer}</p>}
                {cert.issueDate && <p className="text-xs" style={{ color: colors.secondary }}>{cert.issueDate}</p>}
              </div>
            ))}
          </div>
        </section>
      );
    case 'projects':
      return (
        <section className="mb-6" key={section.id}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: colors.secondary }}>
            {title}
          </h2>
          <div className="space-y-3">
            {profile.projects?.map((project) => (
              <div key={project.id}>
                <h3 className="font-semibold" style={{ color: colors.text }}>{project.name}</h3>
                {project.url && (
                  <p className="text-xs" style={{ color: colors.primary }}>{project.url}</p>
                )}
                {project.description && (
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: colors.text }}>{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    case 'contact':
      return (
        <section className="mb-6" key={section.id}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: colors.secondary }}>
            {title}
          </h2>
          <div className="space-y-1 text-sm">
            {profile.email && <p style={{ color: colors.text }}>{profile.email}</p>}
            {profile.phone && <p style={{ color: colors.text }}>{profile.phone}</p>}
            {profile.location && <p style={{ color: colors.text }}>{profile.location}</p>}
            {profile.profileUrl && (
              <p className="break-all" style={{ color: colors.primary }}>{profile.profileUrl}</p>
            )}
          </div>
        </section>
      );
    case 'header':
      return (
        <header className="mb-6" key={section.id}>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: fonts.heading, color: colors.text }}>
            {profile.fullName}
          </h1>
          {profile.headline && (
            <p className="mt-1 text-sm" style={{ color: colors.secondary }}>{profile.headline}</p>
          )}
          {(profile.location || profile.email || profile.phone) && (
            <p className="mt-1 text-xs" style={{ color: colors.secondary }}>
              {[profile.location, profile.email, profile.phone].filter(Boolean).join(' · ')}
            </p>
          )}
        </header>
      );
    default:
      return null;
  }
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

export default function ResumePreview() {
  const { profile, selectedTemplate, exportOptions } = useResumeStore();

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Enter a LinkedIn URL to preview your resume</p>
      </div>
    );
  }

  const colors: Palette = {
    primary: exportOptions.colors?.primary || selectedTemplate.config.colors.primary,
    secondary: exportOptions.colors?.secondary || selectedTemplate.config.colors.secondary,
    background: exportOptions.colors?.background || selectedTemplate.config.colors.background,
    text: exportOptions.colors?.text || selectedTemplate.config.colors.text,
  };
  const fonts: Fonts = {
    heading: exportOptions.fonts?.heading || selectedTemplate.config.fonts.heading,
    body: exportOptions.fonts?.body || selectedTemplate.config.fonts.body,
  };

  const mainSections = getMainSections(selectedTemplate).filter((s) => s.type !== 'header');
  const sidebarSections = getSidebarSections(selectedTemplate);
  const headerSection = getOrderedSections(selectedTemplate).find((s) => s.type === 'header');
  const twoColumn = isTwoColumn(selectedTemplate);
  const minimal = isMinimal(selectedTemplate);
  const sidebarWidth = selectedTemplate.config.sidebarWidth || '32%';

  const renderColumnSections = (sections: SectionConfig[], inSidebar: boolean) =>
    sections.map((section) => renderSection(section.type, section, profile, colors, fonts, inSidebar));

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
        <span className="text-sm text-gray-500">{selectedTemplate.name} 템플릿</span>
      </div>

      <div className="p-8" style={{ background: colors.background }}>
        <div
          className={minimal ? 'max-w-[520px] mx-auto text-center' : 'max-w-[600px] mx-auto'}
        >
          {headerSection && renderSection('header', headerSection, profile, colors, fonts, false)}

          {twoColumn ? (
            <div className="flex gap-8">
              <div className="flex-none" style={{ width: sidebarWidth }}>
                {renderColumnSections(sidebarSections, true)}
              </div>
              <div className="flex-1 min-w-0">
                {renderColumnSections(mainSections, false)}
              </div>
            </div>
          ) : (
            <div>{renderColumnSections(mainSections, false)}</div>
          )}
        </div>
      </div>
    </div>
  );
}