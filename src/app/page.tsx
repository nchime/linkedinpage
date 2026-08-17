'use client';

import ProfileImport from '@/components/editor/ProfileImport';
import ProfileEditor from '@/components/editor/ProfileEditor';
import TemplateSelector from '@/components/templates/TemplateSelector';
import ExportButtons from '@/components/editor/ExportButtons';
import ResumePreview from '@/components/preview/ResumePreview';
import { useResumeStore } from '@/lib/store';

export default function Home() {
  const { profile, isLoading, error } = useResumeStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">LinkedIn Resume Generator</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                LinkedIn 프로필을 전문 이력서로 변환합니다
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <ProfileImport />
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <svg className="animate-spin h-5 w-5 text-blue-600 shrink-0" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-600">프로필을 처리하는 중입니다...</p>
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
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
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
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                전문 이력서 만들기
              </h2>
              <p className="text-sm text-gray-500">
                내 프로필을 가져오거나 PDF 파일을 업로드하여 시작하세요.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            LinkedIn Resume Generator - Transform your professional profile
          </p>
        </div>
      </footer>
    </div>
  );
}