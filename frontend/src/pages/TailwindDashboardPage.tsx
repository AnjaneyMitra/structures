import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  BoltIcon, 
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: number;
  username: string;
}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
}

const difficultyStyles = {
  Easy: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800',
  Medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  Hard: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800',
};

const TailwindDashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ total_submissions: number; problems_solved: number } | null>(null);
  const [quickSearch, setQuickSearch] = useState('');
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

  const handleQuickSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      navigate(`/problems?search=${encodeURIComponent(quickSearch)}`);
    }
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
    <div className="min-h-screen bg-background">
      {/* Main Container with 12-column grid system */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Welcome Header - Full Width */}
          <section className="col-span-12 mb-8">
            <div className="bg-card/30 backdrop-blur-sm rounded-xl p-8 border border-border/50">
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Good morning, {user?.username ? formatUsername(user.username) : ''}
              </h1>
              <p className="text-muted-foreground text-lg">
                Ready to solve some problems today?
              </p>
            </div>
          </section>

          {/* Stats Cards Section - Full Width with 24px horizontal, 32px vertical gutters */}
          {stats && (
            <section className="col-span-12 mb-8">
              <div className="bg-card/20 backdrop-blur-sm rounded-xl p-8 border border-border/30">
                <h2 className="text-xl font-semibold text-foreground mb-6">Your Progress</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Problems Solved</p>
                        <p className="text-3xl font-bold text-primary">{stats.problems_solved}</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <CheckCircleIcon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Total Submissions</p>
                        <p className="text-3xl font-bold text-accent">{stats.total_submissions}</p>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <BoltIcon className="h-8 w-8 text-accent" />
                      </div>
                    </div>
                  </div>

                  {/* Placeholder cards for future metrics */}
                  <div className="bg-card/50 rounded-xl border border-dashed border-border/50 p-6 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Success Rate</p>
                        <p className="text-3xl font-bold text-muted-foreground">--%</p>
                      </div>
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <div className="h-8 w-8 bg-muted/20 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 rounded-xl border border-dashed border-border/50 p-6 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Streak</p>
                        <p className="text-3xl font-bold text-muted-foreground">--</p>
                      </div>
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <div className="h-8 w-8 bg-muted/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Quick Search Section - Centered with responsive width */}
          <section className="col-span-12 mb-8">
            <div className="bg-card/20 backdrop-blur-sm rounded-xl p-8 border border-border/30">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Find Problems</h2>
              <div className="flex justify-center">
                <div className="relative w-full max-w-2xl">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Quick search problems... (e.g. 'Linked List', 'Binary Tree') - Press Enter to search"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    onKeyDown={handleQuickSearch}
                    className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Featured Problems Section - Full Width */}
          <section className="col-span-12">
            <div className="bg-card/20 backdrop-blur-sm rounded-xl p-8 border border-border/30">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Featured Problems</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-6"></div>
              </div>
              
              {/* 12-column grid for problem cards with consistent 24px gutters */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {problems.map((problem) => (
                  <div key={problem.id} className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="text-lg font-bold text-card-foreground flex-1 pr-4 group-hover:text-primary transition-colors duration-200">
                        {problem.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyStyles[problem.difficulty as keyof typeof difficultyStyles] || 'bg-muted text-muted-foreground border-border'}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <Link
                      to={`/problems/${problem.id}`}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl transition-all duration-200 inline-block text-center hover:shadow-md"
                    >
                      Solve Problem
                    </Link>
                  </div>
                ))}
              </div>
              
              {/* View All Problems Button - Centered */}
              <div className="flex justify-center pt-4 border-t border-border/30">
                <Link 
                  to="/problems"
                  className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary bg-transparent rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-semibold hover:shadow-lg"
                >
                  View All Problems
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TailwindDashboardPage;
