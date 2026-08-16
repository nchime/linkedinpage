'use client';

import { useState } from 'react';
import { useResumeStore } from '@/lib/store';
import { LinkedInProfile } from '@/types';

export default function MyProfileButton() {
  const [isBusy, setIsBusy] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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
        setMessage(
          'LinkedIn 로그인이 필요합니다. "LinkedIn 로그인" 버튼을 눌러 로그인해 주세요.'
        );
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

  const disabled = isBusy;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">내 프로필 가져오기</h2>
            <p className="mt-1 text-sm text-gray-500">
              로그인한 내 LinkedIn 계정의 프로필을 PDF로 다운로드하여 이력서로 변환합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMyProfile}
            disabled={disabled}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBusy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                처리 중...
              </span>
            ) : (
              '내 프로필 가져오기'
            )}
          </button>

          {message && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">{message}</p>
            </div>
          )}

          {needsLogin && (
            <button
              type="button"
              onClick={handleLogin}
              disabled={disabled}
              className="w-full px-6 py-3 text-lg font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBusy ? '로그인 처리 중...' : 'LinkedIn 로그인'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}