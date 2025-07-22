import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, CircularProgress, Alert, Button, Stack, 
  TextField, Chip, Avatar, Tooltip, Dialog, DialogTitle, DialogContent, 
  DialogActions, MenuItem, Paper, Divider, Badge, IconButton
} from '@mui/material';
import axios from 'axios';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/VpnKey';
import CodeIcon from '@mui/icons-material/Code';
import PeopleIcon from '@mui/icons-material/People';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useNavigate } from 'react-router-dom';

interface Room {
  id: number;
  code: string;
  problem_id: number;
  participants: { id: number; username: string }[];
}

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
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
    fetchRooms();
    // Fetch problems for create room dialog
    const fetchProblems = async () => {
      try {
        const res = await axios.get('https://structures-production.up.railway.app/api/problems/');
        setProblems(res.data.map((p: any) => ({ id: p.id, title: p.title })));
      } catch {}
    };
    fetchProblems();
  }, []);

  const handleJoin = async () => {
    setJoining(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://structures-production.up.railway.app/api/rooms/join/', { code: joinCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh rooms list
      const roomsRes = await axios.get('https://structures-production.up.railway.app/api/rooms/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(roomsRes.data);
      setJoinCode('');
      // Navigate to the joined room, including the problem ID
      navigate(`/rooms/${response.data.code}/${response.data.problem_id}`);
    } catch (err) {
      setError('Failed to join room.');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateRoom = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://structures-production.up.railway.app/api/rooms/', { problem_id: selectedProblem }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh rooms list
      const roomsRes = await axios.get('https://structures-production.up.railway.app/api/rooms/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(roomsRes.data);
      setCreating(false);
      setCreateOpen(false);
      setSelectedProblem('');
      // Also navigate with problem ID here
      navigate(`/rooms/${res.data.code}/${res.data.problem_id}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || 'Failed to create room.');
      setCreating(false);
    }
  };

  if (loading) return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#0a0a0a',
      color: 'white'
    }}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress sx={{ color: '#00d4aa' }} />
        <Typography variant="h6">Loading rooms...</Typography>
      </Stack>
    </Box>
  );

  if (error) return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#0a0a0a',
      color: 'white',
      p: 4
    }}>
      <Alert 
        severity="error" 
        sx={{ 
          bgcolor: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid #ff6b6b',
          color: '#ff6b6b',
          '& .MuiAlert-icon': { color: '#ff6b6b' }
        }}
      >
        {error}
      </Alert>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#0a0a0a',
      color: 'white'
    }}>
      {/* Header */}
      <Box sx={{ 
        borderBottom: '1px solid #2d3748',
        px: 4,
        py: 3,
        bgcolor: '#1a1a1a'
      }}>
        <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
          <GroupWorkIcon sx={{ color: '#00d4aa', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} sx={{ color: '#00d4aa' }}>
            Collaborative Rooms
          </Typography>
          <Badge badgeContent={rooms.length} color="primary">
            <Chip 
              label="Active" 
              sx={{ 
                bgcolor: '#2d3748', 
                color: '#a0aec0',
                fontWeight: 600
              }} 
            />
          </Badge>
        </Stack>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Enter room code..."
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            size="small"
            sx={{
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2d3748',
                color: 'white',
                '& fieldset': { borderColor: '#4a5568' },
                '&:hover fieldset': { borderColor: '#00d4aa' },
                '&.Mui-focused fieldset': { borderColor: '#00d4aa' }
              }
            }}
            InputProps={{
              startAdornment: <KeyIcon sx={{ color: '#a0aec0', mr: 1 }} />
            }}
          />
          
          <Button
            variant="outlined"
            onClick={handleJoin}
            disabled={joining || !joinCode}
            startIcon={<MeetingRoomIcon />}
            sx={{
              borderColor: '#4a5568',
              color: '#a0aec0',
              '&:hover': {
                borderColor: '#00d4aa',
                color: '#00d4aa',
                bgcolor: 'rgba(0, 212, 170, 0.1)'
              },
              '&:disabled': {
                borderColor: '#4a5568',
                color: '#6b7280'
              }
            }}
          >
            {joining ? 'Joining...' : 'Join Room'}
          </Button>
          
          <Button
            variant="contained"
            onClick={() => setCreateOpen(true)}
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              bgcolor: '#00d4aa',
              '&:hover': { bgcolor: '#00b894' },
              fontWeight: 600
            }}
          >
            Create Room
          </Button>
        </Stack>
      </Box>

      {/* Rooms Grid */}
      <Box sx={{ p: 4 }}>
        {rooms.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: '#a0aec0'
          }}>
            <GroupWorkIcon sx={{ fontSize: 64, color: '#4a5568', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No rooms yet
            </Typography>
            <Typography variant="body2">
              Create your first collaborative room to start coding together
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 3
          }}>
            {rooms.map((room) => (
              <Card key={room.id} sx={{ 
                bgcolor: '#1a1a1a',
                border: '1px solid #2d3748',
                borderRadius: 3,
                transition: 'all 0.2s',
                '&:hover': { 
                  borderColor: '#00d4aa',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 212, 170, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Box sx={{ 
                      p: 1.5,
                      bgcolor: '#2d3748',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CodeIcon sx={{ color: '#00d4aa', fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                        {room.code}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                        Problem #{room.problem_id}
                      </Typography>
                    </Box>
                    <Chip 
                      label={room.code}
                      size="small"
                      sx={{ 
                        bgcolor: '#2d3748',
                        color: '#00d4aa',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700
                      }}
                    />
                  </Stack>
                  
                  <Divider sx={{ borderColor: '#2d3748', my: 2 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <PeopleIcon sx={{ color: '#a0aec0', fontSize: 16 }} />
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#a0aec0' }}>
                        Participants ({room.participants.length})
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {room.participants.slice(0, 3).map(p => (
                        <Tooltip key={p.id} title={p.username}>
                          <Avatar sx={{ 
                            width: 28, 
                            height: 28,
                            bgcolor: '#00d4aa',
                            fontSize: 12,
                            fontWeight: 700
                          }}>
                            {p.username.slice(0, 2).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      ))}
                      {room.participants.length > 3 && (
                        <Avatar sx={{ 
                          width: 28, 
                          height: 28,
                          bgcolor: '#4a5568',
                          fontSize: 10,
                          color: '#a0aec0'
                        }}>
                          +{room.participants.length - 3}
                        </Avatar>
                      )}
                    </Stack>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/rooms/${room.code}`)}
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      bgcolor: '#00d4aa',
                      '&:hover': { bgcolor: '#00b894' },
                      fontWeight: 600,
                      py: 1.5
                    }}
                  >
                    Enter Room
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      <Dialog 
        open={createOpen} 
        onClose={() => setCreateOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid #2d3748',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white',
          borderBottom: '1px solid #2d3748',
          pb: 2
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AddCircleOutlineIcon sx={{ color: '#00d4aa' }} />
            <Typography variant="h6" fontWeight={700}>
              Create New Room
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            select
            label="Select Problem"
            value={selectedProblem}
            onChange={e => setSelectedProblem(Number(e.target.value))}
            fullWidth
            disabled={creating}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2d3748',
                color: 'white',
                '& fieldset': { borderColor: '#4a5568' },
                '&:hover fieldset': { borderColor: '#00d4aa' },
                '&.Mui-focused fieldset': { borderColor: '#00d4aa' }
              },
              '& .MuiInputLabel-root': { color: '#a0aec0' },
              '& .MuiSelect-icon': { color: '#a0aec0' }
            }}
          >
            {problems.map(p => (
              <MenuItem 
                key={p.id} 
                value={p.id}
                sx={{ 
                  bgcolor: '#2d3748', 
                  color: 'white',
                  '&:hover': { bgcolor: '#374151' },
                  '&.Mui-selected': { bgcolor: '#00d4aa', '&:hover': { bgcolor: '#00b894' } }
                }}
              >
                {p.title}
              </MenuItem>
            ))}
          </TextField>
          {createError && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                bgcolor: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid #ff6b6b',
                color: '#ff6b6b',
                '& .MuiAlert-icon': { color: '#ff6b6b' }
              }}
            >
              {createError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid #2d3748',
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <Button 
            onClick={() => setCreateOpen(false)} 
            disabled={creating}
            sx={{ 
              color: '#a0aec0',
              '&:hover': { bgcolor: '#2d3748' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRoom} 
            variant="contained" 
            disabled={creating || !selectedProblem}
            sx={{
              bgcolor: '#00d4aa',
              '&:hover': { bgcolor: '#00b894' },
              '&:disabled': { bgcolor: '#4a5568', color: '#6b7280' },
              fontWeight: 600
            }}
          >
            {creating ? 'Creating...' : 'Create Room'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomsPage; 