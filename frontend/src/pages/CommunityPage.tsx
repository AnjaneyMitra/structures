import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Container,
  Paper,
  useTheme
} from '@mui/material';
import { 
  ChatBubbleLeftRightIcon, 
  UsersIcon 
} from '@heroicons/react/24/outline';

// Import existing components
import ForumsPage from './ForumsPage';
import TailwindFriendsPage from './TailwindFriendsPage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`community-tabpanel-${index}`}
      aria-labelledby={`community-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `community-tab-${index}`,
    'aria-controls': `community-tabpanel-${index}`,
  };
}

const CommunityPage: React.FC = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabs = [
    { label: 'Forums', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, component: <ForumsPage /> },
    { label: 'Friends', icon: <UsersIcon className="w-5 h-5" />, component: <TailwindFriendsPage /> },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          fontWeight={700} 
          sx={{ 
            color: 'var(--color-foreground)',
            mb: 1,
            background: isDark 
              ? 'linear-gradient(135deg, #818CF8 0%, #A78BFA 100%)'
              : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Community
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'var(--color-muted-foreground)',
            maxWidth: '600px'
          }}
        >
          Connect with fellow developers, share knowledge, and build meaningful relationships in our coding community.
        </Typography>
      </Box>

      <Paper 
        sx={{ 
          bgcolor: 'var(--color-card)',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid var(--color-border)'
        }}
      >
        <Box sx={{ borderBottom: '1px solid var(--color-border)' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: 'var(--color-muted-foreground)',
                fontWeight: 600,
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: 'var(--color-primary)',
                },
                '& .MuiSvgIcon-root': {
                  marginRight: 1,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--color-primary)',
                height: 3,
              },
              '& .MuiTabs-scrollButtons': {
                color: 'var(--color-muted-foreground)',
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                {...a11yProps(index)}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1,
                }}
              />
            ))}
          </Tabs>
        </Box>

        {tabs.map((tab, index) => (
          <TabPanel key={index} value={value} index={index}>
            <Box sx={{ p: 0 }}>
              {tab.component}
            </Box>
          </TabPanel>
        ))}
      </Paper>
    </Container>
  );
};

export default CommunityPage;
