import type { GameRecord } from '../types';

const STORAGE_KEYS = {
  GAME_RECORDS: 'word_puzzle_records',
  STREAK: 'word_puzzle_streak',
  LAST_PLAY_DATE: 'word_puzzle_last_date',
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
