import React, { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Stack,
  IconButton,
  useTheme,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CodeBracketIcon, 
  TrophyIcon, // Keep for leaderboards
  AcademicCapIcon, // New icon for achievements
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  ChevronLeftIcon 
} from '@heroicons/react/24/outline';
import { 
  Code as CodeIcon, 
  Settings as SettingsIcon, 
  Person as PersonIcon 
} from '@mui/icons-material';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: <HomeIcon className="w-5 h-5" /> },
  { label: 'Problems', path: '/problems', icon: <CodeBracketIcon className="w-5 h-5" /> },
  { label: 'Achievements', path: '/achievements', icon: <AcademicCapIcon className="w-5 h-5" /> }, // Changed icon
  { label: 'Leaderboards', path: '/leaderboards', icon: <TrophyIcon className="w-5 h-5" /> }, // Kept trophy
  { label: 'Analytics', path: '/analytics', icon: <ChartBarIcon className="w-5 h-5" /> },
  { label: 'Profile', path: '/profile', icon: <UserIcon className="w-5 h-5" /> },
  { label: 'Settings', path: '/settings', icon: <Cog6ToothIcon className="w-5 h-5" /> },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const user = { name: localStorage.getItem('username') || 'User', avatar: '' };
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const handleNavigation = (path: string) => {
    // Force navigation even if we're on a problem page
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      sx={{
        width: isCollapsed ? 80 : 280,
        height: '100vh',
        background: isDark 
          ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : 'linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
        borderRight: isDark 
          ? '1px solid rgba(71, 85, 105, 0.3)'
          : '1px solid rgba(226, 232, 240, 0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
        transition: 'width 0.3s ease-in-out',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? 'radial-gradient(circle at 50% 0%, rgba(129, 140, 248, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: isCollapsed ? 2 : 4, 
        borderBottom: isDark 
          ? '1px solid rgba(71, 85, 105, 0.3)'
          : '1px solid rgba(226, 232, 240, 0.5)', 
        position: 'relative', 
        zIndex: 1 
      }}>
        <Stack direction="row" alignItems="center" spacing={isCollapsed ? 0 : 3} justifyContent={isCollapsed ? 'center' : 'flex-start'}>
          <Box
            sx={{
              width: 48,
              height: 48,
              background: isDark
                ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark
                ? '0 8px 24px rgba(99, 102, 241, 0.4)'
                : '0 8px 24px rgba(79, 70, 229, 0.3)',
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
          {!isCollapsed && (
            <Box>
              <Typography 
                variant="h5" 
                fontWeight={800} 
                color={isDark ? '#F1F5F9' : '#1E293B'} 
                sx={{ fontSize: '1.5rem', lineHeight: 1.2 }}
              >
                CodeTogether
              </Typography>
              <Typography 
                variant="body2" 
                color={isDark ? '#94A3B8' : '#64748B'} 
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              >
                Collaborative Coding
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 1 }}>
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            return (
              <ListItemButton
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  mb: 1.5,
                  borderRadius: 3,
                  color: isDark ? '#94A3B8' : '#64748B',
                  mx: isCollapsed ? 1 : 2,
                  py: 1.5,
                  px: isCollapsed ? 1 : 2,
                  minHeight: 48,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
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
                    background: isDark
                      ? 'linear-gradient(180deg, #818CF8 0%, #A78BFA 100%)'
                      : 'linear-gradient(180deg, #4F46E5 0%, #7C3AED 100%)',
                    transform: 'scaleY(0)',
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease',
                  },
                  '&.Mui-selected': {
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                    color: isDark ? '#818CF8' : '#4F46E5',
                    fontWeight: 600,
                    boxShadow: isDark
                      ? '0 4px 12px rgba(129, 140, 248, 0.2)'
                      : '0 4px 12px rgba(79, 70, 229, 0.15)',
                    transform: 'translateX(8px)',
                    '&::before': {
                      transform: 'scaleY(1)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: isDark ? '#818CF8' : '#4F46E5',
                    },
                  },
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(129, 140, 248, 0.08)'
                      : 'rgba(79, 70, 229, 0.05)',
                    transform: 'translateX(4px)',
                    color: isDark ? '#818CF8' : '#4F46E5',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: isCollapsed ? 0 : 36,
                  justifyContent: 'center',
                  color: 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: isCollapsed ? 2 : 4, 
        borderTop: isDark 
          ? '1px solid rgba(71, 85, 105, 0.3)'
          : '1px solid rgba(226, 232, 240, 0.5)', 
        position: 'relative', 
        zIndex: 1 
      }}>
        {!isCollapsed && (
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: isDark
                  ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                  : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: isDark
                  ? '0 4px 16px rgba(99, 102, 241, 0.4)'
                  : '0 4px 16px rgba(79, 70, 229, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {user.name[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="body1" 
                fontWeight={600} 
                color={isDark ? '#F1F5F9' : '#1E293B'} 
                sx={{ fontSize: '0.875rem' }}
              >
                {user.name}
              </Typography>
              <Typography 
                variant="caption" 
                color={isDark ? '#94A3B8' : '#64748B'} 
                sx={{ fontSize: '0.75rem' }}
              >
                Premium Member
              </Typography>
            </Box>
            <ThemeToggle />
          </Stack>
        )}
        
        <Stack direction={isCollapsed ? "column" : "row"} spacing={2} justifyContent="center">
          {isCollapsed && <ThemeToggle />}
          <IconButton 
            size="medium" 
            sx={{ 
              color: isDark ? '#94A3B8' : '#64748B',
              borderRadius: 2,
              width: 40,
              height: 40,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: isDark
                  ? 'rgba(129, 140, 248, 0.1)'
                  : 'rgba(79, 70, 229, 0.08)',
                color: isDark ? '#818CF8' : '#4F46E5',
                transform: 'translateY(-2px)',
                boxShadow: isDark
                  ? '0 4px 12px rgba(129, 140, 248, 0.3)'
                  : '0 4px 12px rgba(79, 70, 229, 0.2)',
              }
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="medium" 
            sx={{ 
              color: isDark ? '#94A3B8' : '#64748B',
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

      {/* Collapse button - positioned to move with sidebar */}
      <IconButton
        onClick={() => setIsCollapsed(!isCollapsed)}
        sx={{
          position: 'absolute',
          top: 16,
          right: -20,
          width: 40,
          height: 40,
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(226, 232, 240, 0.5)',
          boxShadow: isDark 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          transform: isCollapsed ? 'translateX(-40px)' : 'translateX(0px)',
          transitionDelay: isCollapsed ? '0ms' : '150ms',
          zIndex: 1201,
          '&:hover': {
            backgroundColor: isDark ? '#334155' : '#F8FAFC',
            boxShadow: isDark 
              ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
              : '0 6px 16px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <ChevronLeftIcon 
          className={`w-5 h-5 transition-transform duration-300 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
          style={{ color: isDark ? '#94A3B8' : '#64748B' }}
        />
      </IconButton>
    </Box>
  );
};