import React from 'react';
import { Box, Container, Paper, Typography, Stack, Button, Chip } from '@mui/material';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AppBar from './components/AppBar';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CodeIcon from '@mui/icons-material/Code';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import SpeedIcon from '@mui/icons-material/Speed';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import RoomsPage from './pages/RoomsPage';
import ProfilePage from './pages/ProfilePage';
import CollaborativeRoomPage from './pages/CollaborativeRoomPage';
import { AnimatedBackground } from './components/BackgroundEffects';

function Landing() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 50%, #3B82F6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AnimatedBackground variant="gradient" opacity={0.15} />
      
      <Container maxWidth="lg" sx={{ zIndex: 2, position: 'relative' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 4, md: 8 }, 
            borderRadius: 6, 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.15)',
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              mb: 3, 
              fontSize: { xs: '2.8rem', md: '4.5rem' }, 
              fontWeight: 800, 
              letterSpacing: '-0.03em',
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            DSA Collaborative
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              color: 'text.secondary', 
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Solve Data Structures & Algorithms problems together in real time.
            <br />
            Beautiful, modern, and collaborative—like LeetCode, but social.
          </Typography>

          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="center" 
            sx={{ mb: 6, flexWrap: 'wrap', gap: 2 }}
          >
            <Chip 
              icon={<CodeIcon />} 
              label="Real-time Coding" 
              sx={{ 
                background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                color: 'white',
                fontWeight: 600,
                px: 2,
                py: 1,
              }} 
            />
            <Chip 
              icon={<GroupWorkIcon />} 
              label="Collaborative Rooms" 
              sx={{ 
                background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                color: 'white',
                fontWeight: 600,
                px: 2,
                py: 1,
              }} 
            />
            <Chip 
              icon={<SpeedIcon />} 
              label="Instant Execution" 
              sx={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                color: 'white',
                fontWeight: 600,
                px: 2,
                py: 1,
              }} 
            />
          </Stack>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center" 
            sx={{ mb: 4 }}
          >
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              sx={{ 
                fontWeight: 700, 
                fontSize: '1.2rem', 
                px: 5, 
                py: 1.5,
                borderRadius: 4,
                minWidth: 160,
              }}
            >
              Get Started
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              size="large"
              startIcon={<PersonAddIcon />}
              sx={{ 
                fontWeight: 700, 
                fontSize: '1.2rem', 
                px: 5, 
                py: 1.5,
                borderRadius: 4,
                minWidth: 160,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              Sign Up Free
            </Button>
          </Stack>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
            Built with{' '}
            <Box component="span" sx={{ color: '#6366F1', fontWeight: 600 }}>React</Box>
            {', '}
            <Box component="span" sx={{ color: '#EC4899', fontWeight: 600 }}>Material UI</Box>
            {', and '}
            <Box component="span" sx={{ color: '#10B981', fontWeight: 600 }}>Socket.io</Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBar />
      {children}
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  // You can use location here for nav highlighting, etc.
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
      <Route path="/problems" element={<AppLayout><ProblemsPage /></AppLayout>} />
      <Route path="/problems/:id" element={<AppLayout><ProblemDetailPage /></AppLayout>} />
      <Route path="/rooms" element={<AppLayout><RoomsPage /></AppLayout>} />
      <Route path="/rooms/:code" element={<CollaborativeRoomPage />} />
      <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
