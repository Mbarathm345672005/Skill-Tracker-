import React from 'react';
import { getInitials, getAvatarColor } from '../../utils/formatters';

export const PersonAvatar = ({
  name = '',
  size = 'md',
  showName = false,
  subtitle,
  className = '',
  onClick,
  selected = false,
}) => {
  const color = getAvatarColor(name);
  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className={`inline-flex items-center gap-2.5 rounded-xl transition-all ${
        onClick
          ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 p-1 hover:bg-slate-100'
          : ''
      } ${selected ? 'ring-2 ring-indigo-600 bg-indigo-50/50' : ''} ${className}`}
    >
      <div
        className={`shrink-0 rounded-xl flex items-center justify-center font-semibold border shadow-soft-sm ${color.bg} ${color.text} ${color.border} ${sizeClasses[size]}`}
      >
        {initials}
      </div>
      {showName && (
        <div className="text-left">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{name || 'Unknown'}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}
    </Component>
  );
};
