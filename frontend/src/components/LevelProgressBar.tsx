import React from 'react';
import { UserLevelProgress, LEVEL_COLORS } from '../types/levels';
import LevelBadge from './LevelBadge';

interface LevelProgressBarProps {
  levelProgress: UserLevelProgress;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  levelProgress,
  showDetails = true,
  size = 'medium',
  className = ''
}) => {
  const { level, title, total_xp, xp_to_next_level, progress_percentage } = levelProgress;
  const colors = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS[1];
  
  const isMaxLevel = level === 6;

  const sizeConfig = {
    small: {
      height: 'h-2',
      text: 'text-xs',
      spacing: 'space-y-1'
    },
    medium: {
      height: 'h-3',
      text: 'text-sm',
      spacing: 'space-y-2'
    },
    large: {
      height: 'h-4',
      text: 'text-base',
      spacing: 'space-y-3'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`${config.spacing} ${className}`}>
      {/* Level Badge and XP Info */}
      <div className="flex items-center justify-between">
        <LevelBadge 
          level={level} 
          title={title} 
          size={size}
          showTitle={showDetails}
        />
        
        {showDetails && (
          <div className={`${config.text} text-muted-foreground font-medium`}>
            {total_xp.toLocaleString()} XP
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!isMaxLevel ? (
        <div className="space-y-1">
          <div className={`w-full ${colors.bg} rounded-full ${config.height} overflow-hidden`}>
            <div 
              className={`${config.height} ${colors.accent.replace('text-', 'bg-')} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(progress_percentage, 100)}%` }}
            />
          </div>
          
          {showDetails && (
            <div className="flex justify-between items-center">
              <span className={`${config.text} text-muted-foreground`}>
                {progress_percentage.toFixed(1)}% to next level
              </span>
              <span className={`${config.text} text-muted-foreground`}>
                {xp_to_next_level.toLocaleString()} XP needed
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <div className={`w-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full ${config.height}`} />
          {showDetails && (
            <div className="text-center">
              <span className={`${config.text} text-yellow-600 dark:text-yellow-400 font-medium`}>
                🎉 Maximum Level Reached! 🎉
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LevelProgressBar;