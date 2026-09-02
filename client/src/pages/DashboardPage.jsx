import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Layers,
  Flame,
  Plus,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { SummaryStrip } from '../components/dashboard/SummaryStrip';
import { CategoryBreakdownChart } from '../components/dashboard/CategoryBreakdownChart';
import { TrendChart } from '../components/dashboard/TrendChart';
import { LeaderboardCard } from '../components/dashboard/LeaderboardCard';
import { CategorySummaryCards } from '../components/dashboard/CategorySummaryCards';
import { EntryTable } from '../components/entries/EntryTable';
import { Button } from '../components/common/Button';
import { PersonAvatar } from '../components/common/PersonAvatar';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { getPeriodDateRange } from '../utils/dateUtils';
import { entryApi } from '../api/entryApi';
import { categoryApi } from '../api/categoryApi';
import { personApi } from '../api/personApi';

export const DashboardPage = ({ onOpenNewEntry, onEditEntry }) => {
  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState(''); // '' = All People
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // [] = All Categories

  // Data
  const [categories, setCategories] = useState([]);
  const [people, setPeople] = useState([]);
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial categories & people
  const loadInitialData = async () => {
    try {
      const [catRes, peopleRes] = await Promise.all([
        categoryApi.getAll(),
        personApi.getAll(),
      ]);
      setCategories(catRes.data || []);
      setPeople(peopleRes.data || []);
      setSelectedCategoryIds((catRes.data || []).map((c) => c._id));
    } catch (err) {
      console.error('Failed to load initial categories/people', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch metrics whenever filters change
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const dateRange =
        selectedPeriod === 'custom'
          ? { startDate: customStartDate, endDate: customEndDate }
          : getPeriodDateRange(selectedPeriod);

      const params = {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        personId: selectedPersonId || undefined,
        categoryIds:
          selectedCategoryIds.length > 0 && selectedCategoryIds.length !== categories.length
            ? selectedCategoryIds.join(',')
            : undefined,
      };

      const [sumRes, leadRes, entRes] = await Promise.all([
        entryApi.getSummary(params),
        entryApi.getLeaderboard(params),
        entryApi.getAll({ ...params, limit: 5 }),
      ]);

      setSummary(sumRes.data || {});
      setLeaderboard(leadRes.data || []);
      setRecentEntries(entRes.data || []);

      // If a specific person is selected, fetch their streak
      if (selectedPersonId) {
        try {
          const streakRes = await entryApi.getStreak(selectedPersonId);
          setStreakData(streakRes.data);
        } catch (e) {
          setStreakData(null);
        }
      } else {
        setStreakData(null);
      }
    } catch (error) {
      toast.error('Failed to update dashboard data');
    } finally {
      setLoading(false);
    }
  }, [
    selectedPeriod,
    customStartDate,
    customEndDate,
    selectedPersonId,
    selectedCategoryIds,
    categories.length,
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Toggle category multi-select chip
  const handleToggleCategory = (catId) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(catId)) {
        // don't allow unselecting all, keep at least one or toggle
        if (prev.length === 1) return categories.map((c) => c._id);
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleSelectAllCategories = () => {
    setSelectedCategoryIds(categories.map((c) => c._id));
  };

  const selectedPersonObj = people.find((p) => p._id === selectedPersonId);

  const handleDeleteEntry = async (id) => {
    try {
      await entryApi.delete(id);
      toast.success('Activity deleted');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete activity');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Skill & Activity Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track multi-person learning, project milestones, and problem-solving streaks.
            </p>
          </div>

          {/* Period Selector */}
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
        </div>

        {/* Person & Category Chips Filter Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm">
          {/* Person Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Filter by Person
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedPersonId('')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  selectedPersonId === ''
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All People ({people.length})
              </button>
              {people.map((p) => {
                const isSelected = selectedPersonId === p._id;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setSelectedPersonId(p._id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <PersonAvatar name={p.name} size="sm" />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Multi-select Chips */}
          <div className="space-y-1.5 lg:border-l lg:border-slate-200 lg:pl-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Categories
              </label>
              {selectedCategoryIds.length !== categories.length && (
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  Select All
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat._id);
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => handleToggleCategory(cat._id)}
                    style={{
                      backgroundColor: isSelected ? `${cat.color}20` : undefined,
                      borderColor: isSelected ? cat.color : undefined,
                      color: isSelected ? cat.color : undefined,
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'shadow-soft-sm font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <CategoryIcon iconName={cat.icon} colorHex={isSelected ? cat.color : undefined} className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Summary Strip */}
      <SummaryStrip
        summary={summary}
        selectedPerson={selectedPersonObj}
        streakData={streakData}
        loading={loading}
      />

      {/* 2. Charts Row (Category Breakdown & Trend Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <CategoryBreakdownChart
            categoriesSummary={summary?.categories || []}
            totalEntries={summary?.totalEntries || 0}
            totalMinutes={summary?.totalTimeSpentMinutes || 0}
          />
        </div>
        <div className="lg:col-span-6">
          <TrendChart timeline={summary?.timeline || []} />
        </div>
      </div>

      {/* 3. Category Summary Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Per-Category Overview</h3>
          <span className="text-xs text-slate-500">Filtered for current period</span>
        </div>
        <CategorySummaryCards
          categories={categories}
          categoriesSummary={summary?.categories || []}
          subcategoriesSummary={summary?.subcategories || []}
        />
      </div>

      {/* 4. Leaderboard and Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <LeaderboardCard
            leaderboard={leaderboard}
            onSelectPerson={(pId) => setSelectedPersonId(pId)}
          />
        </div>
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Activities</h3>
            <Link
              to="/entries"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>View all entries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <EntryTable
            entries={recentEntries}
            loading={loading}
            onEdit={onEditEntry}
            onDelete={handleDeleteEntry}
            onLogFirst={onOpenNewEntry}
          />
        </div>
      </div>
    </div>
  );
};
