import React from 'react';
import { AppBar as MUIAppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Button, Box, Avatar, Stack, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Drawer from '@mui/material/Drawer';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import ChallengeNotifications from './ChallengeNotifications';

const navLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon sx={{ mr: 1 }} /> },
  { label: 'Problems', to: '/problems', icon: <ListAltIcon sx={{ mr: 1 }} /> },
  { label: 'Rooms', to: '/rooms', icon: <GroupWorkIcon sx={{ mr: 1 }} /> },
  { label: 'Profile', to: '/profile', icon: <AccountCircleIcon sx={{ mr: 1 }} /> },
];

const AppBar: React.FC = () => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Dummy user avatar (replace with real user info)
  const user = { name: localStorage.getItem('username') || 'User', avatar: '' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <MUIAppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        background: 'rgba(255,255,255,0.97)',
        borderBottom: '1.5px solid #ececec',
        boxShadow: '0 2px 16px 0 rgba(108,99,255,0.06)',
        backdropFilter: 'blur(8px)',
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontWeight: 800,
              color: 'primary.main',
              textDecoration: 'none',
              letterSpacing: '-0.03em',
              fontSize: { xs: '1.3rem', md: '2rem' },
              transition: 'color 0.2s',
              '&:hover': { color: 'secondary.main' },
            }}
          >
            DSA Collab
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}>
            {navLinks.map(link => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                color={location.pathname.startsWith(link.to) ? 'primary' : 'inherit'}
                startIcon={link.icon}
                sx={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  mx: 1,
                  borderBottom: location.pathname.startsWith(link.to) ? '2.5px solid #6C63FF' : '2.5px solid transparent',
                  borderRadius: 0,
                  textTransform: 'none',
                  transition: 'all 0.18s',
                  background: location.pathname.startsWith(link.to) ? 'rgba(108,99,255,0.08)' : 'transparent',
                  color: location.pathname.startsWith(link.to) ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    background: 'rgba(108,99,255,0.13)',
                    color: 'secondary.main',
                    borderBottom: '2.5px solid #FF6584',
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}>
            <IconButton
              aria-label="Open navigation menu"
              onClick={() => setDrawerOpen(true)}
              size="large"
              edge="start"
              color="inherit"
              sx={{ p: 1 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <ChallengeNotifications />
          <ThemeToggle />
          <Tooltip title="Account">
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleMenu}
              sx={{ p: 0 }}
              aria-label="Open account menu"
            >
              <Avatar 
                alt={user.name} 
                src={user.avatar} 
                sx={{ 
                  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                  width: 44, 
                  height: 44, 
                  fontWeight: 700, 
                  border: '2px solid rgba(255, 255, 255, 0.2)', 
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 6px 30px rgba(99, 102, 241, 0.4)',
                  }
                }}
              >
                {user.name[0]}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ 
              sx: { 
                borderRadius: 4, 
                minWidth: 180,
                mt: 1,
                boxShadow: '0 8px 40px rgba(99, 102, 241, 0.15)',
              } 
            }}
          >
            <MenuItem 
              onClick={handleClose} 
              component={Link} 
              to="/profile"
              sx={{ 
                borderRadius: 2, 
                mx: 1, 
                my: 0.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                }
              }}
            >
              <AccountCircleIcon sx={{ mr: 2, color: '#6366F1' }} /> Profile
            </MenuItem>
            <MenuItem 
              onClick={() => { handleClose(); handleLogout(); }}
              sx={{ 
                borderRadius: 2, 
                mx: 1, 
                my: 0.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                }
              }}
            >
              <LogoutIcon sx={{ mr: 2, color: '#EF4444' }} /> Logout
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 240, pt: 2 } }}
        ModalProps={{ keepMounted: true }}
        aria-label="Mobile navigation drawer"
      >
        <Stack spacing={2} sx={{ px: 2 }}>
          {navLinks.map(link => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              color={location.pathname.startsWith(link.to) ? 'primary' : 'inherit'}
              startIcon={link.icon}
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                justifyContent: 'flex-start',
                borderRadius: 2,
                textTransform: 'none',
                background: location.pathname.startsWith(link.to) ? 'rgba(108,99,255,0.08)' : 'transparent',
                color: location.pathname.startsWith(link.to) ? 'primary.main' : 'text.primary',
                '&:hover': {
                  background: 'rgba(108,99,255,0.13)',
                  color: 'secondary.main',
                },
              }}
              onClick={() => setDrawerOpen(false)}
              aria-label={`Go to ${link.label}`}
            >
              {link.label}
            </Button>
          ))}
        </Stack>
      </Drawer>
    </MUIAppBar>
  );
};

export default AppBar; 