import { create } from 'zustand';
import { LinkedInProfile, ResumeTemplate, ExportFormat, ExportOptions } from '@/types';
import { templates } from '@/lib/templates';

interface ResumeState {
  profile: LinkedInProfile | null;
  selectedTemplate: ResumeTemplate;
  exportOptions: ExportOptions;
  isLoading: boolean;
  error: string | null;
  
  setProfile: (profile: LinkedInProfile | null) => void;
  setSelectedTemplate: (templateId: string) => void;
  setExportOptions: (options: ExportOptions) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultOptions: ExportOptions = {
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
  sections: {
    exclude: [],
  },
};

export const useResumeStore = create<ResumeState>((set) => ({
  profile: null,
  selectedTemplate: templates[0],
  exportOptions: defaultOptions,
  isLoading: false,
  error: null,

  setProfile: (profile) => set({ profile }),
  
  setSelectedTemplate: (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      set({ 
        selectedTemplate: template,
        exportOptions: {
          ...defaultOptions,
          colors: template.config.colors,
          fonts: template.config.fonts,
        },
      });
    }
  },
  
  setExportOptions: (options) => set((state) => ({ 
    exportOptions: { ...state.exportOptions, ...options } 
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({
    profile: null,
    selectedTemplate: templates[0],
    exportOptions: defaultOptions,
    isLoading: false,
    error: null,
  }),
}));
