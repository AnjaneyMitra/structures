import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const BackendStatusBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      // Try a simple health check
      const response = await fetch('/api/health');
      if (!response.ok) {
        setShowBanner(true);
      }
    } catch (err) {
      // Backend is not responding
      setShowBanner(true);
    }
  };

  if (!showBanner || dismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            <strong>Backend Server Not Running:</strong> Some features like Forums and Code Snippets require the backend server to be running. 
            <br />
            <span className="text-xs mt-1 block">
              Start the backend with: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">cd backend && python -m uvicorn app.main:sio_app --reload</code>
            </span>
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setDismissed(true)}
              className="inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusBanner;