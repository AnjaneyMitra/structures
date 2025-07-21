import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Alert, Stack, Button, Chip, Paper, Container } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BoltIcon from '@mui/icons-material/Bolt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AnimatedBackground } from '../components/BackgroundEffects';

interface UserProfile {
  id: number;
  username: string;
}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
}

const difficultyColors: Record<string, any> = {
  Easy: { color: 'success', icon: <BoltIcon fontSize="small" /> },
  Medium: { color: 'warning', icon: <AssignmentTurnedInIcon fontSize="small" /> },
  Hard: { color: 'error', icon: <EmojiEventsIcon fontSize="small" /> },
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
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)',
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatedBackground variant="particles" opacity={0.05} />
      
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 }, position: 'relative', zIndex: 1 }}>
        {/* Welcome Header */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 5 }, 
            mb: 4, 
            borderRadius: 5,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                fontWeight: 700, 
                fontSize: 42,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                border: '4px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {user?.username[0].toUpperCase()}
            </Avatar>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                sx={{
                  mb: 1,
                  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Welcome back, {user?.username}!
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={400}>
                Ready to solve some challenging problems today?
              </Typography>
            </Box>
            {stats && (
              <Stack 
                direction={{ xs: 'row', md: 'row' }} 
                spacing={3} 
                sx={{ ml: { md: 'auto' } }}
              >
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex', 
                    alignItems: 'center', 
                    minWidth: 140,
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  <TrendingUpIcon sx={{ color: '#10B981', mr: 2, fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="#10B981">
                      {stats.problems_solved}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Problems Solved
                    </Typography>
                  </Box>
                </Paper>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.1) 100%)',
                    border: '1px solid rgba(236, 72, 153, 0.2)',
                    display: 'flex', 
                    alignItems: 'center', 
                    minWidth: 140,
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  <CodeIcon sx={{ color: '#EC4899', mr: 2, fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="#EC4899">
                      {stats.total_submissions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Total Submissions
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            )}
          </Stack>
        </Paper>
        {/* Featured Problems Section */}
        <Typography 
          variant="h4" 
          fontWeight={700} 
          mb={4} 
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          🔥 Featured Problems
        </Typography>
        
        <Grid container spacing={4}>
          {problems.map((problem) => {
            const diff = difficultyColors[problem.difficulty] || { color: 'default', icon: null };
            return (
              <Grid item xs={12} sm={6} lg={4} key={problem.id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 5, 
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 60px rgba(99, 102, 241, 0.15)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                      <Typography 
                        variant="h6" 
                        fontWeight={700} 
                        sx={{ flexGrow: 1, color: 'text.primary' }}
                      >
                        {problem.title}
                      </Typography>
                      <Chip
                        label={problem.difficulty}
                        color={diff.color}
                        icon={diff.icon}
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.9rem', 
                          px: 2,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </Stack>
                    <Button
                      component={Link}
                      to={`/problems/${problem.id}`}
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrowIcon />}
                      sx={{ 
                        mt: 2, 
                        borderRadius: 3, 
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        py: 1.5,
                      }}
                      fullWidth
                    >
                      Start Solving
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        <Box textAlign="center" mt={6}>
          <Button 
            component={Link} 
            to="/problems" 
            variant="outlined" 
            size="large" 
            sx={{ 
              borderRadius: 4, 
              fontWeight: 700, 
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              borderWidth: 2,
              '&:hover': { borderWidth: 2 }
            }}
          >
            Explore All Problems →
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPage; 