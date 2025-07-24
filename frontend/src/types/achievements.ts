export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
  earned?: boolean;
  earned_at?: string;
  progress?: number;
  total?: number;
}

export interface UserAchievements {
  total_achievements: number;
  earned_count: number;
  achievements: Achievement[];
}

export interface AchievementStats {
  total_achievements: number;
  earned_achievements: number;
  completion_percentage: number;
  xp_from_achievements: number;
  user_total_xp: number;
}

export interface NewlyEarnedAchievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}