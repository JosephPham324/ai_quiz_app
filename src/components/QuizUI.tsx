import { useState } from "react";
import type { Question, EvaluationResult } from "../types";
import { gradeWrittenAnswer, evaluatePracticalExample, generateAIExample } from "../services/ai";
import { BrainCircuit, Check, X, ArrowRight, RotateCcw, Lightbulb, Sparkles } from "lucide-react";

interface QuizUIProps {
  questions: Question[];
  apiKey: string;
  onExit: () => void;
}

export default function QuizUI({ questions, apiKey, onExit }: QuizUIProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerMode, setAnswerMode] = useState<"multiple-choice" | "written">("multiple-choice");
  const [gradingMode, setGradingMode] = useState<"ai" | "strict">("ai");

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [writtenInput, setWrittenInput] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [gradingResult, setGradingResult] = useState<EvaluationResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const [isPracticalEnabled, setIsPracticalEnabled] = useState(false);
  const [practicalInput, setPracticalInput] = useState("");
  const [exampleResult, setExampleResult] = useState<EvaluationResult | null>(null);
  const [isEvaluatingExample, setIsEvaluatingExample] = useState(false);

  const [aiExample, setAiExample] = useState<string | null>(null);
  const [isGeneratingAIExample, setIsGeneratingAIExample] = useState(false);

  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSubmitOptions = async () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);

    if (selectedOption === currentQuestion.correctOptionIndex) {
      setScore((s) => s + 1);
      setGradingResult({ score: 100, feedback: "Correct!" });
    } else {
      setGradingResult({ score: 0, feedback: "Incorrect." });
    }

    if (isPracticalEnabled && practicalInput.trim()) {
      setIsEvaluatingExample(true);
      try {
        const refAnswer = currentQuestion.options?.[currentQuestion.correctOptionIndex!] || "";
        const result = await evaluatePracticalExample(currentQuestion.text, refAnswer, practicalInput, apiKey);
        setExampleResult(result);
      } catch (err) {
        setExampleResult({ score: 0, feedback: "Failed to evaluate example." });
      } finally {
        setIsEvaluatingExample(false);
      }
    }
  };

  const handleSubmitWritten = async () => {
    if (!writtenInput.trim()) return;
    setIsSubmitted(true);

    // Initial grading
    if (gradingMode === "strict") {
      const isCorrect = writtenInput.trim().toLowerCase() === (currentQuestion.writtenAnswerReference || "").trim().toLowerCase();
      if (isCorrect) setScore((s) => s + 1);
      setGradingResult({ score: isCorrect ? 100 : 0, feedback: isCorrect ? "Exact match!" : "No match." });
    } else {
      setIsGrading(true);
      try {
        const result = await gradeWrittenAnswer(currentQuestion.text, currentQuestion.writtenAnswerReference || "", writtenInput, apiKey);
        if (result.score >= 80) setScore((s) => s + 1);
        setGradingResult(result);
      } catch (err) {
        setGradingResult({ score: 0, feedback: "Failed to grade with AI." });
      } finally {
        setIsGrading(false);
      }
    }

    // Practical example evaluation
    if (isPracticalEnabled && practicalInput.trim()) {
      setIsEvaluatingExample(true);
      try {
        const result = await evaluatePracticalExample(
          currentQuestion.text,
          currentQuestion.writtenAnswerReference || "",
          practicalInput,
          apiKey,
        );
        setExampleResult(result);
      } catch (err) {
        setExampleResult({ score: 0, feedback: "Failed to evaluate practical example." });
      } finally {
        setIsEvaluatingExample(false);
      }
    }
  };

  const handleGenerateAIExample = async () => {
    setIsGeneratingAIExample(true);
    try {
      const refAnswer =
        currentQuestion.type === "multiple-choice"
          ? currentQuestion.options?.[currentQuestion.correctOptionIndex!] || ""
          : currentQuestion.writtenAnswerReference || "";
      const result = await generateAIExample(currentQuestion.text, refAnswer, apiKey);
      setAiExample(result.example);
    } catch (err) {
      setAiExample("Failed to generate an AI example. Please try again.");
    } finally {
      setIsGeneratingAIExample(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      resetState();
    } else {
      setIsFinished(true);
    }
  };

  const resetState = () => {
    setSelectedOption(null);
    setWrittenInput("");
    setIsSubmitted(false);
    setGradingResult(null);
    setPracticalInput("");
    setExampleResult(null);
    setAiExample(null);
  };

  if (isFinished) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h2>
        <p className="text-xl text-gray-600 mb-8">
          You scored {score} out of {questions.length}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setIsFinished(false);
              resetState();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
          >
            <RotateCcw className="w-5 h-5" /> Retake Quiz
          </button>
          <button onClick={onExit} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Exit to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <button onClick={onExit} className="text-sm text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.text}</h2>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-2 bg-gray-50 p-1 rounded-lg w-fit">
          <button
            onClick={() => setAnswerMode("multiple-choice")}
            disabled={isSubmitted}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${answerMode === "multiple-choice" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            Multiple Choice
          </button>
          <button
            onClick={() => setAnswerMode("written")}
            disabled={isSubmitted}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${answerMode === "written" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            Written Answer
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer ml-auto bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
          <input
            type="checkbox"
            checked={isPracticalEnabled}
            onChange={(e) => setIsPracticalEnabled(e.target.checked)}
            disabled={isSubmitted}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
          />
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Practical Example Mode</span>
        </label>
      </div>

      <div className="min-h-[200px]">
        {answerMode === "multiple-choice" ? (
          <div className="space-y-3">
            {currentQuestion.options?.map((opt, idx) => (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isSubmitted
                    ? idx === currentQuestion.correctOptionIndex
                      ? "bg-green-50 border-green-500 text-green-900"
                      : idx === selectedOption
                        ? "bg-red-50 border-red-500 text-red-900"
                        : "border-gray-200 opacity-50"
                    : selectedOption === idx
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{opt}</span>
                  {isSubmitted && idx === currentQuestion.correctOptionIndex && <Check className="w-5 h-5 text-green-600" />}
                  {isSubmitted && idx === selectedOption && idx !== currentQuestion.correctOptionIndex && <X className="w-5 h-5 text-red-600" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 items-center text-sm mb-2">
              <span className="text-gray-500">Grading strictness:</span>
              <select
                value={gradingMode}
                onChange={(e) => setGradingMode(e.target.value as "ai" | "strict")}
                disabled={isSubmitted}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700 outline-none"
              >
                <option value="ai">AI Evaluator</option>
                <option value="strict">Strict Match</option>
              </select>
            </div>
            <textarea
              value={writtenInput}
              onChange={(e) => setWrittenInput(e.target.value)}
              disabled={isSubmitted || isGrading}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Type your answer here..."
            />
          </div>
        )}

        {isPracticalEnabled && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Practical Example (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">Provide a real-world scenario where this concept is applied for extra AI feedback.</p>
            <textarea
              value={practicalInput}
              onChange={(e) => setPracticalInput(e.target.value)}
              disabled={isSubmitted || isEvaluatingExample}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm bg-white"
              placeholder="Describe a practical example..."
            />
          </div>
        )}
      </div>

      {(isGrading || isEvaluatingExample || isGeneratingAIExample) && (
        <div className="mt-6 flex flex-col gap-2">
          {isGrading && (
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
              <span>AI is analyzing your answer...</span>
            </div>
          )}
          {isEvaluatingExample && (
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
              <span>AI is evaluating your practical example...</span>
            </div>
          )}
          {isGeneratingAIExample && (
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>AI is crafting a helpful example for you...</span>
            </div>
          )}
        </div>
      )}

      {isSubmitted && (gradingResult || exampleResult || aiExample) && !isGrading && !isEvaluatingExample && !isGeneratingAIExample && (
        <div className="mt-6 space-y-4">
          {gradingResult && (
            <div
              className={`p-4 rounded-lg border ${gradingResult.score >= 80 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{gradingResult.score >= 80 ? "Good Job!" : "Needs Improvement"}</span>
                <span className="text-sm bg-white px-2 py-0.5 rounded-full shadow-sm ml-auto">Score: {gradingResult.score}/100</span>
              </div>
              <p className="text-gray-700 text-sm">{gradingResult.feedback}</p>
              {answerMode === "written" && (
                <div className="mt-3 pt-3 border-t border-black/10">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Reference Answer</p>
                  <p className="text-sm text-gray-800">{currentQuestion.writtenAnswerReference}</p>
                </div>
              )}
            </div>
          )}

          {exampleResult && (
            <div
              className={`p-4 rounded-lg border ${exampleResult.score >= 80 ? "bg-amber-50 border-amber-200" : "bg-orange-50 border-orange-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-900">Practical Example Evaluation</span>
                <span className="text-sm bg-white px-2 py-0.5 rounded-full shadow-sm ml-auto">Score: {exampleResult.score}/100</span>
              </div>
              <p className="text-gray-700 text-sm">{exampleResult.feedback}</p>
            </div>
          )}

          {aiExample && (
            <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-900">AI Learning Example</span>
              </div>
              <p className="text-gray-700 text-sm italic">{aiExample}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-end items-center gap-3">
        {!isSubmitted ? (
          <button
            onClick={answerMode === "multiple-choice" ? handleSubmitOptions : handleSubmitWritten}
            disabled={answerMode === "multiple-choice" ? selectedOption === null : !writtenInput.trim()}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            Submit Answer
          </button>
        ) : (
          <>
            {!aiExample && !isGeneratingAIExample && (
              <button
                onClick={handleGenerateAIExample}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
              >
                <Sparkles className="w-4 h-4" /> Provide Example
              </button>
            )}
            <div className="flex items-center gap-3">
              {gradingResult && gradingResult.score < 80 && (
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setGradingResult(null);
                    setExampleResult(null);
                    setAiExample(null);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
