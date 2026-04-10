import React, { useRef, useMemo } from "react";
import { Download, Upload, List, Trash2, FileText } from "lucide-react";
import Papa from "papaparse";
import type { Question } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

const SOURCE_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
];

interface QuestionBankViewerProps {
  questions: Question[];
  onImported: (questions: Question[], sourceFile: string) => void;
  onStartQuiz: () => void;
  onClear: () => void;
}

export default function QuestionBankViewer({ questions, onImported, onStartQuiz, onClear }: QuestionBankViewerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleExportCSV = () => {
    if (questions.length === 0) return;
    const csv = Papa.unparse(
      questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        optionA: q.options?.[0] || "",
        optionB: q.options?.[1] || "",
        optionC: q.options?.[2] || "",
        optionD: q.options?.[3] || "",
        correctOptionIndex: q.correctOptionIndex,
        writtenAnswerReference: q.writtenAnswerReference || "",
      })),
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "question_bank.csv";
    link.click();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedQuestions: Question[] = results.data.map((row: any) => ({
          id: row.id || Math.random().toString(36).substr(2, 9),
          text: row.text,
          type: row.type || "multiple-choice",
          options: [row.optionA, row.optionB, row.optionC, row.optionD].filter(Boolean),
          correctOptionIndex: parseInt(row.correctOptionIndex, 10),
          writtenAnswerReference: row.writtenAnswerReference,
          sourceFile: row.sourceFile || fileName,
        }));
        onImported(importedQuestions, fileName);
      },
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sourceFiles = useMemo(() => {
    const files = new Set<string>();
    questions.forEach((q) => { if (q.sourceFile) files.add(q.sourceFile); });
    return Array.from(files);
  }, [questions]);

  const colorMap = useMemo(() => {
    const map: Record<string, typeof SOURCE_COLORS[0]> = {};
    sourceFiles.forEach((f, i) => {
      map[f] = SOURCE_COLORS[i % SOURCE_COLORS.length];
    });
    return map;
  }, [sourceFiles]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <List className="w-5 h-5 text-indigo-500" />
          {t.questionBank.title} ({questions.length})
        </h2>
        <div className="flex items-center gap-2">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title={t.questionBank.importCSV}
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={questions.length === 0}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
            title={t.questionBank.exportCSV}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(t.questionBank.clearConfirm)) {
                onClear();
              }
            }}
            disabled={questions.length === 0}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title={t.questionBank.clearBank}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Source file legend */}
      {sourceFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {sourceFiles.map((f) => {
            const color = colorMap[f];
            const count = questions.filter((q) => q.sourceFile === f).length;
            return (
              <span key={f} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${color.bg} ${color.text} ${color.border}`}>
                <FileText className="w-3 h-3" />
                {f} ({count})
              </span>
            );
          })}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t.questionBank.emptyState}</div>
      ) : (
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
            {questions.map((q, idx) => {
              const color = q.sourceFile ? colorMap[q.sourceFile] : null;
              return (
                <div key={q.id} className={`p-3 bg-gray-50 border rounded-lg text-sm ${color ? color.border : "border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-gray-900">
                      {idx + 1}. {q.text}
                    </p>
                    {q.sourceFile && color && (
                      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                        {q.sourceFile}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 line-clamp-2">{q.type === "multiple-choice" ? q.options?.join(" • ") : q.writtenAnswerReference}</div>
                </div>
              );
            })}
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={onStartQuiz}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              {t.questionBank.startQuiz}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
