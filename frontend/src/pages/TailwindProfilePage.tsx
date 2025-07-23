import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon, TrophyIcon, ChartBarIcon, CodeBracketIcon, StarIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface Submission {
  id: number;
  problem_id: number;
  problem_title: string;
  problem_difficulty?: string;
  result: string;
  runtime: string;
  submission_time: string;
  language: string;
  code: string;
  xp_awarded?: number;
}

interface UserProfile {
  id: number;
  username: string;
  total_xp: number;
}

interface UserStats {
  total_submissions: number;
  problems_solved: number;
  total_xp: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
}

const TailwindProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        
        // Fetch user profile
        const userRes = await axios.get('https://structures-production.up.railway.app/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);
        setNewUsername(userRes.data.username);

        // Fetch submissions
        const submissionsRes = await axios.get('https://structures-production.up.railway.app/api/profile/submissions/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(submissionsRes.data);

        // Fetch stats from API
        const statsRes = await axios.get('https://structures-production.up.railway.app/api/profile/stats/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'https://structures-production.up.railway.app/api/profile/username',
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(prev => prev ? { ...prev, username: newUsername } : null);
      setEditing(false);
      setUpdateSuccess(true);
      setUpdateError('');
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setUpdateError('Failed to update username.');
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getResultColor = (result: string) => {
    return result === 'Passed' ? 'text-green-500' : 'text-red-500';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                {editing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="px-3 py-1 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                    <button
                      onClick={handleUpdateUsername}
                      className="p-1 text-green-500 hover:text-green-600"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setNewUsername(user?.username || '');
                        setUpdateError('');
                      }}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-card-foreground">{user?.username}</h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1 text-muted-foreground hover:text-primary"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <p className="text-muted-foreground">Competitive Programmer</p>
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-2 py-1 rounded-full">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600">{user?.total_xp || 0} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {updateSuccess && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg">
              Username updated successfully!
            </div>
          )}
          
          {updateError && (
            <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-lg">
              {updateError}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.total_xp}</p>
                </div>
                <StarIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Problems Solved</p>
                  <p className="text-2xl font-bold text-card-foreground">{stats.problems_solved}</p>
                </div>
                <TrophyIcon className="h-8 w-8 text-accent" />
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold text-card-foreground">{stats.total_submissions}</p>
                </div>
                <CodeBracketIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {stats.total_submissions > 0 
                      ? Math.round((stats.problems_solved / stats.total_submissions) * 100)
                      : 0}%
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* XP Breakdown */}
        {stats && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">XP Breakdown by Difficulty</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">Easy Problems</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-200">{stats.easy_solved}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{stats.easy_solved * 50} XP</p>
                </div>
                <div className="text-green-500 text-2xl font-bold">50</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Medium Problems</p>
                  <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200">{stats.medium_solved}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">{stats.medium_solved * 100} XP</p>
                </div>
                <div className="text-yellow-500 text-2xl font-bold">100</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">Hard Problems</p>
                  <p className="text-xl font-bold text-red-800 dark:text-red-200">{stats.hard_solved}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">{stats.hard_solved * 150} XP</p>
                </div>
                <div className="text-red-500 text-2xl font-bold">150</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border">
            <div className="flex">
              <button
                onClick={() => setActiveTab(0)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 0
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-card-foreground'
                }`}
              >
                Recent Submissions
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 1
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-card-foreground'
                }`}
              >
                Statistics
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 0 && (
              <div>
                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CodeBracketIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No submissions yet</p>
                    <p className="text-sm">Start solving problems to see your submissions here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Problem</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Language</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Result</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">XP</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Runtime</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.slice(0, 10).map((submission) => (
                          <tr key={submission.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div>
                                <button
                                  onClick={() => navigate(`/problems/${submission.problem_id}`)}
                                  className="text-card-foreground hover:text-primary font-medium"
                                >
                                  {submission.problem_title}
                                </button>
                                {submission.problem_difficulty && (
                                  <span className={`ml-2 text-xs ${getDifficultyColor(submission.problem_difficulty)}`}>
                                    {submission.problem_difficulty}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-mono">
                                {submission.language}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${getResultColor(submission.result)}`}>
                                {submission.result}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {submission.xp_awarded && submission.xp_awarded > 0 ? (
                                <div className="flex items-center space-x-1">
                                  <StarIcon className="h-4 w-4 text-yellow-500" />
                                  <span className="text-yellow-600 font-medium">+{submission.xp_awarded}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-mono text-sm">
                              {submission.runtime}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-sm">
                              {new Date(submission.submission_time).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div className="text-center py-12 text-muted-foreground">
                <ChartBarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Detailed Statistics</p>
                <p className="text-sm">Coming soon - charts and analytics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindProfilePage;
