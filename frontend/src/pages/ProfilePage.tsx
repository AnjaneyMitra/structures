import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Stack, Chip, Grid, Avatar, Divider, TextField, Button } from '@mui/material';
import axios from 'axios';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
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
  const navigate = useNavigate();

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

  if (loading) return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Alert severity="error">{error}</Alert></Box>;
  if (!user) return null;

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, mb: 4, background: '#fff', boxShadow: '0 2px 12px 0 rgba(108,99,255,0.07)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Avatar sx={{ width: 72, height: 72, bgcolor: '#6C63FF', fontWeight: 700, fontSize: 36, boxShadow: 2 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Box>
            {editing ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  size="small"
                  label="New Username"
                  variant="outlined"
                  sx={{ minWidth: 180 }}
                />
                <Button
                  variant="contained"
                  color="primary"
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
                >
                  Save
                </Button>
                <Button variant="text" size="small" onClick={() => setEditing(false)}>Cancel</Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h4" fontWeight={700} color="primary">{user.username}</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => { setEditing(true); setNewUsername(user.username); }}
                  sx={{ ml: 1 }}
                >
                  Edit
                </Button>
              </Stack>
            )}
            <Chip label={`User ID: ${user.id}`} color="info" sx={{ fontWeight: 600, ml: 1 }} />
            {updateError && <Alert severity="error" sx={{ mt: 1 }}>{updateError}</Alert>}
            {updateSuccess && <Alert severity="success" sx={{ mt: 1 }}>Username updated!</Alert>}
          </Box>
          {stats && (
            <Stack direction="row" spacing={3} alignItems="center" ml={{ sm: 'auto' }}>
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
      </Paper>
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