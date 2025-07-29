import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  UserGroupIcon,
  ClockIcon,
  PlusIcon,
  FireIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import apiClient from '../utils/apiClient';
import { Challenge, CHALLENGE_STATUS_CONFIG } from '../types/challenges';
import ChallengeResults from '../components/ChallengeResults';
import ChallengeTimer from '../components/ChallengeTimer';



const ChallengesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [receivedChallenges, setReceivedChallenges] = useState<Challenge[]>([]);
  const [sentChallenges, setSentChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showResults, setShowResults] = useState(false);

  const tabs = [
    { key: 'received', label: 'Received', icon: UserGroupIcon, color: 'text-blue-500' },
    { key: 'sent', label: 'Sent', icon: FireIcon, color: 'text-orange-500' },
    { key: 'create', label: 'Create Challenge', icon: PlusIcon, color: 'text-green-500' }
  ];

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);

      const [receivedRes, sentRes] = await Promise.all([
        apiClient.get('/api/challenges/received'),
        apiClient.get('/api/challenges/sent')
      ]);

      setReceivedChallenges(receivedRes.data);
      setSentChallenges(sentRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId: number) => {
    try {
      await apiClient.post(`/api/challenges/${challengeId}/accept`, {});
      
      setSuccess('Challenge accepted! You can now solve the problem.');
      fetchChallenges(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to accept challenge');
    }
  };

  const handleDeclineChallenge = async (challengeId: number) => {
    try {
      await apiClient.post(`/api/challenges/${challengeId}/decline`, {});
      
      setSuccess('Challenge declined.');
      fetchChallenges(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to decline challenge');
    }
  };

  const getStatusConfig = (status: string) => {
    return CHALLENGE_STATUS_CONFIG[status as keyof typeof CHALLENGE_STATUS_CONFIG] || CHALLENGE_STATUS_CONFIG.pending;
  };

  const handleViewResults = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowResults(true);
  };

  const formatTimeLimit = (minutes?: number) => {
    if (!minutes) return 'No time limit';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Friend Challenges
          </h1>
          <p className="text-muted-foreground">
            Challenge your friends to coding problems and compete for the fastest solution!
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Received</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {receivedChallenges.filter(c => c.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FireIcon className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Sent</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {sentChallenges.filter(c => c.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <TrophyIcon className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {[...receivedChallenges, ...sentChallenges].filter(c => c.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
            <button 
              onClick={() => setSuccess(null)}
              className="float-right text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-destructive hover:text-destructive/80"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border">
            <div className="flex">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const count = index === 0 
                  ? receivedChallenges.filter(c => c.status === 'pending').length
                  : index === 1 
                  ? sentChallenges.filter(c => c.status === 'pending').length 
                  : 0;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(index)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === index
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-card-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {count > 0 && index < 2 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-pulse">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Received Challenges Tab */}
            {activeTab === 0 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Received Challenges</h3>
                  <p className="text-sm text-muted-foreground">Challenges sent to you by friends</p>
                </div>
                
                {receivedChallenges.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserGroupIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No challenges received</p>
                    <p className="text-sm">Ask your friends to challenge you to a coding problem!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedChallenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-card-foreground">
                                {challenge.problem_title}
                              </h4>
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(challenge.status).color}`}>
                                <span>{getStatusConfig(challenge.status).icon}</span>
                                <span>{getStatusConfig(challenge.status).label}</span>
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              Challenged by <span className="font-medium text-card-foreground">{challenge.challenger_username}</span>
                            </p>
                            
                            {challenge.message && (
                              <p className="text-sm text-card-foreground mb-2 italic">
                                "{challenge.message}"
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Created: {formatDate(challenge.created_at)}</span>
                              {challenge.time_limit && challenge.status === 'accepted' && (
                                <ChallengeTimer
                                  timeLimit={challenge.time_limit}
                                  startTime={challenge.accepted_at || challenge.created_at}
                                  className="ml-2"
                                />
                              )}
                              {challenge.time_limit && challenge.status !== 'accepted' && (
                                <span className="flex items-center space-x-1">
                                  <ClockIcon className="h-3 w-3" />
                                  <span>{formatTimeLimit(challenge.time_limit)}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-4">
                            {challenge.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAcceptChallenge(challenge.id)}
                                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDeclineChallenge(challenge.id)}
                                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                            
                            {challenge.status === 'accepted' && (
                              <a
                                href={`/challenges/${challenge.id}/solve`}
                                className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors text-center"
                              >
                                Solve Now
                              </a>
                            )}
                            
                            {challenge.status === 'completed' && (
                              <button
                                onClick={() => handleViewResults(challenge)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1"
                              >
                                <EyeIcon className="h-3 w-3" />
                                <span>View Results</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sent Challenges Tab */}
            {activeTab === 1 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Sent Challenges</h3>
                  <p className="text-sm text-muted-foreground">Challenges you've sent to friends</p>
                </div>
                
                {sentChallenges.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FireIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No challenges sent</p>
                    <p className="text-sm">Create a challenge to compete with your friends!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentChallenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-card-foreground">
                                {challenge.problem_title}
                              </h4>
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(challenge.status).color}`}>
                                <span>{getStatusConfig(challenge.status).icon}</span>
                                <span>{getStatusConfig(challenge.status).label}</span>
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              Challenged <span className="font-medium text-card-foreground">{challenge.challenged_username}</span>
                            </p>
                            
                            {challenge.message && (
                              <p className="text-sm text-card-foreground mb-2 italic">
                                "{challenge.message}"
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Created: {formatDate(challenge.created_at)}</span>
                              {challenge.time_limit && (
                                <span className="flex items-center space-x-1">
                                  <ClockIcon className="h-3 w-3" />
                                  <span>{formatTimeLimit(challenge.time_limit)}</span>
                                </span>
                              )}
                              {challenge.completed_at && (
                                <span>Completed: {formatDate(challenge.completed_at)}</span>
                              )}
                            </div>
                          </div>
                          
                          {challenge.status === 'completed' && (
                            <div className="ml-4">
                              <button
                                onClick={() => handleViewResults(challenge)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1"
                              >
                                <EyeIcon className="h-3 w-3" />
                                <span>View Results</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Create Challenge Tab */}
            {activeTab === 2 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Create New Challenge</h3>
                  <p className="text-sm text-muted-foreground">Challenge a friend to solve a specific problem</p>
                </div>
                
                <div className="max-w-md">
                  <p className="text-muted-foreground">
                    To create a challenge, go to any problem page and click the "Challenge Friend" button.
                    You can challenge friends from the problem detail page after selecting a specific problem.
                  </p>
                  
                  <div className="mt-4">
                    <a
                      href="/problems"
                      className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Browse Problems
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Results Modal */}
        {showResults && selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowResults(false);
                setSelectedChallenge(null);
              }}
            />
            
            {/* Modal Content */}
            <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <ChallengeResults
                challenge={selectedChallenge}
                onClose={() => {
                  setShowResults(false);
                  setSelectedChallenge(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;