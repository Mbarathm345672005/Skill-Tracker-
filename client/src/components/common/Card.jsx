import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon: Icon,
  padding = 'p-5 sm:p-6',
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm ${
        hover ? 'transition-all duration-200 hover:shadow-soft-md hover:border-slate-300' : ''
      } ${className}`}
      {...props}
    >
      {(title || action || Icon) && (
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 flex items-center justify-between border-b border-slate-100 mb-1">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  );
};
