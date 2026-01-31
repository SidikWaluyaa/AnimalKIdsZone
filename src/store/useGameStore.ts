import { create } from 'zustand';

export type AvatarType = 'Lion' | 'Rabbit' | 'Cat';
export type GameStep = 'onboarding' | 'menu' | 'game1' | 'game2' | 'summary';

export interface GameHistory {
  id: string;
  gameType: 'game1' | 'game2';
  score: number;
  timeElapsed: number;
  timestamp: Date;
}

interface GameState {
  userName: string;
  avatar: AvatarType | null;
  currentStep: GameStep | 'stats';
  level: 1 | 2 | 3;
  analytics: {
    wrongClicks: number;
    timeElapsed: number; // in seconds
    repeatedClicks: number; // patience
    dragAccuracy: number; // percentage or count
    attempts: number; // Total attempts/moves
  };
  
  lastPlayedGame: 'game1' | 'game2' | null;
  history: GameHistory[];
  
  setLastPlayedGame: (game: 'game1' | 'game2') => void;

  // Actions
  setUserName: (name: string) => void;
  setAvatar: (avatar: AvatarType) => void;
  setStep: (step: GameStep | 'stats') => void;
  setLevel: (level: 1 | 2 | 3) => void;
  updateAnalytics: (data: Partial<GameState['analytics']>) => void;
  addHistory: (entry: Omit<GameHistory, 'id' | 'timestamp'>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  userName: '',
  avatar: null,
  currentStep: 'onboarding',
  level: 1,
  lastPlayedGame: null,
  history: [],
  analytics: {
    wrongClicks: 0,
    timeElapsed: 0,
    repeatedClicks: 0,
    dragAccuracy: 0,
    attempts: 0,
  },

  setUserName: (name) => set({ userName: name }),
  setAvatar: (avatar) => set({ avatar }),
  setStep: (step) => set({ currentStep: step }),
  setLevel: (level) => set({ level }),
  setLastPlayedGame: (game) => set({ lastPlayedGame: game }),
  updateAnalytics: (data) =>
    set((state) => ({
      analytics: { ...state.analytics, ...data },
    })),
  addHistory: (entry) =>
    set((state) => ({
      history: [
        { ...entry, id: Math.random().toString(36).substr(2, 9), timestamp: new Date() },
        ...state.history,
      ],
    })),
  resetGame: () =>
    set({
      userName: '',
      avatar: null,
      currentStep: 'onboarding',
      level: 1,
      lastPlayedGame: null,
      analytics: {
        wrongClicks: 0,
        timeElapsed: 0,
        repeatedClicks: 0,
        dragAccuracy: 0,
        attempts: 0,
      },
    }),
}));
