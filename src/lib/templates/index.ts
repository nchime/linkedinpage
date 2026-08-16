import { ResumeTemplate, SectionConfig } from '@/types';

export const templates: ResumeTemplate[] = [
  {
    id: 'job',
    name: '취업용 이력서',
    description: '채용 지원용 표준 이력서. 지원 직무와 경력에 초점을 맞춘 단일 컬럼 레이아웃',
    layout: 'single-column',
    thumbnail: '/templates/job.svg',
    config: {
      columns: 1,
      colors: {
        primary: '#1E40AF',
        secondary: '#4B5563',
        background: '#FFFFFF',
        text: '#111827',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      sections: [
        { id: 'header', type: 'header', visible: true, order: 1, column: 'main' },
        { id: 'summary', type: 'summary', title: 'Professional Summary', visible: true, order: 2, column: 'main' },
        { id: 'experience', type: 'experience', title: 'Work Experience', visible: true, order: 3, column: 'main' },
        { id: 'education', type: 'education', title: 'Education', visible: true, order: 4, column: 'main' },
        { id: 'skills', type: 'skills', title: 'Skills', visible: true, order: 5, column: 'main' },
        { id: 'certifications', type: 'certifications', title: 'Certifications', visible: true, order: 6, column: 'main' },
      ],
    },
  },
  {
    id: 'speaker',
    name: '컨퍼런스 연사 소개',
    description: '발표자 소개용. 소개글, 발표/프로젝트, 자격증을 전면에 배치하는 투 컬럼 레이아웃',
    layout: 'two-column',
    thumbnail: '/templates/speaker.svg',
    config: {
      columns: 2,
      sidebarWidth: '32%',
      colors: {
        primary: '#7C3AED',
        secondary: '#6B7280',
        background: '#FFFFFF',
        text: '#1F2937',
      },
      fonts: {
        heading: 'Poppins',
        body: 'Inter',
      },
      sections: [
        { id: 'contact', type: 'contact', title: 'Contact', visible: true, order: 1, column: 'sidebar' },
        { id: 'header', type: 'header', visible: true, order: 2, column: 'main' },
        { id: 'summary', type: 'summary', title: 'About', visible: true, order: 3, column: 'main' },
        { id: 'experience', type: 'experience', title: 'Talks & Career', visible: true, order: 4, column: 'main' },
        { id: 'projects', type: 'projects', title: 'Featured Work', visible: true, order: 5, column: 'main' },
        { id: 'skills', type: 'skills', title: 'Expertise', visible: true, order: 6, column: 'main' },
        { id: 'certifications', type: 'certifications', title: 'Certifications', visible: true, order: 7, column: 'sidebar' },
      ],
    },
  },
  {
    id: 'freelancer',
    name: '외주 개발자 소개서',
    description: '외주/프리랜서 수주용 소개서. 기술 스택과 수행 프로젝트를 전면에 배치한 투 컬럼 레이아웃',
    layout: 'two-column',
    thumbnail: '/templates/freelancer.svg',
    config: {
      columns: 2,
      sidebarWidth: '36%',
      colors: {
        primary: '#0F766E',
        secondary: '#64748B',
        background: '#FFFFFF',
        text: '#0F172A',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      sections: [
        { id: 'contact', type: 'contact', title: 'Contact', visible: true, order: 1, column: 'sidebar' },
        { id: 'header', type: 'header', visible: true, order: 2, column: 'main' },
        { id: 'skills', type: 'skills', title: 'Tech Stack', visible: true, order: 3, column: 'sidebar' },
        { id: 'projects', type: 'projects', title: 'Projects', visible: true, order: 4, column: 'main' },
        { id: 'experience', type: 'experience', title: 'Experience', visible: true, order: 5, column: 'main' },
        { id: 'summary', type: 'summary', title: 'About', visible: true, order: 6, column: 'main' },
        { id: 'certifications', type: 'certifications', title: 'Certifications', visible: true, order: 7, column: 'main' },
      ],
    },
  },
  {
    id: 'personal',
    name: '간략한 개인소개',
    description: '짧고 임팩트 있는 개인 소개. 한 장으로 요약하는 미니멀 레이아웃',
    layout: 'minimal',
    thumbnail: '/templates/personal.svg',
    config: {
      columns: 1,
      colors: {
        primary: '#111827',
        secondary: '#6B7280',
        background: '#FFFFFF',
        text: '#111827',
      },
      fonts: {
        heading: 'Helvetica',
        body: 'Helvetica',
      },
      sections: [
        { id: 'header', type: 'header', visible: true, order: 1, column: 'main' },
        { id: 'summary', type: 'summary', title: 'About', visible: true, order: 2, column: 'main' },
        { id: 'skills', type: 'skills', title: 'Skills', visible: true, order: 3, column: 'main' },
        { id: 'experience', type: 'experience', title: 'Experience', visible: true, order: 4, column: 'main' },
        { id: 'education', type: 'education', title: 'Education', visible: false, order: 5, column: 'main' },
      ],
    },
  },
];

export function getTemplateById(id: string): ResumeTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplateNames(): { id: string; name: string; description: string }[] {
  return templates.map(({ id, name, description }) => ({ id, name, description }));
}

export function getOrderedSections(template: ResumeTemplate | undefined): SectionConfig[] {
  if (!template?.config?.sections) return [];
  return [...template.config.sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
}

export function getMainSections(template: ResumeTemplate | undefined): SectionConfig[] {
  return getOrderedSections(template).filter((s) => s.column !== 'sidebar');
}

export function getSidebarSections(template: ResumeTemplate | undefined): SectionConfig[] {
  return getOrderedSections(template).filter((s) => s.column === 'sidebar');
}

export function isTwoColumn(template: ResumeTemplate | undefined): boolean {
  return template?.config?.columns === 2;
}

export function isMinimal(template: ResumeTemplate | undefined): boolean {
  return template?.layout === 'minimal';
}