import React from 'react';
import { Tooltip } from '@mui/material';
import { LEVEL_COLORS, LEVEL_ICONS } from '../types/levels';

interface LevelBadgeProps {
  level: number;
  title: string;
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
  showIcon?: boolean;
  className?: string;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  title,
  size = 'medium',
  showTitle = true,
  showIcon = true,
  className = ''
}) => {
  const colors = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS[1];
  const icon = LEVEL_ICONS[level as keyof typeof LEVEL_ICONS] || LEVEL_ICONS[1];

  const sizeClasses = {
    small: {
      container: 'px-2 py-1 text-xs',
      icon: 'text-sm',
      text: 'text-xs'
    },
    medium: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'text-base',
      text: 'text-sm'
    },
    large: {
      container: 'px-4 py-2 text-base',
      icon: 'text-lg',
      text: 'text-base'
    }
  };

  const sizeConfig = sizeClasses[size];

  const badgeContent = (
    <div className={`
      inline-flex items-center space-x-1.5 rounded-full font-medium
      ${colors.bg} ${colors.text} ${sizeConfig.container} ${className}
      transition-all duration-200 hover:scale-105
    `}>
      {showIcon && (
        <span className={sizeConfig.icon}>
          {icon}
        </span>
      )}
      <span className={`font-semibold ${sizeConfig.text}`}>
        {level}
      </span>
      {showTitle && (
        <span className={sizeConfig.text}>
          {title}
        </span>
      )}
    </div>
  );

  return (
    <Tooltip 
      title={`Level ${level}: ${title}`} 
      arrow 
      placement="top"
    >
      {badgeContent}
    </Tooltip>
  );
};

export default LevelBadge;