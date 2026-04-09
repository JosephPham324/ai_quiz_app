import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { BASE_JSON_FORMAT, COMPLEXITY_PROMPTS } from "../services/ai";
import type { QuestionComplexity } from "../types";

interface PromptModalProps {
  complexity: QuestionComplexity;
  onClose: () => void;
}

export default function PromptModal({ complexity, onClose }: PromptModalProps) {
  const [copied, setCopied] = useState(false);

  const systemPrompt = COMPLEXITY_PROMPTS[complexity] ?? "";
  const fullPrompt = `${systemPrompt}\n\nStrictly output ONLY a valid JSON object with a "questions" array.\n${BASE_JSON_FORMAT}Ensure you generate 3-5 high-quality questions per chunk of context.`;
  const userMessage = `Generate questions from the following text:\n\n{content}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const label = {
    brief: "Brief, Core Idea",
    elaborate: "Elaborate Answers",
    practical: "Practical Application",
    "coding problem": "Coding Problem",
  }[complexity] ?? complexity;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Generation Prompt Preview</h2>
            <p className="text-sm text-gray-500 mt-0.5">Mode: <span className="font-medium text-indigo-600">{label}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* System Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">System Prompt</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy full prompt"}
              </button>
            </div>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
              {fullPrompt}
            </pre>
          </div>

          {/* User Message */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">User Message</span>
            <pre className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-800 whitespace-pre-wrap font-mono leading-relaxed">
              {userMessage}
            </pre>
          </div>

          <p className="text-xs text-gray-400">
            <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">{"{content}"}</span> is replaced with each chunk of your uploaded document at generation time.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
