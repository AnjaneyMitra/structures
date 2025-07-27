import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrophyIcon, 
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  StarIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LevelBadge from '../components/LevelBadge';
import apiClient from '../utils/apiClient';

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

const LeaderboardPage: React.FC = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const leaderboardTypes = [
    { key: 'global', label: 'Global', icon: TrophyIcon, color: 'text-yellow-500' },
    { key: 'weekly', label: 'Weekly', icon: ArrowTrendingUpIcon, color: 'text-green-500' },
    { key: 'monthly', label: 'Monthly', icon: CalendarDaysIcon, color: 'text-blue-500' },
    { key: 'friends', label: 'Friends', icon: UserGroupIcon, color: 'text-purple-500' }
  ];

  const currentLeaderboardType = leaderboardTypes[activeTab].key;
  const currentLeaderboard = leaderboards[currentLeaderboardType as keyof typeof leaderboards];

  useEffect(() => {
    fetchAllLeaderboards();
    fetchStats();
  }, []);

  const fetchAllLeaderboards = async () => {
    try {
      setLoading(true);
      setError(null);

      const [globalRes, weeklyRes, monthlyRes, friendsRes] = await Promise.all([
        apiClient.get('/api/leaderboards/global?limit=50'),
        apiClient.get('/api/leaderboards/weekly?limit=50'),
        apiClient.get('/api/leaderboards/monthly?limit=50'),
        apiClient.get('/api/leaderboards/friends?limit=50').catch(() => ({ data: [] }))
      ]);

      setLeaderboards({
        global: globalRes.data,
        weekly: weeklyRes.data,
        monthly: monthlyRes.data,
        friends: friendsRes.data
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load leaderboards');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/leaderboards/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllLeaderboards();
    await fetchStats();
    setRefreshing(false);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <TrophyIcon className={`h-5 w-5 ${getRankColor(rank)}`} />;
    }
    return <span className="text-muted-foreground font-bold">#{rank}</span>;
  };

  const getCurrentUserRank = () => {
    const username = localStorage.getItem('username');
    if (!username) return null;
    
    const userEntry = currentLeaderboard.find(entry => entry.username === username);
    return userEntry?.rank || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2 flex items-center">
            <TrophyIcon className="h-8 w-8 mr-3 text-primary" />
            Leaderboards
          </h1>
          <p className="text-muted-foreground">
            Compete with developers worldwide and track your coding progress!
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {leaderboardTypes.map((type, index) => {
              const Icon = type.icon;
              const count = type.key === 'friends' 
                ? currentLeaderboard.length 
                : stats?.[type.key as keyof LeaderboardStats]?.count || 0;
              
              return (
                <div key={type.key} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-6 w-6 ${type.color}`} />
                      <div>
                        <p className="text-sm text-muted-foreground">{type.label}</p>
                        <p className="text-xl font-bold text-card-foreground">{count}</p>
                      </div>
                    </div>
                    {index === 0 && (
                      <button 
                        onClick={handleRefresh} 
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                        title="Refresh leaderboards"
                        disabled={refreshing}
                      >
                        <svg 
                          className={`h-4 w-4 ${refreshing ? 'text-primary animate-spin' : 'text-muted-foreground'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border">
            <div className="flex">
              {leaderboardTypes.map((type, index) => {
                const Icon = type.icon;
                const count = type.key === 'friends' 
                  ? currentLeaderboard.length 
                  : stats?.[type.key as keyof LeaderboardStats]?.count || 0;
                
                return (
                  <button
                    key={type.key}
                    onClick={() => setActiveTab(index)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === index
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-card-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{type.label}</span>
                    {count > 0 && (
                      <span className={`text-xs rounded-full px-2 py-1 ${
                        activeTab === index 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Current User Rank Display */}
            {getCurrentUserRank() && (
              <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-primary font-medium">Your Rank</p>
                    <p className="text-lg font-bold text-primary">#{getCurrentUserRank()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Content */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{leaderboardTypes[activeTab].label} Leaderboard</h3>
                {stats?.[currentLeaderboardType as keyof LeaderboardStats]?.last_updated && (
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(stats[currentLeaderboardType as keyof LeaderboardStats].last_updated!).toLocaleString()}
                  </p>
                )}
              </div>
              
              {currentLeaderboard.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrophyIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No entries yet</p>
                  <p className="text-sm">
                    {currentLeaderboardType === 'friends' 
                      ? 'Add friends to see their rankings!' 
                      : 'Start solving problems to appear on the leaderboard!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentLeaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        entry.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                        entry.rank === 2 ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800' :
                        entry.rank === 3 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                        entry.username === localStorage.getItem('username') ? 'bg-primary/10 border-primary/20' :
                        'bg-muted/50 border-border hover:bg-muted/70'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className={`font-medium ${
                                entry.username === localStorage.getItem('username') 
                                  ? 'text-primary font-bold' 
                                  : 'text-card-foreground'
                              }`}>
                                {entry.username}
                                {entry.username === localStorage.getItem('username') && (
                                  <span className="text-xs text-primary ml-1">(You)</span>
                                )}
                              </p>
                              <LevelBadge 
                                level={entry.level} 
                                title={entry.title}
                                size="small"
                                showTitle={false}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {entry.problems_solved} problems solved
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StarIcon className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-yellow-600">{entry.total_xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;