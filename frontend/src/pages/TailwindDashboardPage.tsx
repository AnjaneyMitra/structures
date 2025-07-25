import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BoltIcon, 
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import AchievementBadge from '../components/AchievementBadge';
import { Achievement } from '../types/achievements';
import LevelBadge from '../components/LevelBadge';
import { UserProfileWithLevel } from '../types/levels';
import HorizontalStreakCalendar from '../components/HorizontalStreakCalendar';
import SuccessRateChart from '../components/SuccessRateChart';

interface UserProfile extends UserProfileWithLevel {}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  view_count: number;
  solve_count: number;
  attempt_count: number;
}

const TailwindDashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ 
    total_submissions: number; 
    problems_solved: number; 
    total_xp: number;
    current_streak: number;
    longest_streak: number;
    streak_active: boolean;
  } | null>(null);
  const [streakStats, setStreakStats] = useState<{
    current_streak_rank: number;
    longest_streak: number;
  } | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle OAuth callback parameters if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('access_token');
    const username = params.get('username');
    
    console.log('Dashboard: OAuth callback params:', { 
      hasToken: !!token, 
      hasUsername: !!username,
      url: location.search 
    });
    
    if (token && username) {
      console.log('Dashboard: Cleaning up URL parameters');
      // Remove the query parameters from the URL (AuthContext handles the token)
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const userRes = await axios.get('https://structures-production.up.railway.app/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);
        const probRes = await axios.get('https://structures-production.up.railway.app/api/problems/popular/list?limit=6');
        setProblems(probRes.data);
        const statsRes = await axios.get('https://structures-production.up.railway.app/api/profile/stats/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);
        
        // Fetch streak stats for detailed information
        try {
          const streakStatsRes = await axios.get('https://structures-production.up.railway.app/api/streaks/stats', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStreakStats({
            current_streak_rank: streakStatsRes.data.current_streak_rank,
            longest_streak: streakStatsRes.data.longest_streak
          });
        } catch (streakError) {
          console.log('Failed to load streak stats:', streakError);
        }
        
        // Fetch recent achievements
        try {
          const achievementsRes = await axios.get('https://structures-production.up.railway.app/api/achievements/user', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const earnedAchievements = achievementsRes.data.achievements
            .filter((a: Achievement) => a.earned)
            .sort((a: Achievement, b: Achievement) => 
              new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime()
            )
            .slice(0, 4); // Show only 4 most recent
          setRecentAchievements(earnedAchievements);
        } catch (achievementError) {
          console.log('Failed to load achievements:', achievementError);
          // Don't fail the whole dashboard if achievements fail
        }
      } catch (err: any) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProblemClick = (problemId: number) => {
    navigate(`/problems/${problemId}`);
  };

  const formatUsername = (username: string) => {
    return username ? username.split(' ').map(name => 
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    ).join(' ') : '';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Container with 12-column grid system */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Welcome Header - Full Width */}
          <section className="col-span-12">
            <div className="bg-card/30 backdrop-blur-sm rounded-xl p-8 border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    {getGreeting()}, {user?.username ? formatUsername(user.username) : ''}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Ready to solve some problems today?
                  </p>
                </div>
                {user?.level && user?.title && (
                  <div className="hidden md:flex md:items-center md:space-x-6">
                    <LevelBadge 
                      level={user.level} 
                      title={user.title}
                      size="large"
                    />
                    {/* Streak Stats */}
                    {stats && (
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-orange-500 font-bold text-lg">{stats.longest_streak}</div>
                          <div className="text-muted-foreground text-xs">Personal Best</div>
                        </div>
                        {streakStats && (
                          <div className="text-center">
                            <div className="text-primary font-bold text-lg">#{streakStats.current_streak_rank}</div>
                            <div className="text-muted-foreground text-xs">Current Rank</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Main Content Section - Split Layout */}
          <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Featured Problems Section - Left Side with Scroll */}
            <section className="lg:col-span-1">
              <div className="bg-card/20 backdrop-blur-sm rounded-xl border border-border/30 h-fit max-h-[600px] flex flex-col">
                <div className="flex items-center justify-between p-8 pb-4">
                  <h2 className="text-2xl font-bold text-foreground">Popular Problems</h2>
                  <Link 
                    to="/problems"
                    className="inline-flex items-center px-4 py-2 border border-primary/60 text-primary bg-transparent rounded-lg hover:bg-primary/10 hover:border-primary hover:scale-105 active:scale-95 transition-all duration-200 font-medium text-sm"
                  >
                    View All
                  </Link>
                </div>
                
                {/* Scrollable Problem List - Horizontal Layout */}
                <div className="px-8 pb-8 overflow-y-auto flex-1">
                  <div className="space-y-0 divide-y divide-border/30">
                    {problems.map((problem, index) => (
                      <div 
                        key={problem.id} 
                        className="flex items-center justify-between py-3 px-4 hover:bg-card/50 transition-all duration-200 group cursor-pointer first:pt-0 last:pb-0"
                        onClick={() => handleProblemClick(problem.id)}
                      >
                        {/* Left Side: Number + Title */}
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Problem Number */}
                          <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                          </div>
                          
                          {/* Problem Title */}
                          <h3 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors duration-200 truncate">
                            {problem.title}
                          </h3>
                        </div>
                        
                        {/* Right Side: View Count + Difficulty */}
                        <div className="flex items-center space-x-6 flex-shrink-0">
                          {/* View Count */}
                          <div className="hidden sm:block text-right min-w-[60px]">
                            <span className="text-sm text-muted-foreground">
                              {problem.view_count} view{problem.view_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          {/* Difficulty Badge */}
                          <div className="min-w-[70px] text-right">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              problem.difficulty === 'Easy' 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : problem.difficulty === 'Medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            }`}>
                              {problem.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Cards Section - Right Side Fixed */}
            {stats && (
              <section className="lg:col-span-1">
                <div className="bg-card/20 backdrop-blur-sm rounded-xl p-8 border border-border/30 h-fit">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Your Progress</h2>
                  <div className="grid grid-cols-2 gap-4 h-fit">
                    <div className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-2.5 bg-primary/10 rounded-lg mb-2.5">
                          <CheckCircleIcon className="h-7 w-7 text-primary" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Problems Solved</p>
                        <p className="text-xl font-bold text-primary">{stats.problems_solved}</p>
                      </div>
                    </div>
                    
                    <div className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-2.5 bg-accent/10 rounded-lg mb-2.5">
                          <BoltIcon className="h-7 w-7 text-accent" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Total Submissions</p>
                        <p className="text-xl font-bold text-accent">{stats.total_submissions}</p>
                      </div>
                    </div>

                    <div className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-2.5 bg-yellow-500/10 rounded-lg mb-2.5">
                          <StarIcon className="h-7 w-7 text-yellow-500" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Total XP</p>
                        <p className="text-xl font-bold text-yellow-600">{stats.total_xp || 0}</p>
                      </div>
                    </div>

                    <Link 
                      to="/streaks"
                      className={`bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer block ${
                        stats.current_streak > 0 ? '' : 'opacity-60'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`p-2.5 rounded-lg mb-2.5 ${
                          stats.current_streak > 0 
                            ? 'bg-orange-500/10' 
                            : 'bg-muted/10'
                        }`}>
                          <div className={`h-7 w-7 flex items-center justify-center ${
                            stats.current_streak > 0 
                              ? 'text-orange-500' 
                              : 'text-muted-foreground'
                          }`}>
                            🔥
                          </div>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Current Streak
                        </p>
                        <p className={`text-xl font-bold ${
                          stats.current_streak > 0 
                            ? 'text-orange-500' 
                            : 'text-muted-foreground'
                        }`}>
                          {stats.current_streak || 0}
                        </p>
                        {stats.longest_streak > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Best: {stats.longest_streak}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                  
                  {/* Recent Achievements Section */}
                  {recentAchievements.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Recent Achievements</h3>
                        <Link 
                          to="/achievements"
                          className="text-sm text-primary hover:text-primary-dark transition-colors duration-200"
                        >
                          View All
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {recentAchievements.map((achievement) => (
                          <div 
                            key={achievement.id}
                            className="bg-card rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => navigate('/achievements')}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <AchievementBadge achievement={achievement} size="small" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {achievement.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  +{achievement.xp_reward} XP
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Success Rate Analytics Section - Full Width */}
          <section className="col-span-12 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SuccessRateChart />
              <div className="bg-card/20 backdrop-blur-sm rounded-xl p-6 border border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/problems"
                    className="flex items-center justify-between p-4 bg-card rounded-lg border hover:bg-card/80 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BoltIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Practice Problems</p>
                        <p className="text-sm text-muted-foreground">Solve coding challenges</p>
                      </div>
                    </div>
                    <span className="text-muted-foreground">→</span>
                  </Link>
                  
                  <Link 
                    to="/analytics"
                    className="flex items-center justify-between p-4 bg-card rounded-lg border hover:bg-card/80 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <StarIcon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">View Analytics</p>
                        <p className="text-sm text-muted-foreground">Detailed performance insights</p>
                      </div>
                    </div>
                    <span className="text-muted-foreground">→</span>
                  </Link>
                  
                  <Link 
                    to="/rooms"
                    className="flex items-center justify-between p-4 bg-card rounded-lg border hover:bg-card/80 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Join Room</p>
                        <p className="text-sm text-muted-foreground">Collaborate with friends</p>
                      </div>
                    </div>
                    <span className="text-muted-foreground">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Streak Calendar Section - Moved down with proper spacing */}
        <div className="mt-8 pt-6 border-t border-border/20">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl">
              <HorizontalStreakCalendar days={100} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindDashboardPage;
