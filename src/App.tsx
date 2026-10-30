import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { AcceptanceTestBar } from './components/AcceptanceTestBar';
import { NotesInput } from './components/NotesInput';
import { EmailOutput } from './components/EmailOutput';
import { ACCEPTANCE_TESTS } from './data/acceptanceTests';
import {
  ExtractionResult,
  GroupingOption,
  ToneOption,
  AcceptanceTestPreset,
} from './types';
import { AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTestId, setActiveTestId] = useState<string | null>('test-1-standard-bulleted');
  const [notes, setNotes] = useState<string>(ACCEPTANCE_TESTS[0].notes);
  const [meetingTitle, setMeetingTitle] = useState<string>(ACCEPTANCE_TESTS[0].meetingTitle);
  const [grouping, setGrouping] = useState<GroupingOption>('by_owner');
  const [tone, setTone] = useState<ToneOption>('professional');
  const [senderName, setSenderName] = useState<string>('Project Management');

  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeTestPreset = ACCEPTANCE_TESTS.find((t) => t.id === activeTestId) || null;

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!notes.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/extract-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
          meetingTitle,
          grouping,
          tone,
          senderName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process notes and generate email.');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while communicating with Gemini.');
    } finally {
      setIsLoading(false);
    }
  }, [notes, meetingTitle, grouping, tone, senderName, isLoading]);

  // Handle refinement
  const handleRefine = async (refinementPrompt: string) => {
    if (!result || isRefining) return;

    setIsRefining(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/refine-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentEmailBody: result.emailBody,
          currentSubject: result.subject,
          refinementPrompt,
          actionItems: result.actionItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine email draft.');
      }

      setResult((prev) =>
        prev
          ? {
              ...prev,
              subject: data.subject,
              emailBody: data.emailBody,
            }
          : null
      );
    } catch (err: any) {
      console.error('Refinement error:', err);
      setErrorMessage(err.message || 'Failed to apply refinement.');
    } finally {
      setIsRefining(false);
    }
  };

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to trigger generation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  // Handle selecting an Acceptance Test Preset
  const handleSelectTest = (testId: string) => {
    const preset = ACCEPTANCE_TESTS.find((t) => t.id === testId);
    if (preset) {
      setActiveTestId(testId);
      setNotes(preset.notes);
      setMeetingTitle(preset.meetingTitle);
      setResult(null);
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Header onSelectTest={handleSelectTest} activeTestId={activeTestId} />
      <AcceptanceTestBar activeTestId={activeTestId} onSelectTest={handleSelectTest} />

      {/* Main Single-Screen Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 text-rose-400 hover:text-rose-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Two-panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-[620px]">
          {/* Left panel: Notes input */}
          <section className="h-full flex flex-col">
            <NotesInput
              notes={notes}
              setNotes={(val) => {
                setNotes(val);
                setActiveTestId(null);
              }}
              meetingTitle={meetingTitle}
              setMeetingTitle={setMeetingTitle}
              grouping={grouping}
              setGrouping={setGrouping}
              tone={tone}
              setTone={setTone}
              senderName={senderName}
              setSenderName={setSenderName}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              activeTestPreset={activeTestPreset}
            />
          </section>

          {/* Right panel: Email output & inspector */}
          <section className="h-full flex flex-col">
            <EmailOutput
              result={result}
              isLoading={isLoading}
              onRefine={handleRefine}
              isRefining={isRefining}
            />
          </section>
        </div>

        {/* Footer info & compliance badge */}
        <footer className="mt-4 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>
              Strict adherence: Non-actionable discussions are filtered out. Missing deadlines are labeled <strong>[TBD]</strong> without hallucinating dates.
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Model: Gemini Flash API</span>
            <span>•</span>
            <span>Project Manager Efficiency Suite</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
