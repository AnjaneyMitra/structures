import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Pagination
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import secureApiClient from '../utils/secureApiClient';

interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  total_xp: number;
  problems_solved: number;
  level: number;
  title: string;
}

interface LeaderboardStats {
  global: { count: number; last_updated: string | null };
  weekly: { count: number; last_updated: string | null };
  monthly: { count: number; last_updated: string | null };
}

const GlobalLeaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [leaderboards, setLeaderboards] = useState<{
    global: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    friends: LeaderboardEntry[];
  }>({
    global: [],
    weekly: [],
    monthly: [],
    friends: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const leaderboardTypes = [
    { key: 'global', label: 'Global', icon: <TrophyIcon /> },
    { key: 'weekly', label: 'Weekly', icon: <TrendingIcon /> },
    { key: 'monthly', label: 'Monthly', icon: <CalendarIcon /> },
    { key: 'friends', label: 'Friends', icon: <PeopleIcon /> }
  ];

  const currentLeaderboardType = leaderboardTypes[activeTab].key;
  const currentLeaderboard = leaderboards[currentLeaderboardType as keyof typeof leaderboards];

  useEffect(() => {
    fetchLeaderboard(currentLeaderboardType);
    fetchStats();
  }, [activeTab, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLeaderboard = async (type: string) => {
    try {
      setLoading(true);
      setError(null);

      const limit = 20;
      const offset = (page - 1) * limit;

      const response = await secureApiClient.get(
        `/api/leaderboards/${type}?limit=${limit}&offset=${offset}`
      );

      setLeaderboards(prev => ({
        ...prev,
        [type]: response
      }));

    } catch (err: any) {
      console.error(`Error fetching ${type} leaderboard:`, err);
      setError(err.response?.data?.detail || `Failed to load ${type} leaderboard`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await secureApiClient.get('/api/leaderboards/stats');
      setStats(response);
    } catch (err) {
      console.error('Error fetching leaderboard stats:', err);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard(currentLeaderboardType);
    await fetchStats();
    setRefreshing(false);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return 'var(--color-muted-foreground)';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <TrophyIcon sx={{ color: getRankColor(rank), fontSize: 20 }} />;
    }
    return (
      <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)', fontWeight: 600 }}>
        #{rank}
      </Typography>
    );
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'var(--color-foreground)', mb: 1, fontWeight: 700 }}>
          Leaderboards
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--color-muted-foreground)' }}>
          Compete with other developers and track your progress
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {Object.entries(stats).map(([type, data]) => (
            <Card key={type} sx={{ 
              flex: 1, 
              minWidth: 150,
              bgcolor: 'var(--color-card)', 
              border: '1px solid var(--color-border)' 
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)', textTransform: 'uppercase' }}>
                  {type}
                </Typography>
                <Typography variant="h6" sx={{ color: 'var(--color-foreground)', fontWeight: 600 }}>
                  {data.count} users
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)' }}>
                  Updated: {formatLastUpdated(data.last_updated)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Main Leaderboard Card */}
      <Card sx={{ 
        bgcolor: 'var(--color-card)', 
        border: '1px solid var(--color-border)',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid var(--color-border)' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': { 
                color: 'var(--color-muted-foreground)',
                fontWeight: 600
              },
              '& .Mui-selected': { color: 'var(--color-primary)' },
              '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)' }
            }}
          >
            {leaderboardTypes.map((type, index) => (
              <Tab 
                key={type.key}
                icon={type.icon} 
                label={type.label}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 0 }}>
          {/* Header with refresh button */}
          <Box sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'var(--color-foreground)', fontWeight: 600 }}>
              {leaderboardTypes[activeTab].label} Leaderboard
            </Typography>
            <Button
              size="small"
              onClick={handleRefresh}
              disabled={refreshing}
              startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              sx={{ color: 'var(--color-muted-foreground)' }}
            >
              Refresh
            </Button>
          </Box>

          {/* Error State */}
          {error && (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Leaderboard List */}
          {!loading && !error && (
            <>
              <List sx={{ p: 0 }}>
                {currentLeaderboard.map((entry, index) => (
                  <ListItem 
                    key={entry.id}
                    sx={{ 
                      borderBottom: index < currentLeaderboard.length - 1 ? '1px solid var(--color-border)' : 'none',
                      py: 2,
                      px: 3
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: entry.rank <= 3 ? getRankColor(entry.rank) : 'var(--color-muted)',
                        color: entry.rank <= 3 ? 'white' : 'var(--color-muted-foreground)',
                        width: 40,
                        height: 40
                      }}>
                        {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ color: 'var(--color-foreground)', fontWeight: 600 }}>
                            {entry.username}
                          </Typography>
                          <Chip 
                            label={entry.title}
                            size="small"
                            sx={{ 
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: 'var(--color-primary)',
                              color: 'white'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)' }}>
                          Level {entry.level} • {entry.problems_solved} problems solved
                        </Typography>
                      }
                    />
                    
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                        {entry.total_xp.toLocaleString()} XP
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>

              {/* Empty State */}
              {currentLeaderboard.length === 0 && (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="body1" sx={{ color: 'var(--color-muted-foreground)' }}>
                    No entries found for {leaderboardTypes[activeTab].label.toLowerCase()} leaderboard
                  </Typography>
                </Box>
              )}

              {/* Pagination */}
              {currentLeaderboard.length > 0 && currentLeaderboard.length === 20 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Pagination
                    count={10} // Assume max 10 pages for now
                    page={page}
                    onChange={(event, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default GlobalLeaderboard;