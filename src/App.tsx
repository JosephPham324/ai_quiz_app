import { useState, useEffect } from "react";
import { Settings, BookOpen, Loader2 } from "lucide-react";
import SettingsModal from "./components/SettingsModal";
import FileUploader from "./components/FileUploader";
import QuestionBankViewer from "./components/QuestionBankViewer";
import QuizUI from "./components/QuizUI";
import type { Question } from "./types";
import { generateQuestionsChunk } from "./services/ai";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const [quizMode, setQuizMode] = useState(false);

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

  const handleContentExtracted = async (content: string) => {
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

    try {
      const newQuestions: Question[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          const generated = await generateQuestionsChunk(chunk, apiKey);
          newQuestions.push(
            ...generated.map((q) => ({
              ...q,
              id: Math.random().toString(36).substr(2, 9),
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

  if (quizMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pt-12 px-4 sm:px-6 lg:px-8">
        <QuizUI questions={questions} apiKey={apiKey} onExit={() => setQuizMode(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Quiz Generator</h1>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to AI Quiz Generator</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              To get started, please configure your OpenAI API key. This key is stored securely in your browser and used to generate intelligent
              questions.
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Configure API Key
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">1. Upload Knowledge</h2>
                <FileUploader onContentExtracted={handleContentExtracted} />

                {isGenerating && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-3 text-indigo-700 font-medium mb-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing content with AI...
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2.5">
                      <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
                    </div>
                    <p className="text-right text-xs text-indigo-600 mt-1">{generationProgress}% complete</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <QuestionBankViewer
                questions={questions}
                onImported={(imported) => setQuestions([...questions, ...imported])}
                onStartQuiz={() => setQuizMode(true)}
                onClear={() => setQuestions([])}
                onShuffle={() => {
                  const shuffled = [...questions].sort(() => Math.random() - 0.5);
                  setQuestions(shuffled);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {isSettingsOpen && <SettingsModal currentKey={apiKey} onSave={handleSaveApiKey} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

export default App;
