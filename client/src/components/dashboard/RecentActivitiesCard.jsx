import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ListTodo,
  ArrowRight,
  ExternalLink,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../common/Card';
import { PersonAvatar } from '../common/PersonAvatar';
import { StatusBadge } from '../common/StatusBadge';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatDateDisplay } from '../../utils/dateUtils';
import { formatMinutesToHours } from '../../utils/formatters';
import { Button } from '../common/Button';

export const RecentActivitiesCard = ({
  entries = [],
  loading = false,
  onEditEntry,
  onOpenNewEntry,
}) => {
  const navigate = useNavigate();

  // Show strictly 4 recent rows
  const recentRows = entries.slice(0, 4);

  return (
    <Card
      title="Recent Activities"
      subtitle="Latest 4 activities logged"
      icon={ListTodo}
      action={
        <Link
          to="/entries"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-indigo-50"
        >
          <span>View all entries</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p>Loading activities...</p>
        </div>
      ) : recentRows.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm space-y-3">
          <p>No recent activity found for this period.</p>
          {onOpenNewEntry && (
            <Button size="sm" variant="primary" onClick={onOpenNewEntry}>
              Log First Activity
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentRows.map((entry) => {
            const category = entry.categoryId || {};
            const subcategory = entry.subcategoryId;
            const person = entry.personId || {};

            return (
              <div
                key={entry._id}
                onClick={() => {
                  if (onEditEntry) {
                    onEditEntry(entry);
                  } else {
                    navigate('/entries');
                  }
                }}
                className="group p-3 sm:p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-soft-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              >
                {/* Left: Person avatar + Title + Badges */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <PersonAvatar name={person.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {entry.title}
                      </span>
                      {entry.difficulty && (
                        <DifficultyBadge difficulty={entry.difficulty} />
                      )}
                      {entry.problemLink && (
                        <a
                          href={entry.problemLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open problem link"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Metadata line: Category + Subcategory + Person Name */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="font-medium text-slate-700">{person.name}</span>
                      <span>•</span>
                      <span
                        style={{
                          color: category.color || '#4F46E5',
                        }}
                        className="inline-flex items-center gap-1 font-semibold"
                      >
                        <CategoryIcon
                          iconName={category.icon}
                          colorHex={category.color}
                          className="w-3 h-3"
                        />
                        {category.name || 'Category'}
                        {subcategory?.name ? ` › ${subcategory.name}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status, Time, Date & Details Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right tabular-nums space-y-0.5">
                    <div className="flex items-center gap-2 justify-end">
                      <StatusBadge status={entry.status} />
                      <span className="text-xs font-bold text-slate-700">
                        {formatMinutesToHours(entry.timeSpentMinutes)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {formatDateDisplay(entry.date)}
                    </p>
                  </div>

                  {/* Explicit Details Navigation Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/entries');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 group-hover:border-indigo-300 group-hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-2xs"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
