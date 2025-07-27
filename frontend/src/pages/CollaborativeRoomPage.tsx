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

// Helper function to create a robust socket connection
const createSocketConnection = (url: string) => {
  console.log('Creating socket connection to:', url);
  
  // Try to connect with multiple transport options
  return io(url, {
    transports: ['polling', 'websocket'],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true
  });
};

const languageOptions = [
  { 
    label: 'Python', 
    value: 'python', 
    monaco: 'python', 
    defaultCode: `def solution():
    # Write your solution here
    # Make sure to return the result
    pass
` 
  },
  { 
    label: 'JavaScript', 
    value: 'javascript', 
    monaco: 'javascript', 
    defaultCode: `function solution() {
    // Write your solution here
    // Make sure to return the result
}
` 
  },
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

function generateProblemTemplate(problemData: any, language: string): string {
  if (!problemData) {
    return languageOptions.find(l => l.value === language)?.defaultCode || '';
  }

  // Analyze problem title and description for better parameter naming
  const title = problemData.title?.toLowerCase() || '';
  const description = problemData.description?.toLowerCase() || '';
  
  let paramName = 'nums';
  if (title.includes('array') || title.includes('list') || description.includes('array') || description.includes('list')) {
    paramName = 'nums';
  } else if (title.includes('string') || description.includes('string')) {
    paramName = 's';
  } else if (title.includes('tree') || description.includes('tree')) {
    paramName = 'root';
  } else if (title.includes('graph') || description.includes('node')) {
    paramName = 'graph';
  } else if (title.includes('matrix') || description.includes('matrix')) {
    paramName = 'matrix';
  }

  if (language === 'python') {
    let template = `def solution(${paramName}):\n`;
    template += `    """\n`;
    template += `    ${problemData.title || 'Problem'}\n`;
    template += `    \n`;
    template += `    Args:\n`;
    template += `        ${paramName}: ${getParameterDescription(problemData, paramName)}\n`;
    template += `    \n`;
    template += `    Returns:\n`;
    template += `        ${getReturnDescription(problemData)}\n`;
    template += `    \n`;
    template += `    Example:\n`;
    if (problemData.sample_input && problemData.sample_output) {
      template += `        Input: ${problemData.sample_input.replace(/\n/g, ', ')}\n`;
      template += `        Output: ${problemData.sample_output}\n`;
    }
    template += `    """\n`;
    template += `    # Write your solution here\n`;
    template += `    \n`;
    template += `    # TODO: Implement your solution\n`;
    template += `    pass\n`;
    
    return template;
  } else if (language === 'javascript') {
    let template = `/**\n`;
    template += ` * ${problemData.title || 'Problem'}\n`;
    template += ` * \n`;
    template += ` * @param {${getJSParameterType(problemData)}} ${paramName} - ${getParameterDescription(problemData, paramName)}\n`;
    template += ` * @returns {${getJSReturnType(problemData)}} ${getReturnDescription(problemData)}\n`;
    template += ` * \n`;
    if (problemData.sample_input && problemData.sample_output) {
      template += ` * Example:\n`;
      template += ` * Input: ${problemData.sample_input.replace(/\n/g, ', ')}\n`;
      template += ` * Output: ${problemData.sample_output}\n`;
    }
    template += ` */\n`;
    template += `function solution(${paramName}) {\n`;
    template += `    // Write your solution here\n`;
    template += `    \n`;
    template += `    // TODO: Implement your solution\n`;
    template += `}\n`;
    
    return template;
  }
  
  return languageOptions.find(l => l.value === language)?.defaultCode || '';
}

function getParameterDescription(problemData: any, paramName: string): string {
  if (paramName === 'nums') return 'Array of numbers';
  if (paramName === 's') return 'Input string';
  if (paramName === 'root') return 'Root of the binary tree';
  if (paramName === 'graph') return 'Graph representation';
  if (paramName === 'matrix') return '2D matrix/array';
  return 'Input parameter';
}

function getReturnDescription(problemData: any): string {
  const output = problemData.sample_output?.toLowerCase() || '';
  if (output.includes('[') || output.includes('array')) return 'Array result';
  if (output === 'true' || output === 'false') return 'Boolean result';
  if (!isNaN(Number(output))) return 'Numeric result';
  return 'Result';
}

function getJSParameterType(problemData: any): string {
  const input = problemData.sample_input?.toLowerCase() || '';
  if (input.includes('[') || input.includes(',')) return 'number[]';
  if (input.includes('"') || input.includes("'")) return 'string';
  return 'any';
}

function getJSReturnType(problemData: any): string {
  const output = problemData.sample_output?.toLowerCase() || '';
  if (output.includes('[')) return 'number[]';
  if (output === 'true' || output === 'false') return 'boolean';
  if (!isNaN(Number(output))) return 'number';
  return 'any';
}

const CollaborativeRoomPage: React.FC = () => {
  const { code: roomCode, problem_id: problemId } = useParams<{ code: string; problem_id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
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
    console.log('Initializing socket connection to:', SOCKET_URL);
    
    // Use the helper function to create a robust connection
    const socket = createSocketConnection(SOCKET_URL);
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket.id);
      setConnected(true);
      
      // Join the room with a small delay to ensure the connection is stable
      setTimeout(() => {
        console.log('Emitting join_room event for room:', roomCode, 'username:', username || 'Anonymous');
        socket.emit('join_room', { room: roomCode, username: username || 'Anonymous' });
      }, 500);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
      
      // If the disconnect was not intentional, try to reconnect
      if (reason !== 'io client disconnect') {
        console.log('Attempting to reconnect...');
        setTimeout(() => {
          socket.connect();
        }, 1000);
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
      
      // Try different transport strategies
      if (error.message.includes('websocket')) {
        console.log('WebSocket connection failed, retrying with polling transport only...');
        socket.io.opts.transports = ['polling'];
        socket.connect();
      } else if (socket.io.opts && socket.io.opts.transports && socket.io.opts.transports.includes('websocket')) {
        // If we're still having issues, try with polling only
        console.log('Connection issues, falling back to polling only...');
        if (socket.io.opts) {
          socket.io.opts.transports = ['polling'];
        }
        socket.connect();
      }
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setConnected(true);
      
      // Re-join the room after reconnection
      console.log('Re-joining room after reconnection');
      socket.emit('join_room', { room: roomCode, username: username || 'Anonymous' });
    });
    
    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      
      // If we've tried multiple times with no success, show a message to the user
      setConsoleOutput(prev => 
        prev + '\n\nConnection issues detected. You may need to refresh the page if collaboration features are not working.'
      );
    });
    
    // Add specific handlers for room events to confirm connection is working
    socket.on('user_joined', (data) => {
      console.log('User joined event received:', data);
    });
    
    socket.on('user_list', (data) => {
      console.log('User list received:', data);
    });
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
    socket.on('room_state_updated', (data: any) => {
      if (data.room) {
        setRoomData(data.room);
        setRoomUsers(data.room.participants || []);
      }
      if (data.problem) {
        setProblemData(data.problem);
      }
    });
    socket.on('user_joined_room', (data: any) => {
      if (data.room_code === roomCode && data.user) {
        setRoomUsers(prev => {
          const exists = prev.find(u => u.id === data.user.id);
          if (!exists) {
            return [...prev, data.user];
          }
          return prev;
        });
      }
    });
    // Listen for room state updates
    socket.on('room_state_updated', (data: any) => {
      if (data.room) {
        setRoomData(data.room);
        setRoomUsers(data.room.participants);
        setUsers(data.room.participants.map((u: any) => u.username));
      }
    });
    // Listen for user list updates
    socket.on('user_list', (data: any) => {
      if (data.users) {
        setRoomUsers(data.users);
        setUsers(data.users.map((u: any) => u.username));
      }
    });
    // Set up a connection health check
    const healthCheckInterval = setInterval(() => {
      if (socket && !socket.connected && socketRef.current === socket) {
        console.log('Socket health check: disconnected, attempting to reconnect...');
        socket.connect();
      }
    }, 10000);
    
    return () => {
      clearInterval(healthCheckInterval);
      if (socket.connected) {
        socket.emit('leave_room', { room: roomCode });
      }
      socket.disconnect();
    };
  }, [roomCode, language, username]);
  
  // Add a fallback polling mechanism for room state if socket connection fails
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    
    // If socket is disconnected for more than 10 seconds, start polling
    const startPolling = () => {
      if (pollInterval) return; // Already polling
      
      console.log('Starting fallback polling for room state');
      pollInterval = setInterval(async () => {
        if (!connected) {
          try {
            console.log('Polling for room state...');
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
            setUsers(usersRes.data.map((u: any) => u.username));
          } catch (err) {
            console.error('Polling error:', err);
          }
        }
      }, 10000); // Poll every 10 seconds
    };
    
    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
        console.log('Stopped fallback polling');
      }
    };
    
    // Start/stop polling based on connection status
    let disconnectTimer: NodeJS.Timeout | null = null;
    
    if (!connected) {
      // Start polling after 10 seconds of disconnection
      disconnectTimer = setTimeout(startPolling, 10000);
    } else {
      // Stop polling when connected
      stopPolling();
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = null;
      }
    }
    
    return () => {
      stopPolling();
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
      }
    };
  }, [connected, roomCode]);

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
        console.log(`Fetching room data for room code: ${roomCode}, problem ID: ${problemId}`);
        const token = localStorage.getItem('token');
        
        // First, ensure we're joined to the room
        try {
          console.log('Ensuring user is joined to the room');
          await axios.post(`https://structures-production.up.railway.app/api/rooms/${roomCode}/join`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Successfully joined/confirmed room membership');
        } catch (joinErr: any) {
          // If we get a 400, it means we're already in the room, which is fine
          if (joinErr.response?.status !== 400) {
            console.error('Error joining room:', joinErr);
          }
        }
        
        // Now fetch the room data
        const [roomRes, usersRes, problemRes] = await Promise.all([
          axios.get(`https://structures-production.up.railway.app/api/rooms/code/${roomCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://structures-production.up.railway.app/api/rooms/${roomCode}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://structures-production.up.railway.app/api/problems/${problemId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        setRoomData(roomRes.data);
        setRoomUsers(usersRes.data);
        setUsers(usersRes.data.map((u: any) => u.username));
        setProblemData(problemRes.data);
        
        // Initialize code with problem-specific template if code is empty
        if (!code.trim()) {
          const template = generateProblemTemplate(problemRes.data, language);
          setCode(template);
          
          setConsoleOutput(`Welcome to the collaborative room! 

📝 Your code editor has been initialized with a solution template.
🔧 Modify the solution function to solve the problem.
🏃 Use "Test Run" to see print output from your code.
🎯 Use "Run Sample" to test against the sample input/output.
✅ Use "Submit" to test against all test cases.

Good luck! 🚀`);
        }
      } catch (err: any) {
        console.error('Failed to fetch room data:', err);
        setRoomError(err.response?.data?.detail || 'Failed to load room data');
      } finally {
        setRoomLoading(false);
      }
    };

    if (roomCode && problemId) {
      fetchRoomData();
    }
  }, [roomCode, problemId]);

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
    
    // Generate new template for the selected language
    if (problemData) {
      const newTemplate = generateProblemTemplate(problemData, val);
      setCode(newTemplate);
      
      // Emit the new code to other users
      if (socketRef.current) {
        socketRef.current.emit('code_update', { room: roomCode, code: newTemplate, username });
      }
    }
    
    if (socketRef.current) {
      socketRef.current.emit('language_update', { room: roomCode, language: val });
    }
  };

  const handleTestRun = async () => {
    setRunning(true);
    setRunResult(null);
    setSubmitError('');
    setConsoleOutput('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `https://structures-production.up.railway.app/api/rooms/${roomCode}/execute`,
        {
          code,
          language,
          simple_run: true, // This will execute code directly to show print statements
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Handle simple execution result
      if (res.data.simple_execution) {
        if (res.data.success) {
          setConsoleOutput(res.data.output || 'Code executed successfully (no output)');
        } else {
          setConsoleOutput(`Error: ${res.data.error || 'Execution failed'}`);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Test run failed';
      setSubmitError(errorMsg);
      setConsoleOutput(`Error: ${errorMsg}`);
    } finally {
      setRunning(false);
    }
  };

  const handleRun = async (share: boolean = false) => {
    if (share) setSharingRun(true);
    else setRunning(true);
    setRunResult(null);
    setSubmitError('');
    setConsoleOutput('');
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
      
      // Set console output from the execution result
      if (result) {
        if (result.output) {
          setConsoleOutput(result.output);
        } else if (result.error) {
          setConsoleOutput(`Error: ${result.error}`);
        }
      }

      // Emit socket event for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('code_executed', {
          room: roomCode,
          result: res.data,
          sample_only: true,
          shared: share,
          username: username
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Run failed';
      setSubmitError(errorMsg);
      setConsoleOutput(`Error: ${errorMsg}`);
    } finally {
      if (share) setSharingRun(false);
      else setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    setResults(null);
    setConsoleOutput('');
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
      
      const testResults = res.data.test_case_results || [];
      setResults(testResults);
      
      // Show submission summary in console
      const passedCount = testResults.filter((r: any) => r.passed).length;
      const totalCount = testResults.length;
      const overallStatus = res.data.overall_status || 'unknown';
      
      let summaryMessage = `Submission Complete!\n`;
      summaryMessage += `Status: ${overallStatus.toUpperCase()}\n`;
      summaryMessage += `Passed: ${passedCount}/${totalCount} test cases\n`;
      summaryMessage += `Execution Time: ${res.data.total_execution_time?.toFixed(3) || '0.000'}s`;
      
      if (overallStatus === 'pass') {
        summaryMessage += `\n🎉 All tests passed! Great job!`;
      } else if (passedCount > 0) {
        summaryMessage += `\n⚠️ Some tests failed. Check the results below.`;
      } else {
        summaryMessage += `\n❌ All tests failed. Review your solution.`;
      }
      
      setConsoleOutput(summaryMessage);

      // Emit socket event for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('code_submitted', {
          room: roomCode,
          result: res.data,
          passed: overallStatus === 'pass',
          username: username
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Submission failed';
      setSubmitError(errorMsg);
      setConsoleOutput(`Submission Error: ${errorMsg}`);
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
        bgcolor: 'var(--color-background)',
        color: 'var(--color-foreground)'
      }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} sx={{ color: 'var(--color-primary)' }} />
          <Typography variant="h6">Loading collaborative room...</Typography>
        </Stack>
      </Box>
    );
  }
  
  // Show connection warning if not connected after initial load
  const showConnectionWarning = !connected && !roomLoading && roomData;

  if (roomError) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--color-background)',
        color: 'var(--color-foreground)',
        p: 4
      }}>
        <Stack alignItems="center" spacing={3}>
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'hsl(0 100% 50% / 0.1)', color: 'hsl(0 100% 50%)' }}>
            {roomError}
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/rooms'}
            sx={{
              bgcolor: 'var(--color-primary)',
              '&:hover': { bgcolor: 'var(--color-primary)', opacity: 0.9 },
              px: 4,
              py: 1.5,
              borderRadius: 3
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
      bgcolor: 'var(--color-background)',
      color: 'var(--color-foreground)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Connection Warning Banner */}
      {showConnectionWarning && (
        <Box sx={{
          bgcolor: 'var(--color-warning)',
          color: 'var(--color-warning-foreground)',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}>
          <div className="animate-pulse">
            <FiberManualRecordIcon sx={{ fontSize: 14 }} />
          </div>
          <Typography variant="body2" fontWeight={500}>
            Connection issues detected. Real-time collaboration features may be limited. 
            <Button 
              size="small" 
              sx={{ ml: 2, color: 'inherit', textDecoration: 'underline' }}
              onClick={() => window.location.reload()}
            >
              Refresh page
            </Button>
          </Typography>
        </Box>
      )}
      
      {/* Header */}
      <Box sx={{
        borderBottom: '1px solid var(--color-border)',
        px: 3,
        py: 2,
        bgcolor: 'var(--color-card)'
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CodeIcon sx={{ color: 'var(--color-primary)', fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: 'var(--color-primary)' }}>
            Room {roomCode}
          </Typography>
          <Tooltip title={connected ? 'Real-time connection active' : 'Connection issues - some features may be limited'}>
            <Chip
              label={connected ? 'Connected' : 'Disconnected'}
              color={connected ? 'success' : 'error'}
              size="small"
              sx={{
                bgcolor: connected ? 'var(--color-success)' : 'var(--color-destructive)',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Tooltip>
          <Badge badgeContent={Math.max(users.length, roomUsers.length)} color="primary">
            <PeopleIcon sx={{ color: 'var(--color-muted-foreground)' }} />
          </Badge>
          {problemData && (
            <Chip
              label={problemData.title}
              sx={{
                bgcolor: 'var(--color-card)',
                color: 'var(--color-foreground)',
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
              borderRadius: 3,
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted-foreground)',
              '&:hover': {
                borderColor: 'var(--color-destructive)',
                color: 'var(--color-destructive)',
                bgcolor: 'var(--color-destructive-bg)'
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
                bgcolor: 'var(--color-card)',
                color: 'var(--color-foreground)',
                '& fieldset': { borderColor: 'var(--color-border)' },
                '&:hover fieldset': { borderColor: 'var(--color-primary)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)' }
              },
              '& .MuiInputLabel-root': { color: 'var(--color-muted-foreground)' },
              '& .MuiSelect-icon': { color: 'var(--color-muted-foreground)' }
            }}
          >
            {languageOptions.map(lang => (
              <MenuItem key={lang.value} value={lang.value} sx={{ bgcolor: 'var(--color-card)', color: 'var(--color-foreground)' }}>
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
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: '1px solid var(--color-border)',
          bgcolor: 'var(--color-card)',
          overflow: 'hidden',
          willChange: 'width'
        }}>
          {sidebarOpen && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  borderBottom: '1px solid var(--color-border)',
                  '& .MuiTab-root': {
                    color: 'var(--color-muted-foreground)',
                    fontWeight: 600,
                    minHeight: 48
                  },
                  '& .Mui-selected': { color: 'var(--color-primary)' },
                  '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)' }
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
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--color-primary)', mb: 1 }}>
                        {problemData.title}
                      </Typography>
                      <Chip
                        label={problemData.difficulty}
                        size="small"
                        sx={{
                          bgcolor: problemData.difficulty === 'Easy' ? 'var(--color-primary)' :
                            problemData.difficulty === 'Medium' ? 'hsl(30 100% 50%)' : 'hsl(0 100% 50%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)', lineHeight: 1.6 }}>
                      {problemData.description}
                    </Typography>

                    {problemData.sample_input && problemData.sample_output && (
                      <Card sx={{ 
                        bgcolor: 'var(--color-card)', 
                        border: '1px solid var(--color-border)',
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'var(--color-primary)', mb: 2 }}>
                            Example:
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)', fontWeight: 600 }}>
                                Input:
                              </Typography>
                              <Paper sx={{
                                p: 1.5,
                                mt: 0.5,
                                bgcolor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 13,
                                color: 'var(--color-foreground)'
                              }}>
                                {problemData.sample_input}
                              </Paper>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)', fontWeight: 600 }}>
                                Output:
                              </Typography>
                              <Paper sx={{
                                p: 1.5,
                                mt: 0.5,
                                bgcolor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 13,
                                color: 'var(--color-foreground)'
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
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--color-primary)' }}>
                      Room Participants ({Math.max(users.length, roomUsers.length)})
                    </Typography>
                    {roomUsers.map(u => (
                      <Card key={u.id} sx={{
                        bgcolor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'var(--color-muted)', borderColor: 'var(--color-primary)' }
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
                              <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--color-foreground)' }}>
                                {u.username === username ? `${u.username} (You)` : u.username}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FiberManualRecordIcon
                                  sx={{
                                    fontSize: 8,
                                    color: users.includes(u.username) ? 'var(--color-primary)' : 'var(--color-muted-foreground)'
                                  }}
                                />
                                <Typography variant="caption" sx={{
                                  color: users.includes(u.username) ? 'var(--color-primary)' : 'var(--color-muted-foreground)'
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
                                  bgcolor: 'var(--color-primary)',
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
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--color-primary)', mb: 2 }}>
                      Team Chat
                    </Typography>
                    <Box sx={{
                      flex: 1,
                      overflowY: 'auto',
                      mb: 2,
                      bgcolor: 'var(--color-card)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid var(--color-border)'
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
                            <Typography variant="caption" fontWeight={600} sx={{ color: 'var(--color-primary)' }}>
                              {msg.username || msg.sid}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{
                            color: 'var(--color-foreground)',
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
                            bgcolor: 'var(--color-background)',
                            color: 'var(--color-foreground)',
                            '& fieldset': { borderColor: 'var(--color-border)' },
                            '&:hover fieldset': { borderColor: 'var(--color-primary)' },
                            '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)' }
                          }
                        }}
                      />
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim()}
                        sx={{
                          bgcolor: 'var(--color-primary)',
                          color: 'white',
                          '&:hover': { bgcolor: 'var(--color-primary)', opacity: 0.9 },
                          '&:disabled': { bgcolor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }
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
            borderBottom: '1px solid var(--color-border)',
            px: 3,
            py: 1.5,
            bgcolor: 'var(--color-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                variant="text"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{
                  color: 'var(--color-muted-foreground)',
                  minWidth: 'auto',
                  p: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: 'var(--color-primary)',
                    bgcolor: 'var(--color-primary-hover)'
                  },
                  '& .MuiSvgIcon-root': {
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }
                }}
              >
                {sidebarOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Button>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--color-muted-foreground)' }}>
                Solution.{language === 'python' ? 'py' : 'js'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                onClick={() => {
                  if (problemData) {
                    const template = generateProblemTemplate(problemData, language);
                    setCode(template);
                    if (socketRef.current) {
                      socketRef.current.emit('code_update', { room: roomCode, code: template, username });
                    }
                  }
                }}
                size="small"
                sx={{
                  color: 'hsl(30 100% 50%)',
                  '&:hover': { bgcolor: 'hsl(30 100% 50% / 0.1)' }
                }}
              >
                Reset Template
              </Button>
              <Button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                size="small"
                sx={{
                  color: 'var(--color-muted-foreground)',
                  '&:disabled': { color: 'var(--color-muted)' }
                }}
              >
                Undo
              </Button>
              <Button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                size="small"
                sx={{
                  color: 'var(--color-muted-foreground)',
                  '&:disabled': { color: 'var(--color-muted)' }
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
            borderTop: '1px solid var(--color-border)',
            bgcolor: 'var(--color-card)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{
              px: 3,
              py: 1.5,
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--color-muted-foreground)' }}>
                Console
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleTestRun()}
                  disabled={running}
                  size="small"
                  sx={{
                    borderRadius: 3,
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-muted-foreground)',
                    '&:hover': {
                      borderColor: 'hsl(30 100% 50%)',
                      color: 'hsl(30 100% 50%)',
                      bgcolor: 'hsl(30 100% 50% / 0.1)'
                    }
                  }}
                >
                  {running ? 'Testing...' : 'Test Run'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleRun()}
                  disabled={running}
                  size="small"
                  sx={{
                    borderRadius: 3,
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-muted-foreground)',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                      bgcolor: 'var(--color-primary) / 0.1'
                    }
                  }}
                >
                  {running ? 'Running...' : 'Run Sample'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="small"
                  sx={{
                    borderRadius: 3,
                    bgcolor: 'var(--color-primary)',
                    '&:hover': { bgcolor: 'var(--color-primary)', opacity: 0.9 },
                    fontWeight: 600
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {/* Console Output */}
              {consoleOutput && (
                <Card sx={{
                  mb: 2,
                  bgcolor: 'var(--color-card)',
                  border: '1px solid var(--color-border)'
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'var(--color-primary)', mb: 1 }}>
                      Console Output
                    </Typography>
                    <Typography variant="body2" sx={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: 'var(--color-foreground)',
                      bgcolor: 'var(--color-background)',
                      p: 1.5,
                      borderRadius: 1,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {consoleOutput}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Run Result */}
              {runResult && (
                <Card sx={{
                  mb: 2,
                  bgcolor: runResult.passed ? 'var(--color-primary) / 0.1' : 'hsl(0 100% 50% / 0.1)',
                  border: `1px solid ${runResult.passed ? 'var(--color-primary)' : 'hsl(0 100% 50%)'}`
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                      {runResult.passed ?
                        <CheckCircleIcon sx={{ color: 'var(--color-primary)', fontSize: 20 }} /> :
                        <CancelIcon sx={{ color: 'hsl(0 100% 50%)', fontSize: 20 }} />
                      }
                      <Typography variant="subtitle2" fontWeight={700} sx={{
                        color: runResult.passed ? 'var(--color-primary)' : 'hsl(0 100% 50%)'
                      }}>
                        {runResult.passed ? 'Test Passed' : 'Test Failed'}
                      </Typography>
                      <Chip
                        label={`${runResult.execution_time?.toFixed(3) || '0.000'}s`}
                        size="small"
                        sx={{
                          bgcolor: 'var(--color-muted)',
                          color: 'var(--color-muted-foreground)',
                          fontSize: 11
                        }}
                      />
                    </Stack>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)', fontWeight: 600 }}>
                          Input:
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: 'var(--color-foreground)',
                          bgcolor: 'var(--color-card)',
                          p: 1,
                          borderRadius: 1,
                          mt: 0.5
                        }}>
                          {runResult.input}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)', fontWeight: 600 }}>
                          Expected:
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: 'var(--color-foreground)',
                          bgcolor: 'var(--color-card)',
                          p: 1,
                          borderRadius: 1,
                          mt: 0.5
                        }}>
                          {runResult.expected}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)', fontWeight: 600 }}>
                          Actual Output:
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: runResult.passed ? 'var(--color-primary)' : 'hsl(0 100% 50%)',
                          bgcolor: 'var(--color-card)',
                          p: 1,
                          borderRadius: 1,
                          mt: 0.5
                        }}>
                          {runResult.output || 'No output'}
                        </Typography>
                      </Box>
                      {runResult.error && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'hsl(0 100% 50%)', fontWeight: 600 }}>
                            Error:
                          </Typography>
                          <Typography variant="body2" sx={{
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'hsl(0 100% 50%)',
                            bgcolor: 'var(--color-card)',
                            p: 1,
                            borderRadius: 1,
                            mt: 0.5
                          }}>
                            {runResult.error}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Submission Results */}
              {results && results.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'var(--color-primary)', mb: 2 }}>
                    Submission Results
                  </Typography>
                  <Stack spacing={2}>
                    {results.map((r, i) => (
                      <Card key={i} sx={{
                        bgcolor: r.passed ? 'var(--color-primary) / 0.1' : 'hsl(0 100% 50% / 0.1)',
                        border: `1px solid ${r.passed ? 'var(--color-primary)' : 'hsl(0 100% 50%)'}`
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            {r.passed ?
                              <CheckCircleIcon sx={{ color: 'var(--color-primary)', fontSize: 18 }} /> :
                              <CancelIcon sx={{ color: 'hsl(0 100% 50%)', fontSize: 18 }} />
                            }
                            <Typography variant="body2" fontWeight={600} sx={{
                              color: r.passed ? 'var(--color-primary)' : 'hsl(0 100% 50%)'
                            }}>
                              Test Case {i + 1}
                            </Typography>
                            <Chip
                              label={r.runtime}
                              size="small"
                              sx={{
                                bgcolor: 'var(--color-muted)',
                                color: 'var(--color-muted-foreground)',
                                fontSize: 10,
                                height: 20
                              }}
                            />
                          </Stack>
                          {!r.passed && (
                            <Stack spacing={1} sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{
                                color: 'var(--color-foreground)',
                                fontFamily: 'JetBrains Mono, monospace',
                                display: 'block',
                                bgcolor: 'var(--color-card)',
                                p: 1,
                                borderRadius: 1
                              }}>
                                Expected: {r.expected}
                              </Typography>
                              <Typography variant="caption" sx={{
                                color: 'hsl(0 100% 50%)',
                                fontFamily: 'JetBrains Mono, monospace',
                                display: 'block',
                                bgcolor: 'var(--color-card)',
                                p: 1,
                                borderRadius: 1
                              }}>
                                Got: {r.output || 'No output'}
                              </Typography>
                              {r.error && (
                                <Typography variant="caption" sx={{
                                  color: 'hsl(0 100% 50%)',
                                  fontFamily: 'JetBrains Mono, monospace',
                                  display: 'block',
                                  bgcolor: 'var(--color-card)',
                                  p: 1,
                                  borderRadius: 1
                                }}>
                                  Error: {r.error}
                                </Typography>
                              )}
                            </Stack>
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
                    bgcolor: 'hsl(0 100% 50% / 0.1)',
                    border: '1px solid hsl(0 100% 50%)',
                    color: 'hsl(0 100% 50%)',
                    '& .MuiAlert-icon': { color: 'hsl(0 100% 50%)' }
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
            bgcolor: 'var(--color-primary)',
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
            bgcolor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: 'var(--color-foreground)', borderBottom: '1px solid var(--color-border)' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ExitToAppIcon sx={{ color: 'hsl(0 100% 50%)' }} />
            <Typography variant="h6" fontWeight={700}>
              Exit Room
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: 'var(--color-muted-foreground)' }}>
            Are you sure you want to leave this collaborative room? Your progress will be saved, but you'll need the room code to rejoin.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid var(--color-border)', pt: 2, px: 3, pb: 3 }}>
          <Button
            onClick={() => setExitDialogOpen(false)}
            sx={{ color: 'var(--color-muted-foreground)', '&:hover': { bgcolor: 'var(--color-muted)' } }}
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
              borderRadius: 3,
              bgcolor: 'hsl(0 100% 50%)',
              '&:hover': { bgcolor: 'hsl(0 100% 45%)' },
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