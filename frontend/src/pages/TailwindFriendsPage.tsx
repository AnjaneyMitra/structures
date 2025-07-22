import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  UserPlusIcon, 
  CheckIcon, 
  XMarkIcon,
  TrophyIcon,
  StarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Friend {
  id: number;
  username: string;
  total_xp: number;
}

interface FriendRequest {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: string;
  created_at: string;
  requester_username: string;
  addressee_username: string;
}

interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  total_xp: number;
  problems_solved: number;
}

interface SearchResult {
  id: number;
  username: string;
  total_xp: number;
  friendship_status: string;
}

const TailwindFriendsPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [friendsRes, receivedRes, sentRes, leaderboardRes] = await Promise.all([
        axios.get('https://structures-production.up.railway.app/api/friends/', { headers }),
        axios.get('https://structures-production.up.railway.app/api/friends/requests/received', { headers }),
        axios.get('https://structures-production.up.railway.app/api/friends/requests/sent', { headers }),
        axios.get('https://structures-production.up.railway.app/api/friends/leaderboard', { headers })
      ]);

      setFriends(friendsRes.data);
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (err) {
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `https://structures-production.up.railway.app/api/friends/search/${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const sendFriendRequest = async (username: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://structures-production.up.railway.app/api/friends/request',
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Friend request sent to ${username}!`);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
      searchUsers(searchQuery); // Refresh search results
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send friend request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const acceptFriendRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://structures-production.up.railway.app/api/friends/requests/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Friend request accepted!');
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setError('Failed to accept friend request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const rejectFriendRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://structures-production.up.railway.app/api/friends/requests/${requestId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Friend request rejected');
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setError('Failed to reject friend request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const removeFriend = async (friendId: number, username: string) => {
    if (!confirm(`Remove ${username} from your friends?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://structures-production.up.railway.app/api/friends/${friendId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Removed ${username} from friends`);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setError('Failed to remove friend');
      setTimeout(() => setError(''), 3000);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2 flex items-center">
            <UserGroupIcon className="h-8 w-8 mr-3 text-primary" />
            Friends & Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Connect with friends and compete on the leaderboard!
          </p>
        </div>

        {/* Notifications */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border">
            <div className="flex">
              {['Leaderboard', 'My Friends', 'Friend Requests', 'Find Friends'].map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === index
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-card-foreground'
                  }`}
                >
                  {tab}
                  {index === 2 && receivedRequests.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {receivedRequests.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Leaderboard Tab */}
            {activeTab === 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Friends Leaderboard</h3>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrophyIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No friends yet</p>
                    <p className="text-sm">Add friends to see the leaderboard!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          entry.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                          entry.rank === 2 ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800' :
                          entry.rank === 3 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                          'bg-muted/50 border-border'
                        }`}
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
                              <p className="font-medium text-card-foreground">{entry.username}</p>
                              <p className="text-sm text-muted-foreground">
                                {entry.problems_solved} problems solved
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StarIcon className="h-5 w-5 text-yellow-500" />
                          <span className="font-bold text-yellow-600">{entry.total_xp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Friends Tab */}
            {activeTab === 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">My Friends ({friends.length})</h3>
                {friends.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserGroupIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No friends yet</p>
                    <p className="text-sm">Start by finding and adding friends!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="bg-muted/50 border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">{friend.username}</p>
                              <div className="flex items-center space-x-1">
                                <StarIcon className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-yellow-600">{friend.total_xp} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFriend(friend.id, friend.username)}
                          className="w-full text-sm text-red-600 hover:text-red-700 py-2 px-3 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Remove Friend
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Friend Requests Tab */}
            {activeTab === 2 && (
              <div>
                <div className="space-y-6">
                  {/* Received Requests */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Received Requests ({receivedRequests.length})
                    </h3>
                    {receivedRequests.length === 0 ? (
                      <p className="text-muted-foreground">No pending friend requests</p>
                    ) : (
                      <div className="space-y-3">
                        {receivedRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-card-foreground">{request.requester_username}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(request.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => acceptFriendRequest(request.id)}
                                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                              >
                                <CheckIcon className="h-4 w-4" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => rejectFriendRequest(request.id)}
                                className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                              >
                                <XMarkIcon className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sent Requests */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Sent Requests ({sentRequests.length})
                    </h3>
                    {sentRequests.length === 0 ? (
                      <p className="text-muted-foreground">No pending sent requests</p>
                    ) : (
                      <div className="space-y-3">
                        {sentRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-card-foreground">{request.addressee_username}</p>
                                <p className="text-sm text-muted-foreground">
                                  Sent {new Date(request.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                              Pending
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Find Friends Tab */}
            {activeTab === 3 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Find Friends</h3>
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search users by username..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{user.username}</p>
                            <div className="flex items-center space-x-1">
                              <StarIcon className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-600">{user.total_xp} XP</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {user.friendship_status === 'none' && (
                            <button
                              onClick={() => sendFriendRequest(user.username)}
                              className="flex items-center space-x-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                              <UserPlusIcon className="h-4 w-4" />
                              <span>Add Friend</span>
                            </button>
                          )}
                          {user.friendship_status === 'friends' && (
                            <span className="text-sm text-green-600 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
                              Friends
                            </span>
                          )}
                          {user.friendship_status === 'request_sent' && (
                            <span className="text-sm text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                              Request Sent
                            </span>
                          )}
                          {user.friendship_status === 'request_received' && (
                            <span className="text-sm text-blue-600 bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                              Request Received
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No users found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindFriendsPage;