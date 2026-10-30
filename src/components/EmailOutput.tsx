import React, { useState } from 'react';
import {
  Copy,
  Check,
  Mail,
  Download,
  Edit3,
  Eye,
  Sparkles,
  ArrowRight,
  ListTodo,
  FileText,
  ClipboardCheck,
  ShieldAlert,
} from 'lucide-react';
import { ExtractionResult } from '../types';
import { TbdAlertBanner } from './TbdAlertBanner';
import { ActionItemsTable } from './ActionItemsTable';

interface EmailOutputProps {
  result: ExtractionResult | null;
  isLoading: boolean;
  onRefine: (prompt: string) => Promise<void>;
  isRefining: boolean;
}

export const EmailOutput: React.FC<EmailOutputProps> = ({
  result,
  isLoading,
  onRefine,
  isRefining,
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'actions'>('email');
  const [isEditing, setIsEditing] = useState(false);
  const [subjectText, setSubjectText] = useState(result?.subject || '');
  const [bodyText, setBodyText] = useState(result?.emailBody || '');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [refinementInput, setRefinementInput] = useState('');

  // Keep state updated when result changes
  React.useEffect(() => {
    if (result) {
      setSubjectText(result.subject);
      setBodyText(result.emailBody);
      setActiveTab('email');
    }
  }, [result]);

  const showCopyToast = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => {
      setCopiedNotification(null);
    }, 2400);
  };

  const handleCopyAll = () => {
    const fullText = `Subject: ${subjectText}\n\n${bodyText}`;
    navigator.clipboard.writeText(fullText);
    showCopyToast('Full email (subject + body) copied to clipboard!');
  };

  const handleCopyBodyOnly = () => {
    navigator.clipboard.writeText(bodyText);
    showCopyToast('Email body copied to clipboard!');
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subjectText);
    showCopyToast('Subject line copied to clipboard!');
  };

  const handleOpenMailto = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
  };

  const handleDownloadTxt = () => {
    const fullText = `Subject: ${subjectText}\n\n${bodyText}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subjectText.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Action_Email.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickRefine = (chipPrompt: string) => {
    onRefine(chipPrompt);
  };

  const handleCustomRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinementInput.trim()) {
      onRefine(refinementInput.trim());
      setRefinementInput('');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col items-center justify-center p-8 text-center min-h-[460px]">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <h3 className="font-semibold text-slate-900 text-sm mb-1">
          Extracting Commitments & Formatting Email Draft
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Gemini is isolating deliverables, verifying owners, strictly enforcing [TBD] for unmentioned deadlines, and stripping non-actionable chatter...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm h-full flex flex-col items-center justify-center p-8 text-center min-h-[460px]">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
          <Mail className="w-6 h-6 text-indigo-500" />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm mb-1">
          Your Formatted Action Email Will Appear Here
        </h3>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
          Paste meeting notes or a raw transcript on the left, or choose an Acceptance Test preset above to test instant generation.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600 font-medium">
          <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">✓ Action verification</span>
          <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">✓ Strict [TBD] deadlines</span>
          <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">✓ Strict client blast refusal</span>
        </div>
      </div>
    );
  }

  // Refusal screen if a client blast request was made
  if (result.isRefused) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 shadow-sm flex flex-col h-full overflow-hidden p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Rule Enforced
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                Request Strictly Refused: Client Blast
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {result.refusalMessage ||
                'This application strictly refuses to generate client blasts, marketing announcements, or customer broadcasts.'}
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white border border-rose-200 rounded-xl p-5 overflow-y-auto mb-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Refusal Notice Response:
          </div>
          <p className="text-sm text-slate-900 leading-relaxed font-sans">
            {result.emailBody}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Rule: Only internal meeting notes and action items are processed into team emails.
          </span>
          <button
            onClick={() => handleCopyAll()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Refusal Notice</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header Tabs & Quick Actions */}
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-3 bg-white flex-wrap">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'email'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Email Draft</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'actions'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Action Items</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono">
              {result.actionItems.length}
            </span>
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          {activeTab === 'email' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title={isEditing ? 'Switch to formatted view' : 'Edit email text directly'}
            >
              {isEditing ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Preview</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </>
              )}
            </button>
          )}

          {/* Primary Copy to Clipboard Button */}
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            title="Copy complete email with subject to clipboard"
          >
            {copiedNotification ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenMailto}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Open draft in default mail client"
          >
            <Mail className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadTxt}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Download as text file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Copy Success Toast Banner */}
      {copiedNotification && (
        <div className="mx-5 mt-3 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{copiedNotification}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">Ready to paste</span>
        </div>
      )}

      {/* TBD Alert Banner */}
      <div className="px-5 pt-3">
        <TbdAlertBanner
          tbdCount={result.statistics.tbdDeadlinesCount}
          totalCount={result.statistics.totalActions}
          warnings={result.tbdWarnings}
        />
      </div>

      {/* Main Content Area: Pure White Background & High Contrast */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
        {activeTab === 'email' && (
          <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-hidden bg-white">
            {/* Subject Line Header */}
            <div className="mb-3 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                Subject:
              </span>
              <input
                type="text"
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
                className="flex-1 text-xs sm:text-sm font-semibold text-slate-900 bg-transparent focus:outline-none"
              />
              <button
                onClick={handleCopySubject}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer shrink-0"
                title="Copy subject line only"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Subject</span>
              </button>
            </div>

            {/* Email Body Container (White background, easy to read, with in-box copy button) */}
            <div className="relative flex-1 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs flex flex-col">
              {/* In-box Floating Copy to Clipboard button */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                <button
                  onClick={handleCopyBodyOnly}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white/95 hover:bg-white border border-slate-200 rounded-md shadow-xs transition-colors cursor-pointer backdrop-blur-xs"
                  title="Copy body text only to clipboard"
                >
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Copy Body</span>
                </button>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/90 hover:bg-indigo-50 border border-indigo-200 rounded-md shadow-xs transition-colors cursor-pointer backdrop-blur-xs"
                  title="Copy full email with subject"
                >
                  <ClipboardCheck className="w-3 h-3 text-indigo-600" />
                  <span>Copy All</span>
                </button>
              </div>

              {/* Scrollable Email Text with High Legibility */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-white font-sans text-xs sm:text-sm text-slate-900 leading-relaxed">
                {isEditing ? (
                  <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="w-full h-full resize-none focus:outline-none font-sans text-slate-900 leading-relaxed text-xs sm:text-sm bg-white"
                    placeholder="Email body text..."
                  />
                ) : (
                  <div className="whitespace-pre-wrap selection:bg-indigo-100 font-normal text-slate-900">
                    {bodyText}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Refinement Toolbar */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2 bg-white">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Quick Refine:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickRefine('Make it ultra-concise for busy executives.')}
                  disabled={isRefining}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  ⚡ More Concise
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRefine('Add a polite, clear reminder for owners with [TBD] deadlines to reply with their target dates.')}
                  disabled={isRefining}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  📅 Request [TBD] Dates
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRefine('Organize the action items strictly by individual owner name with bold headings.')}
                  disabled={isRefining}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  👥 Group by Owner
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRefine('Use formal executive leadership tone.')}
                  disabled={isRefining}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  👔 Formal Tone
                </button>
              </div>

              {/* Custom refinement input */}
              <form onSubmit={handleCustomRefineSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  placeholder="Need custom adjustments? (e.g. 'Add a note thanking the team for the quick turnaround')"
                  disabled={isRefining}
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isRefining || !refinementInput.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  {isRefining ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Refine</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <ActionItemsTable actionItems={result.actionItems} />
        )}
      </div>
    </div>
  );
};
