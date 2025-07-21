import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Chip, Stack, Button, Divider, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BoltIcon from '@mui/icons-material/Bolt';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Monaco } from '@monaco-editor/react';
import MonacoEditor from '@monaco-editor/react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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

const difficultyColors: Record<string, any> = {
  Easy: { color: 'success', icon: <BoltIcon fontSize="small" /> },
  Medium: { color: 'warning', icon: <AssignmentTurnedInIcon fontSize="small" /> },
  Hard: { color: 'error', icon: <EmojiEventsIcon fontSize="small" /> },
};

const languageOptions = [
  { label: 'Python', value: 'python', monaco: 'python', defaultCode: '# Write your solution here\n' },
  { label: 'JavaScript', value: 'javascript', monaco: 'javascript', defaultCode: '// Write your solution here\n' },
];

const ProblemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(languageOptions[0].value);
  const [code, setCode] = useState(languageOptions[0].defaultCode);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [runResult, setRunResult] = useState<any | null>(null);
  const [running, setRunning] = useState(false);

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
      // Show per-test-case results if available
      setResults(res.data.test_case_results || []);
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
        'https://structures-production.up.railway.app/api/submissions/',
        {
          problem_id: problem?.id,
          code,
          language,
          sample_only: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Only show the first test case result (sample)
      setRunResult(res.data.test_case_results ? res.data.test_case_results[0] : null);
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Alert severity="error">{error}</Alert></Box>;
  if (!problem) return null;

  const diff = difficultyColors[problem.difficulty] || { color: 'default', icon: null };

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px 0 rgba(108,99,255,0.07)' }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700} color="primary">{problem.title}</Typography>
          <Chip label={problem.difficulty} color={diff.color} icon={diff.icon} sx={{ fontWeight: 700 }} />
        </Stack>
        <Typography variant="body1" mb={3} sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>{problem.description}</Typography>
        <Divider sx={{ my: 3 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} mb={3}>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Sample Input</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, fontFamily: 'JetBrains Mono, Fira Mono, IBM Plex Mono, monospace', background: '#f7f7fa', fontSize: '1.05rem' }}>{problem.sample_input}</Paper>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Sample Output</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, fontFamily: 'JetBrains Mono, Fira Mono, IBM Plex Mono, monospace', background: '#f7f7fa', fontSize: '1.05rem' }}>{problem.sample_output}</Paper>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Test Cases</Typography>
            <Stack spacing={1}>
              {problem.test_cases.map(tc => (
                <Paper key={tc.id} variant="outlined" sx={{ p: 2, fontFamily: 'JetBrains Mono, Fira Mono, IBM Plex Mono, monospace', background: '#f7f7fa', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CodeIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <b>Input:</b> {tc.input}<br />
                    <b>Output:</b> {tc.output}
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Box mt={4}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
            <FormControl sx={{ minWidth: 140 }} size="small">
              <InputLabel id="lang-label">Language</InputLabel>
              <Select
                labelId="lang-label"
                value={language}
                label="Language"
                onChange={e => setLanguage(e.target.value as string)}
              >
                {languageOptions.map(lang => (
                  <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="subtitle2" color="text.secondary" sx={{ ml: { sm: 2 } }}>
              Monaco Editor (VS Code style)
            </Typography>
          </Stack>
          <Paper variant="outlined" sx={{ p: 0, minHeight: 320, background: '#f7f7fa', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
            <MonacoEditor
              height="320px"
              language={languageOptions.find(l => l.value === language)?.monaco || 'python'}
              value={code}
              theme="vs-light"
              options={{ fontSize: 16, fontFamily: 'JetBrains Mono, Fira Mono, IBM Plex Mono, monospace', minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', smoothScrolling: true, fontLigatures: true }}
              onChange={v => setCode(v || '')}
            />
          </Paper>
        </Box>
        <Box mt={4} textAlign="right">
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
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, background: runResult.passed ? '#e7fbe7' : '#fff0f0', borderLeft: runResult.passed ? '6px solid #4caf50' : '6px solid #f44336' }}>
              {runResult.passed ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
              <Box>
                <Typography variant="subtitle2" color={runResult.passed ? 'success.main' : 'error.main'} fontWeight={700}>
                  {runResult.passed ? 'Passed' : 'Failed'}
                </Typography>
                <Typography variant="body2">Input: <code>{runResult.input}</code></Typography>
                <Typography variant="body2">Expected: <code>{runResult.expected}</code></Typography>
                <Typography variant="body2">Output: <code>{runResult.output}</code></Typography>
                <Typography variant="body2">Runtime: {runResult.runtime}</Typography>
                {runResult.error_type && (
                  <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                    <Chip label={runResult.error_type} color="error" size="small" />
                    <details style={{ marginLeft: 8 }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#f44336' }}>Show Error Details</summary>
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>{runResult.runtime}</Typography>
                    </details>
                  </Stack>
                )}
              </Box>
            </Paper>
          </Box>
        )}
        {submitError && (
          <Alert severity="error" sx={{ mt: 3 }}>{submitError}</Alert>
        )}
        {results && (
          <Box mt={4}>
            <Typography variant="h6" fontWeight={700} mb={2}>Submission Results</Typography>
            <Stack spacing={2}>
              {results.map((r, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, background: r.passed ? '#e7fbe7' : '#fff0f0', borderLeft: r.passed ? '6px solid #4caf50' : '6px solid #f44336' }}>
                  {r.passed ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                  <Box>
                    <Typography variant="subtitle2" color={r.passed ? 'success.main' : 'error.main'} fontWeight={700}>
                      {r.passed ? 'Passed' : 'Failed'}
                    </Typography>
                    <Typography variant="body2">Input: <code>{r.input}</code></Typography>
                    <Typography variant="body2">Expected: <code>{r.expected}</code></Typography>
                    <Typography variant="body2">Output: <code>{r.output}</code></Typography>
                    <Typography variant="body2">Runtime: {r.runtime}</Typography>
                    {r.error_type && (
                      <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                        <Chip label={r.error_type} color="error" size="small" />
                        <details style={{ marginLeft: 8 }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#f44336' }}>Show Error Details</summary>
                          <Typography variant="body2" color="error" sx={{ mt: 1 }}>{r.runtime}</Typography>
                        </details>
                      </Stack>
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProblemDetailPage; 