import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tooltip, CircularProgress } from '@mui/material';
import axios from 'axios';

interface CalendarDay {
  date: string;
  solved: boolean;
  is_today: boolean;
}

interface StreakCalendarProps {
  days?: number;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ days = 30 }) => {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeekdayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2" sx={{ textAlign: 'center', p: 2 }}>
        {error}
      </Typography>
    );
  }

  // Group calendar data by weeks
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];
  
  calendarData.forEach((day, index) => {
    currentWeek.push(day);
    
    // Start a new week every 7 days or at the end
    if (currentWeek.length === 7 || index === calendarData.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
        Solve Calendar ({days} days)
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {weeks.map((week, weekIndex) => (
          <Box key={weekIndex} sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            {week.map((day) => (
              <Tooltip
                key={day.date}
                title={`${formatDate(day.date)} - ${day.solved ? 'Solved a problem' : 'No problems solved'}${day.is_today ? ' (Today)' : ''}`}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 1,
                    backgroundColor: day.solved 
                      ? day.is_today 
                        ? '#4CAF50' // Bright green for today
                        : '#81C784' // Light green for solved days
                      : day.is_today
                        ? '#FFC107' // Yellow for today (not solved)
                        : '#E0E0E0', // Gray for unsolved days
                    border: day.is_today ? '2px solid #2196F3' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.2)',
                      boxShadow: 1
                    }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#81C784', borderRadius: 1 }} />
          <Typography variant="caption">Solved</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#E0E0E0', borderRadius: 1 }} />
          <Typography variant="caption">Not solved</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#FFC107', border: '2px solid #2196F3', borderRadius: 1 }} />
          <Typography variant="caption">Today</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default StreakCalendar;