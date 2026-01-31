import { create } from 'zustand';

export type AvatarType = 'Lion' | 'Rabbit' | 'Cat';
export type GameStep = 'onboarding' | 'menu' | 'game1' | 'game2' | 'summary';

interface GameState {
  userName: string;
  avatar: AvatarType | null;
  currentStep: GameStep;
  level: 1 | 2 | 3;
  analytics: {
    wrongClicks: number;
    timeElapsed: number; // in seconds
    repeatedClicks: number; // patience
    dragAccuracy: number; // percentage or count
  };
  
  // Actions
  setUserName: (name: string) => void;
  setAvatar: (avatar: AvatarType) => void;
  setStep: (step: GameStep) => void;
  setLevel: (level: 1 | 2 | 3) => void;
  updateAnalytics: (data: Partial<GameState['analytics']>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  userName: '',
  avatar: null,
  currentStep: 'onboarding',
  level: 1,
  analytics: {
    wrongClicks: 0,
    timeElapsed: 0,
    repeatedClicks: 0,
    dragAccuracy: 0,
  },

  setUserName: (name) => set({ userName: name }),
  setAvatar: (avatar) => set({ avatar }),
  setStep: (step) => set({ currentStep: step }),
  setLevel: (level) => set({ level }),
  updateAnalytics: (data) =>
    set((state) => ({
      analytics: { ...state.analytics, ...data },
    })),
  resetGame: () =>
    set({
      userName: '',
      avatar: null,
      currentStep: 'onboarding',
      level: 1,
      analytics: {
        wrongClicks: 0,
        timeElapsed: 0,
        repeatedClicks: 0,
        dragAccuracy: 0,
      },
    }),
}));
