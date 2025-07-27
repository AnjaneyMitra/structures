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
import { API_BASE_URL } from '../config/api';

interface SimpleHintsPanelProps {
  problemId: number;
  currentCode?: string;
  currentLanguage?: string;
}

export const SimpleHintsPanel: React.FC<SimpleHintsPanelProps> = ({ 
  problemId, 
  currentCode, 
  currentLanguage 
}) => {
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastXpCost, setLastXpCost] = useState<number>(0);

  const handleGetHint = async () => {
    if (!currentCode || !currentLanguage) {
      setError("Please write some code first to get a personalized hint");
      return;
    }

    if (!currentCode.trim() || currentCode.trim().length < 10) {
      setError("Please write more code to get a meaningful hint");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/hints/problems/${problemId}/hint`,
        { 
          user_code: currentCode,
          language: currentLanguage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentHint(response.data.hint);
      setLastXpCost(response.data.xp_penalty_applied);

    } catch (err: any) {
      console.error('Error getting hint:', err);
      setError(err.response?.data?.detail || 'Failed to get hint');
    } finally {
      setLoading(false);
    }
  };

  const canGetHint = currentCode && currentLanguage && currentCode.trim().length > 10;

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

      {/* Current Hint Display */}
      {currentHint && (
        <Card sx={{ 
          bgcolor: 'var(--color-card)', 
          border: '2px solid var(--color-primary)',
          mb: 3
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HintIcon sx={{ color: 'var(--color-primary)', fontSize: 20, mr: 1 }} />
              <Typography variant="subtitle1" sx={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                AI Hint
              </Typography>
              <Chip 
                label="Personalized" 
                size="small" 
                sx={{ 
                  ml: 1, 
                  height: 20, 
                  fontSize: '0.7rem',
                  bgcolor: 'var(--color-primary)',
                  color: 'white'
                }} 
              />
            </Box>
            
            <Typography variant="body2" sx={{ color: 'var(--color-foreground)', lineHeight: 1.6 }}>
              {currentHint}
            </Typography>

            {lastXpCost > 0 && (
              <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(0, 212, 170, 0.1)' }}>
                <Typography variant="caption">
                  This hint cost you {lastXpCost} XP
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Get Hint Section */}
      <Card sx={{ bgcolor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
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
              bgcolor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
              '&:hover': { bgcolor: 'var(--color-primary-hover)' },
              '&:disabled': { 
                bgcolor: 'var(--color-muted)', 
                color: 'var(--color-muted-foreground)' 
              }
            }}
          >
            {loading ? 'Analyzing Your Code...' : 'Get AI Hint'}
          </Button>

          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'var(--color-muted-foreground)' }}>
            The AI will analyze your current code and provide specific guidance for your approach
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleHintsPanel;