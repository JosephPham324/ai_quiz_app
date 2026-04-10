import { useState, useEffect } from "react";
import type { Question, EvaluationResult, CodingGradingResult } from "../types";
import { gradeWrittenAnswer, gradeCodingAnswer, evaluatePracticalExample, generateAIExample } from "../services/ai";
import { BrainCircuit, Check, X, ArrowRight, ArrowLeft, RotateCcw, Lightbulb, Sparkles, Code } from "lucide-react";
import MarkdownContent from "./MarkdownContent";
import { useLanguage } from "../contexts/LanguageContext";

interface QuizUIProps {
  questions: Question[];
  apiKey: string;
  onExit: () => void;
}

const CODE_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "SQL Server",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
];

// Wrapper to easily reset all state by changing the key
export default function QuizUI(props: QuizUIProps) {
  const [attempt, setAttempt] = useState(1);
  return <QuizSession key={attempt} {...props} onRetake={() => setAttempt((a) => a + 1)} />;
}

interface QuizSessionProps extends QuizUIProps {
  onRetake: () => void;
}

function QuizSession({ questions, apiKey, onExit, onRetake }: QuizSessionProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [scores, setScores] = useState<number[]>(new Array(questions.length).fill(0));
  const [preferredLanguage, setPreferredLanguage] = useState("JavaScript");

  const [defaultAnswerMode, setDefaultAnswerMode] = useState<"multiple-choice" | "written" | "code">("multiple-choice");
  const [defaultCodeLanguage, setDefaultCodeLanguage] = useState<string>("JavaScript");

  const totalScore = scores.reduce((a, b) => a + b, 0);

  if (isFinished) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.quizUI.quizCompleted}</h2>
        <p className="text-xl text-gray-600 mb-8">
          {t.quizUI.scoredPart1} {totalScore} {t.quizUI.scoredPart2} {questions.length}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onRetake}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
          >
            <RotateCcw className="w-5 h-5" /> {t.quizUI.retake}
          </button>
          <button onClick={onExit} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            {t.quizUI.exit}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t.quizUI.questionUpper}</span>
          <select
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm font-medium text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {questions.map((_, idx) => (
              <option key={idx} value={idx}>
                {idx + 1} {t.quizUI.of} {questions.length}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">{t.quizUI.aiExampleLang}</span>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {CODE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <button onClick={onExit} className="text-sm text-gray-400 hover:text-gray-600">
            {t.quizUI.cancel}
          </button>
        </div>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className={idx === currentIndex ? "block" : "hidden"}>
          <QuestionCard
            question={q}
            apiKey={apiKey}
            preferredLanguage={preferredLanguage}
            isFirst={idx === 0}
            isLast={idx === questions.length - 1}
            defaultAnswerMode={defaultAnswerMode}
            onAnswerModeChange={setDefaultAnswerMode}
            defaultCodeLanguage={defaultCodeLanguage}
            onCodeLanguageChange={setDefaultCodeLanguage}
            onScore={(points) => {
              setScores((prev) => {
                const next = [...prev];
                next[idx] = points;
                return next;
              });
            }}
            onNext={() => {
              if (idx < questions.length - 1) setCurrentIndex(idx + 1);
              else setIsFinished(true);
            }}
            onPrev={() => {
              if (idx > 0) setCurrentIndex(idx - 1);
            }}
          />
        </div>
      ))}
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  apiKey: string;
  preferredLanguage: string;
  isFirst: boolean;
  isLast: boolean;
  defaultAnswerMode: "multiple-choice" | "written" | "code";
  onAnswerModeChange: (mode: "multiple-choice" | "written" | "code") => void;
  defaultCodeLanguage: string;
  onCodeLanguageChange: (lang: string) => void;
  onScore: (points: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

function QuestionCard({
  question,
  apiKey,
  preferredLanguage,
  isFirst,
  isLast,
  defaultAnswerMode,
  onAnswerModeChange,
  defaultCodeLanguage,
  onCodeLanguageChange,
  onScore,
  onNext,
  onPrev,
}: QuestionCardProps) {
  const { t } = useLanguage();
  const [answerModeState, setAnswerModeState] = useState<"multiple-choice" | "written" | "code">(defaultAnswerMode);
  const [codeLanguageState, setCodeLanguageState] = useState(defaultCodeLanguage);

  const [gradingMode, setGradingMode] = useState<"ai" | "strict">("ai");

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [writtenInput, setWrittenInput] = useState("");

  const [rationaleInput, setRationaleInput] = useState("");
  const [codeContent, setCodeContent] = useState("");

  const [isModeDirty, setIsModeDirty] = useState(false);
  const [isLangDirty, setIsLangDirty] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isModeDirty && !isSubmitted) {
      setAnswerModeState(defaultAnswerMode);
    }
  }, [defaultAnswerMode, isModeDirty, isSubmitted]);

  useEffect(() => {
    if (!isLangDirty && !isSubmitted) {
      setCodeLanguageState(defaultCodeLanguage);
    }
  }, [defaultCodeLanguage, isLangDirty, isSubmitted]);

  const answerMode = answerModeState;
  const codeLanguage = codeLanguageState;

  const setAnswerMode = (mode: "multiple-choice" | "written" | "code") => {
    setAnswerModeState(mode);
    setIsModeDirty(true);
    onAnswerModeChange(mode);
  };

  const setCodeLanguage = (lang: string) => {
    setCodeLanguageState(lang);
    setIsLangDirty(true);
    onCodeLanguageChange(lang);
  };
  const [gradingResult, setGradingResult] = useState<EvaluationResult | null>(null);
  const [codingResult, setCodingResult] = useState<CodingGradingResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const [isPracticalEnabled, setIsPracticalEnabled] = useState(false);
  const [practicalInput, setPracticalInput] = useState("");
  const [exampleResult, setExampleResult] = useState<EvaluationResult | null>(null);
  const [isEvaluatingExample, setIsEvaluatingExample] = useState(false);

  const [aiExample, setAiExample] = useState<string | null>(null);
  const [isGeneratingAIExample, setIsGeneratingAIExample] = useState(false);

  const handleSubmitOptions = async () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);

    if (selectedOption === question.correctOptionIndex) {
      onScore(1);
      setGradingResult({ score: 100, feedback: t.quizUI.correct });
    } else {
      setGradingResult({ score: 0, feedback: t.quizUI.incorrect });
    }

    if (isPracticalEnabled && practicalInput.trim()) {
      setIsEvaluatingExample(true);
      try {
        const refAnswer = question.options?.[question.correctOptionIndex!] || "";
        const result = await evaluatePracticalExample(question.text, refAnswer, practicalInput, apiKey);
        setExampleResult(result);
      } catch (err) {
        setExampleResult({ score: 0, feedback: t.quizUI.failedEvaluateExample });
      } finally {
        setIsEvaluatingExample(false);
      }
    }
  };

  const handleSubmitWritten = async () => {
    if (!writtenInput.trim()) return;
    setIsSubmitted(true);

    if (gradingMode === "strict") {
      const isCorrect = writtenInput.trim().toLowerCase() === (question.writtenAnswerReference || "").trim().toLowerCase();
      if (isCorrect) onScore(1);
      setGradingResult({ score: isCorrect ? 100 : 0, feedback: isCorrect ? t.quizUI.exactMatch : t.quizUI.noMatch });
    } else {
      setIsGrading(true);
      try {
        const result = await gradeWrittenAnswer(question.text, question.writtenAnswerReference || "", writtenInput, apiKey);
        if (result.score >= 80) onScore(1);
        setGradingResult(result);
      } catch (err) {
        setGradingResult({ score: 0, feedback: t.quizUI.failedGradeAI });
      } finally {
        setIsGrading(false);
      }
    }

    if (isPracticalEnabled && practicalInput.trim()) {
      setIsEvaluatingExample(true);
      try {
        const result = await evaluatePracticalExample(question.text, question.writtenAnswerReference || "", practicalInput, apiKey);
        setExampleResult(result);
      } catch (err) {
        setExampleResult({ score: 0, feedback: t.quizUI.failedEvaluateExample });
      } finally {
        setIsEvaluatingExample(false);
      }
    }
  };

  const handleSubmitCode = async () => {
    if (!rationaleInput.trim() && !codeContent.trim()) return;
    setIsSubmitted(true);
    setIsGrading(true);

    try {
      const result = await gradeCodingAnswer(
        question.text,
        question.writtenAnswerReference || "",
        rationaleInput,
        codeContent,
        codeLanguage,
        apiKey,
      );
      setCodingResult(result);
      const avgScore = Math.round((result.rationaleScore + result.codeScore) / 2);
      if (avgScore >= 80) onScore(1);
    } catch (err) {
      setCodingResult({
        rationaleScore: 0,
        codeScore: 0,
        rationaleFeedback: t.quizUI.failedGradeRationale,
        codeFeedback: t.quizUI.failedGradeCode,
      });
    } finally {
      setIsGrading(false);
    }

    if (isPracticalEnabled && practicalInput.trim()) {
      setIsEvaluatingExample(true);
      try {
        const result = await evaluatePracticalExample(question.text, question.writtenAnswerReference || "", practicalInput, apiKey);
        setExampleResult(result);
      } catch (err) {
        setExampleResult({ score: 0, feedback: t.quizUI.failedEvaluateExample });
      } finally {
        setIsEvaluatingExample(false);
      }
    }
  };

  const handleGenerateAIExample = async () => {
    setIsGeneratingAIExample(true);
    try {
      const refAnswer =
        question.type === "multiple-choice"
          ? question.options?.[question.correctOptionIndex!] || ""
          : question.writtenAnswerReference || "";
      const result = await generateAIExample(question.text, refAnswer, apiKey, preferredLanguage);
      setAiExample(result.example);
    } catch (err) {
      setAiExample(t.quizUI.failedGenerateExample);
    } finally {
      setIsGeneratingAIExample(false);
    }
  };

  const handleSubmit = () => {
    if (answerMode === "multiple-choice") return handleSubmitOptions();
    if (answerMode === "written") return handleSubmitWritten();
    return handleSubmitCode();
  };

  const isSubmitDisabled = () => {
    if (answerMode === "multiple-choice") return selectedOption === null;
    if (answerMode === "written") return !writtenInput.trim();
    return !rationaleInput.trim() && !codeContent.trim();
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setGradingResult(null);
    setCodingResult(null);
    setExampleResult(null);
    setAiExample(null);
    onScore(0);
  };

  const overallCodingScore = codingResult ? Math.round((codingResult.rationaleScore + codingResult.codeScore) / 2) : 0;

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.text}</h2>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-2 bg-gray-50 p-1 rounded-lg w-fit">
          <button
            onClick={() => setAnswerMode("multiple-choice")}
            disabled={isSubmitted}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${answerMode === "multiple-choice" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.quizUI.multipleChoice}
          </button>
          <button
            onClick={() => setAnswerMode("written")}
            disabled={isSubmitted}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${answerMode === "written" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.quizUI.writtenAnswer}
          </button>
          <button
            onClick={() => setAnswerMode("code")}
            disabled={isSubmitted}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${answerMode === "code" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Code className="w-3.5 h-3.5" /> {t.quizUI.codeEditor}
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
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">{t.quizUI.practicalMode}</span>
        </label>
      </div>

      <div className="min-h-[200px]">
        {answerMode === "multiple-choice" ? (
          <div className="space-y-3">
            {question.options?.map((opt, idx) => (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isSubmitted
                    ? idx === question.correctOptionIndex
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
                  {isSubmitted && idx === question.correctOptionIndex && <Check className="w-5 h-5 text-green-600" />}
                  {isSubmitted && idx === selectedOption && idx !== question.correctOptionIndex && <X className="w-5 h-5 text-red-600" />}
                </div>
              </button>
            ))}
          </div>
        ) : answerMode === "written" ? (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 items-center text-sm mb-2">
              <span className="text-gray-500">{t.quizUI.gradingStrictness}</span>
              <select
                value={gradingMode}
                onChange={(e) => setGradingMode(e.target.value as "ai" | "strict")}
                disabled={isSubmitted}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700 outline-none"
              >
                <option value="ai">{t.quizUI.aiEvaluator}</option>
                <option value="strict">{t.quizUI.strictMatch}</option>
              </select>
            </div>
            <textarea
              value={writtenInput}
              onChange={(e) => setWrittenInput(e.target.value)}
              disabled={isSubmitted || isGrading}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder={t.quizUI.typeAnswerHere}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 items-center text-sm mb-2">
              <span className="text-gray-500">{t.quizUI.codeLanguageTitle}</span>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                disabled={isSubmitted}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700 outline-none"
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.quizUI.rationaleExplanation}</label>
              <textarea
                value={rationaleInput}
                onChange={(e) => setRationaleInput(e.target.value)}
                disabled={isSubmitted || isGrading}
                className="w-full h-24 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                placeholder={t.quizUI.explainLogic}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <Code className="w-4 h-4 text-emerald-600" />
                {t.quizUI.codeSolution}
              </label>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                disabled={isSubmitted || isGrading}
                className="w-full h-40 p-4 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-mono text-sm bg-gray-900 text-gray-100 placeholder-gray-500"
                placeholder={t.quizUI.writeCodeHere}
              />
            </div>
          </div>
        )}

        {isPracticalEnabled && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              {t.quizUI.practicalExample}
            </label>
            <p className="text-xs text-gray-500 mb-3">{t.quizUI.provideScenario}</p>
            <textarea
              value={practicalInput}
              onChange={(e) => setPracticalInput(e.target.value)}
              disabled={isSubmitted || isEvaluatingExample}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm bg-white"
              placeholder={t.quizUI.describePractical}
            />
          </div>
        )}
      </div>

      {(isGrading || isEvaluatingExample || isGeneratingAIExample) && (
        <div className="mt-6 flex flex-col gap-2">
          {isGrading && (
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
              <span>{t.quizUI.analyzingAnswer}</span>
            </div>
          )}
          {isEvaluatingExample && (
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
              <span>{t.quizUI.evaluatingPractical}</span>
            </div>
          )}
          {isGeneratingAIExample && (
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>{t.quizUI.craftingExample}</span>
            </div>
          )}
        </div>
      )}

      {isSubmitted && (gradingResult || codingResult || exampleResult || aiExample) && !isGrading && !isEvaluatingExample && !isGeneratingAIExample && (
        <div className="mt-6 space-y-4">
          {gradingResult && (
            <div className={`p-4 rounded-lg border ${gradingResult.score >= 80 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{gradingResult.score >= 80 ? t.quizUI.goodJob : t.quizUI.needsImprovement}</span>
                <span className="text-sm bg-white px-2 py-0.5 rounded-full shadow-sm ml-auto">{t.quizUI.score}: {gradingResult.score}/100</span>
              </div>
              <p className="text-gray-700 text-sm">{gradingResult.feedback}</p>
              {answerMode === "written" && (
                <div className="mt-3 pt-3 border-t border-black/10">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">{t.quizUI.referenceAnswer}</p>
                  <p className="text-sm text-gray-800">{question.writtenAnswerReference}</p>
                </div>
              )}
            </div>
          )}

          {codingResult && (
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border ${codingResult.rationaleScore >= 80 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{t.quizUI.rationaleTitle}</span>
                  <span className="text-sm bg-white px-2 py-0.5 rounded-full shadow-sm ml-auto">{t.quizUI.score}: {codingResult.rationaleScore}/100</span>
                </div>
                <p className="text-gray-700 text-sm">{codingResult.rationaleFeedback}</p>
              </div>

              <div className={`p-4 rounded-lg border ${codingResult.codeScore >= 80 ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-gray-900">{t.quizUI.codeSolution}</span>
                  <span className="text-sm bg-white px-2 py-0.5 rounded-full shadow-sm ml-auto">{t.quizUI.score}: {codingResult.codeScore}/100</span>
                </div>
                <p className="text-gray-700 text-sm">{codingResult.codeFeedback}</p>
              </div>

              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">{overallCodingScore >= 80 ? t.quizUI.greatWork : t.quizUI.keepPracticing}</span>
                <span className="text-sm font-medium text-gray-600">{t.quizUI.overall}: {overallCodingScore}/100</span>
              </div>

              <div className="mt-3 pt-3 border-t border-black/10">
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">{t.quizUI.referenceAnswer}</p>
                <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <MarkdownContent content={question.writtenAnswerReference || ""} />
                </div>
              </div>
            </div>
          )}

          {exampleResult && (
            <div className={`p-4 rounded-lg border ${exampleResult.score >= 80 ? "bg-amber-50 border-amber-200" : "bg-orange-50 border-orange-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-900">{t.quizUI.practicalEvalTitle}</span>
                <span className="text-sm bg-white px-2 py-0.5 rounded-full shadow-sm ml-auto">{t.quizUI.score}: {exampleResult.score}/100</span>
              </div>
              <p className="text-gray-700 text-sm">{exampleResult.feedback}</p>
            </div>
          )}

          {aiExample && (
            <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-900">{t.quizUI.aiLearningExample}</span>
              </div>
              <div className="bg-white/50 p-4 rounded-md border border-purple-100 shadow-sm">
                <MarkdownContent content={aiExample} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-between items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> {t.quizUI.previous}
          </button>

          <div className="flex items-center gap-3">
            {/* Action logic */}
            {isSubmitted && !aiExample && !isGeneratingAIExample && (
              <button
                onClick={handleGenerateAIExample}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors font-medium"
              >
                <Sparkles className="w-4 h-4" /> {t.quizUI.provideExampleBtn}
              </button>
            )}

            {isSubmitted && ((gradingResult && gradingResult.score < 80) || (codingResult && overallCodingScore < 80)) && (
              <button
                onClick={handleTryAgain}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <RotateCcw className="w-4 h-4" /> {t.quizUI.tryAgain}
              </button>
            )}

          {!isSubmitted ? (
            <>
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {isLast ? t.quizUI.skipToEnd : t.quizUI.skip} <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled()}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
              >
                {t.quizUI.submitAnswer}
              </button>
            </>
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              {isLast ? t.quizUI.finishQuiz : t.quizUI.nextQuestion} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
