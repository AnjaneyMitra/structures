import React, { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemText, 
  Tooltip,
  Divider,
  Typography
} from '@mui/material';
import { 
  FormatSize as FontSizeIcon
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const fontSizeOptions = [
  { value: 'small' as const, label: 'Small', description: '14px' },
  { value: 'medium' as const, label: 'Medium', description: '16px' },
  { value: 'large' as const, label: 'Large', description: '18px' },
  { value: 'extra-large' as const, label: 'Extra Large', description: '20px' },
];

export const FontSizeSelector: React.FC = () => {
  const { fontSize, setFontSize } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFontSizeSelect = (size: typeof fontSize) => {
    setFontSize(size);
    handleClose();
  };

  const currentFontSize = fontSizeOptions.find(option => option.value === fontSize);

  return (
    <>
      <Tooltip title={`Font size: ${currentFontSize?.label || 'Medium'}`}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'rgba(79, 70, 229, 0.04)'
            }
          }}
        >
          <FontSizeIcon />
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
            minWidth: 180,
            mt: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Font Size
        </Typography>
        <Divider />
        
        {fontSizeOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleFontSizeSelect(option.value)}
            selected={fontSize === option.value}
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
            <ListItemText 
              primary={option.label}
              secondary={option.description}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: fontSize === option.value ? 600 : 400
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem'
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};