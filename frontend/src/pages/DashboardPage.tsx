import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Alert, Stack, Button, Chip, 
  LinearProgress, Divider, Avatar, Badge
} from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BoltIcon from '@mui/icons-material/Bolt';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { LoadingSpinner } from '../components/LoadingSpinner';


interface UserProfile {
  id: number;
  username: string;
}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
}

const difficultyConfig: Record<string, any> = {
  Easy: { 
    color: '#00d4aa', 
    bgcolor: 'rgba(0, 212, 170, 0.1)', 
    icon: <CheckCircleIcon fontSize="small" /> 
  },
  Medium: { 
    color: '#ffa726', 
    bgcolor: 'rgba(255, 167, 38, 0.1)', 
    icon: <AssignmentTurnedInIcon fontSize="small" /> 
  },
  Hard: { 
    color: '#ff6b6b', 
    bgcolor: 'rgba(255, 107, 107, 0.1)', 
    icon: <EmojiEventsIcon fontSize="small" /> 
  },
};

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ total_submissions: number; problems_solved: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const userRes = await axios.get('https://structures-production.up.railway.app/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);
        const probRes = await axios.get('https://structures-production.up.railway.app/api/problems/');
        setProblems(probRes.data.slice(0, 6)); // Preview top 6 problems
        const statsRes = await axios.get('https://structures-production.up.railway.app/api/profile/stats/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);
      } catch (err: any) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#0a0a0a',
        color: 'white'
      }}>
        <Stack alignItems="center" spacing={2}>
          <LoadingSpinner />
          <Typography variant="h6">Loading your dashboard...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#0a0a0a',
        color: 'white',
        p: 4
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            bgcolor: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid #ff6b6b',
            color: '#ff6b6b',
            '& .MuiAlert-icon': { color: '#ff6b6b' }
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#0a0a0a',
      color: 'white'
    }}>
      {/* Header */}
      <Box sx={{ 
        borderBottom: '1px solid #2d3748',
        px: 4,
        py: 4,
        bgcolor: '#1a1a1a'
      }}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Avatar sx={{ 
            width: 60, 
            height: 60,
            bgcolor: '#00d4aa',
            fontSize: 24,
            fontWeight: 700
          }}>
            {user?.username?.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
              Welcome back, {user?.username}!
            </Typography>
            <Typography variant="body1" sx={{ color: '#a0aec0' }}>
              Ready to tackle some coding challenges today?
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Stats Cards */}
        {stats && (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 3,
            mb: 6
          }}>
            <Card sx={{ 
              bgcolor: '#1a1a1a',
              border: '1px solid #2d3748',
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ 
                    p: 2,
                    bgcolor: 'rgba(0, 212, 170, 0.1)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircleIcon sx={{ color: '#00d4aa', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#00d4aa' }}>
                      {stats.problems_solved}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                      Problems Solved
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ 
              bgcolor: '#1a1a1a',
              border: '1px solid #2d3748',
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ 
                    p: 2,
                    bgcolor: 'rgba(255, 167, 38, 0.1)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CodeIcon sx={{ color: '#ffa726', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#ffa726' }}>
                      {stats.total_submissions}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                      Total Submissions
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ 
              bgcolor: '#1a1a1a',
              border: '1px solid #2d3748',
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ 
                    p: 2,
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUpIcon sx={{ color: '#6366f1', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#6366f1' }}>
                      {Math.round((stats.problems_solved / Math.max(stats.total_submissions, 1)) * 100)}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                      Success Rate
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Quick Actions */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'white', mb: 3 }}>
            Quick Actions
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2
          }}>
            <Button
              component={Link}
              to="/problems"
              variant="contained"
              size="large"
              startIcon={<CodeIcon />}
              sx={{
                bgcolor: '#00d4aa',
                '&:hover': { bgcolor: '#00b894' },
                fontWeight: 600,
                py: 2,
                justifyContent: 'flex-start'
              }}
            >
              Browse Problems
            </Button>
            <Button
              component={Link}
              to="/rooms"
              variant="outlined"
              size="large"
              startIcon={<GroupWorkIcon />}
              sx={{
                borderColor: '#4a5568',
                color: '#a0aec0',
                '&:hover': {
                  borderColor: '#00d4aa',
                  color: '#00d4aa',
                  bgcolor: 'rgba(0, 212, 170, 0.1)'
                },
                fontWeight: 600,
                py: 2,
                justifyContent: 'flex-start'
              }}
            >
              Join Room
            </Button>
          </Box>
        </Box>

        {/* Recent Problems */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
              Recommended Problems
            </Typography>
            <Button
              component={Link}
              to="/problems"
              variant="text"
              sx={{ color: '#00d4aa', fontWeight: 600 }}
            >
              View All
            </Button>
          </Stack>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3
          }}>
            {problems.slice(0, 6).map((problem) => {
              const diffConfig = difficultyConfig[problem.difficulty] || difficultyConfig.Easy;
              return (
                <Card key={problem.id} sx={{ 
                  bgcolor: '#1a1a1a',
                  border: '1px solid #2d3748',
                  borderRadius: 3,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    borderColor: '#00d4aa',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 212, 170, 0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'white', flex: 1 }}>
                        {problem.id}. {problem.title}
                      </Typography>
                      <Chip
                        icon={diffConfig.icon}
                        label={problem.difficulty}
                        size="small"
                        sx={{
                          bgcolor: diffConfig.bgcolor,
                          color: diffConfig.color,
                          border: `1px solid ${diffConfig.color}`,
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: diffConfig.color }
                        }}
                      />
                    </Stack>
                    
                    <Button
                      component={Link}
                      to={`/problems/${problem.id}`}
                      variant="contained"
                      fullWidth
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        bgcolor: '#00d4aa',
                        '&:hover': { bgcolor: '#00b894' },
                        fontWeight: 600
                      }}
                    >
                      Solve Problem
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage; 