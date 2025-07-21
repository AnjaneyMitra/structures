import React, { useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Stack, Alert, InputAdornment } from '@mui/material';
import axios from 'axios';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await axios.post('https://structures-production.up.railway.app/api/auth/register', {
        username,
        password,
      });
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6C63FF 0%, #3A86FF 100%)' }}>
      <Container maxWidth="xs">
        <Paper elevation={8} sx={{ p: 5, borderRadius: 5, textAlign: 'center', background: 'rgba(255,255,255,0.97)', boxShadow: '0 4px 32px 0 rgba(108,99,255,0.10)' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', letterSpacing: '-0.02em' }}>Register</Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                fullWidth
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                fullWidth
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">Registration successful! Redirecting...</Alert>}
              <Button
                type="submit"
                variant="contained"
                startIcon={<PersonAddIcon />}
                disabled={loading}
                sx={{ fontWeight: 700, fontSize: '1.1rem', borderRadius: 3, boxShadow: 2, py: 1.2 }}
                fullWidth
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage; 