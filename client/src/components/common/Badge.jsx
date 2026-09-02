import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  colorHex,
  className = '',
}) => {
  const styles = colorHex
    ? {
        backgroundColor: `${colorHex}15`,
        color: colorHex,
        borderColor: `${colorHex}30`,
      }
    : {};

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      style={styles}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        !colorHex ? variantClasses[variant] || variantClasses.default : ''
      } ${className}`}
    >
      {children}
    </span>
  );
};
