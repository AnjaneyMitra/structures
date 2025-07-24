import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CalendarDay {
  date: string;
  solved: boolean;
  is_today: boolean;
}

interface HorizontalStreakCalendarProps {
  days?: number;
}

export const HorizontalStreakCalendar: React.FC<HorizontalStreakCalendarProps> = ({ days = 100 }) => {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `https://structures-production.up.railway.app/api/streaks/calendar?days=${days}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setCalendarData(response.data.calendar_data);
      } catch (err) {
        console.error('Failed to fetch calendar data:', err);
        setError('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [days]);

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground text-sm p-4">
        {error}
      </div>
    );
  }

  // Create weeks array for GitHub-style layout
  const weeks: CalendarDay[][] = [];
  const startDate = new Date(calendarData[0]?.date);
  const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Add empty days at the beginning to align with the correct day of week
  const paddedData = [
    ...Array(startDayOfWeek).fill(null),
    ...calendarData
  ];

  // Group into weeks (7 days each)
  for (let i = 0; i < paddedData.length; i += 7) {
    weeks.push(paddedData.slice(i, i + 7));
  }

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthsShown = new Set<string>();

  return (
    <div className="bg-card/20 backdrop-blur-sm rounded-xl border border-border/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">Solve Calendar</h3>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-sm bg-muted/30"></div>
            <div className="w-2 h-2 rounded-sm bg-green-200 dark:bg-green-900"></div>
            <div className="w-2 h-2 rounded-sm bg-green-300 dark:bg-green-700"></div>
            <div className="w-2 h-2 rounded-sm bg-green-400 dark:bg-green-600"></div>
            <div className="w-2 h-2 rounded-sm bg-green-500 dark:bg-green-500"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="w-full">
        <div className="flex justify-center">
          {/* Month labels */}
          <div className="flex flex-col justify-start mr-3">
            <div className="h-3 mb-1"></div> {/* Space for weekday labels */}
            {weeks.map((week, weekIndex) => {
              const firstDayOfWeek = week.find(day => day !== null);
              if (!firstDayOfWeek) return <div key={weekIndex} className="h-2 mb-1"></div>;
              
              const date = new Date(firstDayOfWeek.date);
              const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
              const monthName = date.toLocaleDateString('en-US', { month: 'short' });
              
              if (!monthsShown.has(monthKey)) {
                monthsShown.add(monthKey);
                return (
                  <div key={weekIndex} className="h-2 mb-1 text-xs text-muted-foreground leading-none">
                    {monthName}
                  </div>
                );
              }
              return <div key={weekIndex} className="h-2 mb-1"></div>;
            })}
          </div>

          {/* Calendar grid */}
          <div className="flex flex-col">
            {/* Weekday labels */}
            <div className="flex space-x-1.5 mb-1">
              {weekdays.map((day, index) => (
                <div key={index} className="w-2 h-3 text-xs text-muted-foreground text-center leading-3">
                  {index % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Calendar weeks */}
            <div className="flex space-x-1.5">
              {Array.from({ length: 7 }, (_, dayIndex) => (
                <div key={dayIndex} className="flex flex-col space-y-1">
                  {weeks.map((week, weekIndex) => {
                    const day = week[dayIndex];
                    if (!day) {
                      return <div key={weekIndex} className="w-2 h-2"></div>;
                    }

                    const colorClass = day.solved 
                      ? 'bg-green-500 dark:bg-green-500' 
                      : 'bg-muted/30 hover:bg-muted/50';

                    return (
                      <div
                        key={weekIndex}
                        className={`w-2 h-2 rounded-sm transition-colors duration-200 cursor-pointer ${colorClass} ${
                          day.is_today ? 'ring-1 ring-primary ring-offset-1' : ''
                        }`}
                        title={`${formatTooltipDate(day.date)} - ${day.solved ? 'Solved a problem' : 'No problems solved'}${day.is_today ? ' (Today)' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground text-center">
        {calendarData.filter(day => day.solved).length} days with activity in the last {days} days
      </div>
    </div>
  );
};

export default HorizontalStreakCalendar;
