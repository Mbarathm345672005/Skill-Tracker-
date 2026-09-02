import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Calendar,
  Clock,
  Link as LinkIcon,
  FileText,
  UserPlus,
  FolderPlus,
  Check,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PersonAvatar } from '../common/PersonAvatar';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatDateInput } from '../../utils/dateUtils';
import { entryApi } from '../../api/entryApi';
import { personApi } from '../../api/personApi';
import { subcategoryApi } from '../../api/subcategoryApi';

export const EntryModal = ({
  isOpen,
  onClose,
  entryToEdit = null,
  categories = [],
  people = [],
  onSaved,
  onPersonCreated,
  onSubcategoryCreated,
}) => {
  const [personId, setPersonId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [status, setStatus] = useState('Done');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [problemLink, setProblemLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick inline add state
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [addingPerson, setAddingPerson] = useState(false);

  const [showAddSubcat, setShowAddSubcat] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [addingSubcat, setAddingSubcat] = useState(false);

  // Subcategories for current category
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  // Populate when editing or opening
  useEffect(() => {
    if (entryToEdit) {
      setPersonId(entryToEdit.personId?._id || entryToEdit.personId || '');
      setCategoryId(entryToEdit.categoryId?._id || entryToEdit.categoryId || '');
      setSubcategoryId(entryToEdit.subcategoryId?._id || entryToEdit.subcategoryId || '');
      setTitle(entryToEdit.title || '');
      setDate(formatDateInput(entryToEdit.date));
      setStatus(entryToEdit.status || 'Done');
      
      const totalMins = entryToEdit.timeSpentMinutes || 0;
      setHours(Math.floor(totalMins / 60) || '');
      setMinutes(totalMins % 60 || '');
      
      setDifficulty(entryToEdit.difficulty || '');
      setProblemLink(entryToEdit.problemLink || '');
      setNotes(entryToEdit.notes || '');
    } else {
      // Default to first person or preserved person
      if (people.length > 0 && !personId) {
        setPersonId(people[0]._id);
      }
      // Default to first category if available
      if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0]._id);
      }
      setSubcategoryId('');
      setTitle('');
      setDate(formatDateInput(new Date()));
      setStatus('Done');
      setHours('');
      setMinutes('');
      setDifficulty('');
      setProblemLink('');
      setNotes('');
    }
  }, [entryToEdit, isOpen, people, categories]);

  // Update subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      subcategoryApi
        .getAll(categoryId)
        .then((res) => {
          setFilteredSubcategories(res.data || []);
        })
        .catch(() => setFilteredSubcategories([]));
    } else {
      setFilteredSubcategories([]);
    }
  }, [categoryId]);

  // Detect if selected category is "Problem Solving"
  const selectedCategory = categories.find((c) => c._id === categoryId);
  const isProblemSolving =
    selectedCategory?.name?.toLowerCase().includes('problem') ||
    selectedCategory?.name?.toLowerCase().includes('leetcode') ||
    selectedCategory?.name?.toLowerCase().includes('dsa');

  const handleCreatePersonInline = async (e) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    try {
      setAddingPerson(true);
      const res = await personApi.create({ name: newPersonName.trim() });
      toast.success(`Added ${res.data.name}!`);
      if (onPersonCreated) onPersonCreated(res.data);
      setPersonId(res.data._id);
      setNewPersonName('');
      setShowAddPerson(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add person');
    } finally {
      setAddingPerson(false);
    }
  };

  const handleCreateSubcatInline = async (e) => {
    e.preventDefault();
    if (!newSubcatName.trim() || !categoryId) return;
    try {
      setAddingSubcat(true);
      const res = await subcategoryApi.create({
        name: newSubcatName.trim(),
        categoryId,
      });
      toast.success(`Added subcategory "${res.data.name}"!`);
      setFilteredSubcategories((prev) => [...prev, res.data]);
      setSubcategoryId(res.data._id);
      if (onSubcategoryCreated) onSubcategoryCreated(res.data);
      setNewSubcatName('');
      setShowAddSubcat(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add subcategory');
    } finally {
      setAddingSubcat(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!personId) {
      toast.error('Please select or add a person first');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const totalTimeSpent =
      (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);

    const payload = {
      personId,
      categoryId,
      subcategoryId: subcategoryId || null,
      title: title.trim(),
      date: new Date(date).toISOString(),
      status,
      timeSpentMinutes: totalTimeSpent,
      notes: notes.trim(),
      difficulty: isProblemSolving && difficulty ? difficulty : null,
      problemLink: isProblemSolving && problemLink.trim() ? problemLink.trim() : null,
    };

    try {
      setSubmitting(true);
      let res;
      if (entryToEdit) {
        res = await entryApi.update(entryToEdit._id, payload);
        toast.success('Activity updated successfully!');
      } else {
        res = await entryApi.create(payload);
        toast.success('Activity logged successfully! 🎉');
      }

      if (onSaved) onSaved(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'Edit Activity Entry' : 'Log New Activity'}
      subtitle={entryToEdit ? 'Update details for this entry' : 'Record what you worked on, learned, or solved'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: PICK PERSON FIRST */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>Step 1: Who is logging this?</span>
              <span className="text-red-500">*</span>
            </label>
            {!showAddPerson && (
              <button
                type="button"
                onClick={() => setShowAddPerson(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Person
              </button>
            )}
          </div>

          {showAddPerson && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-2 mb-2 animate-in fade-in duration-150">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Enter person name (e.g. Alex)"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleCreatePersonInline}
                loading={addingPerson}
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddPerson(false);
                  setNewPersonName('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          {people.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
              <p className="text-sm text-slate-600 mb-2">No people found yet.</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={UserPlus}
                onClick={() => setShowAddPerson(true)}
              >
                Add Your First Person
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {people.map((p) => {
                const isSelected = personId === p._id;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setPersonId(p._id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <PersonAvatar name={p.name} size="sm" />
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 2: PICK CATEGORY */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>Step 2: Category</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {categories.map((cat) => {
              const isSelected = categoryId === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat._id);
                    setSubcategoryId('');
                  }}
                  style={{
                    borderColor: isSelected ? cat.color : undefined,
                    backgroundColor: isSelected ? `${cat.color}15` : undefined,
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'ring-2 shadow-sm font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="p-2 rounded-xl mb-1.5 transition-transform"
                    style={{
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon iconName={cat.icon} colorHex={cat.color} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: SUBCATEGORY */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="subcategory-select" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 3: Subcategory (Optional)
            </label>
            {!showAddSubcat && categoryId && (
              <button
                type="button"
                onClick={() => setShowAddSubcat(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subcategory
              </button>
            )}
          </div>

          {showAddSubcat && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-2 mb-2 animate-in fade-in duration-150">
              <input
                type="text"
                value={newSubcatName}
                onChange={(e) => setNewSubcatName(e.target.value)}
                placeholder="e.g. System Design, YouTube, React"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleCreateSubcatInline}
                loading={addingSubcat}
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddSubcat(false);
                  setNewSubcatName('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          <select
            id="subcategory-select"
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Select Subcategory --</option>
            {filteredSubcategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* STEP 4: FORM FIELDS */}
        <div className="border-t border-slate-200 pt-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Step 4: Entry Details
          </h4>

          {/* Title */}
          <div>
            <label htmlFor="entry-title" className="block text-xs font-semibold text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="entry-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solved Two Sum, Read Chapter 3 of Clean Code"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date and Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="entry-date" className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  id="entry-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {['To Do', 'In Progress', 'Done'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      status === st
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Spent Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Time Spent (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-medium text-slate-400 pointer-events-none">
                  hours
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-medium text-slate-400 pointer-events-none">
                  mins
                </span>
              </div>
            </div>
          </div>

          {/* Problem Solving Extra Fields (Difficulty & Problem Link) */}
          {isProblemSolving && (
            <div className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
                  Problem Solving Specifics
                </span>
              </div>

              {/* Difficulty Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Difficulty
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Easy', color: '#22C55E', activeClass: 'bg-emerald-500 text-white border-emerald-600' },
                    { label: 'Medium', color: '#EAB308', activeClass: 'bg-amber-500 text-white border-amber-600' },
                    { label: 'Hard', color: '#EF4444', activeClass: 'bg-rose-500 text-white border-rose-600' },
                  ].map((diff) => (
                    <button
                      key={diff.label}
                      type="button"
                      onClick={() => setDifficulty(difficulty === diff.label ? '' : diff.label)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        difficulty === diff.label
                          ? diff.activeClass
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Link URL */}
              <div>
                <label htmlFor="problem-link" className="block text-xs font-semibold text-slate-700 mb-1">
                  Problem Link (URL)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="problem-link"
                    type="url"
                    value={problemLink}
                    onChange={(e) => setProblemLink(e.target.value)}
                    placeholder="https://leetcode.com/problems/two-sum/"
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="entry-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Takeaways (Optional)
            </label>
            <textarea
              id="entry-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn? Any blockers or algorithms used?"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {entryToEdit ? 'Save Changes' : 'Log Activity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
