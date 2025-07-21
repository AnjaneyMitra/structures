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
        backgroundColor: '#F7F6F3',
        borderRight: '1px solid #EBEAE6',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #EBEAE6' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 28,
              height: 28,
              backgroundColor: '#00D084',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CodeIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="#37352F" sx={{ fontSize: '1rem' }}>
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
                  mb: 0.5,
                  borderRadius: 1,
                  color: '#787774',
                  '&.Mui-selected': {
                    backgroundColor: '#00D084',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#EBEAE6',
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
      <Box sx={{ p: 2, borderTop: '1px solid #EBEAE6' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              backgroundColor: '#00D084',
              fontSize: '0.75rem',
            }}
          >
            {user.name[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={500} color="#37352F" sx={{ fontSize: '0.875rem' }}>
              {user.name}
            </Typography>
          </Box>
          <ThemeToggle />
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <IconButton size="small" sx={{ color: '#787774' }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ color: '#787774' }}
            onClick={handleLogout}
          >
            <PersonIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};