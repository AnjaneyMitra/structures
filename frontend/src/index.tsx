import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/space-grotesk/800.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/roboto/400.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/fira-mono/400.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <Router>
        <App />
      </Router>
    </ThemeContextProvider>
  </React.StrictMode>
);
