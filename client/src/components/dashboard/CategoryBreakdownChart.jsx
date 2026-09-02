import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '../common/Card';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatMinutesToHours } from '../../utils/formatters';

const DEFAULT_CATEGORY_COLORS = {
  Project: '#3B82F6',
  Learning: '#22C55E',
  'Problem Solving': '#F97316',
};

export const CategoryBreakdownChart = ({ categoriesSummary = [], totalEntries = 0, totalMinutes = 0 }) => {
  const [metricMode, setMetricMode] = useState('count'); // 'count' | 'time'

  const chartData = categoriesSummary.map((cat) => {
    const value = metricMode === 'count' ? cat.count : cat.totalTimeSpentMinutes;
    const total = metricMode === 'count' ? totalEntries : totalMinutes;
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
    return {
      name: cat.name,
      value: value,
      rawMinutes: cat.totalTimeSpentMinutes,
      count: cat.count,
      percent: percent,
      color: cat.color || DEFAULT_CATEGORY_COLORS[cat.name] || '#6366F1',
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold">{data.name}</p>
          <p className="text-slate-300">
            {metricMode === 'count'
              ? `${data.count} entries (${data.percent}%)`
              : `${formatMinutesToHours(data.rawMinutes)} (${data.percent}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Category Distribution"
      subtitle="Breakdown of logged activities"
      icon={PieChartIcon}
      action={
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMetricMode('count')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              metricMode === 'count'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            By Count
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('time')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              metricMode === 'time'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            By Time
          </button>
        </div>
      }
    >
      {categoriesSummary.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No activity in this period.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart with Center Text */}
          <div className="md:col-span-7 h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart aria-label="Category breakdown chart">
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Middle of Donut Hole Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
              <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {metricMode === 'count' ? totalEntries : formatMinutesToHours(totalMinutes)}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                {metricMode === 'count' ? 'Activities' : 'Total Time'}
              </span>
            </div>
          </div>

          {/* WCAG Accessible Text Fallback / Legend Summary */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="sr-only">Category Breakdown Accessible Summary</h4>
            <div className="space-y-2.5">
              {chartData.map((item) => (
                <div
                  key={item.name}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="font-bold text-slate-900">
                      {metricMode === 'count'
                        ? `${item.count} entries`
                        : formatMinutesToHours(item.rawMinutes)}
                    </span>
                    <span className="text-slate-500 ml-1.5 font-medium">({item.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
