import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  LightbulbOutlined as HintIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import apiClient from '../utils/apiClient';

interface SimpleHintsPanelProps {
  problemId: number;
  currentCode?: string;
  currentLanguage?: string;
}

interface HintEntry {
  id: number;
  content: string;
  timestamp: Date;
  xpCost: number;
  codeSnapshot: string; // Store the code that was analyzed
}

// Simplified hints system - v2.0 - No database storage needed!
export const SimpleHintsPanel: React.FC<SimpleHintsPanelProps> = ({ 
  problemId, 
  currentCode, 
  currentLanguage 
}) => {
  const [hints, setHints] = useState<HintEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalXpSpent, setTotalXpSpent] = useState<number>(0);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  const handleGetHint = async () => {
    if (!currentCode || !currentLanguage) {
      setError("Please write some code first to get a personalized hint");
      return;
    }

    if (!currentCode.trim() || currentCode.trim().length < 5) {
      setError("Please write some code to get a meaningful hint");
      return;
    }

    // Prevent rapid requests (3 second cooldown)
    const now = Date.now();
    if (now - lastRequestTime < 3000) {
      setError("Please wait a moment before requesting another hint");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        `/api/hints/problems/${problemId}/hint`,
        { 
          user_code: currentCode,
          language: currentLanguage
        }
      );

      // Add the new hint to the history
      const newHint: HintEntry = {
        id: Date.now(),
        content: response.data.hint,
        timestamp: new Date(),
        xpCost: response.data.xp_penalty_applied,
        codeSnapshot: currentCode.substring(0, 100) + (currentCode.length > 100 ? '...' : '') // Store first 100 chars
      };

      setHints(prev => [newHint, ...prev]); // Add to beginning of array (newest first)
      setTotalXpSpent(prev => prev + response.data.xp_penalty_applied);
      setLastRequestTime(now);

    } catch (err: any) {
      console.error('Error getting hint:', err);
      setError(err.response?.data?.detail || 'Failed to get hint');
    } finally {
      setLoading(false);
    }
  };

  const canGetHint = currentCode && currentLanguage && currentCode.trim().length > 5;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'var(--color-foreground)', mb: 1, display: 'flex', alignItems: 'center' }}>
          <HintIcon sx={{ mr: 1, color: 'var(--color-primary)' }} />
          AI Coding Assistant
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)' }}>
          Get personalized hints based on your current code approach.
        </Typography>
      </Box>

      {/* Hints History */}
      {hints.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: 'var(--color-foreground)', mb: 2, display: 'flex', alignItems: 'center' }}>
            <HintIcon sx={{ mr: 1, color: 'var(--color-primary)', fontSize: 18 }} />
            Your AI Hints ({hints.length})
            {totalXpSpent > 0 && (
              <Chip 
                label={`${totalXpSpent} XP spent`} 
                size="small" 
                sx={{ 
                  ml: 2, 
                  height: 20, 
                  fontSize: '0.7rem',
                  bgcolor: 'var(--color-muted)',
                  color: 'var(--color-muted-foreground)'
                }} 
              />
            )}
          </Typography>

          <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
            {hints.map((hint, index) => (
              <Card 
                key={hint.id}
                sx={{ 
                  bgcolor: 'var(--color-card)', 
                  border: index === 0 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  mb: 2
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HintIcon sx={{ color: 'var(--color-primary)', fontSize: 16, mr: 1 }} />
                      <Typography variant="caption" sx={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        Hint #{hints.length - index}
                      </Typography>
                      {index === 0 && (
                        <Chip 
                          label="Latest" 
                          size="small" 
                          sx={{ 
                            ml: 1, 
                            height: 18, 
                            fontSize: '0.65rem',
                            bgcolor: 'var(--color-primary)',
                            color: 'white'
                          }} 
                        />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: 'var(--color-muted-foreground)' }}>
                      {hint.timestamp.toLocaleTimeString()} • {hint.xpCost} XP
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'var(--color-foreground)', lineHeight: 1.6 }}>
                    {hint.content}
                  </Typography>

                  <Typography variant="caption" sx={{ 
                    display: 'block', 
                    mt: 1, 
                    color: 'var(--color-muted-foreground)',
                    fontFamily: 'monospace',
                    bgcolor: 'var(--color-muted)',
                    p: 1,
                    borderRadius: 1
                  }}>
                    Code analyzed: {hint.codeSnapshot}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Get Hint Section */}
      <Card sx={{ 
        bgcolor: 'var(--color-card)', 
        border: '1px solid var(--color-border)',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          {!canGetHint && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
                bgcolor: 'rgba(255, 167, 38, 0.1)',
                border: '1px solid rgba(255, 167, 38, 0.3)'
              }}
            >
              <Typography variant="body2">
                Write some code first, then get a personalized hint based on your approach
              </Typography>
            </Alert>
          )}

          {canGetHint && (
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ 
                mb: 2,
                bgcolor: 'rgba(255, 167, 38, 0.1)',
                border: '1px solid rgba(255, 167, 38, 0.3)',
                '& .MuiAlert-icon': { color: '#ffa726' }
              }}
            >
              <Typography variant="body2">
                Getting a hint will cost you <strong>3 XP</strong>
              </Typography>
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleGetHint}
            disabled={loading || !canGetHint}
            startIcon={loading ? <CircularProgress size={16} /> : <HintIcon />}
            sx={{
              borderRadius: 3,
              bgcolor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
              '&:hover': { bgcolor: 'var(--color-primary-hover)' },
              '&:disabled': { 
                bgcolor: 'var(--color-muted)', 
                color: 'var(--color-muted-foreground)' 
              }
            }}
          >
            {loading ? 'Analyzing Your Code...' : hints.length > 0 ? 'Get Another Hint' : 'Get AI Hint'}
          </Button>

          {hints.length > 0 && (
            <Button
              variant="text"
              onClick={() => {
                setHints([]);
                setTotalXpSpent(0);
                setError(null);
              }}
              sx={{ 
                mt: 2, 
                color: 'var(--color-muted-foreground)',
                fontSize: '0.75rem',
                textTransform: 'none'
              }}
            >
              Clear Hint History
            </Button>
          )}

          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'var(--color-muted-foreground)' }}>
            {hints.length > 0 
              ? 'Each new hint analyzes your current code state and provides fresh guidance'
              : 'The AI will analyze your current code and provide specific guidance for your approach'
            }
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleHintsPanel;