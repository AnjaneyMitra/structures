import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, CircularProgress, Alert, Chip, Stack, Button, 
  MenuItem, Select, FormControl, Card, CardContent, Tabs, Tab,
  IconButton
} from '@mui/material';
import { BookmarkButton } from '../components/BookmarkButton';
import { useTheme } from '../context/ThemeContext';
import { useKeyboardShortcutsContext } from '../contexts/KeyboardShortcutsContext';
import { useAchievements } from '../contexts/AchievementsContext';
import { ShortcutConfig } from '../hooks/useKeyboardShortcuts';
import { useLevelUp } from '../hooks/useLevelUp';
import LevelUpModal from '../components/LevelUpModal';
import { useChallengeCompletion } from '../hooks/useChallengeCompletion';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MonacoEditor from '@monaco-editor/react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimerIcon from '@mui/icons-material/Timer';
import CodeIcon from '@mui/icons-material/Code';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import { TextField } from '@mui/material';
import SimpleHintsPanel from '../components/SimpleHintsPanel';
import ChallengeCreator from '../components/ChallengeCreator';

interface TestCase {
  id: number;
  input: string;
  output: string;
}

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  sample_input?: string;
  sample_output?: string;
  test_cases: TestCase[];
}

interface TestCaseResult {
  input: string;
  expected: string;
  output: string;
  passed: boolean;
  execution_time: number;
  error?: string;
}

interface SubmissionResult {
  test_case_results: TestCaseResult[];
  total_test_cases: number;
  passed_test_cases: number;
  overall_status: string;
  total_execution_time: number;
  average_execution_time: number;
}

const difficultyConfig: Record<string, any> = {
  Easy: { 
    color: '#00d4aa', 
    bgcolor: 'rgba(0, 212, 170, 0.1)', 
    icon: <CheckCircleIcon fontSize="small" /> 
  },
  Medium: { 
    color: '#ffa726', 
    bgcolor: 'rgba(255, 167, 38, 0.1)', 
    icon: <AssignmentTurnedInIcon fontSize="small" /> 
  },
  Hard: { 
    color: '#ff6b6b', 
    bgcolor: 'rgba(255, 107, 107, 0.1)', 
    icon: <EmojiEventsIcon fontSize="small" /> 
  },
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

const ProblemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fontSize, themeMode } = useTheme();
  const { registerShortcuts, unregisterShortcuts } = useKeyboardShortcutsContext();
  const { showAchievements } = useAchievements();
  const { levelUpInfo, showLevelUpModal, handleLevelUp, closeLevelUpModal } = useLevelUp();
  const { completeChallenge, checkActiveChallenge } = useChallengeCompletion();
  const [problem, setProblem] = useState<Problem | null>(null);

  // Font size mapping for Monaco Editor
  const fontSizeMap = {
    small: 12,
    medium: 14,
    large: 16,
    'extra-large': 18
  };

  // Theme mapping for Monaco Editor
  const getMonacoTheme = () => {
    if (themeMode === 'light') return 'vs';
    return 'vs-dark'; // All other themes use dark mode
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(languageOptions[0].value);
  const [code, setCode] = useState(languageOptions[0].defaultCode);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SubmissionResult | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [runResult, setRunResult] = useState<TestCaseResult | null>(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start collapsed by default
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [consoleHeight, setConsoleHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`https://structures-production.up.railway.app/api/problems/${id}`);
        setProblem(res.data);
        
        // Initialize code with problem-specific template
        const template = generateProblemTemplate(res.data, language);
        setCode(template);
        
        // Show helpful message in console
        setConsoleOutput(`Welcome to the problem editor! 

📝 Your code editor has been initialized with a solution template.
🔧 Modify the solution function to solve the problem.
🏃 Use "Test Run" to see print output from your code.
🎯 Use "Run Sample" to test against the sample input/output.
✅ Use "Submit" to test against all test cases.

Good luck! 🚀`);
      } catch (err) {
        setError('Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id, language]);

  // Fetch submissions when switching to submissions tab
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (activeTab === 1 && problem) {
        setLoadingSubmissions(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(
            `https://structures-production.up.railway.app/api/submissions/problem/${problem.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSubmissions(res.data || []);
        } catch (err) {
          console.error('Failed to fetch submissions:', err);
        } finally {
          setLoadingSubmissions(false);
        }
      }
    };
    fetchSubmissions();
  }, [activeTab, problem]);

  useEffect(() => {
    // Reset code when language changes with problem-specific template
    if (problem) {
      const template = generateProblemTemplate(problem, language);
      setCode(template);
    } else {
      const lang = languageOptions.find(l => l.value === language);
      if (lang) setCode(lang.defaultCode);
    }
  }, [language, problem]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    setResults(null);
    setConsoleOutput('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'https://structures-production.up.railway.app/api/submissions/',
        {
          problem_id: problem?.id,
          code,
          language,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResults(res.data);
      
      // Show achievements if any were earned
      if (res.data.newly_earned_achievements && res.data.newly_earned_achievements.length > 0) {
        showAchievements(res.data.newly_earned_achievements);
      }
      
      // Show level up notification if user leveled up
      if (res.data.level_up_info) {
        handleLevelUp(res.data.level_up_info);
      }
      
      // Show submission summary in console
      const testResults = res.data.test_case_results || [];
      const passedCount = testResults.filter((r: any) => r.passed).length;
      const totalCount = testResults.length;
      const overallStatus = res.data.overall_status || 'unknown';
      
      let summaryMessage = `Submission Complete!\n`;
      summaryMessage += `Status: ${overallStatus.toUpperCase()}\n`;
      summaryMessage += `Passed: ${passedCount}/${totalCount} test cases\n`;
      summaryMessage += `Execution Time: ${res.data.execution_time?.toFixed(3) || '0.000'}s`;
      
      if (overallStatus === 'pass') {
        summaryMessage += `\n🎉 All tests passed! Great job!`;
        if (res.data.xp_awarded && res.data.xp_awarded > 0) {
          summaryMessage += `\n⭐ +${res.data.xp_awarded} XP earned!`;
        }
        
        // Show level up message if user leveled up
        if (res.data.level_up_info && res.data.level_up_info.leveled_up) {
          summaryMessage += `\n🎊 LEVEL UP! You are now a ${res.data.level_up_info.new_title} (Level ${res.data.level_up_info.new_level})!`;
        }
        
        // Show streak information if available
        if (res.data.streak_info) {
          const streakInfo = res.data.streak_info;
          if (streakInfo.streak_updated) {
            summaryMessage += `\n🔥 Streak: ${streakInfo.current_streak} day${streakInfo.current_streak !== 1 ? 's' : ''}!`;
            if (streakInfo.is_new_record) {
              summaryMessage += ` (New personal best!)`;
            }
          } else if (streakInfo.message) {
            summaryMessage += `\n🔥 ${streakInfo.message}`;
          }
        }

        // Check and complete any active challenges
        try {
          const activeChallenge = await checkActiveChallenge(problem?.id || 0);
          if (activeChallenge && res.data.id) {
            const challengeResult = await completeChallenge(activeChallenge.id, res.data.id);
            if (challengeResult) {
              summaryMessage += `\n🏆 Challenge completed! You ${challengeResult.status === 'completed' ? 'won' : 'attempted'} the challenge against ${activeChallenge.challenger_username || activeChallenge.challenged_username}!`;
              if (challengeResult.completion_time) {
                const minutes = Math.floor(challengeResult.completion_time / 60);
                const seconds = challengeResult.completion_time % 60;
                summaryMessage += `\n⏱️ Completion time: ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
              }
            }
          }
        } catch (challengeError) {
          console.error('Challenge completion error:', challengeError);
          // Don't show error to user, just log it
        }
      } else if (passedCount > 0) {
        summaryMessage += `\n⚠️ Some tests failed. Check the results below.`;
      } else {
        summaryMessage += `\n❌ All tests failed. Review your solution.`;
      }
      
      setConsoleOutput(summaryMessage);
      
      // Refresh submissions if we're on the submissions tab
      if (activeTab === 1) {
        try {
          const token = localStorage.getItem('token');
          const submissionsRes = await axios.get(
            `https://structures-production.up.railway.app/api/submissions/problem/${problem?.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSubmissions(submissionsRes.data || []);
        } catch (submissionsErr) {
          console.error('Failed to refresh submissions:', submissionsErr);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Submission failed';
      setSubmitError(errorMsg);
      setConsoleOutput(`Submission Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
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
        `https://structures-production.up.railway.app/api/submissions/test`,
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

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setSubmitError('');
    setConsoleOutput('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'https://structures-production.up.railway.app/api/submissions/run',
        {
          problem_id: problem?.id,
          code,
          language,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Get the first test case result
      if (res.data.test_case_results && res.data.test_case_results.length > 0) {
        setRunResult(res.data.test_case_results[0]);
        
        // Set console output from the execution result
        const result = res.data.test_case_results[0];
        if (result) {
          if (result.output) {
            setConsoleOutput(result.output);
          } else if (result.error) {
            setConsoleOutput(`Error: ${result.error}`);
          }
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Run failed';
      setSubmitError(errorMsg);
      setConsoleOutput(`Error: ${errorMsg}`);
    } finally {
      setRunning(false);
    }
  };

  // Register keyboard shortcuts for this page
  useEffect(() => {
    const shortcuts: ShortcutConfig[] = [
      {
        key: 'r',
        ctrlKey: true,
        description: 'Run code with sample input',
        category: 'Code Actions',
        action: handleRun,
        disabled: running || submitting
      },
      {
        key: 's',
        ctrlKey: true,
        description: 'Submit solution',
        category: 'Code Actions',
        action: handleSubmit,
        disabled: running || submitting
      },
      {
        key: 't',
        ctrlKey: true,
        shiftKey: true,
        description: 'Test run (show console output)',
        category: 'Code Actions',
        action: handleTestRun,
        disabled: running || submitting
      },
      {
        key: 'b',
        ctrlKey: true,
        description: 'Toggle bookmark',
        category: 'Problem Actions',
        action: () => {
          // The BookmarkButton component handles the bookmark toggle
          const bookmarkButton = document.querySelector('[data-testid="bookmark-button"]') as HTMLButtonElement;
          if (bookmarkButton) {
            bookmarkButton.click();
          }
        }
      },
      {
        key: 'Tab',
        description: 'Toggle problem description panel',
        category: 'Navigation',
        action: () => setSidebarOpen(!sidebarOpen)
      },
      {
        key: '1',
        altKey: true,
        description: 'Switch to Description tab',
        category: 'Navigation',
        action: () => setActiveTab(0)
      },
      {
        key: '2',
        altKey: true,
        description: 'Switch to Submissions tab',
        category: 'Navigation',
        action: () => setActiveTab(1)
      },
      {
        key: '3',
        altKey: true,
        description: 'Switch to Hints tab',
        category: 'Navigation',
        action: () => setActiveTab(2)
      },
      {
        key: '4',
        altKey: true,
        description: 'Switch to Discussion tab',
        category: 'Navigation',
        action: () => setActiveTab(3)
      }
    ];

    registerShortcuts(shortcuts);

    return () => {
      unregisterShortcuts();
    };
  }, [registerShortcuts, unregisterShortcuts, handleRun, handleSubmit, handleTestRun, running, submitting, sidebarOpen, setSidebarOpen, setActiveTab]);

  if (loading) return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'var(--color-background)',
      color: 'var(--color-foreground)'
    }}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
        <Typography variant="h6">Loading problem...</Typography>
      </Stack>
    </Box>
  );

  if (error) return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'var(--color-background)',
      color: 'var(--color-foreground)',
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

  if (!problem) return null;

  const diffConfig = difficultyConfig[problem.difficulty] || difficultyConfig.Easy;

  return (
    <Box sx={{ 
      width: '100vw',
      height: '100vh', 
      bgcolor: 'var(--color-background)', 
      color: 'var(--color-foreground)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        borderBottom: '1px solid var(--color-border)',
        px: 4,
        py: 2,
        bgcolor: 'var(--color-card)'
      }}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <IconButton
            onClick={() => {
              console.log('Navigating back to problems page');
              navigate('/problems');
            }}
            sx={{ 
              color: 'var(--color-muted-foreground)',
              '&:hover': { 
                color: 'var(--color-primary)',
                bgcolor: 'var(--color-primary-hover)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <CodeIcon sx={{ color: 'var(--color-primary)', fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: 'var(--color-card-foreground)' }}>
            {problem.id}. {problem.title}
          </Typography>
          <div className="group relative ml-2">
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'var(--color-muted-foreground)', 
                cursor: 'pointer',
                '&:hover': { color: 'var(--color-card-foreground)' }
              }}
              className="transition-colors duration-200"
            >
              ?
            </Typography>
            <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-50">
              <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[300px]">
                <h3 className="text-sm font-semibold mb-3">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Run code</span>
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Ctrl+R</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Submit solution</span>
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Ctrl+S</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Test run</span>
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Ctrl+Shift+T</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle description</span>
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Tab</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Chip
            icon={diffConfig.icon}
            label={problem.difficulty}
            sx={{
              bgcolor: diffConfig.bgcolor,
              color: diffConfig.color,
              border: `1px solid ${diffConfig.color}`,
              fontWeight: 600,
              '& .MuiChip-icon': { color: diffConfig.color }
            }}
          />
          <BookmarkButton problemId={problem.id} />
          <ChallengeCreator 
            problemId={problem.id} 
            problemTitle={problem.title}
            onChallengeCreated={() => {
              // Optional: Show success message or refresh something
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={language}
              onChange={e => {
                const newLang = e.target.value;
                setLanguage(newLang);
                const langOption = languageOptions.find(l => l.value === newLang);
                if (langOption) setCode(langOption.defaultCode);
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2d3748',
                  color: 'white',
                  '& fieldset': { borderColor: '#4a5568' },
                  '&:hover fieldset': { borderColor: '#00d4aa' },
                  '&.Mui-focused fieldset': { borderColor: '#00d4aa' }
                },
                '& .MuiSelect-icon': { color: '#a0aec0' }
              }}
            >
              {languageOptions.map(lang => (
                <MenuItem 
                  key={lang.value} 
                  value={lang.value}
                  sx={{ 
                    bgcolor: '#2d3748', 
                    color: 'white',
                    '&:hover': { bgcolor: '#374151' },
                    '&.Mui-selected': { bgcolor: '#00d4aa', '&:hover': { bgcolor: '#00b894' } }
                  }}
                >
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Main Content - Full Width Editor Layout */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        height: 'calc(100vh - 88px)',
        overflow: 'hidden'
      }}>
        {/* Left Panel - Problem Description (Collapsible) */}
        <Box sx={{ 
          width: sidebarOpen ? '40%' : '0%',
          transition: 'width 0.3s ease-in-out',
          borderRight: sidebarOpen ? '1px solid var(--color-border)' : 'none',
          bgcolor: 'var(--color-card)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          opacity: sidebarOpen ? 1 : 0,
          visibility: sidebarOpen ? 'visible' : 'hidden'
        }}>
          {/* Always render content, but hide with opacity/visibility */}
          <>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ 
                borderBottom: '1px solid var(--color-border)',
                opacity: sidebarOpen ? 1 : 0,
                visibility: sidebarOpen ? 'visible' : 'hidden',
                transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
                '& .MuiTab-root': { 
                  color: 'var(--color-muted-foreground)',
                  fontWeight: 600,
                  minHeight: 48
                },
                '& .Mui-selected': { color: 'var(--color-primary)' },
                '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)' }
              }}
            >
              <Tab icon={<AssignmentIcon />} label="Description" />
              <Tab icon={<HistoryIcon />} label="Submissions" />
              <Tab icon={<LightbulbOutlinedIcon />} label="Hints" />
              <Tab icon={<ChatIcon />} label="Discussion" />
            </Tabs>
            
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 3,
              opacity: sidebarOpen ? 1 : 0,
              visibility: sidebarOpen ? 'visible' : 'hidden',
              transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
            }}>
                {/* Description Tab */}
                {activeTab === 0 && (
                  <Stack spacing={3}>
                    <Typography variant="body1" sx={{ color: 'var(--color-foreground)', lineHeight: 1.7 }}>
                      {problem.description}
                    </Typography>
                    
                    {problem.sample_input && problem.sample_output && (
                      <Card sx={{ 
                        bgcolor: 'var(--color-card)', 
                        border: '1px solid var(--color-border)',
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'var(--color-primary)', mb: 2 }}>
                            Example:
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)', fontWeight: 600 }}>
                                Input:
                              </Typography>
                              <Box sx={{ 
                                p: 2, 
                                mt: 1,
                                bgcolor: 'var(--color-background)', 
                                border: '1px solid var(--color-border)',
                                borderRadius: 1,
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 14,
                                color: 'var(--color-foreground)'
                              }}>
                                {problem.sample_input}
                              </Box>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)', fontWeight: 600 }}>
                                Output:
                              </Typography>
                              <Box sx={{ 
                                p: 2, 
                                mt: 1,
                                bgcolor: 'var(--color-background)', 
                                border: '1px solid var(--color-border)',
                                borderRadius: 1,
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 14,
                                color: 'var(--color-foreground)'
                              }}>
                                {problem.sample_output}
                              </Box>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}
                  </Stack>
                )}
                
                {/* Submissions Tab */}
                {activeTab === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--color-primary)', mb: 2 }}>
                      Your Submissions
                    </Typography>
                    {loadingSubmissions ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={24} sx={{ color: 'var(--color-primary)' }} />
                      </Box>
                    ) : submissions.length > 0 ? (
                      <Stack spacing={2}>
                        {submissions.slice(0, 10).map((submission, index) => (
                          <Card key={submission.id} sx={{ 
                            bgcolor: 'var(--color-card)', 
                            border: `1px solid ${submission.overall_status === 'pass' ? 'var(--color-success)' : 'var(--color-destructive)'}`,
                            borderRadius: 2
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {submission.overall_status === 'pass' ? 
                                    <CheckCircleIcon sx={{ color: 'var(--color-success)', fontSize: 18 }} /> : 
                                    <CancelIcon sx={{ color: 'var(--color-destructive)', fontSize: 18 }} />
                                  }
                                  <Typography variant="body2" fontWeight={600} sx={{ 
                                    color: submission.overall_status === 'pass' ? 'var(--color-success)' : 'var(--color-destructive)' 
                                  }}>
                                    {submission.overall_status === 'pass' ? 'Accepted' : 'Failed'}
                                  </Typography>
                                </Stack>
                                <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)' }}>
                                  {new Date(submission.submitted_at).toLocaleString()}
                                </Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Chip 
                                  label={submission.language} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: 'var(--color-muted)', 
                                    color: 'var(--color-muted-foreground)',
                                    fontSize: 11
                                  }} 
                                />
                                <Chip 
                                  label={`${submission.execution_time?.toFixed(3) || '0.000'}s`} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: 'var(--color-muted)', 
                                    color: 'var(--color-muted-foreground)',
                                    fontSize: 11
                                  }} 
                                />
                                {submission.test_case_results && (
                                  <Chip 
                                    label={`${submission.test_case_results.filter((r: any) => r.passed).length}/${submission.test_case_results.length} tests`} 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: 'var(--color-muted)', 
                                      color: 'var(--color-muted-foreground)',
                                      fontSize: 11
                                    }} 
                                  />
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)' }}>
                        Submit your solution to see your submission history here.
                      </Typography>
                    )}
                  </Box>
                )}
                
                {/* Hints Tab */}
                {activeTab === 2 && (
                  <SimpleHintsPanel 
                    problemId={problem.id} 
                    currentCode={code}
                    currentLanguage={language}
                  />
                )}

                {/* Discussion Tab */}
                {activeTab === 3 && (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--color-primary)', mb: 2 }}>
                      Problem Discussion
                    </Typography>
                    <Box sx={{
                      flex: 1,
                      overflowY: 'auto',
                      mb: 2,
                      bgcolor: 'var(--color-background)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid var(--color-border)',
                      minHeight: 200
                    }}>
                      {chatMessages.length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)', textAlign: 'center', mt: 4 }}>
                          No discussions yet. Start the conversation!
                        </Typography>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <Box key={idx} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{
                              color: 'var(--color-foreground)',
                              wordBreak: 'break-word'
                            }}>
                              {msg}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Share your thoughts about this problem..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { 
                          if (e.key === 'Enter' && chatInput.trim()) {
                            setChatMessages(prev => [...prev, `You: ${chatInput.trim()}`]);
                            setChatInput('');
                          }
                        }}
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
                        onClick={() => {
                          if (chatInput.trim()) {
                            setChatMessages(prev => [...prev, `You: ${chatInput.trim()}`]);
                            setChatInput('');
                          }
                        }}
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
            </>
        </Box>

        {/* Right Panel - Code Editor */}
        <Box sx={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0
        }}>
          {/* Code Editor Header - Simplified */}
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
                onClick={() => {
                  console.log('Toggle button clicked, current state:', sidebarOpen);
                  setSidebarOpen(!sidebarOpen);
                  console.log('New state will be:', !sidebarOpen);
                }}
                sx={{ 
                  color: sidebarOpen ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  minWidth: 'auto',
                  p: 1.5,
                  borderRadius: 2,
                  border: sidebarOpen ? '1px solid var(--color-primary)' : '1px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: 'var(--color-primary)',
                    bgcolor: 'var(--color-primary-hover)',
                    borderColor: 'var(--color-primary)',
                    transform: 'scale(1.05)'
                  },
                  '& .MuiSvgIcon-root': {
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)'
                  }
                }}
                title={sidebarOpen ? 'Hide problem description' : 'Show problem description'}
              >
                {sidebarOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Button>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--color-foreground)' }}>
                Solution.{language === 'python' ? 'py' : 'js'}
              </Typography>
              {!sidebarOpen && (
                <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)' }}>
                  Click arrow to view problem description
                </Typography>
              )}
            </Stack>
            
            <Button
              onClick={() => {
                if (problem) {
                  const template = generateProblemTemplate(problem, language);
                  setCode(template);
                }
              }}
              size="small"
              sx={{
                color: 'var(--color-accent)',
                '&:hover': { bgcolor: 'var(--color-accent-hover)' }
              }}
            >
              Reset Template
            </Button>
          </Box>

          {/* Monaco Editor - Dynamic Height */}
          <Box sx={{ 
            height: `calc(100vh - 150px - ${consoleHeight}px)`,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 200
          }}>
            <MonacoEditor
              height="100%"
              language={languageOptions.find(l => l.value === language)?.monaco || 'python'}
              value={code}
              theme={getMonacoTheme()}
              options={{
                fontSize: fontSizeMap[fontSize],
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                smoothScrolling: true,
                fontLigatures: true,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                bracketPairColorization: { enabled: true }
              }}
              onChange={val => setCode(val || '')}
            />
          </Box>

          {/* Resizable Console/Output Area */}
          <Box sx={{
            height: consoleHeight,
            borderTop: '2px solid var(--color-border)',
            bgcolor: 'var(--color-card)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: 200,
            maxHeight: '60vh',
            opacity: isResizing ? 0.9 : 1,
            transition: isResizing ? 'none' : 'opacity 0.2s ease'
          }}>
            {/* Resize Handle */}
            <Box
              sx={{
                position: 'absolute',
                top: -3,
                left: 0,
                right: 0,
                height: 6,
                cursor: 'ns-resize',
                bgcolor: 'transparent',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: 'var(--color-primary)',
                  opacity: 0.7,
                  '&::after': {
                    content: '""',
                    width: 30,
                    height: 3,
                    bgcolor: 'white',
                    borderRadius: 1,
                    opacity: 0.8
                  }
                },
                '&:hover::before': {
                  content: '"Drag to resize"',
                  position: 'absolute',
                  top: -25,
                  fontSize: 11,
                  color: 'var(--color-foreground)',
                  bgcolor: 'var(--color-card)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  border: '1px solid var(--color-border)'
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
                const startY = e.clientY;
                const startHeight = consoleHeight;
                
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaY = startY - moveEvent.clientY;
                  const newHeight = Math.max(200, Math.min(window.innerHeight * 0.6, startHeight + deltaY));
                  setConsoleHeight(newHeight);
                };
                
                const handleMouseUp = () => {
                  setIsResizing(false);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                  document.body.style.cursor = '';
                  document.body.style.userSelect = '';
                };
                
                document.body.style.cursor = 'ns-resize';
                document.body.style.userSelect = 'none';
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
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
                  onClick={handleTestRun}
                  disabled={running}
                  size="small"
                  sx={{
                    borderRadius: 3,
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-muted-foreground)',
                    '&:hover': {
                      borderColor: 'var(--color-accent)',
                      color: 'var(--color-accent)',
                      bgcolor: 'var(--color-accent-hover)'
                    }
                  }}
                >
                  {running ? 'Testing...' : 'Test Run (Ctrl+Shift+T)'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleRun}
                  disabled={running}
                  size="small"
                  sx={{
                    borderRadius: 3,
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-muted-foreground)',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                      bgcolor: 'var(--color-primary-hover)'
                    }
                  }}
                >
                  {running ? 'Running...' : 'Run Sample (Ctrl+R)'}
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
                    '&:hover': { bgcolor: 'var(--color-primary-dark)' },
                    fontWeight: 600
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit (Ctrl+S)'}
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
                  bgcolor: runResult.passed ? 'var(--color-success-bg)' : 'var(--color-destructive-bg)',
                  border: `1px solid ${runResult.passed ? 'var(--color-success)' : 'var(--color-destructive)'}`
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                      {runResult.passed ? 
                        <CheckCircleIcon sx={{ color: 'var(--color-success)', fontSize: 20 }} /> : 
                        <CancelIcon sx={{ color: 'var(--color-destructive)', fontSize: 20 }} />
                      }
                      <Typography variant="subtitle2" fontWeight={700} sx={{ 
                        color: runResult.passed ? 'var(--color-success)' : 'var(--color-destructive)' 
                      }}>
                        {runResult.passed ? 'Test Passed' : 'Test Failed'}
                      </Typography>
                      <Chip 
                        icon={<TimerIcon />}
                        label={`${runResult.execution_time}ms`} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'var(--color-card)', 
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
                          Output:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'JetBrains Mono, monospace',
                          color: runResult.passed ? 'var(--color-success)' : 'var(--color-destructive)',
                          bgcolor: 'var(--color-card)',
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
              {results && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'var(--color-primary)', mb: 2 }}>
                    Submission Results ({results.passed_test_cases}/{results.total_test_cases} passed)
                  </Typography>
                  <Stack spacing={2}>
                    {results.test_case_results.map((result, i) => (
                      <Card key={i} sx={{ 
                        bgcolor: result.passed ? 'var(--color-success-bg)' : 'var(--color-destructive-bg)',
                        border: `1px solid ${result.passed ? 'var(--color-success)' : 'var(--color-destructive)'}`
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            {result.passed ? 
                              <CheckCircleIcon sx={{ color: 'var(--color-success)', fontSize: 18 }} /> : 
                              <CancelIcon sx={{ color: 'var(--color-destructive)', fontSize: 18 }} />
                            }
                            <Typography variant="body2" fontWeight={600} sx={{ 
                              color: result.passed ? 'var(--color-success)' : 'var(--color-destructive)' 
                            }}>
                              Test Case {i + 1}
                            </Typography>
                            <Chip 
                              icon={<TimerIcon />}
                              label={`${result.execution_time}ms`} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'var(--color-card)', 
                                color: 'var(--color-muted-foreground)',
                                fontSize: 10,
                                height: 20
                              }} 
                            />
                          </Stack>
                          {!result.passed && (
                            <Typography variant="caption" sx={{ 
                              color: 'var(--color-foreground)',
                              fontFamily: 'JetBrains Mono, monospace',
                              display: 'block',
                              bgcolor: 'var(--color-card)',
                              p: 1,
                              borderRadius: 1
                            }}>
                              Expected: {result.expected} | Got: {result.output}
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

      {/* Level Up Modal */}
      <LevelUpModal 
        levelUpInfo={levelUpInfo}
        open={showLevelUpModal}
        onClose={closeLevelUpModal}
      />
    </Box>
  );
};

export default ProblemDetailPage; 