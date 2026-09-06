import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { EntryTable } from '../components/entries/EntryTable';
import { Button } from '../components/common/Button';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { getPeriodDateRange } from '../utils/dateUtils';
import { entryApi } from '../api/entryApi';
import { categoryApi } from '../api/categoryApi';
import { subcategoryApi } from '../api/subcategoryApi';
import { personApi } from '../api/personApi';

export const EntriesPage = ({ onOpenNewEntry, onEditEntry }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all_time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [personId, setPersonId] = useState(searchParams.get('personId') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [subcategoryId, setSubcategoryId] = useState(searchParams.get('subcategoryId') || '');
  const [status, setStatus] = useState('');

  // Data
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [people, setPeople] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync URL query params if present
  useEffect(() => {
    const catQuery = searchParams.get('categoryId');
    if (catQuery) setCategoryId(catQuery);
    const subQuery = searchParams.get('subcategoryId');
    if (subQuery) setSubcategoryId(subQuery);
    const pQuery = searchParams.get('personId');
    if (pQuery) setPersonId(pQuery);
  }, [searchParams]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, peopleRes] = await Promise.all([
          categoryApi.getAll(),
          personApi.getAll(),
        ]);
        setCategories(catRes.data || []);
        setPeople(peopleRes.data || []);
      } catch (e) {
        console.error('Failed to load filter metadata', e);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch subcategories whenever categoryId changes
  useEffect(() => {
    if (!categoryId) {
      setAvailableSubcategories([]);
      setSubcategoryId('');
      return;
    }

    let isMounted = true;
    setLoadingSubcategories(true);
    subcategoryApi
      .getAll(categoryId)
      .then((res) => {
        if (isMounted) {
          setAvailableSubcategories(res.data || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load subcategories for category', err);
        if (isMounted) setAvailableSubcategories([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSubcategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const dateRange =
        selectedPeriod === 'custom'
          ? { startDate: customStartDate, endDate: customEndDate }
          : getPeriodDateRange(selectedPeriod);

      const params = {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        personId: personId || undefined,
        categoryIds: categoryId || undefined,
        subcategoryId: subcategoryId || undefined,
        status: status || undefined,
        search: search.trim() || undefined,
      };

      const res = await entryApi.getAll(params);
      setEntries(res.data || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, customStartDate, customEndDate, personId, categoryId, subcategoryId, status, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEntries();
    }, 200);
    return () => clearTimeout(debounce);
  }, [fetchEntries]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedPeriod('all_time');
    setCustomStartDate('');
    setCustomEndDate('');
    setPersonId('');
    setCategoryId('');
    setSubcategoryId('');
    setStatus('');
    setSearchParams({});
  };

  const handleDelete = async (id) => {
    try {
      await entryApi.delete(id);
      toast.success('Entry deleted');
      fetchEntries();
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  const hasActiveFilters =
    Boolean(search || selectedPeriod !== 'all_time' || personId || categoryId || subcategoryId || status);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Activity Log & History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, edit, and explore all logged learning, projects, and solved challenges.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={onOpenNewEntry}
          className="shadow-md shadow-indigo-500/20"
        >
          Log Activity
        </Button>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-soft-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, notes..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Person Dropdown */}
          <div className="md:col-span-2">
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All People</option>
              {people.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-2">
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId('');
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown (Disabled until category is selected) */}
          <div className="md:col-span-2">
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!categoryId || loadingSubcategories}
              title={!categoryId ? 'Select a category first to enable subcategories' : undefined}
              className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                !categoryId
                  ? 'bg-slate-100/80 border border-slate-200/80 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
              }`}
            >
              <option value="">
                {!categoryId
                  ? 'Subcategory (Disabled)'
                  : loadingSubcategories
                  ? 'Loading subcategories...'
                  : 'All Subcategories'}
              </option>
              {availableSubcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Done">Done</option>
              <option value="In Progress">In Progress</option>
              <option value="To Do">To Do</option>
            </select>
          </div>
        </div>

        {/* Period Selector & Reset Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onChangeCustomDates={(start, end) => {
              setCustomStartDate(start);
              setCustomEndDate(end);
            }}
          />

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              Showing <strong className="text-slate-900">{entries.length}</strong> of {totalCount} entries
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={handleResetFilters}
                className="text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Entry Table */}
      <EntryTable
        entries={entries}
        loading={loading}
        onEdit={onEditEntry}
        onDelete={handleDelete}
        onLogFirst={onOpenNewEntry}
      />
    </div>
  );
};
