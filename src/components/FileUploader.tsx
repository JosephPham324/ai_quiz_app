import React, { useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useLanguage } from '../contexts/LanguageContext';

// Point the worker to the correct asset URL via Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

interface FileUploaderProps {
  onContentExtracted: (content: string, filename: string) => void;
  /** Called for image / PDF files — passes base64 data URLs and page count */
  onImagesExtracted: (base64Images: string[], filename: string, pageCount: number) => void;
}

async function pdfToBase64Images(file: File): Promise<{ images: string[]; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const MAX_PAGES = 20;
  const pagesToProcess = Math.min(pageCount, MAX_PAGES);
  const images: string[] = [];

  for (let i = 1; i <= pagesToProcess; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better OCR quality
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL('image/png'));
  }

  return { images, pageCount };
}

async function imageFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FileUploader({ onContentExtracted, onImagesExtracted }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const processFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      const name = file.name.toLowerCase();
      const isImage = IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext)) || IMAGE_MIME_TYPES.includes(file.type);
      const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';

      if (isImage) {
        const base64 = await imageFileToBase64(file);
        onImagesExtracted([base64], file.name, 1);
      } else if (isPdf) {
        const { images, pageCount } = await pdfToBase64Images(file);
        if (images.length === 0) throw new Error(t.uploader.errorNoPages);
        onImagesExtracted(images, file.name, pageCount);
      } else if (name.endsWith('.txt') || name.endsWith('.md')) {
        const text = await file.text();
        if (!text.trim()) throw new Error(t.uploader.errorEmpty);
        onContentExtracted(text, file.name);
      } else if (name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        if (!text.trim()) throw new Error(t.uploader.errorEmpty);
        onContentExtracted(text, file.name);
      } else {
        throw new Error(t.uploader.errorUnsupported);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.uploader.errorGeneric;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
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
              {t.uploader.dragHint}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t.uploader.extensionsHint}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t.uploader.visionHint}
            </p>
          </div>

          <div className="mt-4 relative">
            <input
              type="file"
              accept=".txt,.md,.docx,.pdf,.png,.jpg,.jpeg,.webp,.gif"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <button
              type="button"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? t.uploader.processing : t.uploader.browse}
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
