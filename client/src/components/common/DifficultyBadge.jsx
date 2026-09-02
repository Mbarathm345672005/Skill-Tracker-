import React from 'react';

const difficultyConfig = {
  Easy: {
    color: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  Medium: {
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  Hard: {
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
};

export const DifficultyBadge = ({ difficulty, className = '' }) => {
  if (!difficulty) return null;
  const config = difficultyConfig[difficulty] || difficultyConfig.Easy;

  return (
    <span
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.borderColor,
      }}
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border tabular-nums ${className}`}
    >
      {difficulty}
    </span>
  );
};
