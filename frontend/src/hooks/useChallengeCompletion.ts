import { useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';

interface ChallengeCompletionResult {
  message: string;
  status: 'completed' | 'failed';
  completion_time?: number;
}

export const useChallengeCompletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeChallenge = useCallback(async (
    challengeId: number, 
    submissionId: number
  ): Promise<ChallengeCompletionResult | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(`/api/challenges/${challengeId}/complete`, {
        submission_id: submissionId
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to complete challenge';
      setError(errorMessage);
      console.error('Challenge completion error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkActiveChallenge = useCallback(async (problemId: number) => {
    try {
      // Check if user has any accepted challenges for this problem
      const [receivedRes, sentRes] = await Promise.all([
        apiClient.get('/api/challenges/received'),
        apiClient.get('/api/challenges/sent')
      ]);

      const allChallenges = [...receivedRes.data, ...sentRes.data];
      const activeChallenge = allChallenges.find(
        (challenge: any) => 
          challenge.problem_id === problemId && 
          challenge.status === 'accepted'
      );

      return activeChallenge || null;
    } catch (err) {
      console.error('Error checking active challenge:', err);
      return null;
    }
  }, []);

  return {
    completeChallenge,
    checkActiveChallenge,
    loading,
    error,
    clearError: () => setError(null)
  };
};