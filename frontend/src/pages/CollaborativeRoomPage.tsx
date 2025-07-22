import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Chip, CircularProgress, Alert, MenuItem, Button,
  Divider, Card, CardContent, Tab, Tabs, Badge, IconButton, TextField, Tooltip, Avatar,
  Snackbar, Drawer, List, ListItem, ListItemText, ListItemIcon, Collapse, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import MonacoEditor from '@monaco-editor/react';
import io from 'socket.io-client';

import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import CodeIcon from '@mui/icons-material/Code';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';

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
  const navigate = useNavigate();
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
  const [showProblem, setShowProblem] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTestCases, setShowTestCases] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
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

  const handleExitRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://structures-production.up.railway.app/api/rooms/${roomCode}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Emit leave room event to socket
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { room: roomCode });
        socketRef.current.disconnect();
      }

      // Navigate back to rooms page
      navigate('/rooms');
    } catch (err) {
      console.error('Failed to leave room:', err);
      // Still navigate back even if API call fails
      navigate('/rooms');
    }
  };

  if (roomLoading) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0a0a0a',
        color: 'white'
      }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} sx={{ color: '#00d4aa' }} />
          <Typography variant="h6">Loading collaborative room...</Typography>
        </Stack>
      </Box>
    );
  }

  if (roomError) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0a0a0a',
        color: 'white',
        p: 4
      }}>
        <Stack alignItems="center" spacing={3}>
          <Alert severity="error" sx={{ mb: 2, bgcolor: '#2d1b1b', color: '#ff6b6b' }}>
            {roomError}
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/rooms'}
            sx={{
              bgcolor: '#00d4aa',
              '&:hover': { bgcolor: '#00b894' },
              px: 4,
              py: 1.5,
              borderRadius: 2
            }}
          >
            Back to Rooms
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100vh',
      bgcolor: '#0a0a0a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{
        borderBottom: '1px solid #2d3748',
        px: 3,
        py: 2,
        bgcolor: '#1a1a1a'
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CodeIcon sx={{ color: '#00d4aa', fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: '#00d4aa' }}>
            Room {roomCode}
          </Typography>
          <Chip
            label={connected ? 'Connected' : 'Disconnected'}
            color={connected ? 'success' : 'error'}
            size="small"
            sx={{
              bgcolor: connected ? '#00d4aa' : '#ff6b6b',
              color: 'white',
              fontWeight: 600
            }}
          />
          <Badge badgeContent={Math.max(users.length, roomUsers.length)} color="primary">
            <PeopleIcon sx={{ color: '#a0aec0' }} />
          </Badge>
          {problemData && (
            <Chip
              label={problemData.title}
              sx={{
                bgcolor: '#2d3748',
                color: 'white',
                fontWeight: 600,
                maxWidth: 200
              }}
            />
          )}
          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setExitDialogOpen(true)}
            sx={{
              borderColor: '#4a5568',
              color: '#a0aec0',
              '&:hover': {
                borderColor: '#ff6b6b',
                color: '#ff6b6b',
                bgcolor: 'rgba(255, 107, 107, 0.1)'
              }
            }}
          >
            Exit Room
          </Button>
          <TextField
            select
            size="small"
            value={language}
            onChange={e => handleLanguageChange(e.target.value)}
            sx={{
              minWidth: 120,
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
            {languageOptions.map(lang => (
              <MenuItem key={lang.value} value={lang.value} sx={{ bgcolor: '#2d3748', color: 'white' }}>
                {lang.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Problem & Description */}
        <Box sx={{
          width: sidebarOpen ? 400 : 0,
          transition: 'width 0.3s ease',
          borderRight: '1px solid #2d3748',
          bgcolor: '#1a1a1a',
          overflow: 'hidden'
        }}>
          {sidebarOpen && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  borderBottom: '1px solid #2d3748',
                  '& .MuiTab-root': {
                    color: '#a0aec0',
                    fontWeight: 600,
                    minHeight: 48
                  },
                  '& .Mui-selected': { color: '#00d4aa' },
                  '& .MuiTabs-indicator': { backgroundColor: '#00d4aa' }
                }}
              >
                <Tab icon={<AssignmentIcon />} label="Problem" />
                <Tab icon={<PeopleIcon />} label="Users" />
                <Tab icon={<ChatIcon />} label="Chat" />
              </Tabs>

              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {/* Problem Tab */}
                {activeTab === 0 && problemData && (
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#00d4aa', mb: 1 }}>
                        {problemData.title}
                      </Typography>
                      <Chip
                        label={problemData.difficulty}
                        size="small"
                        sx={{
                          bgcolor: problemData.difficulty === 'Easy' ? '#00d4aa' :
                            problemData.difficulty === 'Medium' ? '#ffa726' : '#ff6b6b',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#e2e8f0', lineHeight: 1.6 }}>
                      {problemData.description}
                    </Typography>

                    {problemData.sample_input && problemData.sample_output && (
                      <Card sx={{ bgcolor: '#2d3748', border: '1px solid #4a5568' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#00d4aa', mb: 2 }}>
                            Example:
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 600 }}>
                                Input:
                              </Typography>
                              <Paper sx={{
                                p: 1.5,
                                mt: 0.5,
                                bgcolor: '#1a1a1a',
                                border: '1px solid #4a5568',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 13,
                                color: '#e2e8f0'
                              }}>
                                {problemData.sample_input}
                              </Paper>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 600 }}>
                                Output:
                              </Typography>
                              <Paper sx={{
                                p: 1.5,
                                mt: 0.5,
                                bgcolor: '#1a1a1a',
                                border: '1px solid #4a5568',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 13,
                                color: '#e2e8f0'
                              }}>
                                {problemData.sample_output}
                              </Paper>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}
                  </Stack>
                )}

                {/* Users Tab */}
                {activeTab === 1 && (
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#00d4aa' }}>
                      Room Participants ({Math.max(users.length, roomUsers.length)})
                    </Typography>
                    {roomUsers.map(u => (
                      <Card key={u.id} sx={{
                        bgcolor: '#2d3748',
                        border: '1px solid #4a5568',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#374151', borderColor: '#00d4aa' }
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{
                              bgcolor: stringToColor(u.username),
                              width: 32,
                              height: 32,
                              fontSize: 14,
                              fontWeight: 700
                            }}>
                              {u.username.slice(0, 2).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ color: 'white' }}>
                                {u.username === username ? `${u.username} (You)` : u.username}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FiberManualRecordIcon
                                  sx={{
                                    fontSize: 8,
                                    color: users.includes(u.username) ? '#00d4aa' : '#6b7280'
                                  }}
                                />
                                <Typography variant="caption" sx={{
                                  color: users.includes(u.username) ? '#00d4aa' : '#6b7280'
                                }}>
                                  {users.includes(u.username) ? 'Online' : 'Offline'}
                                </Typography>
                              </Stack>
                            </Box>
                            {activeUser === u.username && (
                              <Chip
                                label="Coding"
                                size="small"
                                sx={{
                                  bgcolor: '#00d4aa',
                                  color: 'white',
                                  fontSize: 11,
                                  height: 20
                                }}
                              />
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}

                {/* Chat Tab */}
                {activeTab === 2 && (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#00d4aa', mb: 2 }}>
                      Team Chat
                    </Typography>
                    <Box sx={{
                      flex: 1,
                      overflowY: 'auto',
                      mb: 2,
                      bgcolor: '#2d3748',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid #4a5568'
                    }}>
                      {chatMessages.map((msg, idx) => (
                        <Box key={idx} sx={{ mb: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Avatar sx={{
                              width: 20,
                              height: 20,
                              bgcolor: stringToColor(msg.username || msg.sid),
                              fontSize: 10
                            }}>
                              {(msg.username || msg.sid).slice(0, 2).toUpperCase()}
                            </Avatar>
                            <Typography variant="caption" fontWeight={600} sx={{ color: '#00d4aa' }}>
                              {msg.username || msg.sid}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{
                            color: '#e2e8f0',
                            ml: 3,
                            wordBreak: 'break-word'
                          }}>
                            {msg.message}
                          </Typography>
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#2d3748',
                            color: 'white',
                            '& fieldset': { borderColor: '#4a5568' },
                            '&:hover fieldset': { borderColor: '#00d4aa' },
                            '&.Mui-focused fieldset': { borderColor: '#00d4aa' }
                          }
                        }}
                      />
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim()}
                        sx={{
                          bgcolor: '#00d4aa',
                          color: 'white',
                          '&:hover': { bgcolor: '#00b894' },
                          '&:disabled': { bgcolor: '#4a5568', color: '#6b7280' }
                        }}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Main Coding Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Code Editor Header */}
          <Box sx={{
            borderBottom: '1px solid #2d3748',
            px: 3,
            py: 1.5,
            bgcolor: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                variant="text"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{
                  color: '#a0aec0',
                  minWidth: 'auto',
                  p: 1
                }}
              >
                {sidebarOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Button>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#a0aec0' }}>
                Solution.{language === 'python' ? 'py' : 'js'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                size="small"
                sx={{
                  color: '#a0aec0',
                  '&:disabled': { color: '#4a5568' }
                }}
              >
                Undo
              </Button>
              <Button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                size="small"
                sx={{
                  color: '#a0aec0',
                  '&:disabled': { color: '#4a5568' }
                }}
              >
                Redo
              </Button>
            </Stack>
          </Box>

          {/* Monaco Editor */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <MonacoEditor
              height="100%"
              language={languageOptions.find(l => l.value === language)?.monaco || 'python'}
              value={selectedUser && userCodeHistory[selectedUser] && selectedHistoryIndex[selectedUser] !== undefined
                ? userCodeHistory[selectedUser][selectedHistoryIndex[selectedUser] ?? userCodeHistory[selectedUser].length - 1]
                : (selectedUser && userCodes[selectedUser] !== undefined ? userCodes[selectedUser] : code)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                smoothScrolling: true,
                fontLigatures: true,
                readOnly: !!selectedUser && selectedUser !== username,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                bracketPairColorization: { enabled: true }
              }}
              onChange={val => {
                if (!selectedUser || selectedUser === username) handleCodeChange(val);
              }}
            />
          </Box>

          {/* Console/Output Area */}
          <Box sx={{
            height: 200,
            borderTop: '1px solid #2d3748',
            bgcolor: '#1a1a1a',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{
              px: 3,
              py: 1.5,
              borderBottom: '1px solid #2d3748',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#a0aec0' }}>
                Console
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleRun()}
                  disabled={running}
                  size="small"
                  sx={{
                    borderColor: '#4a5568',
                    color: '#a0aec0',
                    '&:hover': {
                      borderColor: '#00d4aa',
                      color: '#00d4aa',
                      bgcolor: 'rgba(0, 212, 170, 0.1)'
                    }
                  }}
                >
                  {running ? 'Running...' : 'Run'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="small"
                  sx={{
                    bgcolor: '#00d4aa',
                    '&:hover': { bgcolor: '#00b894' },
                    fontWeight: 600
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {/* Run Result */}
              {runResult && (
                <Card sx={{
                  mb: 2,
                  bgcolor: runResult.passed ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                  border: `1px solid ${runResult.passed ? '#00d4aa' : '#ff6b6b'}`
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                      {runResult.passed ?
                        <CheckCircleIcon sx={{ color: '#00d4aa', fontSize: 20 }} /> :
                        <CancelIcon sx={{ color: '#ff6b6b', fontSize: 20 }} />
                      }
                      <Typography variant="subtitle2" fontWeight={700} sx={{
                        color: runResult.passed ? '#00d4aa' : '#ff6b6b'
                      }}>
                        {runResult.passed ? 'Test Passed' : 'Test Failed'}
                      </Typography>
                      <Chip
                        label={runResult.runtime}
                        size="small"
                        sx={{
                          bgcolor: '#2d3748',
                          color: '#a0aec0',
                          fontSize: 11
                        }}
                      />
                    </Stack>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 600 }}>
                          Input:
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#e2e8f0',
                          bgcolor: '#2d3748',
                          p: 1,
                          borderRadius: 1,
                          mt: 0.5
                        }}>
                          {runResult.input}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 600 }}>
                          Expected:
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#e2e8f0',
                          bgcolor: '#2d3748',
                          p: 1,
                          borderRadius: 1,
                          mt: 0.5
                        }}>
                          {runResult.expected}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 600 }}>
                          Output:
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: runResult.passed ? '#00d4aa' : '#ff6b6b',
                          bgcolor: '#2d3748',
                          p: 1,
                          borderRadius: 1,
                          mt: 0.5
                        }}>
                          {runResult.output}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Submission Results */}
              {results && results.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#00d4aa', mb: 2 }}>
                    Submission Results
                  </Typography>
                  <Stack spacing={2}>
                    {results.map((r, i) => (
                      <Card key={i} sx={{
                        bgcolor: r.passed ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                        border: `1px solid ${r.passed ? '#00d4aa' : '#ff6b6b'}`
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            {r.passed ?
                              <CheckCircleIcon sx={{ color: '#00d4aa', fontSize: 18 }} /> :
                              <CancelIcon sx={{ color: '#ff6b6b', fontSize: 18 }} />
                            }
                            <Typography variant="body2" fontWeight={600} sx={{
                              color: r.passed ? '#00d4aa' : '#ff6b6b'
                            }}>
                              Test Case {i + 1}
                            </Typography>
                            <Chip
                              label={r.runtime}
                              size="small"
                              sx={{
                                bgcolor: '#2d3748',
                                color: '#a0aec0',
                                fontSize: 10,
                                height: 20
                              }}
                            />
                          </Stack>
                          {!r.passed && (
                            <Typography variant="caption" sx={{
                              color: '#e2e8f0',
                              fontFamily: 'JetBrains Mono, monospace',
                              display: 'block',
                              bgcolor: '#2d3748',
                              p: 1,
                              borderRadius: 1
                            }}>
                              Expected: {r.expected} | Got: {r.output}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Error Messages */}
              {submitError && (
                <Alert
                  severity="error"
                  sx={{
                    bgcolor: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid #ff6b6b',
                    color: '#ff6b6b',
                    '& .MuiAlert-icon': { color: '#ff6b6b' }
                  }}
                >
                  {submitError}
                </Alert>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Notifications */}
      <Snackbar
        open={openNotif}
        autoHideDuration={3000}
        onClose={() => setOpenNotif(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setOpenNotif(false)}
          severity="info"
          sx={{
            bgcolor: '#00d4aa',
            color: 'white'
          }}
        >
          {notifications[notifications.length - 1]}
        </MuiAlert>
      </Snackbar>

      {/* Exit Room Confirmation Dialog */}
      <Dialog
        open={exitDialogOpen}
        onClose={() => setExitDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid #2d3748',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid #2d3748' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ExitToAppIcon sx={{ color: '#ff6b6b' }} />
            <Typography variant="h6" fontWeight={700}>
              Exit Room
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: '#e2e8f0' }}>
            Are you sure you want to leave this collaborative room? Your progress will be saved, but you'll need the room code to rejoin.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #2d3748', pt: 2, px: 3, pb: 3 }}>
          <Button
            onClick={() => setExitDialogOpen(false)}
            sx={{ color: '#a0aec0', '&:hover': { bgcolor: '#2d3748' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setExitDialogOpen(false);
              handleExitRoom();
            }}
            variant="contained"
            startIcon={<ExitToAppIcon />}
            sx={{
              bgcolor: '#ff6b6b',
              '&:hover': { bgcolor: '#e53e3e' },
              fontWeight: 600
            }}
          >
            Exit Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollaborativeRoomPage; 