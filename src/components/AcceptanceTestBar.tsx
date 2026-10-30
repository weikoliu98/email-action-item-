import React from 'react';
import { ACCEPTANCE_TESTS } from '../data/acceptanceTests';
import { CheckSquare, Users, CalendarOff, Mic, Ban, HelpCircle } from 'lucide-react';

interface AcceptanceTestBarProps {
  activeTestId: string | null;
  onSelectTest: (testId: string) => void;
}

export const AcceptanceTestBar: React.FC<AcceptanceTestBarProps> = ({
  activeTestId,
  onSelectTest,
}) => {
  const getIcon = (num: number) => {
    switch (num) {
      case 1:
        return <CheckSquare className="w-3.5 h-3.5" />;
      case 2:
        return <Users className="w-3.5 h-3.5" />;
      case 3:
        return <CalendarOff className="w-3.5 h-3.5 text-amber-500" />;
      case 4:
        return <Mic className="w-3.5 h-3.5" />;
      case 5:
        return <Ban className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Acceptance Tests:
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">
            (Click to load instant test notes)
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {ACCEPTANCE_TESTS.map((test) => {
            const isActive = activeTestId === test.id;
            return (
              <button
                key={test.id}
                onClick={() => onSelectTest(test.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 ring-2 ring-indigo-600/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
                title={`${test.description}\nExpected: ${test.expectedBehavior}`}
              >
                {getIcon(test.acceptanceTestNumber)}
                <span>
                  {test.acceptanceTestNumber}. {test.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
