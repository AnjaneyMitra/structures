import React, { createContext, useContext, useState, useCallback } from 'react';
import { NewlyEarnedAchievement } from '../types/achievements';
import AchievementModal from '../components/AchievementModal';

interface AchievementsContextType {
  showAchievements: (achievements: NewlyEarnedAchievement[]) => void;
  hideAchievements: () => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};

interface AchievementsProviderProps {
  children: React.ReactNode;
}

export const AchievementsProvider: React.FC<AchievementsProviderProps> = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAchievements, setCurrentAchievements] = useState<NewlyEarnedAchievement[]>([]);

  const showAchievements = useCallback((achievements: NewlyEarnedAchievement[]) => {
    if (achievements.length > 0) {
      setCurrentAchievements(achievements);
      setModalOpen(true);
    }
  }, []);

  const hideAchievements = useCallback(() => {
    setModalOpen(false);
    setCurrentAchievements([]);
  }, []);

  const contextValue: AchievementsContextType = {
    showAchievements,
    hideAchievements
  };

  return (
    <AchievementsContext.Provider value={contextValue}>
      {children}
      <AchievementModal
        open={modalOpen}
        onClose={hideAchievements}
        achievements={currentAchievements}
      />
    </AchievementsContext.Provider>
  );
};