import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Stack, Button, Grid } from '@mui/material';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TailwindDashboardPage from './pages/TailwindDashboardPage';
import TailwindProblemsPage from './pages/TailwindProblemsPage';
import TailwindRoomsPage from './pages/TailwindRoomsPage';
import TailwindProfilePage from './pages/TailwindProfilePage';
import TailwindFriendsPage from './pages/TailwindFriendsPage';
import { TailwindSidebar } from './components/TailwindSidebar';
import ProblemDetailPage from './pages/ProblemDetailPage';
import CollaborativeRoomPage from './pages/CollaborativeRoomPage';

function Landing() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) => theme.palette.mode === 'dark'
            ? `
              radial-gradient(circle at 30% 70%, rgba(129, 140, 248, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(244, 114, 182, 0.1) 0%, transparent 50%)
            `
            : `
              radial-gradient(circle at 30% 70%, rgba(79, 70, 229, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)
            `,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={8} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 3, 
                fontSize: { xs: '2.5rem', md: '3.5rem' }, 
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.2,
              }}
            >
              Code Together, Solve Faster
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                color: 'text.secondary', 
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Join your friends in solving Data Structures & Algorithms problems. 
              Practice individually or collaborate in real-time with built-in pair programming features.
            </Typography>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mb: 4 }}
            >
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                sx={{ minWidth: 180 }}
              >
                Start Coding Together
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                size="large"
                sx={{ minWidth: 160 }}
              >
                Browse Problems →
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              What's new: Just shipped v0.1.0 ✨
            </Typography>
          </Grid>

          {/* Right Content - Code Preview */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                p: 0.5,
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 20px 40px rgba(79, 70, 229, 0.3)'
                  : '0 20px 40px rgba(79, 70, 229, 0.2)',
              }}
            >
              <Paper
                sx={{
                  p: 4,
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#0F172A' : '#1a1a1a',
                  borderRadius: 3,
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Terminal Header */}
                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF5F57' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28CA42' }} />
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                    two-sum.js
                  </Typography>
                </Stack>

                {/* Code Content */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1.8,
                    fontSize: '0.875rem',
                  }}
                >
                  <Box component="span" sx={{ color: '#7C7C7C' }}>
                    {`// Given an array of integers and target, return indices`}<br />
                    {`// of the two numbers that add up to target.`}<br /><br />
                  </Box>
                  <Box component="span" sx={{ color: '#FF79C6' }}>function</Box>{' '}
                  <Box component="span" sx={{ color: '#50FA7B' }}>twoSum</Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>(</Box>
                  <Box component="span" sx={{ color: '#FFB86C' }}>nums</Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>, </Box>
                  <Box component="span" sx={{ color: '#FFB86C' }}>target</Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>) {`{`}<br /></Box>
                  <Box component="span" sx={{ color: '#FF79C6' }}>  const</Box>{' '}
                  <Box component="span" sx={{ color: '#F8F8F2' }}>map = </Box>
                  <Box component="span" sx={{ color: '#FF79C6' }}>new</Box>{' '}
                  <Box component="span" sx={{ color: '#50FA7B' }}>Map</Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>();<br /></Box>
                  <Box component="span" sx={{ color: '#FF79C6' }}>  for</Box>{' '}
                  <Box component="span" sx={{ color: '#F8F8F2' }}>(</Box>
                  <Box component="span" sx={{ color: '#FF79C6' }}>let</Box>{' '}
                  <Box component="span" sx={{ color: '#F8F8F2' }}>i = </Box>
                  <Box component="span" sx={{ color: '#BD93F9' }}>0</Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>; i {'<'} nums.length; i++) {`{`}<br /></Box>
                  <Box component="span" sx={{ color: '#FF79C6' }}>    const</Box>{' '}
                  <Box component="span" sx={{ color: '#F8F8F2' }}>complement = target - nums[i];<br /></Box>
                  <Box component="span" sx={{ color: '#FF79C6' }}>    if</Box>{' '}
                  <Box component="span" sx={{ color: '#F8F8F2' }}>(map.</Box>
                  <Box component="span" sx={{ color: '#50FA7B' }}>has</Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>(complement)) {`{`}<br /></Box>
                  <Box component="span" sx={{ color: '#FF79C6' }}>      return</Box>{' '}
                  <Box component="span" sx={{ color: '#F8F8F2' }}>[map.</Box>
                  <Box component="span" sx={{ color: '#50FA7B' }}>get</Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>(complement), i];<br /></Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>    {`}`}<br /></Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>    map.</Box>
                  <Box component="span" sx={{ color: '#50FA7B' }}>set</Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>(nums[i], i);<br /></Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>  {`}`}<br /></Box>
                  <Box component="span" sx={{ color: '#F8F8F2' }}>{`}`}</Box>
                </Typography>

                {/* Animated cursor */}
                <Box
                  sx={{
                    display: 'inline-block',
                    width: 2,
                    height: 20,
                    backgroundColor: '#00D084',
                    ml: 0.5,
                    animation: 'blink 1s infinite',
                    '@keyframes blink': {
                      '0%, 50%': { opacity: 1 },
                      '51%, 100%': { opacity: 0 },
                    },
                  }}
                />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Determine if we are on a problem or room page for auto-collapse
  const isProblemPage = /^\/problems\/[\w-]+$/.test(location.pathname);
  const isRoomPage = /^\/rooms\/[\w-]+\/[\w-]+$/.test(location.pathname);

  // Auto-collapse sidebar on problem/room pages, but don't auto-expand on other pages
  useEffect(() => {
    if (isProblemPage || isRoomPage) {
      setSidebarOpen(false);
    }
    // Remove the auto-expand behavior for other pages
  }, [location.pathname, isProblemPage, isRoomPage]);

  return (
    <div className="flex">
      <TailwindSidebar 
        open={sidebarOpen} 
        onToggle={setSidebarOpen}
      />
      <main 
        className={`flex-grow min-h-screen bg-background relative page-transition ${
          sidebarOpen ? 'ml-[280px]' : 'ml-[72px]'
        }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(circle at 25% 25%, rgba(79, 70, 229, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)
            `
          }} />
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(45deg, transparent 49%, rgba(79, 70, 229, 0.01) 50%, transparent 51%),
                linear-gradient(-45deg, transparent 49%, rgba(236, 72, 153, 0.01) 50%, transparent 51%)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        <div className="relative z-10 page-slide-in">
          {children}
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {

  // You can use location here for nav highlighting, etc.
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<AppLayout><TailwindDashboardPage /></AppLayout>} />
      <Route path="/problems" element={<AppLayout><TailwindProblemsPage /></AppLayout>} />
      <Route path="/problems/:id" element={<AppLayout><ProblemDetailPage /></AppLayout>} />
      <Route path="/rooms" element={<AppLayout><TailwindRoomsPage /></AppLayout>} />
      <Route path="/rooms/:code/:problem_id" element={<AppLayout><CollaborativeRoomPage /></AppLayout>} />
      <Route path="/profile" element={<AppLayout><TailwindProfilePage /></AppLayout>} />
      <Route path="/friends" element={<AppLayout><TailwindFriendsPage /></AppLayout>} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
