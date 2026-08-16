'use client';

import { useState } from 'react';
import { useResumeStore } from '@/lib/store';
import { LinkedInProfile } from '@/types';

export default function ProfileEditor() {
  const { profile, setProfile } = useResumeStore();
  const [activeSection, setActiveSection] = useState<string | null>('summary');

  if (!profile) return null;

  const updateProfile = (updates: Partial<LinkedInProfile>) => {
    setProfile({ ...profile, ...updates });
  };

  const sections = [
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certifications' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b">
        {profile.avatarUrl && (
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
          <p className="text-gray-600">{profile.headline}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeSection === 'summary' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary
            </label>
            <textarea
              value={profile.summary}
              onChange={(e) => updateProfile({ summary: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {activeSection === 'experience' && (
          <div className="space-y-4">
            {profile.experiences.map((exp, index) => (
              <div key={exp.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{exp.title || 'No Title'}</h3>
                    {exp.company && <p className="text-blue-600">{exp.company}</p>}
                    {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                  </div>
                  <span className="text-sm text-gray-500">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) => {
                    const newExperiences = [...profile.experiences];
                    newExperiences[index] = { ...exp, description: e.target.value };
                    updateProfile({ experiences: newExperiences });
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        )}

        {activeSection === 'education' && (
          <div className="space-y-4">
            {profile.education.map((edu) => (
              <div key={edu.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                <p className="text-blue-600">{edu.school}</p>
                <p className="text-sm text-gray-500">
                  {edu.startDate} - {edu.endDate}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'skills' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={profile.skills.map((s) => s.name).join(', ')}
              onChange={(e) => {
                const skillNames = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                updateProfile({
                  skills: skillNames.map((name, index) => ({
                    id: `skill-${index}`,
                    name,
                    endorsements: 0,
                  })),
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {activeSection === 'certifications' && (
          <div className="space-y-4">
            {profile.certifications && profile.certifications.length > 0 ? (
              profile.certifications.map((cert, index) => (
                <div key={cert.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{cert.name}</h3>
                      {cert.issuer && <p className="text-blue-600">{cert.issuer}</p>}
                    </div>
                    {cert.issueDate && (
                      <span className="text-sm text-gray-500">{cert.issueDate}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No certifications found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
