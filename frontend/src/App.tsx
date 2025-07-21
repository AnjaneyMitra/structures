import React from 'react';
import { Box, Container, Paper, Typography, Stack, Button } from '@mui/material';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AppBar from './components/AppBar';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import RoomsPage from './pages/RoomsPage';
import ProfilePage from './pages/ProfilePage';
import CollaborativeRoomPage from './pages/CollaborativeRoomPage';

const bgGradient = 'linear-gradient(135deg, #6C63FF 0%, #3A86FF 100%)';

function Landing() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: bgGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0,
      }}
    >
      <Container maxWidth="md" sx={{ zIndex: 2 }}>
        <Paper elevation={6} sx={{ p: { xs: 3, md: 6 }, borderRadius: 6, textAlign: 'center', background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800, letterSpacing: '-0.03em', color: 'primary.main', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
            DSA Collaborative
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary', fontWeight: 400 }}>
            Solve Data Structures & Algorithms problems together in real time.<br />
            Beautiful, modern, and collaborative—like LeetCode, but social.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 2 }}>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              sx={{ fontWeight: 700, fontSize: '1.1rem', px: 4, borderRadius: 3, boxShadow: 2 }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              size="large"
              startIcon={<PersonAddIcon />}
              sx={{ fontWeight: 700, fontSize: '1.1rem', px: 4, borderRadius: 3, boxShadow: 2 }}
            >
              Register
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
            Built with <span style={{ color: '#6C63FF', fontWeight: 600 }}>React</span>, <span style={{ color: '#3A86FF', fontWeight: 600 }}>Material UI</span>, and <span style={{ color: '#FF6584', fontWeight: 600 }}>Socket.io</span>.
          </Typography>
        </Paper>
      </Container>
      <Box
        sx={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          top: 0,
          left: 0,
          background: 'radial-gradient(circle at 70% 30%, #FF6584 0%, transparent 60%), radial-gradient(circle at 20% 80%, #43AA8B 0%, transparent 70%)',
          opacity: 0.18,
        }}
      />
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
