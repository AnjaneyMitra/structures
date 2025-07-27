import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { ShortcutConfig, formatShortcut } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
  shortcuts: ShortcutConfig[];
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  open,
  onClose,
  shortcuts
}) => {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutConfig[]>);

  const categories = Object.keys(groupedShortcuts).sort();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'var(--color-card)',
          color: 'var(--color-card-foreground)',
          border: '1px solid var(--color-border)',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 2,
        borderBottom: '1px solid var(--color-border)'
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <KeyboardIcon sx={{ color: 'var(--color-primary)' }} />
          <Typography variant="h6" fontWeight={700}>
            Keyboard Shortcuts
          </Typography>
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ 
            color: 'var(--color-muted-foreground)',
            '&:hover': { color: 'var(--color-foreground)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ 
              color: 'var(--color-muted-foreground)', 
              lineHeight: 1.6,
              mb: 1
            }}>
              Use these keyboard shortcuts to navigate and interact with the application more efficiently.
            </Typography>
            <Box sx={{ 
              color: 'var(--color-muted-foreground)', 
              fontSize: '0.875rem',
              lineHeight: 1.6,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              Press <Chip label="?" size="small" sx={{ fontSize: '0.75rem', borderRadius: 2 }} /> to show this help anytime.
            </Box>
          </Box>

          <Stack spacing={3}>
            {categories.map((category) => (
              <Box key={category}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={700} 
                  sx={{ 
                    color: 'var(--color-primary)', 
                    mb: 2,
                    fontSize: '1rem'
                  }}
                >
                  {category}
                </Typography>
                
                <Stack spacing={1.5}>
                  {groupedShortcuts[category].map((shortcut, index) => (
                    <Box
                      key={`${category}-${index}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                        px: 2,
                        bgcolor: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'var(--color-muted)',
                          borderColor: 'var(--color-primary)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'var(--color-foreground)',
                          flex: 1
                        }}
                      >
                        {shortcut.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {formatShortcut(shortcut).split(' + ').map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <Chip
                              label={key}
                              size="small"
                              sx={{
                                bgcolor: 'var(--color-card)',
                                color: 'var(--color-card-foreground)',
                                border: '1px solid var(--color-border)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                minWidth: '32px',
                                height: '24px'
                              }}
                            />
                            {keyIndex < formatShortcut(shortcut).split(' + ').length - 1 && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'var(--color-muted-foreground)',
                                  mx: 0.5
                                }}
                              >
                                +
                              </Typography>
                            )}
                          </React.Fragment>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Stack>
                
                {category !== categories[categories.length - 1] && (
                  <Divider sx={{ 
                    mt: 3, 
                    borderColor: 'var(--color-border)' 
                  }} />
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 0,
        borderTop: '1px solid var(--color-border)'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: 'var(--color-primary)',
            borderRadius: 3,
            color: 'var(--color-primary-foreground)',
            '&:hover': { bgcolor: 'var(--color-primary-dark)' },
            fontWeight: 600
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;