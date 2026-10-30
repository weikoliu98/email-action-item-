import React, { useState } from 'react';
import { Sparkles, Trash2, Clipboard, SlidersHorizontal, AlertCircle, Info } from 'lucide-react';
import { GroupingOption, ToneOption, AcceptanceTestPreset } from '../types';

interface NotesInputProps {
  notes: string;
  setNotes: (val: string) => void;
  meetingTitle: string;
  setMeetingTitle: (val: string) => void;
  grouping: GroupingOption;
  setGrouping: (val: GroupingOption) => void;
  tone: ToneOption;
  setTone: (val: ToneOption) => void;
  senderName: string;
  setSenderName: (val: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  activeTestPreset: AcceptanceTestPreset | null;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  notes,
  setNotes,
  meetingTitle,
  setMeetingTitle,
  grouping,
  setGrouping,
  tone,
  setTone,
  senderName,
  setSenderName,
  onGenerate,
  isLoading,
  activeTestPreset,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setNotes(text);
      }
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const handleClear = () => {
    setNotes('');
    setMeetingTitle('');
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const lineCount = notes.trim() ? notes.split('\n').length : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <label htmlFor="notes-textarea" className="font-semibold text-sm text-slate-900">
            Meeting Notes / Raw Transcript
          </label>
          <span className="text-xs text-slate-400">
            ({wordCount} words • {lineCount} lines)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Paste</span>
          </button>
          {notes && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border shadow-2xs transition-colors cursor-pointer ${
              showOptions
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
            }`}
            title="Formatting & Tone Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Format Options</span>
          </button>
        </div>
      </div>

      {/* Acceptance Test Banner (if active) */}
      {activeTestPreset && (
        <div className="px-5 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-indigo-950">
              {activeTestPreset.badge}:
            </span>{' '}
            {activeTestPreset.description}
            <div className="mt-0.5 text-indigo-700 font-mono text-[11px]">
              Expected: {activeTestPreset.expectedBehavior}
            </div>
          </div>
        </div>
      )}

      {/* Expandable options panel */}
      {showOptions && (
        <div className="px-5 py-3.5 bg-white border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Grouping Style
            </label>
            <select
              value={grouping}
              onChange={(e) => setGrouping(e.target.value as GroupingOption)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="by_owner">Group by Owner (Recommended)</option>
              <option value="bulleted_list">Standard Chronological Bullets</option>
              <option value="by_priority">Group by Functional Area</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as ToneOption)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="professional">Professional Project Manager</option>
              <option value="concise">Concise & Direct (Speed-reading)</option>
              <option value="executive">Executive Summary Level</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Sign-off Name / Title
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Justin (Project Manager)"
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Meeting Title Input */}
      <div className="px-5 pt-3 pb-2 border-b border-slate-100">
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="Meeting Topic / Subject (optional, e.g. Sprint 24 Planning Sync)"
          className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Main Textarea */}
      <div className="flex-1 relative p-4 flex flex-col min-h-[320px]">
        <textarea
          id="notes-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Paste your raw meeting notes, bullets, or speech-to-text transcript here...

Examples of supported inputs:
• Standard bulleted action items
• Multi-task assignments for one person
• Brainstorm notes where no deadlines were discussed (auto-assigned [TBD])
• Unstructured raw Zoom/Teams transcript with chatter (chatter is filtered out)
• Requests to draft a client blast or announcement`}
          className="w-full flex-1 resize-none bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm leading-relaxed focus:outline-none font-mono selection:bg-indigo-100"
          spellCheck={false}
        />
      </div>

      {/* Action footer */}
      <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 w-full sm:w-auto">
          <AlertCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>Non-actionable chatter is stripped. Deadlines strictly [TBD] if missing.</span>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || !notes.trim()}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer ${
            isLoading || !notes.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Extracting Actions with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Format Action Email</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
