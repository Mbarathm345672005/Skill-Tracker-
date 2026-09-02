import React from 'react';
import { Trophy, Award, Medal, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { PersonAvatar } from '../common/PersonAvatar';
import { formatMinutesToHours, formatNumber } from '../../utils/formatters';
import { formatDateDisplay } from '../../utils/dateUtils';

export const LeaderboardCard = ({ leaderboard = [], onSelectPerson }) => {
  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-7 h-7 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-sm font-black text-amber-700 shadow-sm" title="Rank 1">
            🥇
          </span>
        );
      case 2:
        return (
          <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-sm font-black text-slate-600 shadow-sm" title="Rank 2">
            🥈
          </span>
        );
      case 3:
        return (
          <span className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-sm font-black text-amber-800 shadow-sm" title="Rank 3">
            🥉
          </span>
        );
      default:
        return (
          <span className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 tabular-nums">
            #{rank}
          </span>
        );
    }
  };

  return (
    <Card
      title="Team Leaderboard"
      subtitle="Ranked by volume & hours in this period"
      icon={Trophy}
    >
      {leaderboard.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">
          No members found. Add people in the Manage tab.
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((item, index) => {
            const rank = index + 1;
            return (
              <div
                key={item.personId}
                onClick={() => onSelectPerson && onSelectPerson(item.personId)}
                className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-soft-sm transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(rank)}
                  <PersonAvatar name={item.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.lastActiveDate
                        ? `Last active: ${formatDateDisplay(item.lastActiveDate)}`
                        : 'No entries yet'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 tabular-nums">
                  <div className="flex items-center justify-end gap-1.5 font-bold text-sm text-slate-900">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{formatNumber(item.totalEntries)}</span>
                    <span className="text-xs font-medium text-slate-500">entries</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-600 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatMinutesToHours(item.totalTimeSpentMinutes)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
