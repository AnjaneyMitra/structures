import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Chip
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import AchievementBadge from '../components/AchievementBadge';
import { UserAchievements, AchievementStats } from '../types/achievements';

const AchievementsPage: React.FC = () => {
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [achievementStats, setAchievementStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [achievementsRes, statsRes] = await Promise.all([
        axios.get('https://structures-production.up.railway.app/api/achievements/user', { headers }),
        axios.get('https://structures-production.up.railway.app/api/achievements/stats', { headers })
      ]);

      setUserAchievements(achievementsRes.data);
      setAchievementStats(statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!userAchievements || !achievementStats) return null;

  const earnedAchievements = userAchievements.achievements.filter(a => a.earned);

  // Group achievements by category
  const achievementCategories = {
    'Problem Solving': userAchievements.achievements.filter(a => 
      ['first_solve', 'count'].includes(a.condition_type)
    ),
    'Difficulty Mastery': userAchievements.achievements.filter(a => 
      a.condition_type.startsWith('difficulty_')
    ),
    'Special Skills': userAchievements.achievements.filter(a => 
      ['speed', 'perfect_streak'].includes(a.condition_type)
    ),
    'Consistency': userAchievements.achievements.filter(a => 
      a.condition_type === 'streak'
    )
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <EmojiEventsIcon sx={{ fontSize: 40, color: '#FFD700' }} />
            <Typography variant="h3" fontWeight={700} sx={{ color: 'var(--color-foreground)' }}>
              Achievements
            </Typography>
          </div>
          <Typography variant="h6" sx={{ color: 'var(--color-muted-foreground)' }}>
            Track your coding journey and unlock rewards
          </Typography>
        </div>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              bgcolor: 'var(--color-card)', 
              border: '1px solid var(--color-border)',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: 'var(--color-foreground)' }}>
                      {achievementStats.earned_achievements}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)' }}>
                      Earned
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ 
              bgcolor: 'var(--color-card)', 
              border: '1px solid var(--color-border)',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: 'var(--color-foreground)' }}>
                      {achievementStats.completion_percentage}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)' }}>
                      Complete
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ 
              bgcolor: 'var(--color-card)', 
              border: '1px solid var(--color-border)',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <StarIcon sx={{ color: '#FF9800', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: 'var(--color-foreground)' }}>
                      {achievementStats.xp_from_achievements}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)' }}>
                      XP from Achievements
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ 
              bgcolor: 'var(--color-card)', 
              border: '1px solid var(--color-border)',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)', mb: 1 }}>
                    Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={achievementStats.completion_percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'var(--color-muted)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#FFD700',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)' }}>
                  {achievementStats.earned_achievements} of {achievementStats.total_achievements} unlocked
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recently Earned */}
        {earnedAchievements.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: 'var(--color-foreground)', mb: 3 }}>
              Recently Earned
            </Typography>
            <Grid container spacing={2}>
              {earnedAchievements
                .sort((a, b) => new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime())
                .slice(0, 6)
                .map((achievement) => (
                  <Grid item key={achievement.id}>
                    <AchievementBadge achievement={achievement} size="large" />
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}

        {/* Achievement Categories */}
        {Object.entries(achievementCategories).map(([category, achievements]) => (
          achievements.length > 0 && (
            <Box key={category} sx={{ mb: 6 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: 'var(--color-foreground)', mb: 3 }}>
                {category}
              </Typography>
              <Grid container spacing={3}>
                {achievements.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <Card
                      sx={{
                        bgcolor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: achievement.earned
                            ? '0 8px 25px rgba(255, 215, 0, 0.2)'
                            : '0 4px 15px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <AchievementBadge achievement={achievement} size="medium" />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              sx={{ color: 'var(--color-foreground)', mb: 1 }}
                            >
                              {achievement.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: 'var(--color-muted-foreground)', mb: 2 }}
                            >
                              {achievement.description}
                            </Typography>
                            
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                              <Chip
                                label={`+${achievement.xp_reward} XP`}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                                  color: '#FFD700',
                                  border: '1px solid #FFD700',
                                  borderRadius: 2
                                }}
                              />
                              {achievement.earned && (
                                <Chip
                                  label="Earned"
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                    color: '#4CAF50',
                                    border: '1px solid #4CAF50',
                                    borderRadius: 2
                                  }}
                                />
                              )}
                            </Stack>

                            {!achievement.earned && achievement.progress !== undefined && (
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)' }}>
                                    Progress
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)' }}>
                                    {achievement.progress}/{achievement.total}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min((achievement.progress / (achievement.total || 1)) * 100, 100)}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: 'var(--color-muted)',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: 'var(--color-primary)',
                                      borderRadius: 3
                                    }
                                  }}
                                />
                              </Box>
                            )}

                            {achievement.earned && achievement.earned_at && (
                              <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)' }}>
                                Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;