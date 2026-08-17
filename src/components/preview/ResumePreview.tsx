'use client';

import { useState } from 'react';
import { useResumeStore } from '@/lib/store';
import { LinkedInProfile } from '@/types';
import { SectionConfig } from '@/types';
import { ResumeTemplate } from '@/types';
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
  inSidebar: boolean,
  showExperienceDetails: boolean,
  minimal: boolean
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
      if (minimal) {
        return (
          <section className="mb-6" key={section.id}>
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: colors.secondary }}>
              {title}
            </h2>
            <div className="space-y-1.5">
              {profile.experiences.map((exp) => (
                <div key={exp.id} className="flex justify-between items-baseline gap-2">
                  <p className="text-sm" style={{ color: colors.text }}>
                    <span className="font-semibold">{exp.title}</span>
                    {exp.company && <span style={{ color: colors.primary }}> · {exp.company}</span>}
                  </p>
                  <span className="text-xs whitespace-nowrap shrink-0" style={{ color: colors.secondary }}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate || 'Present'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      }
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
                {showExperienceDetails && exp.location && (
                  <p className="text-xs" style={{ color: colors.secondary }}>{exp.location}</p>
                )}
                {showExperienceDetails && exp.description && (
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

function buildPlainText(profile: LinkedInProfile, template: ResumeTemplate): string {
  const sections = getOrderedSections(template).filter((s) => s.type !== 'header');
  const showDetails = template.config.showExperienceDescription ?? true;
  const titleOf = (s: SectionConfig) => s.title || defaultTitle(s.type);
  const out: string[] = [];

  out.push(profile.fullName);
  if (profile.headline) out.push(profile.headline);
  const contactLine = [profile.location, profile.email, profile.phone].filter(Boolean).join(' · ');
  if (contactLine) out.push(contactLine);

  for (const section of sections) {
    switch (section.type) {
      case 'summary':
        if (profile.summary) out.push('', titleOf(section), '', profile.summary);
        break;
      case 'experience':
        out.push('', titleOf(section), '');
        for (const exp of profile.experiences) {
          const period = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}`;
          out.push(`${exp.title}${exp.company ? ` · ${exp.company}` : ''} (${period})`);
          if (showDetails && exp.description) {
            out.push(exp.description.split('\n').map((l) => `  ${l}`).join('\n'));
          }
        }
        break;
      case 'education':
        out.push('', titleOf(section), '');
        for (const edu of profile.education) {
          out.push(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''} - ${edu.school} (${edu.startDate} - ${edu.endDate})`);
        }
        break;
      case 'skills':
        out.push('', titleOf(section), '', profile.skills.map((s) => s.name).join(' · '));
        break;
      case 'certifications':
        if (profile.certifications?.length) {
          out.push('', titleOf(section), '');
          for (const cert of profile.certifications) {
            out.push(`- ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ''}`);
          }
        }
        break;
      case 'projects':
        if (profile.projects?.length) {
          out.push('', titleOf(section), '');
          for (const project of profile.projects) {
            out.push(`- ${project.name}`);
            if (project.description) out.push(project.description);
          }
        }
        break;
      case 'contact':
        break;
      default:
        break;
    }
  }

  return out.join('\n').trim();
}

export default function ResumePreview() {
  const { profile, selectedTemplate, exportOptions } = useResumeStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!profile) return;
    const text = buildPlainText(profile, selectedTemplate);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

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
  const showExperienceDetails = selectedTemplate.config.showExperienceDescription ?? true;

  const renderColumnSections = (sections: SectionConfig[], inSidebar: boolean) =>
    sections.map((section) => renderSection(section.type, section, profile, colors, fonts, inSidebar, showExperienceDetails, minimal));

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{selectedTemplate.name} 템플릿</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {copied ? (
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </div>

      <div className="p-8" style={{ background: colors.background }}>
        <div
          className={minimal ? 'max-w-[520px] mx-auto text-center' : 'max-w-[600px] mx-auto'}
        >
          {headerSection && renderSection('header', headerSection, profile, colors, fonts, false, showExperienceDetails, minimal)}

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