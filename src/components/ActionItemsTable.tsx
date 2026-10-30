import React, { useState } from 'react';
import { ActionItem } from '../types';
import { Clock, CheckCircle2, User, Copy, Check, Filter } from 'lucide-react';

interface ActionItemsTableProps {
  actionItems: ActionItem[];
}

export const ActionItemsTable: React.FC<ActionItemsTableProps> = ({ actionItems }) => {
  const [selectedOwner, setSelectedOwner] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const owners = Array.from(new Set(actionItems.map((item) => item.owner.trim())));

  const filteredItems =
    selectedOwner === 'ALL'
      ? actionItems
      : actionItems.filter((item) => item.owner.trim() === selectedOwner);

  const handleCopy = (item: ActionItem) => {
    navigator.clipboard.writeText(
      `• ${item.owner}: ${item.task} (Deadline: ${item.deadline})`
    );
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Filter bar */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap bg-white">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter by Owner:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setSelectedOwner('ALL')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedOwner === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            All ({actionItems.length})
          </button>
          {owners.map((owner) => {
            const count = actionItems.filter((i) => i.owner.trim() === owner).length;
            return (
              <button
                key={owner}
                onClick={() => setSelectedOwner(owner)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedOwner === owner
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {owner} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-4">
        {filteredItems.map((item, index) => {
          const isTbd =
            item.hasTbdDeadline ||
            item.deadline.toUpperCase().includes('TBD') ||
            item.deadline.trim() === '';

          return (
            <div
              key={item.id || index}
              className="py-3 px-3 hover:bg-slate-50/80 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {item.owner.slice(0, 2).toUpperCase() || 'UN'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-xs text-slate-900 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {item.owner}
                    </span>
                    {item.category && (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {item.task}
                  </p>
                </div>
              </div>

              {/* Deadline & quick copy */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    isTbd
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                  title={isTbd ? 'Deadline not stated in notes' : 'Target delivery deadline'}
                >
                  {isTbd ? (
                    <>
                      <Clock className="w-3 h-3 text-amber-600" />
                      [TBD]
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {item.deadline}
                    </>
                  )}
                </span>

                <button
                  onClick={() => handleCopy(item)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Copy single item"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
