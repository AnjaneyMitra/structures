import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import { useLocation, Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import CodeIcon from '@mui/icons-material/Code';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: <HomeIcon /> },
  { label: 'Problems', path: '/problems', icon: <CodeIcon /> },
  { label: 'Rooms', path: '/rooms', icon: <GroupWorkIcon /> },
  { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const location = useLocation();
  const user = { name: localStorage.getItem('username') || 'User', avatar: '' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
        borderRight: '1px solid rgba(226, 232, 240, 0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 4, borderBottom: '1px solid rgba(226, 232, 240, 0.5)', position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Box
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              },
            }}
          >
            <CodeIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#1E293B" sx={{ fontSize: '1.5rem', lineHeight: 1.2 }}>
              CodeTogether
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              Collaborative Coding
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                selected={isActive}
                sx={{
                  mb: 1.5,
                  borderRadius: 3,
                  color: '#64748B',
                  mx: 2,
                  py: 1.5,
                  px: 2,
                  minHeight: 48,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '3px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #4F46E5 0%, #7C3AED 100%)',
                    transform: 'scaleY(0)',
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                    color: '#4F46E5',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
                    transform: 'translateX(8px)',
                    '&::before': {
                      transform: 'scaleY(1)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#4F46E5',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(79, 70, 229, 0.05)',
                    transform: 'translateX(4px)',
                    color: '#4F46E5',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 4, borderTop: '1px solid rgba(226, 232, 240, 0.5)', position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {user.name[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontWeight={600} color="#1E293B" sx={{ fontSize: '0.875rem' }}>
              {user.name}
            </Typography>
            <Typography variant="caption" color="#64748B" sx={{ fontSize: '0.75rem' }}>
              Premium Member
            </Typography>
          </Box>
          <ThemeToggle />
        </Stack>
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton 
            size="medium" 
            sx={{ 
              color: '#64748B',
              borderRadius: 2,
              width: 40,
              height: 40,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                color: '#4F46E5',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
              }
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="medium" 
            sx={{ 
              color: '#64748B',
              borderRadius: 2,
              width: 40,
              height: 40,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#EF4444',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              }
            }}
            onClick={handleLogout}
          >
            <PersonIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};