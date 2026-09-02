import React from 'react';
import { CheckCircle2, Clock, CircleDot } from 'lucide-react';

const statusConfig = {
  'To Do': {
    color: '#64748B',
    bgColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    icon: CircleDot,
  },
  'In Progress': {
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    icon: Clock,
  },
  'Done': {
    color: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    icon: CheckCircle2,
  },
};

export const StatusBadge = ({ status = 'Done', className = '' }) => {
  const config = statusConfig[status] || statusConfig['Done'];
  const Icon = config.icon;

  return (
    <span
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.borderColor,
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {status}
    </span>
  );
};
