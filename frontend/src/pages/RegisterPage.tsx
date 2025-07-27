import React, { useState } from 'react';
import { 
  Box, Button, TextField, Typography, Stack, Alert, InputAdornment, 
  Card, CardContent, Divider, CircularProgress, ThemeProvider
} from '@mui/material';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { authTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import CodeIcon from '@mui/icons-material/Code';
import LoginIcon from '@mui/icons-material/Login';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Register the user
      await axios.post('https://structures-production.up.railway.app/api/auth/register', {
        username,
        password,
      });
      
      setSuccess(true);
      
      // Auto-login after successful registration
      try {
        const loginRes = await axios.post('https://structures-production.up.railway.app/api/auth/login', 
          new URLSearchParams({
            username,
            password,
          }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );
        
        // Login successful, store token and redirect to dashboard
        login(loginRes.data.access_token, username);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (loginErr) {
        // If auto-login fails, redirect to login page
        console.error('Auto-login failed:', loginErr);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
            Create your account
          </Typography>
        </Box>

        {/* Register Card */}
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

            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  bgcolor: 'rgba(0, 212, 170, 0.1)',
                  border: '1px solid #00d4aa',
                  color: '#00d4aa',
                  '& .MuiAlert-icon': { color: '#00d4aa' }
                }}
              >
                Account created successfully! Redirecting to login...
              </Alert>
            )}

            {/* Register Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
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
                            '&:hover': { color: '#00d4aa' },
                            borderRadius: 2
                          }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          sx={{ 
                            minWidth: 'auto',
                            p: 0.5,
                            color: '#a0aec0',
                            '&:hover': { color: '#00d4aa' },
                            borderRadius: 2
                          }}
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                  startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                  sx={{
                    py: 1.5,
                    bgcolor: '#00d4aa',
                    '&:hover': { bgcolor: '#00b894' },
                    '&:disabled': { bgcolor: '#4a5568', color: '#6b7280' },
                    fontWeight: 600,
                    fontSize: 16,
                    borderRadius: 3
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ 
              my: 3, 
              borderColor: '#2d3748'
            }} />

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#a0aec0', mb: 2 }}>
                Already have an account?
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                fullWidth
                startIcon={<LoginIcon />}
                sx={{
                  borderColor: '#4a5568',
                  color: '#a0aec0',
                  borderRadius: 3,
                  '&:hover': {
                    borderColor: '#00d4aa',
                    color: '#00d4aa',
                    bgcolor: 'rgba(0, 212, 170, 0.1)'
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            © 2024 CodeLab. Built for developers, by developers.
          </Typography>
        </Box>
      </Box>
    </Box>
    </ThemeProvider>
  );
};

export default RegisterPage; 