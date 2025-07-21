import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Stack, Chip, CircularProgress, Alert, MenuItem, Button } from '@mui/material';
import MonacoEditor from '@monaco-editor/react';
import io from 'socket.io-client';

import SendIcon from '@mui/icons-material/Send';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import HistoryIcon from '@mui/icons-material/History';

const SOCKET_URL = 'https://structures-production.up.railway.app';

const languageOptions = [
  { label: 'Python', value: 'python', monaco: 'python', defaultCode: '# Write your solution here\n' },
  { label: 'JavaScript', value: 'javascript', monaco: 'javascript', defaultCode: '// Write your solution here\n' },
];

// Define chat message type
interface ChatMessage {
  sid: string;
  username?: string;
  message: string;
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

const CollaborativeRoomPage: React.FC = () => {
  const { code: roomCode, id: problemId } = useParams<{ code: string; id?: string }>();
  const [code, setCode] = useState(languageOptions[0].defaultCode);
  const [language, setLanguage] = useState(languageOptions[0].value);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [error] = useState('');
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const codeRef = useRef(code);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [runResult, setRunResult] = useState<any | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [submitError, setSubmitError] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [userCodes, setUserCodes] = useState<{ [user: string]: string }>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [userCodeHistory, setUserCodeHistory] = useState<{ [user: string]: string[] }>({});
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<{ [user: string]: number }>({});
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [roomUsers, setRoomUsers] = useState<any[]>([]);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState('');
  const [problemData, setProblemData] = useState<any>(null);
  const [showProblem, setShowProblem] = useState(false);
  const [sharingRun, setSharingRun] = useState(false);
  const [roomSubmissions, setRoomSubmissions] = useState<any[]>([]);
  const [loadingRoomSubmissions, setLoadingRoomSubmissions] = useState(true);
  const [expandedSubmission, setExpandedSubmission] = useState<number | null>(null);

  useEffect(() => {
    codeRef.current = code;
    setUserCodes(prev => ({ ...prev, [username || 'You']: code }));
    setUserCodeHistory(prev => {
      const user = username || 'You';
      const history = prev[user] || [];
      if (history.length === 0 || history[history.length - 1] !== code) {
        return { ...prev, [user]: [...history, code] };
      }
      return prev;
    });
  }, [code, username]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_room', { room: roomCode, username: username || 'Anonymous' });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('code_update', (data: any) => {
      if (data.code !== codeRef.current) setCode(data.code);
      if (data.username) {
        setUserCodes(prev => ({ ...prev, [data.username]: data.code }));
        setActiveUser(data.username);
      }
    });
    socket.on('user_joined', (data: any) => {
      const userToAdd = data.username || data.sid;
      setUsers(prev => prev.includes(userToAdd) ? prev : [...prev, userToAdd]);
      if (data.username && data.username !== username) {
        setNotifications(n => [...n, `${data.username} joined the room`]);
        setOpenNotif(true);
      }
    });
    socket.on('user_left', (data: any) => {
      const userToRemove = data.username || data.sid;
      setUsers(prev => prev.filter(u => u !== userToRemove));
      if (data.username && data.username !== username) {
        setNotifications(n => [...n, `${data.username} left the room`]);
        setOpenNotif(true);
      }
    });
    socket.on('chat_message', (data: any) => {
      setChatMessages(prev => [...prev, { sid: data.sid, username: data.username, message: data.message }]);
    });
    socket.on('language_update', (data: any) => {
      if (data.language && data.language !== language) setLanguage(data.language);
    });
    socket.on('code_executed', (data: any) => {
      if (data.username !== username) {
        setNotifications(n => [...n, `${data.username} ran their code`]);
        setOpenNotif(true);
      }
    });
    socket.on('code_submitted', (data: any) => {
      if (data.username !== username) {
        const status = data.passed ? 'passed' : 'failed';
        setNotifications(n => [...n, `${data.username} submitted code - ${status}`]);
        setOpenNotif(true);
      }
    });
    return () => {
      socket.emit('leave_room', { room: roomCode });
      socket.disconnect();
    };
  }, [roomCode, language, username]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    // Get username from localStorage or profile API
    const stored = localStorage.getItem('username');
    if (stored) setUsername(stored);
    
    // Fetch room data and users
    const fetchRoomData = async () => {
      setRoomLoading(true);
      setRoomError('');
      try {
        const token = localStorage.getItem('token');
        const [roomRes, usersRes] = await Promise.all([
          axios.get(`https://structures-production.up.railway.app/api/rooms/code/${roomCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://structures-production.up.railway.app/api/rooms/${roomCode}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        setRoomData(roomRes.data);
        setRoomUsers(usersRes.data);
        // Initialize users list with room participants
        setUsers(usersRes.data.map((u: any) => u.username));
        
        // Fetch problem details
        if (roomRes.data.problem_id) {
          try {
            const problemRes = await axios.get(`https://structures-production.up.railway.app/api/problems/${roomRes.data.problem_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setProblemData(problemRes.data);
          } catch (err) {
            console.error('Failed to fetch problem data:', err);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch room data:', err);
        setRoomError(err.response?.data?.detail || 'Failed to load room data');
      } finally {
        setRoomLoading(false);
      }
    };
    
    if (roomCode) {
      fetchRoomData();
    }
  }, [roomCode]);

  // Fetch room submissions on mount
  useEffect(() => {
    const fetchRoomSubmissions = async () => {
      setLoadingRoomSubmissions(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://structures-production.up.railway.app/api/rooms/${roomCode}/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoomSubmissions(res.data.reverse()); // latest first
      } catch (err) {
        setRoomSubmissions([]);
      } finally {
        setLoadingRoomSubmissions(false);
      }
    };
    if (roomCode) fetchRoomSubmissions();
  }, [roomCode]);
  // Listen for real-time submission events
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const handleRoomSubmission = (data: any) => {
      if (data && data.submission) {
        setRoomSubmissions(prev => [data.submission, ...prev]);
      }
    };
    socket.on('room_submission', handleRoomSubmission);
    return () => {
      socket.off('room_submission', handleRoomSubmission);
    };
  }, [socketRef]);

  const handleCodeChange = (val: string | undefined) => {
    if (val !== code) {
      setUndoStack(prev => [...prev, code]);
      setRedoStack([]);
    }
    setCode(val || '');
    setActiveUser(username);
    if (socketRef.current) {
      socketRef.current.emit('code_update', { room: roomCode, code: val, username });
    }
  };
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prev = undoStack[undoStack.length - 1];
      setUndoStack(undoStack.slice(0, -1));
      setRedoStack(r => [code, ...r]);
      setCode(prev);
      if (socketRef.current) {
        socketRef.current.emit('code_update', { room: roomCode, code: prev });
      }
    }
  };
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[0];
      setRedoStack(redoStack.slice(1));
      setUndoStack(u => [...u, code]);
      setCode(next);
      if (socketRef.current) {
        socketRef.current.emit('code_update', { room: roomCode, code: next });
      }
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim() && socketRef.current) {
      socketRef.current.emit('chat_message', { room: roomCode, message: chatInput });
      setChatInput('');
    }
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    if (socketRef.current) {
      socketRef.current.emit('language_update', { room: roomCode, language: val });
    }
  };

  const handleRun = async (share: boolean = false) => {
    if (share) setSharingRun(true);
    else setRunning(true);
    setRunResult(null);
    setSubmitError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `https://structures-production.up.railway.app/api/rooms/${roomCode}/execute`,
        {
          code,
          language,
          sample_only: true,
          share_run_output: share,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = res.data.test_case_results ? res.data.test_case_results[0] : null;
      setRunResult(result);
      
      // Emit socket event for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('code_executed', {
          room: roomCode,
          result: res.data,
          sample_only: true,
          shared: share
        });
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Run failed');
    } finally {
      if (share) setSharingRun(false);
      else setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    setResults(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `https://structures-production.up.railway.app/api/rooms/${roomCode}/submit`,
        {
          code,
          language,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResults(res.data.test_case_results || []);
      
      // Emit socket event for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('code_submitted', {
          room: roomCode,
          result: res.data,
          passed: res.data.overall_status === 'pass'
        });
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchUserSubmissions = async (user: string) => {
    setLoadingSubmissions(true);
    setUserSubmissions([]);
    setShowSubmissions(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://structures-production.up.railway.app/api/rooms/${roomCode}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter by username if available
      const userSubs = res.data.filter((s: any) => s.username === user);
      setUserSubmissions(userSubs);
    } catch (err) {
      console.error('Failed to fetch user submissions:', err);
      setUserSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  if (roomLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1200, mx: 'auto', textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading room...</Typography>
      </Box>
    );
  }

  if (roomError) {
    return (
      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {roomError}
        </Alert>
        <Button variant="contained" onClick={() => window.location.href = '/rooms'}>
          Back to Rooms
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        <Paper elevation={3} sx={{ flex: 2, p: { xs: 2, md: 4 }, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px 0 rgba(108,99,255,0.07)' }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={700} color="primary">Room: {roomCode}</Typography>
            <Chip label={connected ? 'Connected' : 'Disconnected'} color={connected ? 'success' : 'error'} />
            <Chip label={`Users: ${Math.max(users.length, roomUsers.length)}`} color="info" />
            {roomData && (
              <Chip 
                label={`Problem #${roomData.problem_id}`} 
                color="secondary" 
                variant="outlined"
                onClick={() => setShowProblem(!showProblem)}
                sx={{ cursor: 'pointer' }}
              />
            )}
            {problemData && (
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setShowProblem(!showProblem)}
                sx={{ textTransform: 'none' }}
              >
                {showProblem ? 'Hide Problem' : 'Show Problem'}
              </Button>
            )}
            <Stack direction="row" spacing={-1} ml={2}>
              {users.map((u, i) => (
                <Tooltip key={u} title={u}><Avatar sx={{ width: 28, height: 28, bgcolor: stringToColor(u), fontSize: 14, border: '2px solid #fff', zIndex: users.length - i }}>{u.slice(0, 2)}</Avatar></Tooltip>
              ))}
            </Stack>
            <TextField
              select
              size="small"
              label="Language"
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
              sx={{ minWidth: 120, ml: 2 }}
            >
              {languageOptions.map(lang => (
                <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
              ))}
            </TextField>
            <Button onClick={handleUndo} disabled={undoStack.length === 0} sx={{ ml: 2 }}>Undo</Button>
            <Button onClick={handleRedo} disabled={redoStack.length === 0}>Redo</Button>
          </Stack>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {showProblem && problemData && (
            <Paper variant="outlined" sx={{ p: 3, mb: 3, background: '#f8f9ff', border: '1px solid #e0e7ff' }}>
              <Typography variant="h6" fontWeight={700} color="primary" mb={2}>
                {problemData.title}
              </Typography>
              <Chip label={problemData.difficulty} color={
                problemData.difficulty === 'Easy' ? 'success' : 
                problemData.difficulty === 'Medium' ? 'warning' : 'error'
              } size="small" sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {problemData.description}
              </Typography>
              {problemData.sample_input && problemData.sample_output && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>Sample:</Typography>
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Input:</Typography>
                      <Paper variant="outlined" sx={{ p: 1, fontFamily: 'monospace', fontSize: 14, background: '#fff' }}>
                        {problemData.sample_input}
                      </Paper>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Output:</Typography>
                      <Paper variant="outlined" sx={{ p: 1, fontFamily: 'monospace', fontSize: 14, background: '#fff' }}>
                        {problemData.sample_output}
                      </Paper>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Paper>
          )}
          <MonacoEditor
            height="400px"
            language={languageOptions.find(l => l.value === language)?.monaco || 'python'}
            value={selectedUser && userCodeHistory[selectedUser] && selectedHistoryIndex[selectedUser] !== undefined
              ? userCodeHistory[selectedUser][selectedHistoryIndex[selectedUser] ?? userCodeHistory[selectedUser].length - 1]
              : (selectedUser && userCodes[selectedUser] !== undefined ? userCodes[selectedUser] : code)}
            theme="vs-light"
            options={{ fontSize: 16, fontFamily: 'JetBrains Mono, Fira Mono, IBM Plex Mono, monospace', minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', smoothScrolling: true, fontLigatures: true, readOnly: !!selectedUser && selectedUser !== username }}
            onChange={val => {
              if (!selectedUser || selectedUser === username) handleCodeChange(val);
            }}
          />
          <Box mt={2} textAlign="right">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<PlayArrowIcon />}
              sx={{ fontWeight: 700, borderRadius: 2, px: 4, mr: 2 }}
              onClick={() => handleRun(false)}
              disabled={running || sharingRun}
            >
              {running ? 'Running...' : 'Run Code'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              sx={{ fontWeight: 700, borderRadius: 2, px: 4, mr: 2 }}
              onClick={() => handleRun(true)}
              disabled={sharingRun || running}
            >
              {sharingRun ? 'Sharing...' : 'Share Run Output'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </Box>
          {runResult && (
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>Sample Run Result</Typography>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, background: runResult.passed ? '#e7fbe7' : '#fff0f0' }}>
                {runResult.passed ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                <Box>
                  <Typography variant="subtitle2" color={runResult.passed ? 'success.main' : 'error.main'} fontWeight={700}>
                    {runResult.passed ? 'Passed' : 'Failed'}
                  </Typography>
                  <Typography variant="body2">Input: <code>{runResult.input}</code></Typography>
                  <Typography variant="body2">Expected: <code>{runResult.expected}</code></Typography>
                  <Typography variant="body2">Output: <code>{runResult.output}</code></Typography>
                  <Typography variant="body2">Runtime: {runResult.runtime}</Typography>
                </Box>
              </Paper>
            </Box>
          )}
          {results && (
            <Box mt={4}>
              <Typography variant="h6" fontWeight={700} mb={2}>Submission Results</Typography>
              <Stack spacing={2}>
                {results.map((r, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, background: r.passed ? '#e7fbe7' : '#fff0f0' }}>
                    {r.passed ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                    <Box>
                      <Typography variant="subtitle2" color={r.passed ? 'success.main' : 'error.main'} fontWeight={700}>
                        {r.passed ? 'Passed' : 'Failed'}
                      </Typography>
                      <Typography variant="body2">Input: <code>{r.input}</code></Typography>
                      <Typography variant="body2">Expected: <code>{r.expected}</code></Typography>
                      <Typography variant="body2">Output: <code>{r.output}</code></Typography>
                      <Typography variant="body2">Runtime: {r.runtime}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
          {submitError && (
            <Alert severity="error" sx={{ mt: 3 }}>{submitError}</Alert>
          )}
        </Paper>
        <Paper elevation={2} sx={{ flex: 1, p: 2, borderRadius: 4, minWidth: 320, maxHeight: 500, display: 'flex', flexDirection: 'column', background: '#f7f7fa', boxShadow: '0 2px 12px 0 rgba(108,99,255,0.07)' }}>
          <Typography variant="h6" fontWeight={700} mb={2} color="primary">Users in Room ({Math.max(users.length, roomUsers.length)})</Typography>
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
            {/* Show room participants from backend */}
            {roomUsers.map(u => (
              <Chip
                key={u.id}
                avatar={<Avatar sx={{ bgcolor: stringToColor(u.username), width: 24, height: 24, fontSize: 14 }}>{u.username.slice(0, 2)}</Avatar>}
                label={u.username === username ? `${u.username} (You)` : u.username}
                color={selectedUser === u.username ? 'primary' : 'default'}
                onClick={() => {
                  setSelectedUser(u.username === selectedUser ? null : u.username);
                  setSelectedHistoryIndex({});
                  if (u.username !== selectedUser) fetchUserSubmissions(u.username);
                  else setShowSubmissions(false);
                }}
                sx={{ 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  mb: 1, 
                  border: activeUser === u.username ? '2px solid #4caf50' : undefined, 
                  background: activeUser === u.username ? '#e7fbe7' : undefined,
                  opacity: users.includes(u.username) ? 1 : 0.6 // Show offline users with reduced opacity
                }}
                variant={activeUser === u.username ? 'filled' : 'outlined'}
                icon={<HistoryIcon fontSize="small" />}
              />
            ))}
            {/* Show any additional connected users not in room participants */}
            {users.filter(u => !roomUsers.some(ru => ru.username === u)).map(u => (
              <Chip
                key={u}
                avatar={<Avatar sx={{ bgcolor: stringToColor(u), width: 24, height: 24, fontSize: 14 }}>{u.slice(0, 2)}</Avatar>}
                label={`${u} (Guest)`}
                color="warning"
                sx={{ fontWeight: 600, mb: 1, opacity: 0.8 }}
                variant="outlined"
              />
            ))}
          </Stack>
          {showSubmissions && (
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>Submission History for {selectedUser}</Typography>
              {loadingSubmissions ? <CircularProgress size={20} /> : (
                <Stack spacing={1}>
                  {userSubmissions.length === 0 && <Typography variant="body2" color="text.secondary">No submissions yet.</Typography>}
                  {userSubmissions.map((sub, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 1, fontSize: 13, background: sub.result === 'pass' ? '#e7fbe7' : '#fff0f0', borderLeft: sub.result === 'pass' ? '4px solid #4caf50' : '4px solid #f44336' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={sub.result} color={sub.result === 'pass' ? 'success' : 'error'} size="small" />
                        <Typography variant="body2" fontWeight={700}>{new Date(sub.submission_time).toLocaleString()}</Typography>
                        <Chip label={sub.language} size="small" />
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 1, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap' }}>{sub.code}</Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          )}
          {selectedUser && userCodeHistory[selectedUser] && userCodeHistory[selectedUser].length > 1 && (
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>Code History for {selectedUser}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {userCodeHistory[selectedUser].map((snap, idx) => (
                  <Button
                    key={idx}
                    size="small"
                    variant={selectedHistoryIndex[selectedUser] === idx ? 'contained' : 'outlined'}
                    color={selectedHistoryIndex[selectedUser] === idx ? 'primary' : 'inherit'}
                    onClick={() => {
                      setSelectedHistoryIndex(prev => ({ ...prev, [selectedUser]: idx }));
                      if (selectedUser === username) setCode(snap);
                    }}
                    sx={{ fontFamily: 'JetBrains Mono, monospace', minWidth: 36 }}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary">Click a snapshot to view. If it's your code, you can restore it.</Typography>
            </Box>
          )}
          <Typography variant="h6" fontWeight={700} mb={2} color="primary">Chat</Typography>
          <Box ref={chatBoxRef} sx={{ flex: 1, overflowY: 'auto', mb: 1, pr: 1, borderRadius: 2, background: '#fafdff', boxShadow: 'inset 0 1px 4px #e0e7ff' }}>
            {chatMessages.map((msg, idx) => (
              <Box key={idx} sx={{ mb: 1, display: 'flex', alignItems: 'center', transition: 'background 0.2s', '&:hover': { background: '#f0f4ff' } }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#6C63FF', fontSize: 12, mr: 1 }}>{msg.username ? msg.username.slice(0, 2) : msg.sid.slice(-2)}</Avatar>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', color: '#333', fontWeight: 700 }}>{msg.username || msg.sid}:</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', color: '#333', ml: 1 }}>{msg.message}</Typography>
              </Box>
            ))}
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
              sx={{ bgcolor: '#fff', borderRadius: 2 }}
            />
            <IconButton color="primary" onClick={handleSendMessage} disabled={!chatInput.trim()} sx={{ transition: 'background 0.2s', '&:hover': { background: '#e0e7ff' } }}>
              <SendIcon />
            </IconButton>
          </Stack>
        </Paper>
      </Stack>
      <Snackbar open={openNotif} autoHideDuration={3000} onClose={() => setOpenNotif(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setOpenNotif(false)} severity="info">
          {notifications[notifications.length - 1]}
        </MuiAlert>
      </Snackbar>
      {/* Room Submission History */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight={700} mb={2}>Room Submission History</Typography>
        {loadingRoomSubmissions ? (
          <CircularProgress size={24} />
        ) : roomSubmissions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No submissions yet.</Typography>
        ) : (
          <Stack spacing={2}>
            {roomSubmissions.map((sub, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, background: sub.overall_status === 'pass' ? '#e7fbe7' : '#fff0f0', borderLeft: sub.overall_status === 'pass' ? '4px solid #4caf50' : '4px solid #f44336' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label={sub.overall_status} color={sub.overall_status === 'pass' ? 'success' : 'error'} size="small" />
                  <Typography variant="subtitle2" fontWeight={700}>{sub.username}</Typography>
                  <Typography variant="body2" color="text.secondary">{sub.execution_time ? `${sub.execution_time.toFixed(3)}s` : ''}</Typography>
                  <Typography variant="body2" color="text.secondary">{sub.submission_time ? new Date(sub.submission_time).toLocaleString() : ''}</Typography>
                  <Button size="small" onClick={() => setExpandedSubmission(expandedSubmission === idx ? null : idx)}>
                    {expandedSubmission === idx ? 'Hide' : 'Show'} Details
                  </Button>
                </Stack>
                {expandedSubmission === idx && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" fontWeight={700}>Code:</Typography>
                    <Paper variant="outlined" sx={{ p: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, background: '#f4f4fa', whiteSpace: 'pre-wrap', wordBreak: 'break-all', mb: 2 }}>
                      {sub.code}
                    </Paper>
                    <Typography variant="subtitle2" fontWeight={700}>Test Case Results:</Typography>
                    <Stack spacing={1}>
                      {sub.test_case_results && Array.isArray(sub.test_case_results) && sub.test_case_results.map((r: any, i: number) => (
                        <Paper key={i} variant="outlined" sx={{ p: 1, background: r.passed ? '#e7fbe7' : '#fff0f0', borderLeft: r.passed ? '4px solid #4caf50' : '4px solid #f44336' }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={r.passed ? 'Passed' : 'Failed'} color={r.passed ? 'success' : 'error'} size="small" />
                            <Typography variant="body2">Input: <code>{r.input}</code></Typography>
                            <Typography variant="body2">Expected: <code>{r.expected}</code></Typography>
                            <Typography variant="body2">Output: <code>{r.output}</code></Typography>
                            <Typography variant="body2">Runtime: {r.runtime}</Typography>
                            {r.error && <Alert severity="error" sx={{ ml: 2 }}>{r.error}</Alert>}
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default CollaborativeRoomPage; 