import React, { useState, useEffect } from 'react';
import {
  Users,
  Layers,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Check,
  FolderGit2,
  BookOpen,
  Code2,
  Sparkles,
  Briefcase,
  GraduationCap,
  Puzzle,
  Flame,
  Star,
  Target,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { PersonAvatar } from '../components/common/PersonAvatar';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { personApi } from '../api/personApi';
import { categoryApi } from '../api/categoryApi';
import { subcategoryApi } from '../api/subcategoryApi';

const AVAILABLE_ICONS = [
  'FolderGit2',
  'BookOpen',
  'Code2',
  'Briefcase',
  'GraduationCap',
  'Puzzle',
  'Flame',
  'Target',
  'Star',
  'Sparkles',
  'Layers',
  'CheckCircle',
];

const PRESET_COLORS = [
  '#3B82F6', // Blue (Project)
  '#22C55E', // Green (Learning)
  '#F97316', // Orange (Problem Solving)
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EAB308', // Yellow
  '#EF4444', // Red
  '#10B981', // Emerald
];

export const ManagePage = ({ onDataChanged }) => {
  const [activeTab, setActiveTab] = useState('people'); // 'people' | 'categories' | 'subcategories'

  const [people, setPeople] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Person Modal state
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [personName, setPersonName] = useState('');
  const [personSubmitting, setPersonSubmitting] = useState(false);

  // Category Modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');
  const [categoryIcon, setCategoryIcon] = useState('FolderGit2');
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Subcategory Modal state
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState('');
  const [subcategorySubmitting, setSubcategorySubmitting] = useState(false);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState(null); // { type: 'person'|'category'|'subcategory', item: obj }
  const [deleting, setDeleting] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [peopleRes, catRes, subRes] = await Promise.all([
        personApi.getAll(),
        categoryApi.getAll(),
        subcategoryApi.getAll(),
      ]);
      setPeople(peopleRes.data || []);
      setCategories(catRes.data || []);
      setSubcategories(subRes.data || []);
    } catch (err) {
      toast.error('Failed to load management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Handlers for Person
  const openAddPerson = () => {
    setEditingPerson(null);
    setPersonName('');
    setPersonModalOpen(true);
  };

  const openEditPerson = (p) => {
    setEditingPerson(p);
    setPersonName(p.name);
    setPersonModalOpen(true);
  };

  const handleSavePerson = async (e) => {
    e.preventDefault();
    if (!personName.trim()) return;
    try {
      setPersonSubmitting(true);
      if (editingPerson) {
        await personApi.update(editingPerson._id, { name: personName.trim() });
        toast.success('Person updated successfully!');
      } else {
        await personApi.create({ name: personName.trim() });
        toast.success('Person added successfully!');
      }
      setPersonModalOpen(false);
      fetchAll();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setPersonSubmitting(false);
    }
  };

  // Handlers for Category
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryColor('#3B82F6');
    setCategoryIcon('FolderGit2');
    setCategoryModalOpen(true);
  };

  const openEditCategory = (c) => {
    setEditingCategory(c);
    setCategoryName(c.name);
    setCategoryColor(c.color || '#3B82F6');
    setCategoryIcon(c.icon || 'FolderGit2');
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      setCategorySubmitting(true);
      if (editingCategory) {
        await categoryApi.update(editingCategory._id, {
          name: categoryName.trim(),
          color: categoryColor,
          icon: categoryIcon,
        });
        toast.success('Category updated successfully!');
      } else {
        await categoryApi.create({
          name: categoryName.trim(),
          color: categoryColor,
          icon: categoryIcon,
        });
        toast.success('Category created successfully!');
      }
      setCategoryModalOpen(false);
      fetchAll();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Handlers for Subcategory
  const openAddSubcategory = (preselectedCatId = '') => {
    setEditingSubcategory(null);
    setSubcategoryName('');
    setSubcategoryCategoryId(preselectedCatId || categories[0]?._id || '');
    setSubcategoryModalOpen(true);
  };

  const openEditSubcategory = (s) => {
    setEditingSubcategory(s);
    setSubcategoryName(s.name);
    setSubcategoryCategoryId(s.categoryId?._id || s.categoryId || '');
    setSubcategoryModalOpen(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!subcategoryName.trim() || !subcategoryCategoryId) return;
    try {
      setSubcategorySubmitting(true);
      if (editingSubcategory) {
        await subcategoryApi.update(editingSubcategory._id, {
          name: subcategoryName.trim(),
          categoryId: subcategoryCategoryId,
        });
        toast.success('Subcategory updated successfully!');
      } else {
        await subcategoryApi.create({
          name: subcategoryName.trim(),
          categoryId: subcategoryCategoryId,
        });
        toast.success('Subcategory added successfully!');
      }
      setSubcategoryModalOpen(false);
      fetchAll();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubcategorySubmitting(false);
    }
  };

  // Delete handler
  const executeDelete = async () => {
    if (!deleteDialog) return;
    try {
      setDeleting(true);
      const { type, item } = deleteDialog;
      if (type === 'person') {
        await personApi.delete(item._id);
        toast.success(`Deleted ${item.name}`);
      } else if (type === 'category') {
        await categoryApi.delete(item._id);
        toast.success(`Deleted ${item.name}`);
      } else if (type === 'subcategory') {
        await subcategoryApi.delete(item._id);
        toast.success(`Deleted ${item.name}`);
      }
      setDeleteDialog(null);
      fetchAll();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      toast.error(err.message || 'Could not delete item');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Manage Organization & Taxonomy
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure team members, primary categories, and their subcategory structures.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('people')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'people'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>People ({people.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subcategories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'subcategories'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Subcategories ({subcategories.length})</span>
        </button>
      </div>

      {/* TAB 1: PEOPLE */}
      {activeTab === 'people' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Team / Family Members</h3>
            <Button variant="primary" size="sm" icon={Plus} onClick={openAddPerson}>
              Add Person
            </Button>
          </div>

          {people.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-soft-sm">
              <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-600 font-semibold mb-3">No people configured yet</p>
              <Button variant="primary" size="sm" onClick={openAddPerson}>
                Add Your First Person
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {people.map((person) => (
                <div
                  key={person._id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center justify-between group hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <PersonAvatar name={person.name} size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{person.name}</h4>
                      <p className="text-xs text-slate-400">Member</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEditPerson(person)}
                      aria-label={`Edit ${person.name}`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteDialog({ type: 'person', item: person })
                      }
                      aria-label={`Delete ${person.name}`}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Activity Categories</h3>
            <Button variant="primary" size="sm" icon={Plus} onClick={openAddCategory}>
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                style={{ borderColor: `${cat.color}40` }}
                className="bg-white p-5 rounded-2xl border shadow-soft-sm flex items-center justify-between group hover:shadow-soft-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <CategoryIcon iconName={cat.icon} colorHex={cat.color} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{cat.name}</h4>
                      {cat.isDefault && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Color: <span className="font-mono">{cat.color}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => openEditCategory(cat)}
                    aria-label={`Edit category ${cat.name}`}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteDialog({ type: 'category', item: cat })
                    }
                    aria-label={`Delete category ${cat.name}`}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBCATEGORIES (GROUPED BY CATEGORY) */}
      {activeTab === 'subcategories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Subcategories by Category</h3>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => openAddSubcategory()}
            >
              Add Subcategory
            </Button>
          </div>

          <div className="space-y-6">
            {categories.map((cat) => {
              const subsInCat = subcategories.filter(
                (s) => (s.categoryId?._id || s.categoryId) === cat._id
              );

              return (
                <div
                  key={cat._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden"
                >
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="p-1.5 rounded-lg"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      >
                        <CategoryIcon iconName={cat.icon} colorHex={cat.color} className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{cat.name}</span>
                      <span className="text-xs text-slate-500 font-semibold">
                        ({subsInCat.length} subcategories)
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Plus}
                      onClick={() => openAddSubcategory(cat._id)}
                      className="text-xs text-indigo-600"
                    >
                      Add to {cat.name}
                    </Button>
                  </div>

                  <div className="p-4">
                    {subsInCat.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No subcategories under {cat.name} yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {subsInCat.map((sub) => (
                          <div
                            key={sub._id}
                            className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-between group hover:bg-white hover:border-slate-300 transition-all"
                          >
                            <span className="text-xs font-bold text-slate-800">
                              {sub.name}
                            </span>
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => openEditSubcategory(sub)}
                                aria-label={`Edit ${sub.name}`}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteDialog({ type: 'subcategory', item: sub })
                                }
                                aria-label={`Delete ${sub.name}`}
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PERSON MODAL */}
      <Modal
        isOpen={personModalOpen}
        onClose={() => setPersonModalOpen(false)}
        title={editingPerson ? 'Edit Person' : 'Add New Person'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSavePerson} className="space-y-4">
          <div>
            <label htmlFor="person-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name / Nickname <span className="text-red-500">*</span>
            </label>
            <input
              id="person-name-input"
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPersonModalOpen(false)}
              disabled={personSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={personSubmitting}>
              {editingPerson ? 'Save Changes' : 'Create Person'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CATEGORY MODAL */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label htmlFor="category-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              id="category-name-input"
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. System Design, Fitness"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCategoryColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform ${
                    categoryColor === color ? 'ring-2 ring-slate-900 scale-110 shadow-sm' : 'hover:scale-105'
                  }`}
                >
                  {categoryColor === color && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
              <input
                type="color"
                value={categoryColor}
                onChange={(e) => setCategoryColor(e.target.value)}
                className="w-7 h-7 p-0 border border-slate-200 rounded-lg cursor-pointer"
                title="Custom Hex Color"
              />
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setCategoryIcon(iconName)}
                  style={{
                    backgroundColor: categoryIcon === iconName ? `${categoryColor}20` : undefined,
                    color: categoryIcon === iconName ? categoryColor : undefined,
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                    categoryIcon === iconName
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <CategoryIcon iconName={iconName} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryModalOpen(false)}
              disabled={categorySubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={categorySubmitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* SUBCATEGORY MODAL */}
      <Modal
        isOpen={subcategoryModalOpen}
        onClose={() => setSubcategoryModalOpen(false)}
        title={editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveSubcategory} className="space-y-4">
          <div>
            <label htmlFor="parent-category-select" className="block text-xs font-semibold text-slate-700 mb-1">
              Parent Category <span className="text-red-500">*</span>
            </label>
            <select
              id="parent-category-select"
              required
              value={subcategoryCategoryId}
              onChange={(e) => setSubcategoryCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subcat-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Subcategory Name <span className="text-red-500">*</span>
            </label>
            <input
              id="subcat-name-input"
              type="text"
              required
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              placeholder="e.g. LeetCode, Course, Book"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubcategoryModalOpen(false)}
              disabled={subcategorySubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={subcategorySubmitting}>
              {editingSubcategory ? 'Save Changes' : 'Create Subcategory'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        title={`Delete ${deleteDialog?.type || 'Item'}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{' '}
            <strong className="text-slate-900">"{deleteDialog?.item?.name}"</strong>?
            {deleteDialog?.type === 'category' &&
              ' Deleting a category will also delete its associated subcategories (provided no entries are linked).'}
            {deleteDialog?.type === 'person' &&
              ' You cannot delete a person if they have logged entries.'}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={executeDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
