import { create } from 'zustand';
import { useAppStore } from './useAppStore';

interface GamificationStoreState {
  addXp: (amount: number) => void;
  useCalorieShield: () => boolean;
  unlockBadge: (badgeName: string) => void;
  attackBoss: (damageHp: number) => void;
}

export const useGamificationStore = create<GamificationStoreState>(() => ({
  addXp: (amount) => {
    const { store, setCompleteStore } = useAppStore.getState();
    const currentGamification = store.gamification;
    const newTotalXp = currentGamification.totalXp + amount;

    // Level formula: Level = Math.floor((totalXp / 100) ^ (1/1.5))
    const newLevel = Math.max(1, Math.floor(Math.pow(newTotalXp / 100, 1 / 1.5)));

    const updatedStore = {
      ...store,
      gamification: {
        ...currentGamification,
        totalXp: newTotalXp,
        level: newLevel,
      },
    };

    setCompleteStore(updatedStore);
  },

  useCalorieShield: () => {
    const { store, setCompleteStore } = useAppStore.getState();
    const currentGamification = store.gamification;

    if (currentGamification.calorieShields <= 0) return false;

    const updatedStore = {
      ...store,
      gamification: {
        ...currentGamification,
        calorieShields: currentGamification.calorieShields - 1,
      },
    };

    setCompleteStore(updatedStore);
    return true;
  },

  unlockBadge: (badgeName) => {
    const { store, setCompleteStore } = useAppStore.getState();
    const currentGamification = store.gamification;

    if (currentGamification.unlockedBadges.includes(badgeName)) return;

    const updatedStore = {
      ...store,
      gamification: {
        ...currentGamification,
        unlockedBadges: [...currentGamification.unlockedBadges, badgeName],
      },
    };

    setCompleteStore(updatedStore);
  },

  attackBoss: (damageHp) => {
    const { store, setCompleteStore } = useAppStore.getState();
    const currentGamification = store.gamification;
    const newHp = Math.max(0, currentGamification.bossCurrentHp - damageHp);

    const defeated = newHp === 0;

    const updatedStore = {
      ...store,
      gamification: {
        ...currentGamification,
        bossCurrentHp: newHp,
        bossDefeatedThisWeek: defeated || currentGamification.bossDefeatedThisWeek,
      },
    };

    setCompleteStore(updatedStore);
  },
}));
