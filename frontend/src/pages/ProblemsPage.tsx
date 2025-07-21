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
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatedBackground variant="waves" opacity={0.03} />
      
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 }, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 5,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
          }}
        >
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            alignItems={{ xs: 'flex-start', md: 'center' }} 
            spacing={3}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <ListAltIcon 
                sx={{ 
                  fontSize: 48, 
                  background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }} 
              />
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={800}
                  sx={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Problem Library
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  {problems.length} challenging problems to master
                </Typography>
              </Box>
            </Stack>
            
            <Box sx={{ ml: { md: 'auto' } }}>
              <TextField
                placeholder="Search problems..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="medium"
                sx={{ minWidth: 280 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <FilterListIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Stack>
        </Paper>
        {/* Problems Grid */}
        <Grid container spacing={4}>
          {filteredProblems.map((problem) => {
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
                        sx={{ 
                          flexGrow: 1, 
                          color: 'text.primary',
                          lineHeight: 1.3,
                        }}
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
                      Start Challenge
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        {filteredProblems.length === 0 && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: 5,
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight={600} mb={1}>
              No problems found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search terms or browse all problems
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default ProblemsPage; 