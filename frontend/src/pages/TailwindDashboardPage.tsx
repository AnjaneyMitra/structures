import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BoltIcon, 
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: number;
  username: string;
  total_xp: number;
}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
}

const TailwindDashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ total_submissions: number; problems_solved: number; total_xp: number } | null>(null);
  const navigate = useNavigate();

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
        const probRes = await axios.get('https://structures-production.up.railway.app/api/problems/');
        setProblems(probRes.data.slice(0, 6));
        const statsRes = await axios.get('https://structures-production.up.railway.app/api/profile/stats/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);
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
    <div className="lg:h-screen bg-background lg:overflow-hidden">
      {/* Main Container with 12-column grid system */}
      <div className="max-w-7xl mx-auto px-6 py-8 lg:h-full lg:flex lg:flex-col">
        <div className="grid grid-cols-12 gap-6 lg:h-full">
          
          {/* Welcome Header - Full Width */}
          <section className="col-span-12 lg:flex-shrink-0">
            <div className="bg-card/30 backdrop-blur-sm rounded-xl p-8 border border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Good morning, {user?.username ? formatUsername(user.username) : ''}
              </h2>
              <p className="text-muted-foreground text-lg">
                Ready to solve some problems today?
              </p>
            </div>
          </section>

          {/* Main Content Section - Split Layout */}
          <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:flex-1 lg:min-h-0">
            
            {/* Featured Problems Section - Left Side with Scroll */}
            <section className="lg:col-span-1 lg:flex lg:flex-col">
              <div className="bg-card/20 backdrop-blur-sm rounded-xl border border-border/30 lg:h-full lg:flex lg:flex-col">
                <div className="flex items-center justify-between p-8 pb-4 lg:flex-shrink-0">
                  <h2 className="text-2xl font-bold text-foreground">Featured Problems</h2>
                  <Link 
                    to="/problems"
                    className="inline-flex items-center px-4 py-2 border border-primary/60 text-primary bg-transparent rounded-lg hover:bg-primary/10 hover:border-primary hover:scale-105 active:scale-95 transition-all duration-200 font-medium text-sm"
                  >
                    View All
                  </Link>
                </div>
                
                {/* Scrollable Problem cards - responsive overflow */}
                <div className="px-8 pb-8 lg:flex-1 lg:overflow-y-auto">
                  <div className="space-y-2">
                    {problems.map((problem, index) => (
                      <div 
                        key={problem.id} 
                        className="bg-card rounded-lg border border-border/50 p-4 hover:bg-card/80 hover:border-primary/20 transition-all duration-200 group cursor-pointer"
                        onClick={() => handleProblemClick(problem.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Problem Number */}
                            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                            </div>
                            
                            {/* Problem Title */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors duration-200 truncate">
                                {problem.title}
                              </h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 flex-shrink-0">
                            {/* Acceptance Rate Placeholder */}
                            <div className="hidden sm:flex items-center space-x-1">
                              <span className="text-xs text-muted-foreground">
                                {Math.floor(Math.random() * 30 + 40)}.{Math.floor(Math.random() * 10)}%
                              </span>
                            </div>
                            
                            {/* Difficulty Badge */}
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                              problem.difficulty === 'Easy' 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                : problem.difficulty === 'Medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
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
              <section className="lg:col-span-1 lg:flex lg:flex-col">
                <div className="bg-card/20 backdrop-blur-sm rounded-xl p-8 border border-border/30 lg:h-full lg:flex lg:flex-col">
                  <h2 className="text-xl font-semibold text-foreground mb-6 lg:flex-shrink-0">Your Progress</h2>
                  <div className="grid grid-cols-2 gap-3 h-fit lg:flex-shrink-0">
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

                    <div className="bg-card/50 rounded-xl border border-dashed border-border/50 p-5 opacity-60">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-2.5 bg-muted/10 rounded-lg mb-2.5">
                          <div className="h-7 w-7 bg-muted/20 rounded"></div>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Streak</p>
                        <p className="text-xl font-bold text-muted-foreground">--</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TailwindDashboardPage;
