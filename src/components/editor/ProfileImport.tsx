'use client';

import { useState, useRef } from 'react';
import { useResumeStore } from '@/lib/store';
import { LinkedInProfile } from '@/types';

type Tab = 'profile' | 'upload';

export default function ProfileImport() {
  const [tab, setTab] = useState<Tab>('profile');
  const [isBusy, setIsBusy] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setProfile, setLoading, setError } = useResumeStore();

  const fetchMyProfile = async () => {
    setIsBusy(true);
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/profile/self', { method: 'POST' });

      if (res.ok) {
        const profile: LinkedInProfile = await res.json();
        setProfile(profile);
        setNeedsLogin(false);
        return;
      }

      const data = await res.json();
      if (res.status === 401 || data.needsLogin) {
        setNeedsLogin(true);
        setMessage('LinkedIn 로그인이 필요합니다. 로그인 버튼을 눌러주세요.');
      } else {
        throw new Error(data.error || '프로필을 불러오지 못했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필을 불러오지 못했습니다.');
    } finally {
      setIsBusy(false);
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsBusy(true);
    setMessage('LinkedIn 로그인 창이 열립니다. 로그인을 완료한 후 기다려 주세요...');
    setError(null);

    try {
      const res = await fetch('/api/auth/login', { method: 'POST' });
      const data = await res.json();

      if (data.loggedIn) {
        setMessage('로그인 완료. 내 프로필을 불러오는 중입니다...');
        await fetchMyProfile();
      } else {
        setNeedsLogin(true);
        setMessage(
          data.canceled
            ? '로그인 창이 닫혔습니다. 다시 시도해 주세요.'
            : '로그인이 완료되지 않았습니다. 다시 시도해 주세요.'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('PDF 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsBusy(true);
    setUploadError(null);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '파일을 파싱하지 못했습니다.');
      }

      const profile: LinkedInProfile = await response.json();

      if (!profile.fullName || profile.fullName === 'Unknown') {
        throw new Error('프로필 데이터를 파싱하지 못했습니다. 파일 형식을 확인해 주세요.');
      }

      setProfile(profile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '파일 업로드에 실패했습니다.';
      setUploadError(msg);
      setError(msg);
    } finally {
      setIsBusy(false);
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFile(files[0]);
  };

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
    }`;

  const buttonClass = (color: 'blue' | 'emerald') =>
    `inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg
     focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
       color === 'blue'
         ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
         : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
     }`;

  const spinner = (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">프로필 불러오기</h2>
          <span className="text-xs text-gray-400">내 LinkedIn 프로필 또는 PDF 파일</span>
        </div>
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button type="button" onClick={() => setTab('profile')} className={tabClass(tab === 'profile')}>
            내 프로필
          </button>
          <button type="button" onClick={() => setTab('upload')} className={tabClass(tab === 'upload')}>
            PDF 업로드
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        {tab === 'profile' ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={fetchMyProfile} disabled={isBusy} className={`${buttonClass('blue')} min-w-[220px] flex-1`}>
                {isBusy ? (
                  <>
                    {spinner}
                    처리 중...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    내 프로필 가져오기
                  </>
                )}
              </button>

              {needsLogin && (
                <button type="button" onClick={handleLogin} disabled={isBusy} className={`${buttonClass('emerald')} min-w-[160px]`}>
                  {isBusy ? (
                    <>
                      {spinner}
                      로그인 처리 중...
                    </>
                  ) : (
                    'LinkedIn 로그인'
                  )}
                </button>
              )}
            </div>

            {message && (
              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">{message}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg py-5 px-4 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              } ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
              <p className="text-sm font-medium text-gray-700">
                {isBusy ? '처리 중...' : 'LinkedIn 프로필 PDF 파일을 여기에 놓거나 클릭'}
              </p>
              <p className="text-xs text-gray-400 mt-1">LinkedIn 데이터 내보내기 PDF 지원</p>
            </div>

            {uploadError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{uploadError}</p>
            )}

            <details className="group text-xs text-gray-500">
              <summary className="cursor-pointer text-blue-600 font-medium">
                LinkedIn 프로필 PDF 내보내기 방법
              </summary>
              <ol className="mt-2 ml-4 list-decimal space-y-1 text-gray-500">
                <li>LinkedIn 설정 및 개인정보 → 데이터 개인정보</li>
                <li>&quot;데이터 사본 받기&quot; → &quot;특별히 필요한 항목이 있나요?&quot;</li>
                <li>원하는 데이터를 선택하고 &quot;아카이브 요청&quot;</li>
                <li>준비되면 PDF 파일을 다운로드</li>
              </ol>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}