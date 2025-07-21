import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Alert, Stack, Button, Chip, Paper, Container } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BoltIcon from '@mui/icons-material/Bolt';

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
    <Box sx={{ p: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
          Good morning, {user?.username}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ready to solve some problems today?
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="primary.main" sx={{ mb: 1 }}>
                {stats.problems_solved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Problems Solved
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="secondary.main" sx={{ mb: 1 }}>
                {stats.total_submissions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Submissions
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Featured Problems */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
          Featured Problems
        </Typography>
        
        <Grid container spacing={3}>
          {problems.map((problem) => {
            const diff = difficultyColors[problem.difficulty] || { color: 'default', icon: null };
            return (
              <Grid item xs={12} sm={6} md={4} key={problem.id}>
                <Card elevation={1}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight={500} sx={{ flexGrow: 1 }}>
                        {problem.title}
                      </Typography>
                      <Chip
                        label={problem.difficulty}
                        color={diff.color}
                        size="small"
                      />
                    </Stack>
                    <Button
                      component={Link}
                      to={`/problems/${problem.id}`}
                      variant="contained"
                      size="small"
                      fullWidth
                    >
                      Solve
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            component={Link} 
            to="/problems" 
            variant="outlined"
          >
            View All Problems
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage; 