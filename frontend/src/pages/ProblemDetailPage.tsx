import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, CircularProgress, Alert, Chip, Stack, Button, 
  MenuItem, Select, FormControl, Card, CardContent, Tabs, Tab, Divider
} from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BoltIcon from '@mui/icons-material/Bolt';
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
  { label: 'Python', value: 'python', monaco: 'python', defaultCode: '# Write your solution here\n\ndef solution():\n    # Your code here\n    pass\n\n# Read input and call solution\nif __name__ == "__main__":\n    result = solution()\n    print(result)\n' },
  { label: 'JavaScript', value: 'javascript', monaco: 'javascript', defaultCode: '// Write your solution here\n\nfunction solution() {\n    // Your code here\n}\n\n// Read input and call solution\nconst result = solution();\nconsole.log(result);\n' },
];

const ProblemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`https://structures-production.up.railway.app/api/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        setError('Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  useEffect(() => {
    // Reset code when language changes
    const lang = languageOptions.find(l => l.value === language);
    if (lang) setCode(lang.defaultCode);
  }, [language]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    setResults(null);
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
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setSubmitError('');
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
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Run failed');
    } finally {
      setRunning(false);
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

  if (!problem) return null;

  const diffConfig = difficultyConfig[problem.difficulty] || difficultyConfig.Easy;

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
        px: 4,
        py: 2,
        bgcolor: '#1a1a1a'
      }}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <CodeIcon sx={{ color: '#00d4aa', fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
            {problem.id}. {problem.title}
          </Typography>
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

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Problem Description */}
        <Box sx={{ 
          width: sidebarOpen ? 450 : 0,
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
                <Tab icon={<AssignmentIcon />} label="Description" />
                <Tab icon={<HistoryIcon />} label="Submissions" />
              </Tabs>
              
              <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                {/* Description Tab */}
                {activeTab === 0 && (
                  <Stack spacing={3}>
                    <Typography variant="body1" sx={{ color: '#e2e8f0', lineHeight: 1.7 }}>
                      {problem.description}
                    </Typography>
                    
                    {problem.sample_input && problem.sample_output && (
                      <Card sx={{ bgcolor: '#2d3748', border: '1px solid #4a5568' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#00d4aa', mb: 2 }}>
                            Example:
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 600 }}>
                                Input:
                              </Typography>
                              <Box sx={{ 
                                p: 2, 
                                mt: 1,
                                bgcolor: '#1a1a1a', 
                                border: '1px solid #4a5568',
                                borderRadius: 1,
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 14,
                                color: '#e2e8f0'
                              }}>
                                {problem.sample_input}
                              </Box>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 600 }}>
                                Output:
                              </Typography>
                              <Box sx={{ 
                                p: 2, 
                                mt: 1,
                                bgcolor: '#1a1a1a', 
                                border: '1px solid #4a5568',
                                borderRadius: 1,
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 14,
                                color: '#e2e8f0'
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
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#00d4aa', mb: 2 }}>
                      Your Submissions
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                      Submit your solution to see your submission history here.
                    </Typography>
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
          </Box>

          {/* Monaco Editor */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <MonacoEditor
              height="100%"
              language={languageOptions.find(l => l.value === language)?.monaco || 'python'}
              value={code}
              theme="vs-dark"
              options={{
                fontSize: 14,
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

          {/* Console/Output Area */}
          <Box sx={{ 
            height: 250,
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
                  onClick={handleRun}
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
                        icon={<TimerIcon />}
                        label={`${runResult.execution_time}ms`} 
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
              {results && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#00d4aa', mb: 2 }}>
                    Submission Results ({results.passed_test_cases}/{results.total_test_cases} passed)
                  </Typography>
                  <Stack spacing={2}>
                    {results.test_case_results.map((result, i) => (
                      <Card key={i} sx={{ 
                        bgcolor: result.passed ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                        border: `1px solid ${result.passed ? '#00d4aa' : '#ff6b6b'}`
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            {result.passed ? 
                              <CheckCircleIcon sx={{ color: '#00d4aa', fontSize: 18 }} /> : 
                              <CancelIcon sx={{ color: '#ff6b6b', fontSize: 18 }} />
                            }
                            <Typography variant="body2" fontWeight={600} sx={{ 
                              color: result.passed ? '#00d4aa' : '#ff6b6b' 
                            }}>
                              Test Case {i + 1}
                            </Typography>
                            <Chip 
                              icon={<TimerIcon />}
                              label={`${result.execution_time}ms`} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#2d3748', 
                                color: '#a0aec0',
                                fontSize: 10,
                                height: 20
                              }} 
                            />
                          </Stack>
                          {!result.passed && (
                            <Typography variant="caption" sx={{ 
                              color: '#e2e8f0',
                              fontFamily: 'JetBrains Mono, monospace',
                              display: 'block',
                              bgcolor: '#2d3748',
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
    </Box>
  );
};

export default ProblemDetailPage; 