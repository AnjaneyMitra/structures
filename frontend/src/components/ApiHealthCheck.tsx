import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ApiStatus {
  forums: 'loading' | 'success' | 'error';
  snippets: 'loading' | 'success' | 'error';
  auth: 'loading' | 'success' | 'error';
}

const ApiHealthCheck: React.FC = () => {
  const [status, setStatus] = useState<ApiStatus>({
    forums: 'loading',
    snippets: 'loading',
    auth: 'loading'
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Check Forums API
    try {
      const forumsResponse = await fetch('/api/forums/categories', { headers });
      setStatus(prev => ({
        ...prev,
        forums: forumsResponse.ok ? 'success' : 'error'
      }));
    } catch {
      setStatus(prev => ({ ...prev, forums: 'error' }));
    }

    // Check Snippets API
    try {
      const snippetsResponse = await fetch('/api/snippets/public?limit=1', { headers });
      setStatus(prev => ({
        ...prev,
        snippets: snippetsResponse.ok ? 'success' : 'error'
      }));
    } catch {
      setStatus(prev => ({ ...prev, snippets: 'error' }));
    }

    // Check Auth API
    try {
      const authResponse = await fetch('/api/auth/debug', { headers });
      setStatus(prev => ({
        ...prev,
        auth: authResponse.ok ? 'success' : 'error'
      }));
    } catch {
      setStatus(prev => ({ ...prev, auth: 'error' }));
    }
  };

  const getStatusIcon = (apiStatus: 'loading' | 'success' | 'error') => {
    switch (apiStatus) {
      case 'loading':
        return <ClockIcon className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  const hasErrors = Object.values(status).some(s => s === 'error');
  const allLoaded = Object.values(status).every(s => s !== 'loading');

  if (!showDetails && allLoaded && !hasErrors) {
    return null; // Hide if everything is working
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">API Status</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showDetails ? 'Hide' : 'Show'}
          </button>
        </div>

        {(showDetails || hasErrors) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon(status.forums)}
              <span>Forums API</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon(status.snippets)}
              <span>Snippets API</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon(status.auth)}
              <span>Auth API</span>
            </div>

            {hasErrors && (
              <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                Some APIs are not responding. Make sure the backend server is running.
              </div>
            )}

            <button
              onClick={checkApiHealth}
              className="w-full mt-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiHealthCheck;