import React, { useState } from "react";
import { X, Check } from "lucide-react";
import type { Question } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface EditQuestionModalProps {
  question: Question;
  onSave: (updatedQuestion: Question) => void;
  onClose: () => void;
}

export default function EditQuestionModal({ question, onSave, onClose }: EditQuestionModalProps) {
  const { t } = useLanguage();

  const [text, setText] = useState(question.text || "");
  const [type, setType] = useState<'multiple-choice' | 'written'>(question.type || "multiple-choice");
  const [options, setOptions] = useState<string[]>(
    question.options && question.options.length > 0
      ? [...question.options]
      : ["", "", "", ""]
  );
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(
    typeof question.correctOptionIndex === "number" ? question.correctOptionIndex : 0
  );
  const [writtenAnswerReference, setWrittenAnswerReference] = useState(
    question.writtenAnswerReference || ""
  );

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctOptionIndex >= newOptions.length) {
        setCorrectOptionIndex(newOptions.length - 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const updated: Question = {
      ...question,
      text: text.trim(),
      type,
      options: type === "multiple-choice" ? options.map((opt) => opt.trim()).filter(Boolean) : undefined,
      correctOptionIndex: type === "multiple-choice" ? correctOptionIndex : undefined,
      writtenAnswerReference: writtenAnswerReference.trim() || undefined,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{t.editModal.title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              {t.editModal.questionText}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              {t.editModal.questionType}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="multiple-choice"
                  checked={type === "multiple-choice"}
                  onChange={() => setType("multiple-choice")}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                {t.editModal.multipleChoice}
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="written"
                  checked={type === "written"}
                  onChange={() => setType("written")}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                {t.editModal.written}
              </label>
            </div>
          </div>

          {/* Multiple Choice Options */}
          {type === "multiple-choice" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  {t.editModal.options} & ({t.editModal.correctOption})
                </label>
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    + Add Option
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOptionIndex === idx}
                      onChange={() => setCorrectOptionIndex(idx)}
                      title="Select as correct option"
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 shrink-0"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`${t.editModal.optionPlaceholder} ${String.fromCharCode(65 + idx)}`}
                      className={`flex-1 bg-gray-50 border rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 ${
                        correctOptionIndex === idx ? "border-indigo-400 bg-indigo-50/50" : "border-gray-200"
                      }`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                        title="Remove Option"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reference Answer */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              {t.editModal.referenceAnswer}
            </label>
            <textarea
              value={writtenAnswerReference}
              onChange={(e) => setWrittenAnswerReference(e.target.value)}
              rows={3}
              placeholder={t.editModal.referencePlaceholder}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t.editModal.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              {t.editModal.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
