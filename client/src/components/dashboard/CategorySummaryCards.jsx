import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FolderGit2, BookOpen, Code2 } from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatMinutesToHours, formatNumber } from '../../utils/formatters';

export const CategorySummaryCards = ({
  categories = [],
  categoriesSummary = [],
  subcategoriesSummary = [],
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {categories.map((cat) => {
        const summary = categoriesSummary.find((c) => c._id === cat._id) || {
          count: 0,
          totalTimeSpentMinutes: 0,
        };

        const subcats = subcategoriesSummary.filter((s) => s.categoryId === cat._id);

        return (
          <div
            key={cat._id}
            style={{
              borderColor: `${cat.color}30`,
            }}
            className="bg-white rounded-2xl border p-5 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2.5 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon iconName={cat.icon} colorHex={cat.color} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{cat.name}</h4>
                    <p className="text-xs text-slate-500">
                      {formatMinutesToHours(summary.totalTimeSpentMinutes)} logged
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-black tabular-nums"
                >
                  {formatNumber(summary.count)} entries
                </span>
              </div>

              {/* Subcategories list pills */}
              <div className="space-y-1.5 mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Subcategories Breakdown
                </p>
                {subcats.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No subcategory activity</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {subcats.slice(0, 6).map((sub) => (
                      <Link
                        key={sub._id}
                        to={`/entries?categoryId=${cat._id}&subcategoryId=${sub._id}`}
                        title={`Filter entries by ${sub.name}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-medium text-slate-700 hover:text-indigo-700 transition-colors"
                      >
                        <span>{sub.name}</span>
                        <span className="font-bold text-slate-900">({sub.count})</span>
                      </Link>
                    ))}
                    {subcats.length > 6 && (
                      <span className="text-xs text-slate-400 self-center">
                        +{subcats.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* View Details Link */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <Link
                to={`/entries?categoryId=${cat._id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View {cat.name} entries</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
