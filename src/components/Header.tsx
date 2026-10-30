import React from 'react';
import { Mail, Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface HeaderProps {
  onSelectTest: (testId: string) => void;
  activeTestId: string | null;
}

export const Header: React.FC<HeaderProps> = ({ onSelectTest, activeTestId }) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 tracking-tight">ActionDraft</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Gemini Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Turn meeting notes & transcripts into action emails in seconds
            </p>
          </div>
        </div>

        {/* Right side info & quick status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strict [TBD] Deadline Enforcement</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
            <span>⌘ + Enter to generate</span>
          </div>
        </div>
      </div>
    </header>
  );
};
