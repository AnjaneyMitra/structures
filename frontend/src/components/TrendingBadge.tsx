import React from 'react';
import { FireIcon } from '@heroicons/react/24/solid';

interface TrendingBadgeProps {
  trending?: boolean;
  className?: string;
}

export const TrendingBadge: React.FC<TrendingBadgeProps> = ({ 
  trending = false, 
  className = '' 
}) => {
  if (!trending) return null;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium shadow-lg ${className}`}>
      <FireIcon className="w-3 h-3" />
      <span>Trending</span>
    </div>
  );
};

export default TrendingBadge;
