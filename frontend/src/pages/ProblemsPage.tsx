import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Alert, Button, Chip, Stack, TextField, 
  InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, IconButton, Tooltip, Badge
} from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

import BoltIcon from '@mui/icons-material/Bolt';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FilterListIcon from '@mui/icons-material/FilterList';

import { LoadingSpinner } from '../components/LoadingSpinner';


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

const ProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');

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

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = !difficultyFilter || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) return (
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
        <Typography variant="h6">Loading problems...</Typography>
      </Stack>
    </Box>
  );

  if (error) return (
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
        py: 3,
        bgcolor: '#1a1a1a'
      }}>
        <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
          <CodeIcon sx={{ color: '#00d4aa', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} sx={{ color: '#00d4aa' }}>
            Problems
          </Typography>
          <Badge badgeContent={problems.length} color="primary">
            <Chip 
              label="Total" 
              sx={{ 
                bgcolor: '#2d3748', 
                color: '#a0aec0',
                fontWeight: 600
              }} 
            />
          </Badge>
        </Stack>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2d3748',
                color: 'white',
                '& fieldset': { borderColor: '#4a5568' },
                '&:hover fieldset': { borderColor: '#00d4aa' },
                '&.Mui-focused fieldset': { borderColor: '#00d4aa' }
              },
              '& .MuiInputLabel-root': { color: '#a0aec0' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#a0aec0' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setDifficultyFilter(difficultyFilter ? '' : 'Easy')}
            sx={{
              borderColor: '#4a5568',
              color: '#a0aec0',
              '&:hover': {
                borderColor: '#00d4aa',
                color: '#00d4aa',
                bgcolor: 'rgba(0, 212, 170, 0.1)'
              }
            }}
          >
            Filter
          </Button>
        </Stack>
      </Box>

      {/* Problems Table */}
      <Box sx={{ p: 4 }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            bgcolor: '#1a1a1a',
            border: '1px solid #2d3748',
            borderRadius: 2,
            boxShadow: 'none'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: '1px solid #2d3748' }}>
                <TableCell sx={{ color: '#a0aec0', fontWeight: 700, bgcolor: '#1a1a1a', border: 'none' }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: '#a0aec0', fontWeight: 700, bgcolor: '#1a1a1a', border: 'none' }}>
                  Title
                </TableCell>
                <TableCell sx={{ color: '#a0aec0', fontWeight: 700, bgcolor: '#1a1a1a', border: 'none' }}>
                  Difficulty
                </TableCell>
                <TableCell sx={{ color: '#a0aec0', fontWeight: 700, bgcolor: '#1a1a1a', border: 'none' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProblems.map((problem) => {
                const diffConfig = difficultyConfig[problem.difficulty] || difficultyConfig.Easy;
                return (
                  <TableRow 
                    key={problem.id}
                    sx={{ 
                      borderBottom: '1px solid #2d3748',
                      '&:hover': { 
                        bgcolor: '#2d3748',
                        cursor: 'pointer'
                      },
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <TableCell sx={{ color: 'white', border: 'none', py: 2 }}>
                      <CheckCircleIcon sx={{ color: '#4a5568', fontSize: 20 }} />
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: 'none', py: 2 }}>
                      <Typography variant="body1" fontWeight={600} sx={{ color: '#e2e8f0' }}>
                        {problem.id}. {problem.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: 'none', py: 2 }}>
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
                    </TableCell>
                    <TableCell sx={{ color: 'white', border: 'none', py: 2 }}>
                      <Button
                        component={Link}
                        to={`/problems/${problem.id}`}
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        sx={{
                          bgcolor: '#00d4aa',
                          '&:hover': { bgcolor: '#00b894' },
                          fontWeight: 600,
                          textTransform: 'none'
                        }}
                      >
                        Solve
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredProblems.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: '#a0aec0'
          }}>
            <CodeIcon sx={{ fontSize: 64, color: '#4a5568', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No problems found
            </Typography>
            <Typography variant="body2">
              {search ? 'Try adjusting your search terms' : 'Check back later for new problems'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProblemsPage; 