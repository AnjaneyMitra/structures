import React, { useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Stack, Alert, InputAdornment } from '@mui/material';
import axios from 'axios';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', new URLSearchParams({
        username,
        password,
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      localStorage.setItem('token', res.data.access_token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const GOOGLE_LOGIN_URL = 'http://localhost:8000/api/auth/google-login';

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = GOOGLE_LOGIN_URL;
  };

  // Handle Google OAuth callback (token in query param)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const username = params.get('username');
    if (token) {
      localStorage.setItem('token', token);
      if (username) localStorage.setItem('username', username);
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6C63FF 0%, #3A86FF 100%)' }}>
      <Container maxWidth="xs">
        <Paper elevation={8} sx={{ p: 5, borderRadius: 5, textAlign: 'center', background: 'rgba(255,255,255,0.97)', boxShadow: '0 4px 32px 0 rgba(108,99,255,0.10)' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', letterSpacing: '-0.02em' }}>Login</Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                fullWidth
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                disabled={loading}
                sx={{ fontWeight: 700, fontSize: '1.1rem', borderRadius: 3, boxShadow: 2, py: 1.2 }}
                fullWidth
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{ fontWeight: 700, fontSize: '1.1rem', borderRadius: 3, boxShadow: 2, py: 1.2, mt: 2 }}
                fullWidth
              >
                Sign in with Google
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage; 