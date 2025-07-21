import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { BrowserRouter as Router } from 'react-router-dom';
import '@fontsource/inter/400.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/roboto/400.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/fira-mono/400.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
