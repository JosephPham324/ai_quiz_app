import { useState, useMemo } from 'react';
import {
  BookOpen,
  Code2,
  Search,
  Layers,
  Sparkles,
  Pencil,
  Globe,
  Copy,
  Check,
  ChevronRight,
  Menu,
  X,
  FileText
} from 'lucide-react';

type SectionId =
  | 'user-overview'
  | 'user-setup'
  | 'user-upload'
  | 'user-section-selector'
  | 'user-language-options'
  | 'user-question-bank'
  | 'user-quiz-engine'
  | 'user-faq'
  | 'dev-architecture'
  | 'dev-setup'
  | 'dev-structure'
  | 'dev-prompt-engineering'
  | 'dev-state-flow'
  | 'dev-deployment'
  | 'dev-contributing';

interface NavItem {
  id: SectionId;
  label: string;
  category: 'user' | 'dev';
}

const NAV_ITEMS: NavItem[] = [
  // User Guide
  { id: 'user-overview', label: '1. Executive Overview', category: 'user' },
  { id: 'user-setup', label: '2. API Key Setup', category: 'user' },
  { id: 'user-upload', label: '3. Upload & Vision OCR', category: 'user' },
  { id: 'user-section-selector', label: '4. Section Line Selector', category: 'user' },
  { id: 'user-language-options', label: '5. Language Settings', category: 'user' },
  { id: 'user-question-bank', label: '6. Editing & Deleting Questions', category: 'user' },
  { id: 'user-quiz-engine', label: '7. Quiz Mode & AI Grading', category: 'user' },
  { id: 'user-faq', label: '8. User FAQ & Troubleshooting', category: 'user' },
  // Contributor Guide
  { id: 'dev-architecture', label: '1. System Architecture', category: 'dev' },
  { id: 'dev-setup', label: '2. Local Development Setup', category: 'dev' },
  { id: 'dev-structure', label: '3. Directory & Modules', category: 'dev' },
  { id: 'dev-prompt-engineering', label: '4. AI Prompt Engineering', category: 'dev' },
  { id: 'dev-state-flow', label: '5. Component State Flow', category: 'dev' },
  { id: 'dev-deployment', label: '6. GitHub Pages Deployment', category: 'dev' },
  { id: 'dev-contributing', label: '7. Contributing Guidelines', category: 'dev' },
];

export default function DocsApp() {
  const [activeCategory, setActiveCategory] = useState<'user' | 'dev'>('user');
  const [activeSection, setActiveSection] = useState<SectionId>('user-overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) {
      return NAV_ITEMS.filter((item) => item.category === activeCategory);
    }
    const q = searchQuery.toLowerCase();
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q));
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-indigo-600 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">AI Quiz Generator</span>
              <span className="ml-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                Docs Portal
              </span>
            </div>
          </div>

          {/* Header Action Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="./index.html"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Launch App
            </a>
            <a
              href="./AI_Quiz_Generator_User_Manual.pdf"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Download PDF User Manual"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              PDF Manual (.pdf)
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-20 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } top-16 lg:top-0`}
        >
          {/* Category Tabs */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <div className="grid grid-cols-2 p-1 bg-gray-200/80 rounded-xl gap-1">
              <button
                onClick={() => {
                  setActiveCategory('user');
                  setActiveSection('user-overview');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === 'user' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                User Manual
              </button>
              <button
                onClick={() => {
                  setActiveCategory('dev');
                  setActiveSection('dev-architecture');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === 'dev' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Contributor
              </button>
            </div>

            {/* Quick Filter Bar */}
            <div className="relative mt-3">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                  activeSection === item.id
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-3 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="truncate">{item.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${activeSection === item.id ? 'text-indigo-600' : 'text-gray-300'}`} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Documentation Body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* USER GUIDE SECTIONS */}

            {activeSection === 'user-overview' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    User Guide • Chapter 1
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Executive Overview & Core Features</h1>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    The <strong>AI Quiz Generator</strong> turns knowledge documents, technical manuals, PDF files, and image scans into intelligent assessment quizzes automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                    <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Vision AI OCR Extraction
                    </h3>
                    <p className="text-xs text-indigo-800">
                      Extracts and transcribes document text from PDF files, screenshots, and image formats faithfully before question generation.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                    <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      Section Line Range Selector
                    </h3>
                    <p className="text-xs text-indigo-800">
                      Mark specific line ranges to turn into questions, preventing duplicate questions when updating files continuously.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                    <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      Target Language Learning
                    </h3>
                    <p className="text-xs text-indigo-800">
                      Supports separate Question Language and Target Learning Language (e.g. learning Japanese vocabulary via Vietnamese questions).
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                    <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-1">
                      <Pencil className="w-4 h-4 text-indigo-600" />
                      Question Bank Editing
                    </h3>
                    <p className="text-xs text-indigo-800">
                      Edit text, options, and reference answers or delete single questions with full CSV import/export support.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'user-setup' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    User Guide • Chapter 2
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">API Key Setup & Model Selection</h1>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <h3 className="font-semibold text-gray-900">Setting Up OpenAI API Key</h3>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1.5">
                    <li>Click the <strong>Settings (Gear)</strong> icon in the top header.</li>
                    <li>Enter your OpenAI API key starting with <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">sk-...</code></li>
                    <li>Click <strong>Save</strong>. Your key is stored securely in your local browser storage.</li>
                  </ol>
                </div>
              </section>
            )}

            {activeSection === 'user-upload' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    User Guide • Chapter 3
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Document Upload & AI Vision OCR</h1>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Drag and drop any supported document (<code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">.txt, .md, .docx, .pdf, .png, .jpg, .jpeg, .webp, .gif</code>) into the upload card.
                </p>
              </section>
            )}

            {activeSection === 'user-section-selector' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    User Guide • Chapter 4
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Section & Line Range Selection</h1>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  When developing knowledge documents continuously, re-uploading the entire file can generate duplicate questions. The <strong>Section & Line Range Selector</strong> allows you to select non-contiguous line ranges or use presets:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li><strong>Select All Document</strong>: uses the whole file.</li>
                  <li><strong>Bottom Half (Newest)</strong>: selects the bottom half of the file.</li>
                  <li><strong>Last 50 Lines</strong>: selects only the last 50 lines.</li>
                  <li><strong>Clicking Document Lines</strong>: click any line in the document preview to set range start/end.</li>
                </ul>
              </section>
            )}

            {activeSection === 'user-language-options' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    User Guide • Chapter 5
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Language Settings (Target & Question Language)</h1>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                  <h3 className="font-semibold text-indigo-900">Bilingual Learning Setup Example</h3>
                  <p className="text-xs text-indigo-800">
                    Set <strong>Question Language = Vietnamese</strong> and <strong>Target Learning Language = Japanese</strong> to generate Vietnamese questions testing Japanese vocabulary, kanji, and grammar.
                  </p>
                </div>
              </section>
            )}

            {activeSection === 'user-question-bank' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    User Guide • Chapter 6
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Question Bank Management, Editing & Deleting</h1>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>• <strong>Pencil Icon</strong>: Opens the Edit Question Modal to refine question wording, answer choices, and reference explanations.</p>
                  <p>• <strong>Trash Icon</strong>: Permanently deletes a single question from your bank.</p>
                </div>
              </section>
            )}

            {activeSection === 'user-quiz-engine' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    User Guide • Chapter 7
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Interactive Quiz Mode & AI Evaluation</h1>
                </div>
                <p className="text-sm text-gray-700">
                  Start the quiz to test your knowledge. For written answer or practical example questions, OpenAI grades your input conceptually and gives detailed feedback score from 0-100.
                </p>
              </section>
            )}

            {activeSection === 'user-faq' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    User Guide • Chapter 8
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">User FAQ & Troubleshooting</h1>
                </div>
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900">Q: Where is my API key stored?</h4>
                    <p className="text-xs text-gray-600">A: It is stored locally in your browser storage and never sent to third-party servers.</p>
                  </div>
                </div>
              </section>
            )}

            {/* CONTRIBUTOR GUIDE SECTIONS */}

            {activeSection === 'dev-architecture' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    Contributor Guide • Section 1
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">System Architecture & Tech Stack</h1>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 border rounded-lg bg-gray-50"><span className="font-bold text-xs">React 19</span></div>
                  <div className="p-3 border rounded-lg bg-gray-50"><span className="font-bold text-xs">TypeScript 5.9</span></div>
                  <div className="p-3 border rounded-lg bg-gray-50"><span className="font-bold text-xs">Vite 7.3</span></div>
                  <div className="p-3 border rounded-lg bg-gray-50"><span className="font-bold text-xs">Tailwind CSS v4</span></div>
                </div>
              </section>
            )}

            {activeSection === 'dev-setup' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    Contributor Guide • Section 2
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Local Development Setup</h1>
                </div>
                <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-xs space-y-2">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>bash</span>
                    <button
                      onClick={() => handleCopy("git clone https://github.com/JosephPham324/ai_quiz_app.git\ncd ai_quiz_app\nnpm install\nnpm run dev", "setup")}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedCode === "setup" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre>git clone https://github.com/JosephPham324/ai_quiz_app.git{"\n"}cd ai_quiz_app{"\n"}npm install{"\n"}npm run dev</pre>
                </div>
              </section>
            )}

            {activeSection === 'dev-structure' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    Contributor Guide • Section 3
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Directory & Module Structure</h1>
                </div>
                <pre className="bg-gray-50 border p-4 rounded-xl text-xs font-mono leading-relaxed">
{`src/
├── components/
│   ├── EditQuestionModal.tsx       # Single-question edit dialog
│   ├── FileUploader.tsx            # Multi-format document uploader
│   ├── ImageTextReviewModal.tsx    # OCR extraction review
│   ├── PromptModal.tsx             # Generation prompt preview
│   ├── QuestionBankViewer.tsx      # Question bank with edit/delete
│   ├── QuizConfigModal.tsx         # Quiz settings modal
│   ├── QuizUI.tsx                  # Interactive quiz engine
│   ├── SectionSelectorModal.tsx    # Line-range selection modal
│   └── SettingsModal.tsx           # API key modal
├── contexts/
│   └── LanguageContext.tsx        # i18n English/Vietnamese context
├── locales/
│   ├── en.ts                       # English localizations
│   └── vi.ts                       # Vietnamese localizations
├── services/
│   └── ai.ts                       # OpenAI API client & prompt builder
└── types/
    └── index.ts                    # TypeScript interface definitions`}
                </pre>
              </section>
            )}

            {activeSection === 'dev-prompt-engineering' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    Contributor Guide • Section 4
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">AI Prompt Engineering & Model Architecture (`ai.ts`)</h1>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  The application's AI module located in <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">src/services/ai.ts</code> orchestrates system prompt construction, model selection, language directive injection, and real-time conceptual evaluation.
                </p>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-base">1. OpenAI Model Selection Matrix</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                      <div className="font-bold text-indigo-700 font-mono mb-1">gpt-4.1-nano</div>
                      <p className="text-gray-600">Ultra-fast generation, lightweight token overhead, best for large text uploads & rapid vocabulary quizzes.</p>
                    </div>
                    <div className="p-3 border border-indigo-200 rounded-xl bg-indigo-50/50">
                      <div className="font-bold text-indigo-700 font-mono mb-1">gpt-4o (Default)</div>
                      <p className="text-gray-600">High accuracy, multi-lingual translation, AI Vision OCR for scanned document images and PDFs.</p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                      <div className="font-bold text-indigo-700 font-mono mb-1">gpt-4.1</div>
                      <p className="text-gray-600">Deep technical reasoning, multi-step math/code problem generation, strict essay evaluation.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-base">2. Dynamic System Prompt Pipeline</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Function <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">buildSystemPrompt(complexity, options)</code> dynamically composes instructions in five stages:
                  </p>
                  <pre className="bg-gray-900 text-indigo-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`System Prompt Assembly =
  1. Base Persona Directive ("You are an expert educator and quiz builder...")
  2. Complexity Directive (Brief / Elaborate / Practical / Coding / Vocabulary / Custom)
  3. Language Directive (buildLanguageDirective for Question & Target Languages)
  4. User Custom Instruction (Appended when promptLanguageInstruction or custom prompt is supplied)
  5. JSON Output Schema Enforcement (Requires valid JSON array of Question objects)`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-base">3. Bilingual Directive Logic (`buildLanguageDirective`)</h3>
                  <div className="p-4 border border-indigo-100 bg-indigo-50/40 rounded-xl text-xs text-gray-700 space-y-2">
                    <p>When users configure a <strong>Question Language</strong> (e.g. Vietnamese) and a <strong>Target Learning Language</strong> (e.g. Japanese):</p>
                    <pre className="bg-white p-3 border rounded-lg font-mono text-[11px] text-indigo-950">
{`buildLanguageDirective({ questionLanguage: 'Vietnamese', targetLanguage: 'Japanese' })
=> "CRITICAL LANGUAGE CONSTRAINT:
   - Question Language: Write all question stems, answer choices, and explanations in Vietnamese.
   - Target Learning Language: Test Japanese concepts, vocabulary, grammar, or written references."`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-base">4. Conceptual Written Answer Grading</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Function <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">evaluateWrittenAnswer()</code> sends the student's answer alongside the reference solution to OpenAI, returning a structured JSON score (0-100) and constructive feedback text.
                  </p>
                </div>
              </section>
            )}

            {activeSection === 'dev-state-flow' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    Contributor Guide • Section 5
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Component State Flow</h1>
                </div>
                <p className="text-sm text-gray-700">
                  <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">App.tsx</code> maintains global state for <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">questions</code> array, <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">sectionSelectionState</code>, <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">imageReviewState</code>, and <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">currentGenerationOptions</code>.
                </p>
              </section>
            )}

            {activeSection === 'dev-deployment' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    Contributor Guide • Section 6
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">GitHub Pages Deployment Workflow</h1>
                </div>
                <p className="text-sm text-gray-700">
                  GitHub Actions workflow file <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">.github/workflows/deploy.yml</code> automatically builds both <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">dist/index.html</code> and <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">dist/docs.html</code> and deploys them directly to GitHub Pages on every push to <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">main</code>.
                </p>
              </section>
            )}

            {activeSection === 'dev-contributing' && (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    Contributor Guide • Section 7
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Contributing Guidelines</h1>
                </div>
                <div className="p-4 bg-gray-50 border rounded-xl space-y-2 text-sm text-gray-700">
                  <p>1. Fork repository and create a feature branch (<code className="font-mono text-xs">feature/my-feature</code>).</p>
                  <p>2. Ensure clean TypeScript compilation (<code className="font-mono text-xs">npm run build</code>).</p>
                  <p>3. Submit a clean Pull Request with clear description of changes.</p>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
