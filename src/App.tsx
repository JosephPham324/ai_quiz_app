import { useState, useEffect, useMemo, useCallback } from "react";
import { Settings, BookOpen, Loader2, ChevronDown, Eye } from "lucide-react";
import SettingsModal from "./components/SettingsModal";
import FileUploader from "./components/FileUploader";
import QuestionBankViewer from "./components/QuestionBankViewer";
import QuizConfigModal from "./components/QuizConfigModal";
import QuizUI from "./components/QuizUI";
import PromptModal from "./components/PromptModal";
import ImageTextReviewModal from "./components/ImageTextReviewModal";
import type { Question, QuestionComplexity, ModelOption, QuizConfig } from "./types";
import { generateQuestionsChunk, extractTextFromImages, COMPLEXITY_PROMPTS } from "./services/ai";
import { useLanguage } from "./contexts/LanguageContext";

const MODEL_OPTIONS: ModelOption[] = [
  { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", inputCost: "$0.10", outputCost: "$0.40" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", inputCost: "$0.40", outputCost: "$1.60" },
  { id: "gpt-4.1", name: "GPT-4.1", inputCost: "$2.00", outputCost: "$8.00" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", inputCost: "$0.15", outputCost: "$0.60" },
  { id: "gpt-4o", name: "GPT-4o", inputCost: "$2.50", outputCost: "$10.00" },
  { id: "gpt-5-nano", name: "GPT-5 Nano", inputCost: "$0.05", outputCost: "$0.40" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", inputCost: "$0.25", outputCost: "$2.00" },
  { id: "gpt-5", name: "GPT-5", inputCost: "$1.25", outputCost: "$10.00" },
  { id: "gpt-5.1", name: "GPT-5.1", inputCost: "$1.25", outputCost: "$10.00" },
  { id: "gpt-5.2", name: "GPT-5.2", inputCost: "$1.75", outputCost: "$14.00" },
  { id: "gpt-5.4-nano", name: "GPT-5.4 Nano", inputCost: "$0.20", outputCost: "$1.25" },
  { id: "gpt-5.4-mini", name: "GPT-5.4 Mini", inputCost: "$0.75", outputCost: "$4.50" },
  { id: "gpt-5.4", name: "GPT-5.4", inputCost: "$2.50", outputCost: "$15.00" },
  { id: "gpt-5.4-pro", name: "GPT-5.4 Pro", inputCost: "$30.00", outputCost: "$180.00" },
  { id: "o3-mini", name: "o3-mini", inputCost: "$1.10", outputCost: "$4.40" },
  { id: "o3", name: "o3", inputCost: "$2.00", outputCost: "$8.00" },
  { id: "o4-mini", name: "o4-mini", inputCost: "$1.10", outputCost: "$4.40" },
];

function App() {
  const { t } = useLanguage();

  const COMPLEXITY_OPTIONS = useMemo<{ value: QuestionComplexity; label: string; desc: string }[]>(() => [
    { value: "brief", label: t.app.briefLabel, desc: t.app.briefDesc },
    { value: "elaborate", label: t.app.elaborateLabel, desc: t.app.elaborateDesc },
    { value: "practical", label: t.app.practicalLabel, desc: t.app.practicalDesc },
    { value: "coding problem", label: t.app.codingLabel, desc: t.app.codingDesc },
    { value: "custom", label: t.app.customLabel, desc: t.app.customDesc },
  ], [t]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const [quizMode, setQuizMode] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);

  // Generation options state
  const [complexity, setComplexity] = useState<QuestionComplexity>("brief");
  const [selectedModelId, setSelectedModelId] = useState("gpt-4.1-nano");
  const [visionModelId, setVisionModelId] = useState("gpt-4o");
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [previewComplexity, setPreviewComplexity] = useState<QuestionComplexity | null>(null);

  // Image/PDF extraction review state
  const [imageReviewState, setImageReviewState] = useState<{
    filename: string;
    pageCount: number;
    isLoading: boolean;
    error: string | null;
    extractedText: string;
    base64Images: string[];
  } | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("openai_api_key");
    if (key) {
      setApiKey(key);
    } else {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("openai_api_key", key);
    setIsSettingsOpen(false);
  };

  const activeModel = useCustomModel ? customModelName.trim() : selectedModelId;

  const sourceFiles = useMemo(() => {
    const files = new Set<string>();
    questions.forEach((q) => { if (q.sourceFile) files.add(q.sourceFile); });
    return Array.from(files);
  }, [questions]);

  const handleImagesExtracted = async (base64Images: string[], filename: string, pageCount: number) => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    // Open the review modal in loading state
    setImageReviewState({ filename, pageCount, isLoading: true, error: null, extractedText: "", base64Images });

    try {
      const text = await extractTextFromImages(base64Images, apiKey, visionModelId);
      setImageReviewState((prev) => prev ? { ...prev, isLoading: false, extractedText: text } : null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Extraction failed";
      setImageReviewState((prev) => prev ? { ...prev, isLoading: false, error: message } : null);
    }
  };

  const handleContentExtracted = async (content: string, filename: string) => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    const chunkSize = 2000;
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.substring(i, i + chunkSize));
    }

    const options = { model: activeModel || "gpt-4.1-nano", complexity, customPrompt: complexity === "custom" ? customPrompt : undefined };

    try {
      const newQuestions: Question[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          const generated = await generateQuestionsChunk(chunk, apiKey, options);
          newQuestions.push(
            ...generated.map((q) => ({
              ...q,
              id: Math.random().toString(36).substr(2, 9),
              sourceFile: filename,
            })),
          );
          setQuestions([...questions, ...newQuestions]);
          setGenerationProgress(Math.round(((i + 1) / chunks.length) * 100));
        } catch (err) {
          console.error("Failed to generate for chunk", i, err);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageTextDownload = () => {
    if (!imageReviewState) return;
    const blob = new Blob([imageReviewState.extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = imageReviewState.filename.replace(/\.[^.]+$/, "") + "_extracted.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageTextSubmit = () => {
    if (!imageReviewState) return;
    const { extractedText, filename } = imageReviewState;
    setImageReviewState(null);
    handleContentExtracted(extractedText, filename);
  };



  const handleStartQuizWithConfig = useCallback((config: QuizConfig) => {
    let selected: Question[] = [];

    if (config.questionsPerFile > 0 && sourceFiles.length > 0) {
      // Pick questionsPerFile from each source file
      for (const file of sourceFiles) {
        const fileQuestions = questions.filter((q) => q.sourceFile === file);
        const picked = fileQuestions.slice(0, config.questionsPerFile);
        selected.push(...picked);
      }
    } else {
      selected = [...questions];
    }

    // Limit to totalQuestions
    selected = selected.slice(0, config.totalQuestions);

    // Scramble if needed
    if (config.scrambled) {
      selected = selected.sort(() => Math.random() - 0.5);
    }

    setActiveQuizQuestions(selected);
    setIsConfigModalOpen(false);
    setQuizMode(true);
  }, [questions, sourceFiles]);

  if (quizMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pt-12 px-4 sm:px-6 lg:px-8">
        <QuizUI questions={activeQuizQuestions} apiKey={apiKey} onExit={() => setQuizMode(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{t.app.title}</h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {!apiKey ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto mt-12">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t.app.welcome}</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {t.app.welcomeDesc}
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              {t.app.configKey}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">{t.app.uploadStep}</h2>
                <FileUploader
                  onContentExtracted={handleContentExtracted}
                  onImagesExtracted={handleImagesExtracted}
                />

                {isGenerating && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-3 text-indigo-700 font-medium mb-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.app.analyzing}
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2.5">
                      <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
                    </div>
                    <p className="text-right text-xs text-indigo-600 mt-1">{generationProgress}% {t.app.complete}</p>
                  </div>
                )}
              </div>

              {/* Generation Options */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">{t.app.generationOptions}</h2>

                {/* Question Complexity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.app.questionComplexity}</label>
                  <div className="space-y-2">
                    {COMPLEXITY_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          complexity === opt.value
                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        <label className="flex items-start gap-3 flex-1 cursor-pointer">
                          <input
                            type="radio"
                            name="complexity"
                            value={opt.value}
                            checked={complexity === opt.value}
                            onChange={() => setComplexity(opt.value)}
                            className="mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </label>
                        {opt.value !== "custom" && (
                          <button
                            type="button"
                            onClick={() => setPreviewComplexity(opt.value)}
                            title="Preview prompt"
                            className="ml-auto shrink-0 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Custom Prompt Textarea */}
                  {complexity === "custom" && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-600">{t.app.yourPrompt}</label>
                        <div className="flex gap-2">
                          {Object.entries(COMPLEXITY_PROMPTS).map(([key, val]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setCustomPrompt(val + "\n\n{content}")}
                              className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors capitalize"
                            >
                              {key}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={8}
                        placeholder={t.app.promptPlaceholder}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 font-mono leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                      />
                      <p className="text-xs text-gray-400">
                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">{'{content}'}</span> {t.app.promptHelp}
                      </p>
                    </div>
                  )}
                </div>

                {/* Models Section */}
                <div className="space-y-6">
                  {/* API Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.app.textModel}</label>

                    <div className="flex items-center gap-3 mb-3">
                      <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-all ${!useCustomModel ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                      <input type="radio" name="modelMode" checked={!useCustomModel} onChange={() => setUseCustomModel(false)} className="sr-only" />
                      {t.app.selectList}
                    </label>
                    <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-all ${useCustomModel ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                      <input type="radio" name="modelMode" checked={useCustomModel} onChange={() => setUseCustomModel(true)} className="sr-only" />
                      {t.app.customModel}
                    </label>
                  </div>

                  {!useCustomModel ? (
                    <div className="relative">
                      <select
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {MODEL_OPTIONS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}  —  In: {m.inputCost} / Out: {m.outputCost} per 1M tokens
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={customModelName}
                      onChange={(e) => setCustomModelName(e.target.value)}
                      placeholder="e.g. gpt-4o-2024-05-13"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}

                  {!useCustomModel && (
                    <p className="text-xs text-gray-400 mt-2">{t.app.pricesNote}</p>
                  )}
                  </div>

                  {/* Vision Model Selection */}
                  <div className="pt-6 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.app.visionModel}</label>
                    <div className="relative">
                      <select
                        value={visionModelId}
                        onChange={(e) => setVisionModelId(e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {MODEL_OPTIONS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <QuestionBankViewer
                questions={questions}
                onImported={(imported) => setQuestions([...questions, ...imported])}
                onStartQuiz={() => setIsConfigModalOpen(true)}
                onClear={() => setQuestions([])}
              />
            </div>
          </div>
        )}
      </main>

      {isSettingsOpen && <SettingsModal currentKey={apiKey} onSave={handleSaveApiKey} onClose={() => setIsSettingsOpen(false)} />}
      {isConfigModalOpen && (
        <QuizConfigModal
          totalAvailable={questions.length}
          sourceFiles={sourceFiles}
          onStart={handleStartQuizWithConfig}
          onClose={() => setIsConfigModalOpen(false)}
        />
      )}
      {previewComplexity && (
        <PromptModal complexity={previewComplexity} onClose={() => setPreviewComplexity(null)} />
      )}
      {imageReviewState && (
        <ImageTextReviewModal
          filename={imageReviewState.filename}
          pageCount={imageReviewState.pageCount}
          isLoading={imageReviewState.isLoading}
          error={imageReviewState.error}
          extractedText={imageReviewState.extractedText}
          onTextChange={(text) => setImageReviewState((prev) => prev ? { ...prev, extractedText: text } : null)}
          onDownload={handleImageTextDownload}
          onSubmit={handleImageTextSubmit}
          onClose={() => setImageReviewState(null)}
        />
      )}
    </div>
  );
}

export default App;
