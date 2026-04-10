import React, { useState } from 'react';
import { X, Key, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsModalProps {
  currentKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function SettingsModal({ currentKey, onSave, onClose }: SettingsModalProps) {
  const [key, setKey] = useState(currentKey);
  const { language, setLanguage, t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(key.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{t.settings.apiSettings}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              {t.settings.apiKeyLabel}
            </label>
            <input
              type="password"
              id="apiKey"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={t.settings.apiKeyPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              {t.settings.apiKeyDesc}
            </p>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4" /> {t.settings.languageLabel}
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="en">{t.settings.languageEn}</option>
              <option value="vi">{t.settings.languageVi}</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {t.settings.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {t.settings.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
