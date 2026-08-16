'use client';

import { useResumeStore } from '@/lib/store';

export default function ResumePreview() {
  const { profile, selectedTemplate, exportOptions } = useResumeStore();

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Enter a LinkedIn URL to preview your resume</p>
      </div>
    );
  }

  const colors = exportOptions.colors || selectedTemplate.config.colors;
  const fonts = exportOptions.fonts || selectedTemplate.config.fonts;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
        <span className="text-sm text-gray-500">{selectedTemplate.name} Template</span>
      </div>
      
      <div className="p-8" style={{ background: colors.background }}>
        <div className="max-w-[600px] mx-auto">
          <header className="mb-8 text-center">
            <h2 
              className="text-lg font-semibold uppercase tracking-widest mb-4"
              style={{ color: colors.secondary }}
            >
              Career Profile
            </h2>
            <h1 
              className="text-5xl font-bold mb-4 tracking-tight"
              style={{ fontFamily: fonts.heading, color: colors.text }}
            >
              {profile.fullName}
            </h1>
            <div 
              className="flex flex-wrap items-center justify-center gap-3 text-sm"
              style={{ color: colors.secondary }}
            >
              {profile.email && (
                <a 
                  href={`mailto:${profile.email}`} 
                  style={{ color: colors.primary }}
                  className="hover:underline"
                >
                  {profile.email}
                </a>
              )}
              {profile.email && profile.headline && <span>·</span>}
              {profile.headline && (
                <span>{profile.headline}</span>
              )}
            </div>
          </header>

          {profile.summary && exportOptions.sections?.exclude?.includes('summary') !== true && (
            <section className="mb-6">
              <h2 
                className="text-lg font-semibold mb-2 pb-1"
                style={{ 
                  fontFamily: fonts.heading, 
                  color: colors.primary,
                  borderBottom: `1px solid ${colors.secondary}`
                }}
              >
                Professional Summary
              </h2>
              <p style={{ color: colors.text }}>{profile.summary}</p>
            </section>
          )}

          {profile.experiences.length > 0 && exportOptions.sections?.exclude?.includes('experience') !== true && (
            <section className="mb-6">
              <h2 
                className="text-lg font-semibold mb-2 pb-1"
                style={{ 
                  fontFamily: fonts.heading, 
                  color: colors.primary,
                  borderBottom: `1px solid ${colors.secondary}`
                }}
              >
                Work Experience
              </h2>
              <div className="space-y-4">
                {profile.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold" style={{ color: colors.text }}>{exp.title}</h3>
                      <span className="text-sm" style={{ color: colors.secondary }}>
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: colors.primary }}>{exp.company}</p>
                    {exp.location && (
                      <p className="text-xs" style={{ color: colors.secondary }}>{exp.location}</p>
                    )}
                    <p className="text-sm mt-1" style={{ color: colors.text }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.education.length > 0 && exportOptions.sections?.exclude?.includes('education') !== true && (
            <section className="mb-6">
              <h2 
                className="text-lg font-semibold mb-2 pb-1"
                style={{ 
                  fontFamily: fonts.heading, 
                  color: colors.primary,
                  borderBottom: `1px solid ${colors.secondary}`
                }}
              >
                Education
              </h2>
              <div className="space-y-3">
                {profile.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold" style={{ color: colors.text }}>
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                      </h3>
                      <span className="text-sm" style={{ color: colors.secondary }}>
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: colors.primary }}>{edu.school}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.skills.length > 0 && exportOptions.sections?.exclude?.includes('skills') !== true && (
            <section>
              <h2 
                className="text-lg font-semibold mb-2 pb-1"
                style={{ 
                  fontFamily: fonts.heading, 
                  color: colors.primary,
                  borderBottom: `1px solid ${colors.secondary}`
                }}
              >
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ 
                      background: `${colors.primary}15`,
                      color: colors.primary 
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {profile.certifications && profile.certifications.length > 0 && exportOptions.sections?.exclude?.includes('certifications') !== true && (
            <section>
              <h2 
                className="text-lg font-semibold mb-2 pb-1"
                style={{ 
                  fontFamily: fonts.heading, 
                  color: colors.primary,
                  borderBottom: `1px solid ${colors.secondary}`
                }}
              >
                Certifications
              </h2>
              <div className="space-y-2">
                {profile.certifications.map((cert) => (
                  <div key={cert.id}>
                    <h3 className="font-medium" style={{ color: colors.text }}>{cert.name}</h3>
                    {cert.issuer && <p className="text-sm" style={{ color: colors.primary }}>{cert.issuer}</p>}
                    {cert.issueDate && <p className="text-xs" style={{ color: colors.secondary }}>{cert.issueDate}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
