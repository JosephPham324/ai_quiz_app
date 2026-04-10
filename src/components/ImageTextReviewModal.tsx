import { X, Download, Sparkles, Loader2, FileText, AlertCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface ImageTextReviewModalProps {
  filename: string;
  pageCount: number;
  isLoading: boolean;
  error: string | null;
  extractedText: string;
  onTextChange: (text: string) => void;
  onDownload: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function ImageTextReviewModal({
  filename,
  pageCount,
  isLoading,
  error,
  extractedText,
  onTextChange,
  onDownload,
  onSubmit,
  onClose,
}: ImageTextReviewModalProps) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{t.imageReview.title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">{filename}</span>
                {pageCount > 1 && <span className="ml-1">· {pageCount} {t.imageReview.pages}</span>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 min-h-0">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{t.imageReview.readingDoc}</p>
                <p className="text-xs text-gray-400 mt-1">{t.imageReview.extractingFrom} {pageCount > 1 ? `${pageCount} ${t.imageReview.pages}` : t.imageReview.image}</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{t.imageReview.failedTitle}</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {t.imageReview.extractedTextLabel}
                </span>
                <span className="text-xs text-gray-400">
                  {t.imageReview.reviewHint}
                </span>
              </div>
              <textarea
                value={extractedText}
                onChange={(e) => onTextChange(e.target.value)}
                rows={16}
                className="w-full flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y font-mono"
                placeholder={t.imageReview.placeholder}
              />
              <p className="text-xs text-gray-400">
                {t.imageReview.editHint}
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDownload}
            disabled={isLoading || !!error || !extractedText.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {t.imageReview.download}
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading || !!error || !extractedText.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {t.imageReview.useForQuiz}
          </button>
        </div>
      </div>
    </div>
  );
}
