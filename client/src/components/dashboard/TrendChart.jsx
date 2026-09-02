import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../common/Card';
import { Activity } from 'lucide-react';
import { formatMinutesToHours } from '../../utils/formatters';

export const TrendChart = ({ timeline = [] }) => {
  const formattedData = timeline.map((item) => ({
    date: item.date,
    displayDate: item.date?.slice(5) || '', // MM-DD
    count: item.count,
    hours: Number((item.totalTimeSpentMinutes / 60).toFixed(1)),
    minutes: item.totalTimeSpentMinutes,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-200">{data.date}</p>
          <p className="text-indigo-300 font-semibold">{data.count} activities logged</p>
          <p className="text-emerald-300">{formatMinutesToHours(data.minutes)} invested</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Activity Trend"
      subtitle="Consistency & volume over the selected period"
      icon={Activity}
    >
      {timeline.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No trend data recorded in this timeframe.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              aria-label="Activity trend over time"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="#4F46E5"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
