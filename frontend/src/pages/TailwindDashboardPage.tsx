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
  Easy: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Hard: 'bg-red-100 text-red-800 border-red-200',
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Good morning, {user?.username ? formatUsername(user.username) : ''}
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to solve some problems today?
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                  <p className="text-3xl font-bold text-primary">{stats.problems_solved}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-3xl font-bold text-accent">{stats.total_submissions}</p>
                </div>
                <BoltIcon className="h-8 w-8 text-accent" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Quick search problems... (e.g. 'Linked List', 'Binary Tree') - Press Enter to search"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyDown={handleQuickSearch}
              className="w-full pl-10 pr-4 py-3 bg-card border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Featured Problems */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Featured Problems</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <div key={problem.id} className="bg-card rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-card-foreground flex-1 pr-3">
                    {problem.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyStyles[problem.difficulty as keyof typeof difficultyStyles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <Link
                  to={`/problems/${problem.id}`}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors duration-200 inline-block text-center"
                >
                  Solve
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link 
              to="/problems"
              className="inline-flex items-center px-6 py-3 border border-primary text-primary bg-transparent rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors duration-200 font-medium"
            >
              View All Problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindDashboardPage;
