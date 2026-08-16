export interface LinkedInProfile {
  id: string;
  fullName: string;
  headline: string;
  summary: string;
  location: string;
  email?: string;
  phone?: string;
  profileUrl: string;
  avatarUrl?: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  certifications?: Certification[];
  projects?: Project[];
  languages?: Language[];
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  location?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  endorsements?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  url?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'elementary' | 'limited' | 'professional' | 'full' | 'native';
}

export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'html' | 'markdown' | 'json';

export interface ExportConfig {
  format: ExportFormat;
  templateId: string;
  options?: ExportOptions;
}

export interface ExportOptions {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  sections?: {
    include?: string[];
    exclude?: string[];
  };
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  layout: 'single-column' | 'two-column' | 'minimal' | 'creative';
  thumbnail: string;
  config: TemplateConfig;
}

export interface TemplateConfig {
  columns: number;
  sidebarWidth?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  sections: SectionConfig[];
}

export interface SectionConfig {
  id: string;
  type: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'languages' | 'contact';
  title?: string;
  visible: boolean;
  order: number;
  column?: 'main' | 'sidebar';
}

export interface ResumeData {
  profile: LinkedInProfile;
  template: ResumeTemplate;
  options: ExportOptions;
}
