import React from 'react';
import { Box } from '@mui/material';
import GlobalLeaderboard from '../components/GlobalLeaderboard';

const LeaderboardPage: React.FC = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'var(--color-background)',
      py: 3
    }}>
      <GlobalLeaderboard />
    </Box>
  );
};

export default LeaderboardPage;