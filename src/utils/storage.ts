import type { GameRecord, FavoriteWord, AchievementProgress, GameMode, SavedGameState } from '../types';

const STORAGE_KEYS = {
  GAME_RECORDS: 'word_puzzle_records',
  STREAK: 'word_puzzle_streak',
  LAST_PLAY_DATE: 'word_puzzle_last_date',
  FAVORITES: 'word_puzzle_favorites',
  ACHIEVEMENTS: 'word_puzzle_achievements',
  SETTINGS: 'word_puzzle_settings',
  GUIDE_SHOWN: 'word_puzzle_guide_shown',
  GAME_STATE: 'word_puzzle_game_state',
};

export function getGameRecords(): GameRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_RECORDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGameRecord(record: GameRecord): void {
  try {
    const records = getGameRecords();
    const existingIndex = records.findIndex(r => 
      r.date === record.date && (r.mode || 'classic') === (record.mode || 'classic')
    );
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(STORAGE_KEYS.GAME_RECORDS, JSON.stringify(records));
  } catch {
    console.error('Failed to save game record');
  }
}

export function getStreak(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STREAK);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
}

export function saveStreak(streak: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, String(streak));
  } catch {
    console.error('Failed to save streak');
  }
}

export function getLastPlayDate(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_PLAY_DATE);
  } catch {
    return null;
  }
}

export function saveLastPlayDate(date: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_PLAY_DATE, date);
  } catch {
    console.error('Failed to save last play date');
  }
}

export function getTodayRecord(date: string, mode: GameMode = 'classic'): GameRecord | null {
  const records = getGameRecords();
  return records.find(r => 
    r.date === date && (r.mode || 'classic') === mode
  ) || null;
}

export function getFavorites(): FavoriteWord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFavorite(word: Omit<FavoriteWord, 'addedAt'>): FavoriteWord {
  try {
    const favorites = getFavorites();
    const existingIndex = favorites.findIndex(f => f.word === word.word);
    if (existingIndex >= 0) {
      return favorites[existingIndex];
    }
    const newFavorite: FavoriteWord = {
      ...word,
      addedAt: Date.now(),
    };
    favorites.push(newFavorite);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return newFavorite;
  } catch {
    console.error('Failed to save favorite');
    return { ...word, addedAt: Date.now() };
  }
}

export function removeFavorite(word: string): void {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => f.word !== word);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
  } catch {
    console.error('Failed to remove favorite');
  }
}

export function isFavorite(word: string): boolean {
  const favorites = getFavorites();
  return favorites.some(f => f.word === word);
}

export function getAchievements(): AchievementProgress[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAchievements(achievements: AchievementProgress[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch {
    console.error('Failed to save achievements');
  }
}

export type Theme = 'light' | 'dark';

export interface AppSettings {
  soundEnabled: boolean;
  theme: Theme;
  dailyReminder: {
    enabled: boolean;
    time: string;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  theme: 'light',
  dailyReminder: {
    enabled: false,
    time: '09:00',
  },
};

export function getSettings(): AppSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      const parsed = JSON.parse(data);
      const settings = { ...DEFAULT_SETTINGS, ...parsed };
      if (!parsed.theme) {
        settings.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return settings;
    }
  } catch {
    // ignore
  }
  return {
    ...DEFAULT_SETTINGS,
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  };
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    console.error('Failed to save settings');
  }
}

export function hasShownGuide(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.GUIDE_SHOWN) === 'true';
  } catch {
    return false;
  }
}

export function markGuideAsShown(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GUIDE_SHOWN, 'true');
  } catch {
    console.error('Failed to mark guide as shown');
  }
}

export function saveGameState(state: SavedGameState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
  } catch {
    console.error('Failed to save game state');
  }
}

export function loadGameState(): SavedGameState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (!data) return null;
    const parsed = JSON.parse(data) as SavedGameState;
    if (!parsed.currentWord || !parsed.savedAt) return null;
    if (parsed.gameStatus !== 'playing' && parsed.gameStatus !== 'paused' && parsed.gameStatus !== 'idle') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch {
    console.error('Failed to clear game state');
  }
}

export function hasUnfinishedGame(): SavedGameState | null {
  const state = loadGameState();
  if (!state) return null;
  if (state.gameStatus === 'success' || state.gameStatus === 'failed') return null;
  return state;
}
