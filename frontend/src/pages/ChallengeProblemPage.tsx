import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TrophyIcon, 
  UserIcon,
  FireIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import apiClient from '../utils/apiClient';
import { Challenge } from '../types/challenges';
import ChallengeTimer from '../components/ChallengeTimer';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  sample_input?: string;
  sample_output?: string;
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
}

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

const ChallengeProblemPage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { fontSize, themeMode } = useTheme();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Code editor state
  const [language, setLanguage] = useState(languageOptions[0].value);
  const [code, setCode] = useState(languageOptions[0].defaultCode);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SubmissionResult | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<TestCaseResult | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string>('');

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
    return 'vs-dark';
  };

  useEffect(() => {
    fetchChallengeAndProblem();
  }, [challengeId]);

  useEffect(() => {
    // Reset code when language changes
    const lang = languageOptions.find(l => l.value === language);
    if (lang) setCode(lang.defaultCode);
  }, [language]);

  const fetchChallengeAndProblem = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch challenge details
      const challengeRes = await apiClient.get(`/api/challenges/${challengeId}`);
      const challengeData = challengeRes.data;
      setChallenge(challengeData);

      // Fetch problem details
      const problemRes = await apiClient.get(`/api/problems/${challengeData.problem_id}`);
      setProblem(problemRes.data);

      // Initialize console with challenge info
      setConsoleOutput(`🏆 Challenge Mode Activated!

Challenge from: ${challengeData.challenger_username || challengeData.challenged_username}
Problem: ${problemRes.data.title}
${challengeData.time_limit ? `⏱️ Time Limit: ${formatTimeLimit(challengeData.time_limit)}` : '⏱️ No time limit'}
${challengeData.message ? `💬 Message: "${challengeData.message}"` : ''}

Good luck! 🚀`);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLimit = (minutes?: number) => {
    if (!minutes) return 'No time limit';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Hard': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleSubmit = async () => {
    if (!problem || !challenge) return;

    setSubmitting(true);
    setSubmitError('');
    setResults(null);
    setConsoleOutput('');
    
    try {
      const res = await apiClient.post('/api/submissions/', {
        problem_id: problem.id,
        code,
        language,
        challenge_id: challenge.id, // Include challenge ID for tracking
      });
      
      setResults(res.data);
      
      // Show submission summary in console
      const testResults = res.data.test_case_results || [];
      const passedCount = testResults.filter((r: any) => r.passed).length;
      const totalCount = testResults.length;
      const overallStatus = res.data.overall_status || 'unknown';
      
      let summaryMessage = `🏆 Challenge Submission Complete!\n`;
      summaryMessage += `Status: ${overallStatus.toUpperCase()}\n`;
      summaryMessage += `Passed: ${passedCount}/${totalCount} test cases\n`;
      summaryMessage += `Execution Time: ${res.data.execution_time?.toFixed(3) || '0.000'}s`;
      
      if (overallStatus === 'pass') {
        summaryMessage += `\n🎉 Challenge completed successfully!`;
        if (res.data.xp_awarded && res.data.xp_awarded > 0) {
          summaryMessage += `\n⭐ +${res.data.xp_awarded} XP earned!`;
        }
        
        // Complete the challenge
        try {
          const challengeResult = await apiClient.post(`/api/challenges/${challenge.id}/complete`, null, {
            params: { submission_id: res.data.id }
          });
          
          if (challengeResult.data) {
            summaryMessage += `\n🏆 Challenge result: ${challengeResult.data.status === 'won' ? 'You won!' : 'Challenge completed!'}`;
            if (challengeResult.data.completion_time) {
              const minutes = Math.floor(challengeResult.data.completion_time / 60);
              const seconds = challengeResult.data.completion_time % 60;
              summaryMessage += `\n⏱️ Your time: ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
            }
          }
        } catch (challengeError) {
          console.error('Challenge completion error:', challengeError);
        }
      } else if (passedCount > 0) {
        summaryMessage += `\n⚠️ Some tests failed. Keep trying!`;
      } else {
        summaryMessage += `\n❌ All tests failed. Review your solution.`;
      }
      
      setConsoleOutput(summaryMessage);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Submission failed';
      setSubmitError(errorMsg);
      setConsoleOutput(`Submission Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRun = async () => {
    if (!problem) return;

    setRunning(true);
    setRunResult(null);
    setSubmitError('');
    setConsoleOutput('');
    
    try {
      const res = await apiClient.post('/api/submissions/run', {
        problem_id: problem.id,
        code,
        language,
      });
      
      if (res.data.test_case_results && res.data.test_case_results.length > 0) {
        setRunResult(res.data.test_case_results[0]);
        
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !challenge || !problem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-6 max-w-md w-full">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{error || 'Challenge or problem not found'}</p>
          <button 
            onClick={() => navigate('/challenges')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Challenge Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/challenges')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Challenges
              </button>
              <div className="flex items-center space-x-3">
                <TrophyIcon className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Challenge Mode</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {challenge.time_limit && challenge.accepted_at && (
                <ChallengeTimer
                  timeLimit={challenge.time_limit}
                  startTime={challenge.accepted_at}
                  className="text-sm"
                />
              )}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span>vs {challenge.challenger_username || challenge.challenged_username}</span>
              </div>
            </div>
          </div>
          
          {challenge.message && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm italic">"{challenge.message}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Problem Description Panel */}
        <div className="w-1/2 border-r border-border bg-card overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-card-foreground">
                  {problem.id}. {problem.title}
                </h2>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
              <FireIcon className="h-6 w-6 text-orange-500" />
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p className="text-card-foreground leading-relaxed mb-6">
                {problem.description}
              </p>
              
              {problem.sample_input && problem.sample_output && (
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-primary font-semibold mb-3">Example:</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Input:</p>
                      <pre className="bg-muted p-2 rounded text-sm font-mono text-foreground">
                        {problem.sample_input}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Output:</p>
                      <pre className="bg-muted p-2 rounded text-sm font-mono text-foreground">
                        {problem.sample_output}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CodeBracketIcon className="h-5 w-5 text-primary" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-background border border-border rounded px-3 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {languageOptions.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRun}
                  disabled={running || submitting}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span>{running ? 'Running...' : 'Run'}</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={running || submitting}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <TrophyIcon className="h-4 w-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <MonacoEditor
              height="60%"
              language={languageOptions.find(l => l.value === language)?.monaco || 'python'}
              theme={getMonacoTheme()}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: fontSizeMap[fontSize as keyof typeof fontSizeMap] || 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
              }}
            />
          </div>

          {/* Console/Results Panel */}
          <div className="h-40 bg-background border-t border-border">
            <div className="h-full flex flex-col">
              <div className="bg-muted/30 px-4 py-2 border-b border-border">
                <h3 className="text-sm font-medium">Console Output</h3>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
                  {consoleOutput || 'Ready to run your code...'}
                </pre>
                
                {/* Show run results */}
                {runResult && (
                  <div className="mt-4 p-3 bg-card border border-border rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      {runResult.passed ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        Sample Test: {runResult.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>Input: {runResult.input}</div>
                      <div>Expected: {runResult.expected}</div>
                      <div>Output: {runResult.output}</div>
                      {runResult.error && <div className="text-red-500">Error: {runResult.error}</div>}
                    </div>
                  </div>
                )}
                
                {/* Show submission results */}
                {results && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      {results.overall_status === 'pass' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {results.overall_status === 'pass' ? 'All Tests Passed!' : 'Some Tests Failed'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({results.passed_test_cases}/{results.total_test_cases} passed)
                      </span>
                    </div>
                  </div>
                )}
                
                {submitError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                    {submitError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeProblemPage;