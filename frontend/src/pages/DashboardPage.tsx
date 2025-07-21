import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, CircularProgress, Alert, Stack, Button, Chip, Paper } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BoltIcon from '@mui/icons-material/Bolt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';

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
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" mb={6}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: '#6C63FF', fontWeight: 700, fontSize: 36, boxShadow: 3 }}>
          {user?.username[0].toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary" mb={1}>
            Welcome, {user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to solve some DSA problems collaboratively?
          </Typography>
        </Box>
        {stats && (
          <Stack direction="row" spacing={3} alignItems="center" ml={{ md: 'auto' }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f7f7fa', display: 'flex', alignItems: 'center', minWidth: 120 }}>
              <AssignmentTurnedInIcon color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>{stats.problems_solved}</Typography>
                <Typography variant="caption" color="text.secondary">Solved</Typography>
              </Box>
            </Paper>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f7f7fa', display: 'flex', alignItems: 'center', minWidth: 120 }}>
              <CodeIcon color="secondary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>{stats.total_submissions}</Typography>
                <Typography variant="caption" color="text.secondary">Submissions</Typography>
              </Box>
            </Paper>
          </Stack>
        )}
      </Stack>
      <Typography variant="h5" fontWeight={700} mb={2} color="primary">
        Featured Problems
      </Typography>
      <Grid container spacing={3}>
        {problems.map((problem) => {
          const diff = difficultyColors[problem.difficulty] || { color: 'default', icon: null };
          return (
            <Grid item xs={12} sm={6} md={4} key={problem.id}>
              <Card elevation={3} sx={{ borderRadius: 4, height: '100%', background: '#fff', boxShadow: '0 2px 12px 0 rgba(108,99,255,0.07)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                      {problem.title}
                    </Typography>
                    <Chip
                      label={problem.difficulty}
                      color={diff.color}
                      icon={diff.icon}
                      sx={{ fontWeight: 700, fontSize: '0.95rem', px: 1.5 }}
                    />
                  </Stack>
                  <Button
                    component={Link}
                    to={`/problems/${problem.id}`}
                    variant="contained"
                    size="medium"
                    startIcon={<PlayArrowIcon />}
                    sx={{ mt: 2, borderRadius: 2, fontWeight: 700, boxShadow: 1 }}
                    fullWidth
                  >
                    Solve Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Box textAlign="center" mt={4}>
        <Button component={Link} to="/problems" variant="outlined" size="large" sx={{ borderRadius: 3, fontWeight: 700, px: 5 }}>
          View All Problems
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardPage; 