export interface Word {
  word: string;
  meaning: string;
  phonetic?: string;
  example?: string;
}

export type GameStatus = 'idle' | 'playing' | 'success' | 'failed';

export interface GameState {
  currentWord: Word | null;
  shuffledLetters: string[];
  answerLetters: (string | null)[];
  timeLeft: number;
  gameStatus: GameStatus;
  streak: number;
  lastPlayDate: string | null;
  hintsUsed: number;
  startTime: number | null;
}

export interface GameRecord {
  date: string;
  word: string;
  success: boolean;
  timeUsed: number;
  hintsUsed: number;
}

export interface LetterPosition {
  letter: string;
  index: number;
  source: 'pool' | 'answer';
}

export interface FavoriteWord {
  word: string;
  meaning: string;
  phonetic?: string;
  example?: string;
  addedAt: number;
}
