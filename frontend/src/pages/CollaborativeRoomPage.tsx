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
      socket.emit('join_room', { room: roomCode, username });
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
      setUsers(prev => prev.includes(data.username || data.sid) ? prev : [...prev, data.username || data.sid]);
      if (data.username && data.username !== username) {
        setNotifications(n => [...n, `${data.username} joined the room`]);
        setOpenNotif(true);
      }
    });
    socket.on('user_left', (data: any) => {
      setUsers(prev => prev.filter(u => u !== (data.username || data.sid)));
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
    // Optionally fetch from API if not found
  }, []);

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

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setSubmitError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'https://structures-production.up.railway.app/api/submissions/',
        {
          code,
          language,
          problem_id: undefined, // You may want to pass a real problem_id if available
          sample_only: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRunResult(res.data.test_case_results ? res.data.test_case_results[0] : null);
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    setResults(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'https://structures-production.up.railway.app/api/submissions/',
        {
          code,
          language,
          problem_id: undefined, // You may want to pass a real problem_id if available
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResults(res.data.test_case_results || []);
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
      // Try to get problemId from URL or props, fallback to undefined
      const pid = problemId || undefined;
      if (!pid) return;
      const res = await axios.get(`https://structures-production.up.railway.app/api/submissions/problem/${pid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter by username if available
      setUserSubmissions(res.data.filter((s: any) => s.username === user));
    } catch (err) {
      setUserSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        <Paper elevation={3} sx={{ flex: 2, p: { xs: 2, md: 4 }, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px 0 rgba(108,99,255,0.07)' }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={700} color="primary">Room: {roomCode}</Typography>
            <Chip label={connected ? 'Connected' : 'Disconnected'} color={connected ? 'success' : 'error'} />
            <Chip label={`Users: ${users.length}`} color="info" />
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
              onClick={handleRun}
              disabled={running}
            >
              {running ? 'Running...' : 'Run Code'}
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
          <Typography variant="h6" fontWeight={700} mb={2} color="primary">Users in Room</Typography>
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
            {users.map(u => (
              <Chip
                key={u}
                avatar={<Avatar sx={{ bgcolor: stringToColor(u), width: 24, height: 24, fontSize: 14 }}>{u.slice(0, 2)}</Avatar>}
                label={u === username ? `${u} (You)` : u}
                color={selectedUser === u ? 'primary' : 'default'}
                onClick={() => {
                  setSelectedUser(u === selectedUser ? null : u);
                  setSelectedHistoryIndex({});
                  if (u !== selectedUser) fetchUserSubmissions(u);
                  else setShowSubmissions(false);
                }}
                sx={{ fontWeight: 600, cursor: 'pointer', mb: 1, border: activeUser === u ? '2px solid #4caf50' : undefined, background: activeUser === u ? '#e7fbe7' : undefined }}
                variant={activeUser === u ? 'filled' : 'outlined'}
                icon={<HistoryIcon fontSize="small" />}
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
    </Box>
  );
};

export default CollaborativeRoomPage; 