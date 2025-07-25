import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SuccessRateData {
  difficulty: string;
  success_rate: number;
  total_attempts: number;
  successful_attempts: number;
}

interface SuccessRateChartProps {
  userId?: number;
  showGlobal?: boolean;
}

const SuccessRateChart: React.FC<SuccessRateChartProps> = ({ userId, showGlobal = false }) => {
  const [data, setData] = useState<SuccessRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuccessRate = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint = showGlobal 
          ? 'https://structures-production.up.railway.app/api/analytics/global-success-rate'
          : 'https://structures-production.up.railway.app/api/analytics/success-rate';
        
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(endpoint, { headers });
        setData(response.data);
      } catch (err) {
        setError('Failed to load success rate data');
        console.error('Success rate fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessRate();
  }, [userId, showGlobal]);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {showGlobal ? 'Global Success Rate' : 'Your Success Rate'} by Difficulty
        </h3>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyTextColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 dark:text-green-400';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'Hard':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {showGlobal ? 'Global Success Rate' : 'Your Success Rate'} by Difficulty
      </h3>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.difficulty} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`font-medium ${getDifficultyTextColor(item.difficulty)}`}>
                {item.difficulty}
              </span>
              <div className="text-right">
                <span className="text-sm font-semibold text-foreground">
                  {item.success_rate}%
                </span>
                <div className="text-xs text-muted-foreground">
                  {item.successful_attempts}/{item.total_attempts} solved
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getDifficultyColor(item.difficulty)}`}
                style={{ width: `${Math.min(item.success_rate, 100)}%` }}
              ></div>
            </div>
            
            {item.total_attempts === 0 && (
              <div className="text-xs text-muted-foreground italic">
                No attempts yet
              </div>
            )}
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No data available</p>
          <p className="text-sm mt-1">
            {showGlobal ? 'No submissions found in the system' : 'Start solving problems to see your success rate!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SuccessRateChart;