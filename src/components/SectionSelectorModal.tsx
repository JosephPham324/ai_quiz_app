import { useState, useMemo } from "react";
import { X, Plus, Trash2, Sparkles, Layers, ListFilter } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export interface LineRange {
  id: string;
  startInput: string;
  endInput: string;
}

interface SectionSelectorModalProps {
  filename: string;
  fullText: string;
  onConfirm: (selectedText: string) => void;
  onClose: () => void;
}

export default function SectionSelectorModal({
  filename,
  fullText,
  onConfirm,
  onClose,
}: SectionSelectorModalProps) {
  const { t } = useLanguage();

  const lines = useMemo(() => fullText.split("\n"), [fullText]);
  const totalLines = lines.length;

  // Active line ranges state (using text inputs for freedom)
  const [ranges, setRanges] = useState<LineRange[]>([
    { id: "1", startInput: "1", endInput: String(totalLines) },
  ]);

  // Track active range for click-to-select
  const [activeRangeId, setActiveRangeId] = useState<string>("1");

  // Presets
  const handleSelectAll = () => {
    setRanges([{ id: "1", startInput: "1", endInput: String(totalLines) }]);
    setActiveRangeId("1");
  };

  const handleSelectLast50 = () => {
    const start = Math.max(1, totalLines - 49);
    setRanges([{ id: "1", startInput: String(start), endInput: String(totalLines) }]);
    setActiveRangeId("1");
  };

  const handleSelectBottomHalf = () => {
    const start = Math.max(1, Math.floor(totalLines / 2) + 1);
    setRanges([{ id: "1", startInput: String(start), endInput: String(totalLines) }]);
    setActiveRangeId("1");
  };

  const handleClearAll = () => {
    setRanges([]);
  };

  const handleAddRange = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const lastRange = ranges[ranges.length - 1];
    let defaultStart = 1;
    if (lastRange) {
      const parsedEnd = parseInt(lastRange.endInput, 10);
      defaultStart = isNaN(parsedEnd) ? 1 : Math.min(totalLines, parsedEnd + 1);
    }
    setRanges([
      ...ranges,
      { id: newId, startInput: String(defaultStart), endInput: String(totalLines) },
    ]);
    setActiveRangeId(newId);
  };

  const handleRemoveRange = (id: string) => {
    const next = ranges.filter((r) => r.id !== id);
    setRanges(next);
    if (activeRangeId === id && next.length > 0) {
      setActiveRangeId(next[0].id);
    }
  };

  const handleUpdateRangeInput = (id: string, field: "startInput" | "endInput", value: string) => {
    // Allow digits or empty string while typing
    const sanitized = value.replace(/[^0-9]/g, "");
    setRanges(
      ranges.map((r) => (r.id === id ? { ...r, [field]: sanitized } : r))
    );
  };

  const handleBlurRangeInput = (id: string, field: "startInput" | "endInput") => {
    setRanges(
      ranges.map((r) => {
        if (r.id !== id) return r;
        const raw = r[field];
        const val = parseInt(raw, 10);
        if (isNaN(val) || val < 1) {
          return { ...r, [field]: field === "startInput" ? "1" : String(totalLines) };
        }
        const clamped = Math.min(totalLines, val);
        return { ...r, [field]: String(clamped) };
      })
    );
  };

  // Helper to parse numeric start & end for range computation
  const parsedRanges = useMemo(() => {
    return ranges.map((r) => {
      const startNum = parseInt(r.startInput, 10);
      const endNum = parseInt(r.endInput, 10);
      const validStart = isNaN(startNum) ? 1 : Math.max(1, Math.min(totalLines, startNum));
      const validEnd = isNaN(endNum) ? totalLines : Math.max(1, Math.min(totalLines, endNum));
      return {
        id: r.id,
        min: Math.min(validStart, validEnd),
        max: Math.max(validStart, validEnd),
      };
    });
  }, [ranges, totalLines]);

  // Check if line (1-based index) is selected in any range
  const selectedLineSet = useMemo(() => {
    const set = new Set<number>();
    parsedRanges.forEach((r) => {
      for (let i = r.min; i <= r.max; i++) {
        set.add(i);
      }
    });
    return set;
  }, [parsedRanges]);

  // Compute selected text
  const selectedText = useMemo(() => {
    const selectedLines: string[] = [];
    for (let i = 1; i <= totalLines; i++) {
      if (selectedLineSet.has(i)) {
        selectedLines.push(lines[i - 1]);
      }
    }
    return selectedLines.join("\n");
  }, [lines, totalLines, selectedLineSet]);

  const selectedWordCount = useMemo(() => {
    const trimmed = selectedText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [selectedText]);

  // Click on line to set range start or end
  const handleLineClick = (lineNum: number) => {
    if (ranges.length === 0) {
      const newId = Math.random().toString(36).substring(2, 9);
      setRanges([{ id: newId, startInput: String(lineNum), endInput: String(totalLines) }]);
      setActiveRangeId(newId);
      return;
    }

    const currentRange = ranges.find((r) => r.id === activeRangeId) || ranges[ranges.length - 1];
    const currentStart = parseInt(currentRange.startInput, 10) || 1;

    if (lineNum < currentStart) {
      handleUpdateRangeInput(currentRange.id, "startInput", String(lineNum));
    } else {
      handleUpdateRangeInput(currentRange.id, "endInput", String(lineNum));
    }
  };

  const handleGenerate = () => {
    if (!selectedText.trim()) return;
    onConfirm(selectedText);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {t.sectionSelector.title}
                <span className="text-xs font-normal text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  {filename}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{t.sectionSelector.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Panel: Range Controls & Presets */}
          <div className="lg:col-span-4 p-5 border-r border-gray-200 overflow-y-auto space-y-6 bg-gray-50/50">
            {/* Quick Selection Presets */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2.5 flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-indigo-500" />
                {t.sectionSelector.presetsLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-gray-700 rounded-lg transition-all text-left shadow-xs"
                >
                  {t.sectionSelector.selectAll}
                </button>
                <button
                  type="button"
                  onClick={handleSelectBottomHalf}
                  className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-gray-700 rounded-lg transition-all text-left shadow-xs"
                >
                  {t.sectionSelector.selectBottomHalf}
                </button>
                <button
                  type="button"
                  onClick={handleSelectLast50}
                  className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-gray-700 rounded-lg transition-all text-left shadow-xs"
                >
                  {t.sectionSelector.selectLast50}
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-2 text-xs font-medium bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 text-rose-600 rounded-lg transition-all text-left shadow-xs"
                >
                  {t.sectionSelector.clearAll}
                </button>
              </div>
            </div>

            {/* Range Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t.sectionSelector.rangeLabel}s ({ranges.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddRange}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.sectionSelector.addRange}
                </button>
              </div>

              {ranges.length === 0 ? (
                <div className="p-4 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-400">
                  No ranges selected. Click "+ Add Line Range" or choose a preset.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {ranges.map((r, idx) => {
                    const isActive = r.id === activeRangeId;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setActiveRangeId(r.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? "border-indigo-500 bg-indigo-50/60 shadow-xs"
                            : "border-gray-200 bg-white hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">
                            {t.sectionSelector.rangeLabel} {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRange(r.id);
                            }}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors"
                            title={t.sectionSelector.removeRange}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-gray-500 block mb-0.5">{t.sectionSelector.startLine}</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={r.startInput}
                              onChange={(e) => handleUpdateRangeInput(r.id, "startInput", e.target.value)}
                              onBlur={() => handleBlurRangeInput(r.id, "startInput")}
                              className="w-full bg-white border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-800 font-mono outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block mb-0.5">{t.sectionSelector.endLine}</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={r.endInput}
                              onChange={(e) => handleUpdateRangeInput(r.id, "endInput", e.target.value)}
                              onBlur={() => handleBlurRangeInput(r.id, "endInput")}
                              className="w-full bg-white border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-800 font-mono outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selection Stats Card */}
            <div className="p-4 bg-indigo-900 text-white rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span>{t.sectionSelector.selectedSummary}</span>
                <span className="font-semibold text-white">
                  {Math.round((selectedLineSet.size / (totalLines || 1)) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{selectedLineSet.size}</span>
                <span className="text-xs text-indigo-200">{t.sectionSelector.lines} ({selectedWordCount} {t.sectionSelector.words})</span>
              </div>
              <p className="text-[11px] text-indigo-300">
                {selectedLineSet.size} {t.sectionSelector.lines} {t.sectionSelector.ofTotal} {totalLines} {t.sectionSelector.lines}.
              </p>
            </div>
          </div>

          {/* Right Panel: Interactive Document Viewer */}
          <div className="lg:col-span-8 flex flex-col min-h-0 bg-white">
            <div className="px-4 py-2 bg-gray-100/60 border-b border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500 font-medium">{t.sectionSelector.clickHint}</span>
              <span className="text-xs font-mono text-gray-400">{totalLines} lines total</span>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-xs leading-relaxed select-text">
              {lines.map((lineText, idx) => {
                const lineNum = idx + 1;
                const isSelected = selectedLineSet.has(lineNum);
                return (
                  <div
                    key={idx}
                    onClick={() => handleLineClick(lineNum)}
                    className={`flex items-start group cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50/80 border-l-4 border-indigo-600 text-indigo-950 font-medium"
                        : "hover:bg-gray-100 border-l-4 border-transparent text-gray-700"
                    }`}
                  >
                    <span
                      className={`w-12 shrink-0 select-none text-right pr-3 py-0.5 text-[11px] ${
                        isSelected ? "text-indigo-600 font-bold" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      {lineNum}
                    </span>
                    <span className="flex-1 py-0.5 pr-4 whitespace-pre-wrap break-all">
                      {lineText || " "}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t.sectionSelector.cancel}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={selectedLineSet.size === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {t.sectionSelector.generateForSelected} ({selectedLineSet.size} {t.sectionSelector.lines})
          </button>
        </div>
      </div>
    </div>
  );
}
