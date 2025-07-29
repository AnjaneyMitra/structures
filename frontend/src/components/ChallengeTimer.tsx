import React, { useState, useEffect } from 'react';
import { ClockIcon, FireIcon } from '@heroicons/react/24/outline';

interface ChallengeTimerProps {
  timeLimit: number; // in minutes
  startTime: string; // ISO string
  onTimeUp?: () => void;
  className?: string;
}

const ChallengeTimer: React.FC<ChallengeTimerProps> = ({
  timeLimit,
  startTime,
  onTimeUp,
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Parse the start time - handle both UTC and local time formats
      let startDate: Date;
      
      // If the startTime doesn't end with 'Z' or have timezone info, assume it's UTC
      if (startTime && !startTime.includes('Z') && !startTime.includes('+') && !startTime.includes('-')) {
        // Assume UTC if no timezone info
        startDate = new Date(startTime + 'Z');
      } else {
        startDate = new Date(startTime);
      }
      
      const start = startDate.getTime();
      const now = new Date().getTime(); // User's local time
      const elapsed = Math.floor((now - start) / 1000); // seconds elapsed
      const totalSeconds = timeLimit * 60; // convert minutes to seconds
      const remaining = Math.max(0, totalSeconds - elapsed);
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Timer Debug:', {
          originalStartTime: startTime,
          parsedStartTime: startDate.toISOString(),
          userLocalTime: new Date().toISOString(),
          userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          elapsed: elapsed,
          totalSeconds,
          remaining,
          timeLimitMinutes: timeLimit
        });
      }
      
      setTimeRemaining(remaining);
      
      if (remaining === 0 && !isExpired) {
        setIsExpired(true);
        if (onTimeUp) {
          onTimeUp();
        }
      }
    };

    // Calculate initial time
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, startTime, onTimeUp, isExpired]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    const percentage = (timeRemaining / (timeLimit * 60)) * 100;
    
    if (isExpired) return 'text-red-600 dark:text-red-400';
    if (percentage <= 10) return 'text-red-500 dark:text-red-400';
    if (percentage <= 25) return 'text-orange-500 dark:text-orange-400';
    if (percentage <= 50) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  const getProgressPercentage = (): number => {
    const totalSeconds = timeLimit * 60;
    return Math.max(0, (timeRemaining / totalSeconds) * 100);
  };

  if (isExpired) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <FireIcon className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-red-600 dark:text-red-400">
          Time's Up!
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-card border border-border rounded-lg">
        <ClockIcon className={`h-4 w-4 ${getTimerColor()}`} />
        <div className="flex flex-col">
          <span className={`text-sm font-mono font-bold ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </span>
          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${
                getProgressPercentage() <= 10 ? 'bg-red-500' :
                getProgressPercentage() <= 25 ? 'bg-orange-500' :
                getProgressPercentage() <= 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs text-muted-foreground">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeTimer;