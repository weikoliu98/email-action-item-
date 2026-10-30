import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface TbdAlertBannerProps {
  tbdCount: number;
  totalCount: number;
  warnings?: string[];
}

export const TbdAlertBanner: React.FC<TbdAlertBannerProps> = ({
  tbdCount,
  totalCount,
  warnings,
}) => {
  if (tbdCount === 0) {
    return (
      <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">
            All {totalCount} action item{totalCount !== 1 ? 's have' : ' has'} explicit target dates.
          </span>
        </div>
        <span className="text-[11px] text-emerald-600 font-mono">0 [TBD] Deadlines</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-amber-950">
            {tbdCount} of {totalCount} action item{totalCount !== 1 ? 's have' : ' has'} [TBD] deadlines
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 font-medium border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          [TBD] Rule Enforced
        </span>
      </div>
      <p className="text-amber-800 text-[11px] leading-relaxed">
        Per the PM rule, no deadlines were invented or guessed. The email draft explicitly marks these as <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-semibold">[TBD]</code> so owners can confirm their estimated delivery dates.
      </p>
    </div>
  );
};
