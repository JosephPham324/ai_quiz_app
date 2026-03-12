import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import * as mammoth from 'mammoth';

interface FileUploaderProps {
  onContentExtracted: (content: string, filename: string) => void;
}

export default function FileUploader({ onContentExtracted }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = async (file: File) => {
    setError(null);
    setIsLoading(true);
    
    try {
      let text = '';
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        text = await file.text();
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        throw new Error('Unsupported file type. Please upload .txt, .md, or .docx');
      }

      if (!text.trim()) {
        throw new Error('The file appears to be empty.');
      }

      onContentExtracted(text, file.name);
    } catch (err: any) {
      setError(err.message || 'An error occurred while reading the file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Drag and drop your knowledge file here
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports .txt, .md, and .docx formats
            </p>
          </div>
          
          <div className="mt-4 relative">
            <input
              type="file"
              accept=".txt,.md,.docx"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <button
              type="button"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Browse Files'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
