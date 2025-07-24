export interface LevelInfo {
  level: number;
  title: string;
  xp_required: number;
  is_max_level: boolean;
}

export interface UserLevelProgress {
  level: number;
  title: string;
  total_xp: number;
  xp_to_next_level: number;
  level_start_xp: number;
  level_end_xp: number;
  progress_percentage: number;
}

export interface LevelUpInfo {
  leveled_up: boolean;
  old_level: number;
  old_title: string;
  new_level: number;
  new_title: string;
}

export interface UserProfileWithLevel {
  id: number;
  username: string;
  total_xp: number;
  theme_preference?: string;
  font_size?: string;
  level: number;
  title: string;
  level_progress: UserLevelProgress;
}

// Level color mappings for UI consistency
export const LEVEL_COLORS = {
  1: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', accent: 'text-gray-500' },
  2: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', accent: 'text-green-500' },
  3: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', accent: 'text-blue-500' },
  4: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', accent: 'text-purple-500' },
  5: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', accent: 'text-orange-500' },
  6: { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20', text: 'text-yellow-700 dark:text-yellow-300', accent: 'text-yellow-500' }
};

// Level icons/emojis
export const LEVEL_ICONS = {
  1: '🌱', // Novice
  2: '📚', // Apprentice  
  3: '⚡', // Practitioner
  4: '🎯', // Expert
  5: '👑', // Master
  6: '💎'  // Grandmaster
};