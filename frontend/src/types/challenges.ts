export interface Challenge {
  id: number;
  challenger_username: string;
  challenged_username: string;
  problem_id: number;
  problem_title: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined' | 'expired';
  message?: string;
  time_limit?: number; // in minutes
  created_at: string;
  accepted_at?: string;
  expires_at?: string;
  completed_at?: string;
}

export interface ChallengeResult {
  id: number;
  challenge_id: number;
  user_id: number;
  username: string;
  completion_time?: number; // in seconds
  status: 'completed' | 'failed' | 'timeout';
  completed_at: string;
}

export interface ChallengeCreate {
  challenged_username: string;
  problem_id: number;
  message?: string;
  time_limit?: number;
}

export interface Friend {
  id: number;
  username: string;
  total_xp: number;
  level: number;
  title?: string;
}

export interface ChallengeNotification {
  id: number;
  type: 'challenge_received' | 'challenge_accepted' | 'challenge_completed' | 'challenge_declined';
  challenge: Challenge;
  timestamp: string;
  read: boolean;
}

// Challenge status colors and icons
export const CHALLENGE_STATUS_CONFIG = {
  pending: {
    color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
    icon: '⏳',
    label: 'Pending'
  },
  accepted: {
    color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
    icon: '✅',
    label: 'Accepted'
  },
  completed: {
    color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    icon: '🏆',
    label: 'Completed'
  },
  declined: {
    color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
    icon: '❌',
    label: 'Declined'
  },
  expired: {
    color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20',
    icon: '⏰',
    label: 'Expired'
  }
};