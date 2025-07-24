import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { LocalFireDepartment, EmojiEvents, TrendingUp } from '@mui/icons-material';
import axios from 'axios';
import StreakDisplay from '../components/StreakDisplay';
import StreakCalendar from '../components/StreakCalendar';

interface StreakStats {
  current_streak: number;
  longest_streak: number;
  last_solve_date: string | null;
  streak_active: boolean;
  days_since_last_solve: number | null;
  total_solve_days_this_year: number;
  current_streak_rank: number;
  longest_streak_rank: number;
  streak_percentage: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  current_streak: number;
  longest_streak: number;
}

const StreakPage: React.FC = () => {
  const [streakStats, setStreakStats] = useState<StreakStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch detailed streak stats
        const statsResponse = await axios.get(
          'https://structures-production.up.railway.app/api/streaks/stats',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setStreakStats(statsResponse.data);

        // Fetch leaderboard
        const leaderboardResponse = await axios.get(
          'https://structures-production.up.railway.app/api/streaks/leaderboard',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setLeaderboard(leaderboardResponse.data.leaderboard);

      } catch (err) {
        console.error('Failed to fetch streak data:', err);
        setError('Failed to load streak data');
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!streakStats) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">No streak data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalFireDepartment sx={{ color: 'orange' }} />
        Streak Tracking
      </Typography>

      <Grid container spacing={3}>
        {/* Current Streak Stats */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Your Streak Stats</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <StreakDisplay 
                      currentStreak={streakStats.current_streak}
                      longestStreak={streakStats.longest_streak}
                      streakActive={streakStats.streak_active}
                      size="large"
                      showLongest={false}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Current Streak
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <EmojiEvents sx={{ fontSize: '2rem', color: 'gold', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {streakStats.longest_streak}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Personal Best
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <TrendingUp sx={{ fontSize: '2rem', color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      #{streakStats.current_streak_rank}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Current Rank
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {streakStats.total_solve_days_this_year}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Days Solved This Year
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Streak Status */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Status:</strong>{' '}
                <Chip 
                  label={streakStats.streak_active ? 'Active' : 'Broken'} 
                  color={streakStats.streak_active ? 'success' : 'error'}
                  size="small"
                />
              </Typography>
              
              {streakStats.last_solve_date && (
                <Typography variant="body2" color="text.secondary">
                  Last solved: {new Date(streakStats.last_solve_date).toLocaleDateString()}
                  {streakStats.days_since_last_solve !== null && (
                    ` (${streakStats.days_since_last_solve} day${streakStats.days_since_last_solve !== 1 ? 's' : ''} ago)`
                  )}
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Calendar */}
          <StreakCalendar days={60} />
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Streak Leaderboard
            </Typography>
            
            {leaderboard.length > 0 ? (
              <List>
                {leaderboard.map((entry) => (
                  <ListItem key={entry.rank} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 24 }}>
                            #{entry.rank}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: entry.rank <= 3 ? 'bold' : 'normal' }}>
                            {entry.username}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LocalFireDepartment sx={{ fontSize: '1rem', color: 'orange' }} />
                          <Typography variant="body2">
                            {entry.current_streak} days
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            (Best: {entry.longest_streak})
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No active streaks yet
              </Typography>
            )}
          </Paper>

          {/* Tips */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Streak Tips
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Solve at least one problem daily"
                  secondary="Keep your streak alive by solving problems consistently"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Start small"
                  secondary="Begin with easier problems to build momentum"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Set reminders"
                  secondary="Use calendar reminders to maintain consistency"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StreakPage;