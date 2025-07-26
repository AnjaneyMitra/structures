import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  LightbulbOutlined as HintIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Hint {
  id: number;
  content: string;
  order: number;
  xp_penalty: number;
  generated_by_ai: boolean;
}

interface HintsAvailable {
  total_hints: number;
  revealed_hints: number;
  next_hint_order: number | null;
  hints_exhausted: boolean;
}

interface HintsPanelProps {
  problemId: number;
}

export const HintsPanel: React.FC<HintsPanelProps> = ({ problemId }) => {
  const [hintsAvailable, setHintsAvailable] = useState<HintsAvailable | null>(null);
  const [revealedHints, setRevealedHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    hintOrder: number;
    xpPenalty: number;
  }>({ open: false, hintOrder: 0, xpPenalty: 0 });

  useEffect(() => {
    fetchHintsData();
  }, [problemId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHintsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch hints availability
      const availableRes = await axios.get(
        `https://structures-production.up.railway.app/api/hints/problems/${problemId}/hints/available`,
        { headers }
      );
      setHintsAvailable(availableRes.data);

      // Fetch revealed hints
      const revealedRes = await axios.get(
        `https://structures-production.up.railway.app/api/hints/problems/${problemId}/hints/revealed`,
        { headers }
      );
      setRevealedHints(revealedRes.data);

    } catch (err: any) {
      console.error('Error fetching hints:', err);
      setError(err.response?.data?.detail || 'Failed to load hints');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealHint = async (hintOrder: number) => {
    try {
      setRevealing(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `https://structures-production.up.railway.app/api/hints/problems/${problemId}/hints/reveal`,
        { hint_order: hintOrder },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add the new hint to revealed hints
      setRevealedHints(prev => [...prev, response.data.hint]);
      
      // Update hints availability
      await fetchHintsData();
      
      setConfirmDialog({ open: false, hintOrder: 0, xpPenalty: 0 });

    } catch (err: any) {
      console.error('Error revealing hint:', err);
      setError(err.response?.data?.detail || 'Failed to reveal hint');
    } finally {
      setRevealing(false);
    }
  };

  const openConfirmDialog = (hintOrder: number, xpPenalty: number) => {
    setConfirmDialog({ open: true, hintOrder, xpPenalty });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, hintOrder: 0, xpPenalty: 0 });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2, color: 'var(--color-muted-foreground)' }}>
          Loading hints...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button size="small" onClick={fetchHintsData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!hintsAvailable) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No hints available for this problem.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Typography variant="h6" sx={{ color: 'var(--color-foreground)', mb: 1, display: 'flex', alignItems: 'center' }}>
          <HintIcon sx={{ mr: 1, color: 'var(--color-primary)' }} />
          Hints ({hintsAvailable.revealed_hints}/{hintsAvailable.total_hints})
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)' }}>
          Get progressive hints to help solve this problem. Each hint costs XP.
        </Typography>
      </Box>

      {/* Revealed Hints */}
      {revealedHints.length > 0 && (
        <Stack spacing={2}>
          {revealedHints.map((hint, index) => (
            <Card 
              key={hint.id} 
              sx={{ 
                bgcolor: 'var(--color-background)', 
                border: '1px solid var(--color-border)',
                borderLeft: '4px solid var(--color-primary)'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckIcon sx={{ color: 'var(--color-primary)', fontSize: 16, mr: 1 }} />
                  <Typography variant="caption" sx={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    Hint {hint.order}
                  </Typography>
                  {hint.generated_by_ai && (
                    <Chip 
                      label="AI Generated" 
                      size="small" 
                      sx={{ 
                        ml: 1, 
                        height: 20, 
                        fontSize: '0.7rem',
                        bgcolor: 'var(--color-secondary)',
                        color: 'var(--color-secondary-foreground)'
                      }} 
                    />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--color-foreground)' }}>
                  {hint.content}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Next Hint Button */}
      {!hintsAvailable.hints_exhausted && hintsAvailable.next_hint_order && (
        <>
          {revealedHints.length > 0 && <Divider sx={{ borderColor: 'var(--color-border)' }} />}
          
          <Card sx={{ bgcolor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LockIcon sx={{ color: 'var(--color-muted-foreground)', fontSize: 16, mr: 1 }} />
                <Typography variant="subtitle2" sx={{ color: 'var(--color-foreground)' }}>
                  Hint {hintsAvailable.next_hint_order}
                </Typography>
              </Box>
              
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
                  Revealing this hint will cost you <strong>5 XP</strong>
                </Typography>
              </Alert>

              <Button
                variant="contained"
                onClick={() => openConfirmDialog(hintsAvailable.next_hint_order!, 5)}
                disabled={revealing}
                startIcon={revealing ? <CircularProgress size={16} /> : <HintIcon />}
                sx={{
                  bgcolor: 'var(--color-primary)',
                  color: 'var(--color-primary-foreground)',
                  '&:hover': { bgcolor: 'var(--color-primary-hover)' }
                }}
              >
                {revealing ? 'Revealing...' : 'Reveal Hint'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* All Hints Exhausted */}
      {hintsAvailable.hints_exhausted && (
        <Alert severity="info" sx={{ bgcolor: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)' }}>
          <Typography variant="body2">
            You've revealed all available hints for this problem. Good luck with your solution!
          </Typography>
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={closeConfirmDialog}
        PaperProps={{
          sx: {
            bgcolor: 'var(--color-card)',
            border: '1px solid var(--color-border)'
          }
        }}
      >
        <DialogTitle sx={{ color: 'var(--color-card-foreground)' }}>
          Confirm Hint Reveal
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'var(--color-muted-foreground)', mb: 2 }}>
            Are you sure you want to reveal Hint {confirmDialog.hintOrder}?
          </Typography>
          <Alert severity="warning" sx={{ bgcolor: 'rgba(255, 167, 38, 0.1)' }}>
            This will cost you <strong>{confirmDialog.xpPenalty} XP</strong> and cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={closeConfirmDialog}
            sx={{ color: 'var(--color-muted-foreground)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleRevealHint(confirmDialog.hintOrder)}
            variant="contained"
            disabled={revealing}
            sx={{
              bgcolor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)'
            }}
          >
            {revealing ? 'Revealing...' : 'Reveal Hint'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default HintsPanel;