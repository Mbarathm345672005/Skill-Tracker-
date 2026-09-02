import React from 'react';
import { PERIODS } from '../../utils/dateUtils';
import { Calendar } from 'lucide-react';

export const PeriodSelector = ({
  selectedPeriod,
  onSelectPeriod,
  customStartDate,
  customEndDate,
  onChangeCustomDates,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-soft-sm">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {PERIODS.map((p) => {
          const isSelected = selectedPeriod === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPeriod(p.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom range date pickers */}
      {selectedPeriod === 'custom' && (
        <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:pl-3 sm:border-l border-slate-200 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onChangeCustomDates(e.target.value, customEndDate)}
              className="bg-transparent border-none text-slate-800 text-xs focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onChangeCustomDates(customStartDate, e.target.value)}
              className="bg-transparent border-none text-slate-800 text-xs focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
