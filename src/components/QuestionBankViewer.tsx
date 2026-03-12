import React, { useRef } from "react";
import { Download, Upload, List, Trash2, Shuffle } from "lucide-react";
import Papa from "papaparse";
import type { Question } from "../types";

interface QuestionBankViewerProps {
  questions: Question[];
  onImported: (questions: Question[]) => void;
  onStartQuiz: () => void;
  onClear: () => void;
  onShuffle: () => void;
}

export default function QuestionBankViewer({ questions, onImported, onStartQuiz, onClear, onShuffle }: QuestionBankViewerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        }));
        onImported(importedQuestions);
      },
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <List className="w-5 h-5 text-indigo-500" />
          Question Bank ({questions.length})
        </h2>
        <div className="flex items-center gap-2">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Import CSV"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={questions.length === 0}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onShuffle}
            disabled={questions.length === 0}
            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
            title="Shuffle Questions"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the question bank?")) {
                onClear();
              }
            }}
            disabled={questions.length === 0}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Clear Question Bank"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No questions generated yet. Upload a knowledge file to begin.</div>
      ) : (
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm">
                <p className="font-medium text-gray-900 mb-2">
                  {idx + 1}. {q.text}
                </p>
                <div className="text-gray-500 line-clamp-2">{q.type === "multiple-choice" ? q.options?.join(" • ") : q.writtenAnswerReference}</div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={onStartQuiz}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
