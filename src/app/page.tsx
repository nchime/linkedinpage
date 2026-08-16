'use client';

import FileUpload from '@/components/editor/FileUpload';
import MyProfileButton from '@/components/editor/MyProfileButton';
import ProfileEditor from '@/components/editor/ProfileEditor';
import TemplateSelector from '@/components/templates/TemplateSelector';
import ExportButtons from '@/components/editor/ExportButtons';
import ResumePreview from '@/components/preview/ResumePreview';
import { useResumeStore } from '@/lib/store';

export default function Home() {
  const { profile, isLoading, error } = useResumeStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                LinkedIn Resume Generator
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Transform your LinkedIn profile into a professional resume
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-8">
          <MyProfileButton />
          <FileUpload />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="mb-6 p-8 bg-white rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Processing your profile...</p>
            </div>
          </div>
        )}

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ProfileEditor />
              <TemplateSelector />
              <ExportButtons />
            </div>
            
            <div className="lg:sticky lg:top-8 lg:self-start">
              <ResumePreview />
            </div>
          </div>
        )}

        {!profile && !isLoading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Create Your Professional Resume
              </h2>
              <p className="text-gray-500">
                Upload your LinkedIn profile PDF export to get started.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            LinkedIn Resume Generator - Transform your professional profile
          </p>
        </div>
      </footer>
    </div>
  );
}
