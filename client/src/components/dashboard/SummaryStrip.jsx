import React from 'react';
import {
  Flame,
  Clock,
  CheckCircle,
  Zap,
  TrendingUp,
  Code2,
} from 'lucide-react';
import { formatNumber, formatMinutesToHours } from '../../utils/formatters';

export const SummaryStrip = ({
  summary = {},
  selectedPerson = null,
  streakData = null,
  loading = false,
}) => {
  const totalEntries = summary?.totalEntries || 0;
  const totalMinutes = summary?.totalTimeSpentMinutes || 0;
  const doneEntries = summary?.statuses?.['Done'] || 0;
  const completionRate = totalEntries > 0 ? Math.round((doneEntries / totalEntries) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Entries */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Activities
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {loading ? '—' : formatNumber(totalEntries)}
            </h3>
            <span className="text-xs font-semibold text-slate-500">logged</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <CheckCircle className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Total Time Spent */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Time Invested
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {loading ? '—' : formatMinutesToHours(totalMinutes)}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              ({totalMinutes} mins)
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Streak Card (Displayed for single person, or Team Overview if All People) */}
      {selectedPerson ? (
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 p-5 rounded-2xl border border-orange-200 shadow-soft-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-orange-950">
                {selectedPerson.name}'s Streak
              </p>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-orange-600 tabular-nums">
                {streakData?.currentStreak ?? 0}
                <span className="text-base font-bold text-orange-600/80 ml-1">days</span>
              </h3>
            </div>
            <p className="text-[11px] font-semibold text-orange-900/80 mt-0.5">
              Best: {streakData?.longestStreak ?? 0} days · Active: {streakData?.totalActiveDays ?? 0}d
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
            <Flame className="w-6 h-6 fill-white" />
          </div>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completion Rate
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {loading ? '—' : `${completionRate}%`}
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                ({doneEntries} Done)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Across all logged tasks
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* 4. Problem Solving / Categories Active */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Problems Solved
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-orange-600 tabular-nums">
              {loading
                ? '—'
                : (summary?.difficulties?.Easy || 0) +
                  (summary?.difficulties?.Medium || 0) +
                  (summary?.difficulties?.Hard || 0)}
            </h3>
            <span className="text-xs font-semibold text-slate-500">questions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium tabular-nums">
            <span className="text-emerald-600 font-bold">{summary?.difficulties?.Easy || 0}E</span> ·{' '}
            <span className="text-amber-600 font-bold">{summary?.difficulties?.Medium || 0}M</span> ·{' '}
            <span className="text-rose-600 font-bold">{summary?.difficulties?.Hard || 0}H</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
          <Code2 className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
