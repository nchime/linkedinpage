'use client';

import { useState } from 'react';
import { useResumeStore } from '@/lib/store';
import { ExportFormat } from '@/types';

export default function ExportButtons() {
  const { profile, selectedTemplate, exportOptions } = useResumeStore();
  const [isGenerating, setIsGenerating] = useState<ExportFormat | null>(null);

  const formats: { format: ExportFormat; label: string; icon: string }[] = [
    { format: 'json', label: 'JSON', icon: '📋' },
    { format: 'pdf', label: 'PDF', icon: '📄' },
    { format: 'docx', label: 'Word', icon: '📝' },
    { format: 'pptx', label: 'PowerPoint', icon: '📊' },
    { format: 'html', label: 'HTML', icon: '🌐' },
    { format: 'markdown', label: 'Markdown', icon: '📋' },
  ];

  const handleExport = async (format: ExportFormat) => {
    if (!profile) return;

    setIsGenerating(format);

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          template: selectedTemplate,
          options: exportOptions,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.fullName.replace(/\s+/g, '_')}_resume.${format === 'markdown' ? 'md' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Export Resume</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {formats.map(({ format, label, icon }) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            disabled={!profile || isGenerating !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating === format ? (
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <span className="text-xl">{icon}</span>
            )}
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
