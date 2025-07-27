import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  ClockIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import apiClient from '../utils/apiClient';

interface Friend {
  id: number;
  username: string;
  total_xp: number;
  level: number;
}

interface ChallengeCreatorProps {
  problemId: number;
  problemTitle: string;
  onChallengeCreated?: () => void;
}

const ChallengeCreator: React.FC<ChallengeCreatorProps> = ({
  problemId,
  problemTitle,
  onChallengeCreated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [message, setMessage] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      const response = await apiClient.get('/api/friends/');
      setFriends(response.data || []);
    } catch (err: any) {
      setError('Failed to load friends list');
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFriend) {
      setError('Please select a friend to challenge');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const challengeData = {
        challenged_username: selectedFriend,
        problem_id: problemId,
        message: message.trim() || undefined,
        time_limit: timeLimit ? parseInt(timeLimit) : undefined
      };

      await apiClient.post('/api/challenges', challengeData);

      setSuccess('Challenge sent successfully!');
      setSelectedFriend('');
      setMessage('');
      setTimeLimit('');
      
      if (onChallengeCreated) {
        onChallengeCreated();
      }

      // Close dialog after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFriend('');
    setMessage('');
    setTimeLimit('');
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm border border-border bg-background hover:bg-muted hover:text-muted-foreground rounded-md transition-colors"
      >
        <UserGroupIcon className="h-4 w-4" />
        <span>Challenge Friend</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
          />
          
          {/* Dialog content */}
          <div className="relative z-50 bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5 text-primary" />
                <span>Challenge a Friend</span>
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Problem:</p>
                <p className="text-sm text-muted-foreground">{problemTitle}</p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-md text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <div>
                  <label htmlFor="friend-select" className="text-sm font-medium text-card-foreground leading-none">
                    Select Friend
                  </label>
                  <select
                    id="friend-select"
                    value={selectedFriend}
                    onChange={(e) => setSelectedFriend(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Choose a friend...</option>
                    {friends.map((friend) => (
                      <option key={friend.id} value={friend.username}>
                        {friend.username} (Level {friend.level}, {friend.total_xp} XP)
                      </option>
                    ))}
                  </select>
                  {friends.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No friends found. Add friends to challenge them!
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-medium text-card-foreground leading-none">
                    Challenge Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a motivational message or taunt..."
                    className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.length}/200 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="time-limit" className="text-sm font-medium text-card-foreground leading-none flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>Time Limit (Optional)</span>
                  </label>
                  <input
                    id="time-limit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    placeholder="Minutes"
                    min="1"
                    max="1440"
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for no time limit. Max: 24 hours (1440 minutes)
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                    className="flex-1 inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-border bg-background hover:bg-muted hover:text-muted-foreground h-10 px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedFriend || friends.length === 0}
                    className="flex-1 inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4" />
                        <span>Send Challenge</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChallengeCreator;