import { useState, useMemo } from "react";
import { X, Play, Shuffle, FileText, Hash } from "lucide-react";
import type { QuizConfig } from "../types";

interface QuizConfigModalProps {
  totalAvailable: number;
  sourceFiles: string[];
  onStart: (config: QuizConfig) => void;
  onClose: () => void;
}

export default function QuizConfigModal({ totalAvailable, sourceFiles, onStart, onClose }: QuizConfigModalProps) {
  const [totalQuestions, setTotalQuestions] = useState(totalAvailable);
  const [questionsPerFile, setQuestionsPerFile] = useState(0); // 0 = no per-file limit
  const [scrambled, setScrambled] = useState(false);

  const effectiveMax = useMemo(() => {
    if (questionsPerFile > 0 && sourceFiles.length > 0) {
      return Math.min(totalAvailable, questionsPerFile * sourceFiles.length);
    }
    return totalAvailable;
  }, [questionsPerFile, sourceFiles.length, totalAvailable]);

  const handleStart = () => {
    onStart({
      totalQuestions: Math.min(totalQuestions, effectiveMax),
      questionsPerFile,
      scrambled,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-600" />
            Quiz Configuration
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Total questions */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Hash className="w-4 h-4 text-indigo-500" />
              Number of Questions
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={totalAvailable}
                value={Math.min(totalQuestions, effectiveMax)}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="number"
                min={1}
                max={totalAvailable}
                value={Math.min(totalQuestions, effectiveMax)}
                onChange={(e) => setTotalQuestions(Math.max(1, Math.min(totalAvailable, Number(e.target.value))))}
                className="w-16 text-center text-sm font-medium border border-gray-200 rounded-lg py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-400">/ {totalAvailable}</span>
            </div>
          </div>

          {/* Questions per source file */}
          {sourceFiles.length > 1 && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Questions per Source File
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={totalAvailable}
                  value={questionsPerFile}
                  onChange={(e) => setQuestionsPerFile(Math.max(0, Number(e.target.value)))}
                  className="w-20 text-center text-sm font-medium border border-gray-200 rounded-lg py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-500">
                  {questionsPerFile === 0 ? "No limit (use all)" : `${questionsPerFile} per file`}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sourceFiles.map((f) => (
                  <span key={f} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scrambled toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-700">Scramble Questions</span>
            </div>
            <button
              onClick={() => setScrambled(!scrambled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${scrambled ? "bg-indigo-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${scrambled ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
