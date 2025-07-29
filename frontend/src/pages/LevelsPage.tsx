import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/outline';
import { LevelInfo, UserLevelProgress, LEVEL_COLORS, LEVEL_ICONS } from '../types/levels';
import LevelProgressBar from '../components/LevelProgressBar';

const LevelsPage: React.FC = () => {
  const [allLevels, setAllLevels] = useState<LevelInfo[]>([]);
  const [userProgress, setUserProgress] = useState<UserLevelProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all levels info
        const levelsRes = await axios.get('https://structures-production.up.railway.app/api/levels/all');
        setAllLevels(levelsRes.data);

        // Fetch user's current progress
        const progressRes = await axios.get('https://structures-production.up.railway.app/api/levels/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProgress(progressRes.data);
      } catch (err) {
        setError('Failed to load levels data.');
        console.error('Levels page error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLevelDescription = (level: number, title: string) => {
    const descriptions = {
      1: "Welcome to your coding journey! Every expert was once a beginner.",
      2: "You're learning the ropes! Keep solving problems to build your foundation.",
      3: "You're getting the hang of it! Your problem-solving skills are developing nicely.",
      4: "Impressive progress! You've mastered the fundamentals and are tackling complex challenges.",
      5: "Outstanding achievement! You've reached mastery level in problem solving.",
      6: "Legendary status! You've achieved the highest level of expertise. You are a true coding grandmaster!"
    };
    return descriptions[level as keyof typeof descriptions] || "Keep coding and growing!";
  };

  const getXPRange = (level: LevelInfo, nextLevel?: LevelInfo) => {
    if (level.is_max_level) {
      return `${level.xp_required.toLocaleString()}+ XP`;
    }
    const endXP = nextLevel ? nextLevel.xp_required - 1 : level.xp_required + 999;
    return `${level.xp_required.toLocaleString()} - ${endXP.toLocaleString()} XP`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrophyIcon className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-card-foreground">Level System</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Progress through six levels of mastery by solving problems and earning XP. 
            Each level represents your growing expertise in competitive programming.
          </p>
        </div>

        {/* Current Progress Card */}
        {userProgress && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-card-foreground mb-4 flex items-center">
              <StarIcon className="h-6 w-6 text-primary mr-2" />
              Your Current Progress
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <LevelProgressBar 
                  levelProgress={userProgress} 
                  size="large"
                  showDetails={true}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Level:</span>
                  <span className="font-semibold text-card-foreground">
                    {userProgress.level} - {userProgress.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total XP:</span>
                  <span className="font-semibold text-yellow-600">
                    {userProgress.total_xp.toLocaleString()}
                  </span>
                </div>
                {userProgress.level < 6 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">XP to Next Level:</span>
                    <span className="font-semibold text-card-foreground">
                      {userProgress.xp_to_next_level.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allLevels.map((level, index) => {
            const colors = LEVEL_COLORS[level.level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS[1];
            const icon = LEVEL_ICONS[level.level as keyof typeof LEVEL_ICONS] || LEVEL_ICONS[1];
            const nextLevel = allLevels[index + 1];
            const isCurrentLevel = userProgress?.level === level.level;
            const isUnlocked = userProgress ? userProgress.level >= level.level : false;
            const isCompleted = userProgress ? userProgress.level > level.level : false;

            return (
              <div
                key={level.level}
                className={`
                  bg-card border rounded-lg p-6 transition-all duration-300 hover:shadow-lg
                  ${isCurrentLevel ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-border'}
                  ${!isUnlocked ? 'opacity-60' : ''}
                `}
              >
                {/* Level Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-2xl
                      ${colors.bg} ${isUnlocked ? '' : 'grayscale'}
                    `}>
                      {icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">
                        Level {level.level}
                      </h3>
                      <p className={`text-sm font-medium ${colors.text}`}>
                        {level.title}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="text-right">
                    {isCompleted && (
                      <div className="text-green-500 text-xl">✓</div>
                    )}
                    {isCurrentLevel && (
                      <div className="text-primary text-xl">📍</div>
                    )}
                    {!isUnlocked && (
                      <div className="text-muted-foreground text-xl">🔒</div>
                    )}
                  </div>
                </div>

                {/* XP Requirement */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">XP Range:</span>
                    <span className="text-sm font-medium text-card-foreground">
                      {getXPRange(level, nextLevel)}
                    </span>
                  </div>
                  
                  {/* Progress bar for current level */}
                  {isCurrentLevel && userProgress && (
                    <div className="mt-3">
                      <div className={`w-full ${colors.bg} rounded-full h-2 overflow-hidden`}>
                        <div 
                          className={`h-2 ${colors.accent.replace('text-', 'bg-')} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(userProgress.progress_percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {userProgress.progress_percentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {userProgress.xp_to_next_level.toLocaleString()} XP to go
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {getLevelDescription(level.level, level.title)}
                </p>

                {/* Unlock Requirements */}
                {!isUnlocked && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">
                      <strong>Unlock requirement:</strong> Earn {level.xp_required.toLocaleString()} total XP
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* XP Earning Guide */}
        <div className="mt-12 bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-card-foreground mb-4">How to Earn XP</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl mb-2">🟢</div>
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">Easy Problems</h4>
              <p className="text-green-600 dark:text-green-400 text-2xl font-bold mb-1">50 XP</p>
              <p className="text-xs text-green-600 dark:text-green-400">Perfect for beginners</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl mb-2">🟡</div>
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">Medium Problems</h4>
              <p className="text-yellow-600 dark:text-yellow-400 text-2xl font-bold mb-1">100 XP</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Good challenge level</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl mb-2">🔴</div>
              <h4 className="font-semibold text-red-700 dark:text-red-300 mb-1">Hard Problems</h4>
              <p className="text-red-600 dark:text-red-400 text-2xl font-bold mb-1">150 XP</p>
              <p className="text-xs text-red-600 dark:text-red-400">For advanced coders</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> XP is only awarded for your first successful solution to each problem. 
              Focus on solving new problems to maximize your XP gain and level progression.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelsPage;