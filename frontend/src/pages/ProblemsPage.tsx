import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Alert, Button, Chip, Stack, TextField, InputAdornment } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

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

const ProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('https://structures-production.up.railway.app/api/problems/');
        setProblems(res.data);
      } catch (err) {
        setError('Failed to load problems.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <ListAltIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" fontWeight={700} color="primary">All Problems</Typography>
        <Box flexGrow={1} />
        <TextField
          placeholder="Search problems..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3, background: '#f7f7fa' },
          }}
        />
      </Stack>
      <Grid container spacing={3}>
        {filteredProblems.map((problem) => {
          const diff = difficultyColors[problem.difficulty] || { color: 'default', icon: null };
          return (
            <Grid item xs={12} sm={6} md={4} key={problem.id}>
              <Card elevation={2} sx={{ borderRadius: 4, height: '100%', background: '#fff', boxShadow: '0 2px 12px 0 rgba(108,99,255,0.07)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 24px 0 rgba(108,99,255,0.13)' } }}>
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
                    Solve
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      {filteredProblems.length === 0 && (
        <Box textAlign="center" mt={6}>
          <Typography variant="h6" color="text.secondary">No problems found.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProblemsPage; 