import React, { useState } from 'react';
import { 
  Box, Button, TextField, Typography, Stack, Alert, InputAdornment, 
  Card, CardContent, Divider, CircularProgress, ThemeProvider
} from '@mui/material';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { authTheme } from '../theme';

import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';
import CodeIcon from '@mui/icons-material/Code';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
      localStorage.setItem('username', username);
      navigate('/dashboard');
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
    <ThemeProvider theme={authTheme}>
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 70%, rgba(0, 212, 170, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, px: 3 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
              <CodeIcon sx={{ color: '#00d4aa', fontSize: 40 }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                CodeLab
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: '#a0aec0' }}>
              Sign in to your account
            </Typography>
          </Box>

          {/* Login Card */}
          <Card sx={{ 
            bgcolor: '#1a1a1a',
            border: '1px solid #2d3748',
            borderRadius: 3,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <CardContent sx={{ p: 4 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    bgcolor: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid #ff6b6b',
                    color: '#ff6b6b',
                    '& .MuiAlert-icon': { color: '#ff6b6b' }
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Google Login */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  mb: 3,
                  py: 1.5,
                  borderColor: '#4a5568',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#6b7280',
                    bgcolor: '#2d3748'
                  }
                }}
              >
                Continue with Google
              </Button>

              <Divider sx={{ 
                mb: 3, 
                borderColor: '#2d3748',
                '&::before, &::after': {
                  borderColor: '#2d3748'
                }
              }}>
                <Typography variant="body2" sx={{ color: '#6b7280', px: 2 }}>
                  or
                </Typography>
              </Divider>

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    sx={{
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#a0aec0' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    sx={{
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#a0aec0' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ 
                              minWidth: 'auto',
                              p: 0.5,
                              color: '#a0aec0',
                              '&:hover': { color: '#00d4aa' }
                            }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                    sx={{
                      py: 1.5,
                      bgcolor: '#00d4aa',
                      '&:hover': { bgcolor: '#00b894' },
                      '&:disabled': { bgcolor: '#4a5568', color: '#6b7280' },
                      fontWeight: 600,
                      fontSize: 16
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ 
                my: 3, 
                borderColor: '#2d3748'
              }} />

              {/* Register Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#a0aec0', mb: 2 }}>
                  Don't have an account?
                </Typography>
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  fullWidth
                  startIcon={<AppRegistrationIcon />}
                  sx={{
                    borderColor: '#4a5568',
                    color: 'text.primary',
                  }}
                >
                  Register
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          © 2024 CodeLab. Built for developers, by developers.
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage; 