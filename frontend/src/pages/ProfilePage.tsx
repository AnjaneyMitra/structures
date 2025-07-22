import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, CircularProgress, Alert, Stack, Chip, Avatar, 
  Divider, TextField, Button, Card, CardContent, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid
} from '@mui/material';
import axios from 'axios';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';

interface Submission {
  id: number;
  problem_id: number;
  problem_title: string;
  problem_difficulty?: string;
  result: string;
  runtime: string;
  submission_time: string;
  language: string;
  code: string;
}

interface UserProfile {
  id: number;
  username: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ total_submissions: number; problems_solved: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);


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
        const subRes = await axios.get('https://structures-production.up.railway.app/api/profile/submissions/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(subRes.data);
        const statsRes = await axios.get('https://structures-production.up.railway.app/api/profile/stats/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <CircularProgress sx={{ color: '#00d4aa' }} />
        <Typography variant="h6">Loading profile...</Typography>
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

  if (!user) return null;

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
        <Stack direction="row" alignItems="center" spacing={4}>
          <Avatar sx={{ 
            width: 80, 
            height: 80,
            bgcolor: '#00d4aa',
            fontSize: 32,
            fontWeight: 700
          }}>
            {user.username.slice(0, 2).toUpperCase()}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            {editing ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  size="small"
                  label="New Username"
                  sx={{
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#2d3748',
                      color: 'white',
                      '& fieldset': { borderColor: '#4a5568' },
                      '&:hover fieldset': { borderColor: '#00d4aa' },
                      '&.Mui-focused fieldset': { borderColor: '#00d4aa' }
                    },
                    '& .MuiInputLabel-root': { color: '#a0aec0' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#00d4aa' }
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={async () => {
                    setUpdateError('');
                    setUpdateSuccess(false);
                    try {
                      const token = localStorage.getItem('token');
                      const res = await axios.put(
                        'https://structures-production.up.railway.app/api/profile/username',
                        { new_username: newUsername },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      setUser(res.data.user);
                      localStorage.setItem('username', res.data.user.username);
                      localStorage.setItem('token', res.data.access_token);
                      setEditing(false);
                      setUpdateSuccess(true);
                    } catch (err: any) {
                      setUpdateError(err.response?.data?.detail || 'Update failed');
                    }
                  }}
                  sx={{
                    bgcolor: '#00d4aa',
                    '&:hover': { bgcolor: '#00b894' }
                  }}
                >
                  Save
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => setEditing(false)}
                  sx={{ color: '#a0aec0' }}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                  {user.username}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => { setEditing(true); setNewUsername(user.username); }}
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
                  Edit
                </Button>
              </Stack>
            )}
            
            <Typography variant="body1" sx={{ color: '#a0aec0', mt: 1 }}>
              User ID: #{user.id}
            </Typography>
            
            {updateError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2,
                  bgcolor: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid #ff6b6b',
                  color: '#ff6b6b',
                  '& .MuiAlert-icon': { color: '#ff6b6b' }
                }}
              >
                {updateError}
              </Alert>
            )}
            
            {updateSuccess && (
              <Alert 
                severity="success" 
                sx={{ 
                  mt: 2,
                  bgcolor: 'rgba(0, 212, 170, 0.1)',
                  border: '1px solid #00d4aa',
                  color: '#00d4aa',
                  '& .MuiAlert-icon': { color: '#00d4aa' }
                }}
              >
                Username updated successfully!
              </Alert>
            )}
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Stats Cards */}
        {stats && (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                    bgcolor: 'rgba(0, 212, 170, 0.1)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AssignmentTurnedInIcon sx={{ color: '#00d4aa', fontSize: 28 }} />
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
                    bgcolor: 'rgba(0, 212, 170, 0.1)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CodeIcon sx={{ color: '#00d4aa', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#00d4aa' }}>
                      {stats.total_submissions}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                      Submissions
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}
        <Stack direction="row" spacing={3} alignItems="center" ml={{ sm: 'auto' }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f7f7fa', display: 'flex', alignItems: 'center', minWidth: 120 }}>
            <AssignmentTurnedInIcon color="primary" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>{stats?.problems_solved || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Solved</Typography>
            </Box>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f7f7fa', display: 'flex', alignItems: 'center', minWidth: 120 }}>
            <CodeIcon color="secondary" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>{stats?.total_submissions || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Submissions</Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>
      <Typography variant="h5" fontWeight={700} mb={2} color="primary">Submission History</Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={2}>
        {submissions.map(sub => (
          <Grid item xs={12} sm={6} key={sub.id}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, background: '#f7f7fa', boxShadow: '0 1px 6px 0 rgba(108,99,255,0.04)' }}>
              <Typography variant="subtitle1" fontWeight={700} color="primary">
                {sub.problem_title} <Chip label={sub.problem_difficulty} size="small" sx={{ ml: 1 }} />
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mb={1} mt={1}>
                <Chip label={sub.result} color={sub.result === 'pass' ? 'success' : 'error'} size="small" sx={{ fontWeight: 700 }} />
                <Chip label={sub.language} size="small" sx={{ fontWeight: 700 }} />
                <Typography variant="body2" color="text.secondary">Runtime: {sub.runtime}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">Time: {new Date(sub.submission_time).toLocaleString()}</Typography>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>View Code</summary>
                <Paper variant="outlined" sx={{ p: 1, mt: 1, fontFamily: 'JetBrains Mono, Fira Mono, IBM Plex Mono, monospace', fontSize: 13, background: '#f4f4fa', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {sub.code}
                </Paper>
              </details>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {submissions.length === 0 && (
        <Box textAlign="center" mt={6}>
          <Typography variant="h6" color="text.secondary">No submissions yet.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProfilePage; 