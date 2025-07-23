import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserGroupIcon, PlusCircleIcon, XMarkIcon, PlayIcon, UserIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface Room {
  id: number;
  code: string;
  problem_id: number;
  participants: { id: number; username: string }[];
}

const TailwindRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const navigate = useNavigate();
  const [problems, setProblems] = useState<{ id: number; title: string }[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<number | ''>('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://structures-production.up.railway.app/api/rooms/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(res.data);
      } catch (err) {
        setError('Failed to load rooms.');
      } finally {
        setLoading(false);
      }
    };

    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://structures-production.up.railway.app/api/problems/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblems(res.data);
      } catch (err) {
        console.error('Failed to load problems');
      }
    };

    fetchRooms();
    fetchProblems();
  }, []);

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    
    setJoining(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://structures-production.up.railway.app/api/rooms/${joinCode}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Find the room in the list to get the problem_id
      const joinedRoom = rooms.find(r => r.code === joinCode);
      if (joinedRoom) {
        navigate(`/rooms/${joinedRoom.code}/${joinedRoom.problem_id}`);
      } else {
        // fallback: reload rooms and try again
        const res = await axios.get('https://structures-production.up.railway.app/api/rooms/', { headers: { Authorization: `Bearer ${token}` } });
        const updatedRoom = res.data.find((r: any) => r.code === joinCode);
        if (updatedRoom) {
          navigate(`/rooms/${updatedRoom.code}/${updatedRoom.problem_id}`);
        } else {
          setError('Joined room, but could not find problem.');
        }
      }
      setShowJoinModal(false);
      setJoinCode('');
    } catch (err) {
      setError('Failed to join room. Check the code and try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedProblem) return;
    
    setCreating(true);
    setCreateError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'https://structures-production.up.railway.app/api/rooms/',
        { problem_id: selectedProblem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/rooms/${res.data.code}/${res.data.problem_id}`);
    } catch (err) {
      setCreateError('Failed to create room.');
    } finally {
      setCreating(false);
    }
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Collaborative Rooms</h1>
              <p className="text-muted-foreground text-lg mt-1">Work on coding challenges with your peers in real-time</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Primary: Create Room Section */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center">
              <PlusCircleIcon className="h-6 w-6 mr-2 text-primary" />
              Create New Room
            </h2>
            <p className="text-muted-foreground">Select a problem to get started</p>
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            <select
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(Number(e.target.value) || '')}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-center"
            >
              <option value="">Select a problem to collaborate on</option>
              {problems.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.title}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleCreateRoom}
              disabled={creating || !selectedProblem}
              className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-semibold transition-all hover:scale-105 active:scale-95"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
              ) : (
                <>
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Create Room
                </>
              )}
            </button>
            
            {createError && (
              <div className="mt-3 text-destructive text-sm text-center">{createError}</div>
            )}
          </div>
        </div>

        {/* Secondary: Join Room Link */}
        <div className="text-center mb-8">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm underline underline-offset-4"
          >
            Have a room code? Join with code
          </button>
        </div>

        {/* Active Rooms */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Active Rooms</h2>
          {rooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserGroupIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No active rooms</p>
              <p className="text-sm">Create a room or join one with a code to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-card/50 border border-border rounded-lg p-4 hover:bg-card/70 transition-colors cursor-pointer"
                  onClick={() => navigate(`/rooms/${room.code}/${room.problem_id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-accent rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-accent">Live</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                      {room.code}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button className="text-primary hover:text-primary/80 text-sm font-medium">
                      Join →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Join Room Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">Join Room</h3>
                <button 
                  onClick={() => setShowJoinModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  autoFocus
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    disabled={joining || !joinCode.trim()}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {joining ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Join
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TailwindRoomsPage;
