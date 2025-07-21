import React, { useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Stack, Alert, InputAdornment, Divider } from '@mui/material';
import axios from 'axios';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';
import { AnimatedBackground } from '../components/BackgroundEffects';

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
      const res = await axios.post('https://structures-production.up.railway.app/api/auth/login', new URLSearchParams({
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

  const GOOGLE_LOGIN_URL = 'https://structures-production.up.railway.app/api/auth/google-login';

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
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 50%, #3B82F6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AnimatedBackground variant="geometric" opacity={0.1} />
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: 6, 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.15)',
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 1, 
              fontWeight: 800, 
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
            Sign in to continue your coding journey
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                fullWidth
                size="large"
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
                size="large"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)',
                  }}
                >
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                disabled={loading}
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.2rem', 
                  py: 1.8,
                  borderRadius: 4,
                }}
                fullWidth
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
              </Divider>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.1rem', 
                  py: 1.8,
                  borderRadius: 4,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
                fullWidth
              >
                Continue with Google
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage; 