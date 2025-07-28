import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  ClockIcon, 
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Challenge, ChallengeResult } from '../types/challenges';
import apiClient from '../utils/apiClient';

interface ChallengeResultsProps {
  challenge: Challenge;
  onClose?: () => void;
}

const ChallengeResults: React.FC<ChallengeResultsProps> = ({
  challenge,
  onClose
}) => {
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [challenge.id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/challenges/${challenge.id}/results`);
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load challenge results');
    } finally {
      setLoading(false);
    }
  };

  const formatCompletionTime = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'timeout':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResultColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'timeout':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const winner = results.find(r => r.status === 'completed');
  const fastestTime = results
    .filter(r => r.status === 'completed' && r.completion_time)
    .sort((a, b) => (a.completion_time || 0) - (b.completion_time || 0))[0];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-8">
          <XCircleIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrophyIcon className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Challenge Results
            </h3>
            <p className="text-sm text-muted-foreground">
              {challenge.problem_title}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Challenge Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Challenger</p>
          <p className="text-sm font-medium text-card-foreground">{challenge.challenger_username}</p>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Challenged</p>
          <p className="text-sm font-medium text-card-foreground">{challenge.challenged_username}</p>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Time Limit</p>
          <p className="text-sm font-medium text-card-foreground">
            {challenge.time_limit ? `${challenge.time_limit} minutes` : 'No limit'}
          </p>
        </div>
      </div>

      {/* Winner Banner */}
      {winner && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                🎉 {winner.username} wins!
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Completed in {formatCompletionTime(winner.completion_time)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-card-foreground mb-3">
          Participant Results
        </h4>
        
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No results yet</p>
            <p className="text-xs">Results will appear when participants complete the challenge</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results
              .sort((a, b) => {
                // Sort by: completed first, then by completion time
                if (a.status === 'completed' && b.status !== 'completed') return -1;
                if (a.status !== 'completed' && b.status === 'completed') return 1;
                if (a.status === 'completed' && b.status === 'completed') {
                  return (a.completion_time || 0) - (b.completion_time || 0);
                }
                return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
              })
              .map((result, index) => (
                <div
                  key={result.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.status === 'completed' && result === fastestTime
                      ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
                      : 'border-border bg-muted/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {result.status === 'completed' && result === fastestTime && (
                      <FireIcon className="h-5 w-5 text-yellow-500" />
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-card-foreground">
                        #{index + 1}
                      </span>
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-card-foreground">
                        {result.username}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getResultIcon(result.status)}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getResultColor(result.status)}`}>
                          {result.status}
                        </span>
                      </div>
                      {result.completion_time && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCompletionTime(result.completion_time)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Challenge Message */}
      {challenge.message && (
        <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Challenge Message
          </p>
          <p className="text-sm text-card-foreground italic">
            "{challenge.message}"
          </p>
        </div>
      )}
    </div>
  );
};

export default ChallengeResults;