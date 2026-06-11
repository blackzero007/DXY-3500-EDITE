import type { GameRecord, FavoriteWord } from '../types';

const STORAGE_KEYS = {
  GAME_RECORDS: 'word_puzzle_records',
  STREAK: 'word_puzzle_streak',
  LAST_PLAY_DATE: 'word_puzzle_last_date',
  FAVORITES: 'word_puzzle_favorites',
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
    const existingIndex = records.findIndex(r => r.date === record.date);
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

export function getTodayRecord(date: string): GameRecord | null {
  const records = getGameRecords();
  return records.find(r => r.date === date) || null;
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
