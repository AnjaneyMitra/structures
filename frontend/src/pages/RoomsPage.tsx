import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Alert, Button, Stack, TextField, Chip, Avatar, Tooltip } from '@mui/material';
import axios from 'axios';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';

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
      await axios.post('https://structures-production.up.railway.app/api/rooms/join/', { code: joinCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
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
      setCreating(false);
      setCreateOpen(false);
      setSelectedProblem('');
      navigate(`/rooms/${res.data.code}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || 'Failed to create room.');
      setCreating(false);
    }
  };

  if (loading) return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <GroupWorkIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" fontWeight={700} color="primary">Your Rooms</Typography>
        <Box flexGrow={1} />
        <TextField
          label="Join Room by Code"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          size="small"
          sx={{ minWidth: 200, background: '#f7f7fa', borderRadius: 2 }}
          InputProps={{ startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} /> }}
        />
        <Button variant="contained" onClick={handleJoin} disabled={joining || !joinCode} sx={{ fontWeight: 700, borderRadius: 2, px: 3 }} startIcon={<MeetingRoomIcon />}>
          Join
        </Button>
        <Button variant="outlined" sx={{ fontWeight: 700, borderRadius: 2, px: 3 }} startIcon={<AddCircleOutlineIcon />} onClick={() => setCreateOpen(true)}>
          Create Room
        </Button>
      </Stack>
      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.id}>
            <Card elevation={2} sx={{ borderRadius: 4, height: '100%', background: '#fff', boxShadow: '0 2px 12px 0 rgba(108,99,255,0.07)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 24px 0 rgba(108,99,255,0.13)' } }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>Room Code: {room.code}</Typography>
                  <Tooltip title="Copy Room Code"><Chip icon={<KeyIcon />} label={room.code} size="small" color="info" sx={{ fontWeight: 700 }} /></Tooltip>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={2}>Problem ID: <b>{room.problem_id}</b></Typography>
                <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                  {room.participants.map(p => (
                    <Chip
                      key={p.id}
                      avatar={<Avatar sx={{ bgcolor: '#6C63FF', width: 24, height: 24, fontSize: 14 }}><PersonIcon fontSize="small" /></Avatar>}
                      label={p.username}
                      size="small"
                      sx={{ fontWeight: 600, bgcolor: '#f7f7fa', color: 'primary.main', mr: 1, mb: 1 }}
                    />
                  ))}
                </Stack>
                <Button variant="contained" size="medium" sx={{ mt: 1, borderRadius: 2, fontWeight: 700 }} startIcon={<MeetingRoomIcon />} onClick={() => navigate(`/rooms/${room.code}`)}>Enter Room</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create New Room</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Select Problem"
            value={selectedProblem}
            onChange={e => setSelectedProblem(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
            disabled={creating}
          >
            {problems.map(p => (
              <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
            ))}
          </TextField>
          {createError && <Alert severity="error" sx={{ mt: 2 }}>{createError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
          <Button onClick={handleCreateRoom} variant="contained" disabled={creating || !selectedProblem}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomsPage; 