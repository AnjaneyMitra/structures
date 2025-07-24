import { useState, useCallback } from 'react';
import { LevelUpInfo } from '../types/levels';

export const useLevelUp = () => {
  const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  const handleLevelUp = useCallback((levelUpData: LevelUpInfo | null) => {
    if (levelUpData && levelUpData.leveled_up) {
      setLevelUpInfo(levelUpData);
      setShowLevelUpModal(true);
    }
  }, []);

  const closeLevelUpModal = useCallback(() => {
    setShowLevelUpModal(false);
    setLevelUpInfo(null);
  }, []);

  return {
    levelUpInfo,
    showLevelUpModal,
    handleLevelUp,
    closeLevelUpModal
  };
};