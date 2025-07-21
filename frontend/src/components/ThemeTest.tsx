import React from 'react';
import { Box, Button, Card, CardContent, Typography, TextField, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ThemeToggle } from './ThemeToggle';

export const ThemeTest: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Theme Test Component
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <ThemeToggle />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Current theme: {isDark ? 'Dark' : 'Light'}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Sample Card
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This card demonstrates the glassmorphism effect and theme-aware styling.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label="Success" color="success" />
            <Chip label="Warning" color="warning" />
            <Chip label="Error" color="error" />
            <Chip label="Primary" color="primary" />
            <Chip label="Secondary" color="secondary" />
          </Box>

          <TextField
            label="Sample Input"
            placeholder="Type something..."
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained">
              Contained Button
            </Button>
            <Button variant="outlined">
              Outlined Button
            </Button>
            <Button variant="text">
              Text Button
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary">
        Theme colors and effects should adapt automatically when switching between light and dark modes.
      </Typography>
    </Box>
  );
};