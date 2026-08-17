'use client';

import { useEffect, useState } from 'react';
import { useResumeStore } from '@/lib/store';

export default function LinkedInSessionButton() {
  const { linkedInLoggedIn, setLinkedInLoggedIn, setError } = useResumeStore();
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => setLinkedInLoggedIn(Boolean(data.loggedIn)))
      .catch(() => {});
  }, [setLinkedInLoggedIn]);

  const handleLogout = async () => {
    if (!window.confirm('LinkedIn 세션을 로그아웃하시겠습니까?')) return;
    setIsBusy(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();
      setLinkedInLoggedIn(false);
      if (data.error) setError(data.error);
    } catch {
      setError('세션 로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  if (!linkedInLoggedIn) return null;

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isBusy}
      title="LinkedIn 세션 로그아웃"
      aria-label="LinkedIn 세션 로그아웃"
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {isBusy ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      )}
      <span className="hidden sm:inline">로그아웃</span>
    </button>
  );
}