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
        width: 240,
        height: '100vh',
        background: 'linear-gradient(180deg, rgba(247, 246, 243, 0.95) 0%, rgba(251, 251, 250, 0.95) 100%)',
        borderRight: '1px solid rgba(235, 234, 230, 0.6)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(235, 234, 230, 0.6)' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #00D084 0%, #26D0CE 100%)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 208, 132, 0.3)',
            }}
          >
            <CodeIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#37352F" sx={{ fontSize: '1.1rem' }}>
            CodeTogether
          </Typography>
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
                  mb: 1,
                  borderRadius: 2,
                  color: '#787774',
                  mx: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #00D084 0%, #26D0CE 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0, 208, 132, 0.3)',
                    transform: 'translateX(4px)',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 208, 132, 0.08)',
                    transform: 'translateX(2px)',
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
      <Box sx={{ p: 3, borderTop: '1px solid rgba(235, 234, 230, 0.6)' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #00D084 0%, #26D0CE 100%)',
              fontSize: '0.875rem',
              boxShadow: '0 2px 8px rgba(0, 208, 132, 0.3)',
            }}
          >
            {user.name[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} color="#37352F" sx={{ fontSize: '0.875rem' }}>
              {user.name}
            </Typography>
          </Box>
          <ThemeToggle />
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <IconButton 
            size="small" 
            sx={{ 
              color: '#787774',
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 208, 132, 0.08)',
                color: '#00D084',
              }
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ 
              color: '#787774',
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(224, 62, 62, 0.08)',
                color: '#E03E3E',
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