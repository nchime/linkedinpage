'use client';

import { useResumeStore } from '@/lib/store';
import { templates } from '@/lib/templates';

export default function TemplateSelector() {
  const { selectedTemplate, setSelectedTemplate } = useResumeStore();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Template</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              selectedTemplate.id === template.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-[8.5/11] bg-gray-100 rounded mb-3 flex items-center justify-center">
              <div 
                className="w-full h-full p-2"
                style={{ 
                  background: template.config.colors.background,
                  borderLeft: `4px solid ${template.config.colors.primary}`
                }}
              >
                <div 
                  className="h-2 w-1/2 mb-1 rounded"
                  style={{ background: template.config.colors.primary }}
                />
                <div 
                  className="h-1 w-3/4 mb-2 rounded"
                  style={{ background: template.config.colors.secondary }}
                />
                <div 
                  className="h-1 w-full mb-1 rounded"
                  style={{ background: template.config.colors.text + '40' }}
                />
                <div 
                  className="h-1 w-full mb-1 rounded"
                  style={{ background: template.config.colors.text + '40' }}
                />
                <div 
                  className="h-1 w-2/3 rounded"
                  style={{ background: template.config.colors.text + '40' }}
                />
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
