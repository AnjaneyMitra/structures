import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  TrophyIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Challenge, CHALLENGE_STATUS_CONFIG } from '../types/challenges';
import apiClient from '../utils/apiClient';

interface ChallengeNotificationsProps {
  onChallengeUpdate?: () => void;
}

const ChallengeNotifications: React.FC<ChallengeNotificationsProps> = ({
  onChallengeUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/challenges/received');
      const pendingChallenges = response.data.filter(
        (challenge: Challenge) => challenge.status === 'pending'
      );
      
      setNotifications(pendingChallenges);
      setUnreadCount(pendingChallenges.length);
    } catch (err) {
      console.error('Failed to fetch challenge notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId: number) => {
    try {
      await apiClient.post(`/api/challenges/${challengeId}/accept`);
      await fetchNotifications();
      if (onChallengeUpdate) {
        onChallengeUpdate();
      }
    } catch (err) {
      console.error('Failed to accept challenge:', err);
    }
  };

  const handleDeclineChallenge = async (challengeId: number) => {
    try {
      await apiClient.post(`/api/challenges/${challengeId}/decline`);
      await fetchNotifications();
      if (onChallengeUpdate) {
        onChallengeUpdate();
      }
    } catch (err) {
      console.error('Failed to decline challenge:', err);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-card-foreground flex items-center space-x-2">
                  <TrophyIcon className="h-4 w-4 text-primary" />
                  <span>Challenge Notifications</span>
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {unreadCount} pending
                  </span>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <UserGroupIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No pending challenges</p>
                  <p className="text-xs">New challenge invitations will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((challenge) => (
                    <div key={challenge.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <TrophyIcon className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-card-foreground truncate">
                              {challenge.problem_title}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(challenge.created_at)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2">
                            <span className="font-medium">{challenge.challenger_username}</span> challenged you
                          </p>
                          
                          {challenge.message && (
                            <p className="text-xs text-card-foreground mb-3 italic bg-muted/30 p-2 rounded">
                              "{challenge.message}"
                            </p>
                          )}
                          
                          {challenge.time_limit && (
                            <div className="flex items-center space-x-1 mb-3">
                              <ClockIcon className="h-3 w-3 text-orange-500" />
                              <span className="text-xs text-orange-600 dark:text-orange-400">
                                {challenge.time_limit} minute limit
                              </span>
                            </div>
                          )}
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAcceptChallenge(challenge.id)}
                              className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                            >
                              <CheckCircleIcon className="h-3 w-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleDeclineChallenge(challenge.id)}
                              className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                            >
                              <XCircleIcon className="h-3 w-3" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border bg-muted/30">
                <a
                  href="/challenges"
                  className="text-xs text-primary hover:text-primary-dark transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  View all challenges →
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChallengeNotifications;