export type WordDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Word {
  word: string;
  meaning: string;
  phonetic?: string;
  example?: string;
  difficulty: WordDifficulty;
}

export type GameMode = 'classic' | 'practice' | 'challenge';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'success' | 'failed';

export interface GameState {
  currentWord: Word | null;
  shuffledLetters: string[];
  answerLetters: (string | null)[];
  timeLeft: number;
  gameStatus: GameStatus;
  gameMode: GameMode;
  difficulty: Difficulty;
  streak: number;
  lastPlayDate: string | null;
  hintsUsed: number;
  startTime: number | null;
  totalPausedDuration: number;
  pauseStartTime: number | null;
}

export interface GameModeConfig {
  id: GameMode;
  name: string;
  description: string;
  icon: string;
  timeLimit: number | null;
  allowHints: boolean;
  showAnswer: boolean;
  color: string;
  bgGradient: string;
}

export interface GameRecord {
  date: string;
  word: string;
  success: boolean;
  timeUsed: number;
  hintsUsed: number;
  mode?: GameMode;
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
  difficulty: WordDifficulty;
  addedAt: number;
}

export interface SavedGameState {
  currentWord: Word;
  shuffledLetters: string[];
  answerLetters: (string | null)[];
  timeLeft: number;
  gameStatus: GameStatus;
  gameMode: GameMode;
  difficulty: Difficulty;
  hintsUsed: number;
  savedAt: number;
}

export type AchievementId =
  | 'first_clear'
  | 'streak_7'
  | 'no_hint'
  | 'speed_demon'
  | 'correct_20'
  | 'favorite_10'
  | 'hint_user'
  | 'word_master';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  target: number;
}

export interface AchievementProgress {
  id: AchievementId;
  current: number;
  unlockedAt: number | null;
}
