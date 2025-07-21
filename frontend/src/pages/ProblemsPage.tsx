import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Alert, Button, Chip, Stack, TextField, InputAdornment, Container, Paper } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FilterListIcon from '@mui/icons-material/FilterList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AnimatedBackground } from '../components/BackgroundEffects';

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

  if (loading) return <LoadingSpinner message="Loading problems..." />;
  if (error) return (
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

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={600} color="text.primary">
            Problems
          </Typography>
          <TextField
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {filteredProblems.length} problems available
        </Typography>
      </Box>

      {/* Problems Grid */}
      <Grid container spacing={3}>
        {filteredProblems.map((problem) => {
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
      
      {filteredProblems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No problems found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProblemsPage; 