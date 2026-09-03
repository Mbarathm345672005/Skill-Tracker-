import React from 'react';
import {
  Folder,
  FolderGit2,
  BookOpen,
  Code2,
  Briefcase,
  GraduationCap,
  Puzzle,
  Flame,
  Target,
  Star,
  Sparkles,
  Layers,
  CheckCircle,
  Bookmark,
  Compass,
  Laptop,
  Brain,
  PenTool,
  Terminal,
} from 'lucide-react';

const iconMap = {
  Folder,
  FolderGit2,
  BookOpen,
  Code2,
  Briefcase,
  GraduationCap,
  Puzzle,
  Flame,
  Target,
  Star,
  Sparkles,
  Layers,
  CheckCircle,
  Bookmark,
  Compass,
  Laptop,
  Brain,
  PenTool,
  Terminal,
};

export const CategoryIcon = ({
  iconName = 'Folder',
  className = 'w-4 h-4',
  colorHex,
  style = {},
}) => {
  const IconComponent = iconMap[iconName] || Folder;

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
