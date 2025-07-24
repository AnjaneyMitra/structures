import React, { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Tooltip,
  Divider,
  Typography
} from '@mui/material';
import { 
  Palette as PaletteIcon,
  LightMode,
  DarkMode,
  Contrast,
  Circle
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const themeOptions = [
  { 
    value: 'light' as const, 
    label: 'Light', 
    icon: <LightMode />, 
    color: '#4f46e5' 
  },
  { 
    value: 'dark' as const, 
    label: 'Dark', 
    icon: <DarkMode />, 
    color: '#6366f1' 
  },
  { 
    value: 'high-contrast' as const, 
    label: 'High Contrast', 
    icon: <Contrast />, 
    color: '#ffff00' 
  },
  { 
    value: 'blue' as const, 
    label: 'Blue Dark', 
    icon: <Circle />, 
    color: '#2563eb' 
  },
  { 
    value: 'green' as const, 
    label: 'Green Dark', 
    icon: <Circle />, 
    color: '#059669' 
  },
  { 
    value: 'purple' as const, 
    label: 'Purple Dark', 
    icon: <Circle />, 
    color: '#7c3aed' 
  },
];

export const ThemeSelector: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (theme: typeof themeMode) => {
    setThemeMode(theme);
    handleClose();
  };

  const currentTheme = themeOptions.find(option => option.value === themeMode);

  return (
    <>
      <Tooltip title="Change theme">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: currentTheme?.color || 'text.primary',
            '&:hover': {
              backgroundColor: 'rgba(79, 70, 229, 0.04)'
            }
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: 200,
            mt: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Choose Theme
        </Typography>
        <Divider />
        
        {themeOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleThemeSelect(option.value)}
            selected={themeMode === option.value}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(79, 70, 229, 0.12)',
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: option.color, minWidth: 36 }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText 
              primary={option.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: themeMode === option.value ? 600 : 400
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};