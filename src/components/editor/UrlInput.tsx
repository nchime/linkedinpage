'use client';

import { useState } from 'react';
import { useResumeStore } from '@/lib/store';
import { validateLinkedInUrl, extractLinkedInUrl } from '@/lib/linkedin';
import { LinkedInProfile } from '@/types';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(true);
  const { setProfile, setLoading, setError, isLoading } = useResumeStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLinkedInUrl(url)) {
      setIsValid(false);
      return;
    }

    setIsValid(true);
    setLoading(true);
    setError(null);

    try {
      const profileId = extractLinkedInUrl(url);
      if (!profileId) {
        throw new Error('Invalid LinkedIn URL');
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, profileId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile: LinkedInProfile = await response.json();
      setProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile URL
          </label>
          <input
            type="text"
            id="linkedin-url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setIsValid(true);
            }}
            placeholder="https://www.linkedin.com/in/username"
            className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 ${
              isValid 
                ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                : 'border-red-500 focus:ring-red-500 focus:border-red-500'
            }`}
            disabled={isLoading}
          />
          {!isValid && (
            <p className="mt-2 text-sm text-red-600">
              Please enter a valid LinkedIn profile URL
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !url}
          className="w-full px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Resume'
          )}
        </button>
      </div>
    </form>
  );
}
