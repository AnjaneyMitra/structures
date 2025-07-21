import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, Alert, MenuItem, Divider, CircularProgress, Chip } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const difficulties = ['Easy', 'Medium', 'Hard'];

const AdminProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    sample_input: '',
    sample_output: '',
    reference_solution: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Simple admin check (in production, use a backend check)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // Optionally, decode JWT and check is_admin claim
  }, [navigate]);

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

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    try {
      if (editingId) {
        await axios.put(`https://structures-production.up.railway.app/api/problems/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Problem updated!');
      } else {
        await axios.post('https://structures-production.up.railway.app/api/problems/', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Problem created!');
      }
      setForm({ title: '', description: '', difficulty: 'Easy', sample_input: '', sample_output: '', reference_solution: '' });
      setEditingId(null);
      fetchProblems();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save problem.');
    }
  };

  const handleEdit = (problem: any) => {
    setForm({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      sample_input: problem.sample_input || '',
      sample_output: problem.sample_output || '',
      reference_solution: problem.reference_solution || ''
    });
    setEditingId(problem.id);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} color="primary" mb={3}>Admin: Create/Edit Problems</Typography>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
        <Stack spacing={2}>
          <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth required />
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline minRows={3} required />
          <TextField select label="Difficulty" name="difficulty" value={form.difficulty} onChange={handleChange} fullWidth>
            {difficulties.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <TextField label="Sample Input" name="sample_input" value={form.sample_input} onChange={handleChange} fullWidth />
          <TextField label="Sample Output" name="sample_output" value={form.sample_output} onChange={handleChange} fullWidth />
          <TextField label="Reference Solution (admin only)" name="reference_solution" value={form.reference_solution} onChange={handleChange} fullWidth multiline minRows={2} />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>{editingId ? 'Update' : 'Create'} Problem</Button>
            {editingId && <Button variant="outlined" onClick={() => { setEditingId(null); setForm({ title: '', description: '', difficulty: 'Easy', sample_input: '', sample_output: '', reference_solution: '' }); }}>Cancel</Button>}
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
        </Stack>
      </Paper>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h5" fontWeight={700} mb={2} color="primary">Existing Problems</Typography>
      {loading ? <CircularProgress /> : (
        <Stack spacing={2}>
          {problems.map(problem => (
            <Paper key={problem.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700}>{problem.title} <Chip label={problem.difficulty} size="small" sx={{ ml: 1 }} /></Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>{problem.description.slice(0, 120)}{problem.description.length > 120 ? '...' : ''}</Typography>
              <Button variant="outlined" size="small" onClick={() => handleEdit(problem)}>Edit</Button>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default AdminProblemsPage; 