import React from 'react';
import * as Icons from 'lucide-react';

export const CategoryIcon = ({
  iconName = 'Folder',
  className = 'w-4 h-4',
  colorHex,
  style = {},
}) => {
  const IconComponent = Icons[iconName] || Icons.Folder;

  return (
    <IconComponent
      className={className}
      style={{
        color: colorHex || undefined,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};
