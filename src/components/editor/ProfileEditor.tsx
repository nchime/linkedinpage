'use client';

import { useState } from 'react';
import { useResumeStore } from '@/lib/store';
import {
  LinkedInProfile,
  Experience,
  Education,
  Skill,
  Certification,
} from '@/types';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const cardClass = 'p-4 border rounded-lg space-y-3';
const rowClass = 'grid grid-cols-1 sm:grid-cols-2 gap-3';

export default function ProfileEditor() {
  const { profile, setProfile } = useResumeStore();
  const [activeSection, setActiveSection] = useState<string | null>('profile');

  if (!profile) return null;

  const updateProfile = (updates: Partial<LinkedInProfile>) => {
    setProfile({ ...profile, ...updates });
  };

  const sections = [
    { id: 'profile', label: '기본 정보' },
    { id: 'experience', label: '경력' },
    { id: 'education', label: '학력' },
    { id: 'skills', label: '보유기술' },
    { id: 'certifications', label: '자격증' },
  ];

  const field = (label: string, value: string, onChange: (v: string) => void) => (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );

  const updateExperiences = (index: number, updates: Partial<Experience>) => {
    const experiences = profile.experiences.map((exp, i) =>
      i === index ? { ...exp, ...updates } : exp
    );
    updateProfile({ experiences });
  };

  const updateEducation = (index: number, updates: Partial<Education>) => {
    const education = profile.education.map((edu, i) =>
      i === index ? { ...edu, ...updates } : edu
    );
    updateProfile({ education });
  };

  const updateCertifications = (index: number, updates: Partial<Certification>) => {
    const certifications = (profile.certifications || []).map((cert, i) =>
      i === index ? { ...cert, ...updates } : cert
    );
    updateProfile({ certifications });
  };

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
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => updateProfile({ fullName: e.target.value })}
            className="w-full text-xl font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={profile.headline}
            onChange={(e) => updateProfile({ headline: e.target.value })}
            className="w-full text-sm text-gray-600 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-500 mt-1"
          />
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
        {activeSection === 'profile' && (
          <div className={rowClass}>
            {field('이름', profile.fullName, (v) => updateProfile({ fullName: v }))}
            {field('이메일', profile.email || '', (v) => updateProfile({ email: v }))}
            {field('전화번호', profile.phone || '', (v) => updateProfile({ phone: v }))}
            {field('위치', profile.location, (v) => updateProfile({ location: v }))}
            {field('프로필 URL', profile.profileUrl, (v) => updateProfile({ profileUrl: v }))}
            <label className="block">
              <span className={labelClass}>헤드라인</span>
              <input
                type="text"
                value={profile.headline}
                onChange={(e) => updateProfile({ headline: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>소개</span>
              <textarea
                value={profile.summary}
                onChange={(e) => updateProfile({ summary: e.target.value })}
                rows={4}
                className={inputClass}
              />
            </label>
          </div>
        )}

        {activeSection === 'experience' && (
          <div className="space-y-4">
            {profile.experiences.map((exp, index) => (
              <div key={exp.id} className={cardClass}>
                <div className={rowClass}>
                  {field('직책', exp.title, (v) => updateExperiences(index, { title: v }))}
                  {field('회사', exp.company, (v) => updateExperiences(index, { company: v }))}
                  {field('시작일', exp.startDate, (v) => updateExperiences(index, { startDate: v }))}
                  {field('종료일', exp.endDate || '', (v) => updateExperiences(index, { endDate: v }))}
                  {field('위치', exp.location || '', (v) => updateExperiences(index, { location: v }))}
                  <label className="flex items-end gap-2">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        updateExperiences(index, { current: e.target.checked, endDate: e.target.checked ? undefined : exp.endDate })
                      }
                      className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">재직 중</span>
                  </label>
                </div>
                <label className="block">
                  <span className={labelClass}>상세 내용</span>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperiences(index, { description: e.target.value })}
                    rows={3}
                    className={inputClass}
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'education' && (
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={edu.id} className={cardClass}>
                <div className={rowClass}>
                  {field('학교', edu.school, (v) => updateEducation(index, { school: v }))}
                  {field('학위', edu.degree, (v) => updateEducation(index, { degree: v }))}
                  {field('전공', edu.field, (v) => updateEducation(index, { field: v }))}
                  {field('시작일', edu.startDate, (v) => updateEducation(index, { startDate: v }))}
                  {field('종료일', edu.endDate, (v) => updateEducation(index, { endDate: v }))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'skills' && (
          <div>
            <label className={labelClass}>보유기술 (쉼표로 구분)</label>
            <input
              type="text"
              value={profile.skills.map((s) => s.name).join(', ')}
              onChange={(e) => {
                const skillNames = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                const skills: Skill[] = skillNames.map((name, index) => ({
                  id: `skill-${index}`,
                  name,
                  endorsements: profile.skills[index]?.endorsements ?? 0,
                }));
                updateProfile({ skills });
              }}
              className={inputClass}
            />
          </div>
        )}

        {activeSection === 'certifications' && (
          <div className="space-y-4">
            {profile.certifications && profile.certifications.length > 0 ? (
              profile.certifications.map((cert, index) => (
                <div key={cert.id} className={cardClass}>
                  <div className={rowClass}>
                    {field('자격증명', cert.name, (v) => updateCertifications(index, { name: v }))}
                    {field('발급 기관', cert.issuer, (v) => updateCertifications(index, { issuer: v }))}
                    {field('취득일', cert.issueDate, (v) => updateCertifications(index, { issueDate: v }))}
                    {field('만료일', cert.expirationDate || '', (v) => updateCertifications(index, { expirationDate: v }))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">자격증이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
