import { ResumeTemplate } from '@/types';

export const templates: ResumeTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean and professional single-column layout',
    layout: 'single-column',
    thumbnail: '/templates/classic.svg',
    config: {
      columns: 1,
      colors: {
        primary: '#1F2937',
        secondary: '#4B5563',
        background: '#FFFFFF',
        text: '#111827',
      },
      fonts: {
        heading: 'Georgia',
        body: 'Arial',
      },
      sections: [
        { id: 'header', type: 'header', visible: true, order: 1 },
        { id: 'summary', type: 'summary', title: 'Professional Summary', visible: true, order: 2 },
        { id: 'experience', type: 'experience', title: 'Work Experience', visible: true, order: 3 },
        { id: 'education', type: 'education', title: 'Education', visible: true, order: 4 },
        { id: 'skills', type: 'skills', title: 'Skills', visible: true, order: 5 },
      ],
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column layout with sidebar',
    layout: 'two-column',
    thumbnail: '/templates/modern.svg',
    config: {
      columns: 2,
      sidebarWidth: '35%',
      colors: {
        primary: '#2563EB',
        secondary: '#64748B',
        background: '#FFFFFF',
        text: '#1E293B',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      sections: [
        { id: 'sidebar', type: 'contact', visible: true, order: 1 },
        { id: 'header', type: 'header', visible: true, order: 2 },
        { id: 'summary', type: 'summary', title: 'About', visible: true, order: 3 },
        { id: 'experience', type: 'experience', title: 'Experience', visible: true, order: 4 },
        { id: 'education', type: 'education', title: 'Education', visible: true, order: 5 },
        { id: 'skills', type: 'skills', title: 'Skills', visible: true, order: 6 },
      ],
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and clean design with focus on content',
    layout: 'minimal',
    thumbnail: '/templates/minimal.svg',
    config: {
      columns: 1,
      colors: {
        primary: '#000000',
        secondary: '#6B7280',
        background: '#FFFFFF',
        text: '#111827',
      },
      fonts: {
        heading: 'Helvetica',
        body: 'Helvetica',
      },
      sections: [
        { id: 'header', type: 'header', visible: true, order: 1 },
        { id: 'summary', type: 'summary', visible: false, order: 2 },
        { id: 'experience', type: 'experience', title: 'Experience', visible: true, order: 3 },
        { id: 'education', type: 'education', title: 'Education', visible: true, order: 4 },
        { id: 'skills', type: 'skills', title: 'Skills', visible: true, order: 5 },
      ],
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Colorful and eye-catching design',
    layout: 'creative',
    thumbnail: '/templates/creative.svg',
    config: {
      columns: 2,
      sidebarWidth: '40%',
      colors: {
        primary: '#7C3AED',
        secondary: '#A78BFA',
        background: '#F5F3FF',
        text: '#1E1B4B',
      },
      fonts: {
        heading: 'Poppins',
        body: 'Roboto',
      },
      sections: [
        { id: 'sidebar', type: 'contact', visible: true, order: 1 },
        { id: 'header', type: 'header', visible: true, order: 2 },
        { id: 'summary', type: 'summary', title: 'Profile', visible: true, order: 3 },
        { id: 'experience', type: 'experience', title: 'Work History', visible: true, order: 4 },
        { id: 'education', type: 'education', title: 'Education', visible: true, order: 5 },
        { id: 'skills', type: 'skills', title: 'Expertise', visible: true, order: 6 },
        { id: 'projects', type: 'projects', title: 'Projects', visible: true, order: 7 },
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
