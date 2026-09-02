import React, { useState } from 'react';
import {
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { PersonAvatar } from '../common/PersonAvatar';
import { StatusBadge } from '../common/StatusBadge';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatDateDisplay } from '../../utils/dateUtils';
import { formatMinutesToHours } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export const EntryTable = ({
  entries = [],
  loading = false,
  onEdit,
  onDelete,
  onLogFirst,
}) => {
  const [deleteConfirmEntry, setDeleteConfirmEntry] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteConfirmEntry) return;
    try {
      setDeleting(true);
      await onDelete(deleteConfirmEntry._id);
      setDeleteConfirmEntry(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading activities...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-soft-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">No activities logged yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Start recording your daily learning, projects worked on, or DSA problems solved.
        </p>
        {onLogFirst && (
          <Button variant="primary" onClick={onLogFirst}>
            Log Your First Activity
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Activity Entries">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="py-3.5 px-6">Activity / Title</th>
                <th scope="col" className="py-3.5 px-4">Person</th>
                <th scope="col" className="py-3.5 px-4">Category & Subcategory</th>
                <th scope="col" className="py-3.5 px-4">Status</th>
                <th scope="col" className="py-3.5 px-4">Time Spent</th>
                <th scope="col" className="py-3.5 px-4">Date</th>
                <th scope="col" className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {entries.map((entry) => {
                const category = entry.categoryId || {};
                const subcategory = entry.subcategoryId;
                const person = entry.personId || {};

                return (
                  <tr
                    key={entry._id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Title & Notes & Problem Link */}
                    <td className="py-4 px-6 align-top">
                      <div className="flex items-start gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">
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
                                title="Open problem link"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100"
                              >
                                Problem <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {entry.notes && (
                            <p className="text-xs text-slate-500 line-clamp-2 max-w-md">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Person */}
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <PersonAvatar name={person.name} size="sm" />
                        <span className="font-semibold text-slate-700">{person.name || '—'}</span>
                      </div>
                    </td>

                    {/* Category & Subcategory */}
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          style={{
                            backgroundColor: `${category.color || '#4F46E5'}15`,
                            color: category.color || '#4F46E5',
                            borderColor: `${category.color || '#4F46E5'}30`,
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                        >
                          <CategoryIcon iconName={category.icon} colorHex={category.color} className="w-3.5 h-3.5" />
                          {category.name || 'Uncategorized'}
                        </span>
                        {subcategory && (
                          <p className="text-xs text-slate-500 pl-1">
                            ↳ {subcategory.name}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      <StatusBadge status={entry.status} />
                    </td>

                    {/* Time Spent */}
                    <td className="py-4 px-4 align-top whitespace-nowrap tabular-nums text-slate-600 font-medium">
                      {formatMinutesToHours(entry.timeSpentMinutes)}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 align-top whitespace-nowrap text-slate-500 text-xs">
                      {formatDateDisplay(entry.date)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 align-top whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          aria-label={`Edit ${entry.title}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmEntry(entry)}
                          aria-label={`Delete ${entry.title}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {entries.map((entry) => {
          const category = entry.categoryId || {};
          const subcategory = entry.subcategoryId;
          const person = entry.personId || {};

          return (
            <div
              key={entry._id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-base">{entry.title}</h4>
                    {entry.difficulty && <DifficultyBadge difficulty={entry.difficulty} />}
                  </div>
                  {entry.problemLink && (
                    <a
                      href={entry.problemLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100"
                    >
                      Problem Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(entry)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmEntry(entry)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {entry.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {entry.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <PersonAvatar name={person.name} size="sm" />
                  <span className="font-semibold text-slate-700">{person.name}</span>
                </div>
                <StatusBadge status={entry.status} />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span
                  style={{
                    backgroundColor: `${category.color || '#4F46E5'}15`,
                    color: category.color || '#4F46E5',
                  }}
                  className="px-2 py-0.5 rounded-md font-semibold"
                >
                  {category.name} {subcategory ? `· ${subcategory.name}` : ''}
                </span>
                <div className="flex items-center gap-3">
                  <span>⏱ {formatMinutesToHours(entry.timeSpentMinutes)}</span>
                  <span>📅 {formatDateDisplay(entry.date)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmEntry}
        onClose={() => setDeleteConfirmEntry(null)}
        title="Delete Activity Entry"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete the activity{' '}
            <strong className="text-slate-900">"{deleteConfirmEntry?.title}"</strong>? This
            action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmEntry(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
