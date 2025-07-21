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
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(251, 251, 250, 1) 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 70%, rgba(0, 208, 132, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(107, 115, 255, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={2}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: 4, 
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(235, 234, 230, 0.6)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(55, 53, 47, 0.1)',
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 1, 
              fontWeight: 600, 
              color: '#37352F',
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" color="#787774" sx={{ mb: 4 }}>
            Sign in to continue coding together
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
                disabled={loading}
                sx={{ 
                  fontWeight: 500, 
                  py: 1.5,
                  backgroundColor: '#00D084',
                  '&:hover': {
                    backgroundColor: '#00A86B',
                  }
                }}
                fullWidth
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="#787774">
                  or
                </Typography>
              </Divider>
              
              <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{ 
                  fontWeight: 500, 
                  py: 1.5,
                  borderColor: '#EBEAE6',
                  color: '#37352F',
                  '&:hover': {
                    borderColor: '#D3D1CB',
                    backgroundColor: '#F7F6F3',
                  }
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