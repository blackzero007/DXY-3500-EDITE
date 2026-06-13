import type { Difficulty, WordDifficulty } from '../types';

export interface DifficultyConfig {
  id: Difficulty;
  name: string;
  description: string;
  timeLimit: number;
  allowHints: boolean;
  color: string;
  bgGradient: string;
  wordDifficulty: WordDifficulty;
  minLetters: number;
  maxLetters: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: '简单',
    description: '90秒限时，可使用提示',
    timeLimit: 90,
    allowHints: true,
    color: 'green',
    bgGradient: 'from-green-500 to-emerald-600',
    wordDifficulty: 'beginner',
    minLetters: 3,
    maxLetters: 4,
  },
  normal: {
    id: 'normal',
    name: '普通',
    description: '60秒限时，可使用提示',
    timeLimit: 60,
    allowHints: true,
    color: 'teal',
    bgGradient: 'from-teal-500 to-teal-600',
    wordDifficulty: 'intermediate',
    minLetters: 5,
    maxLetters: 6,
  },
  hard: {
    id: 'hard',
    name: '困难',
    description: '30秒限时，禁止使用提示',
    timeLimit: 30,
    allowHints: false,
    color: 'red',
    bgGradient: 'from-red-500 to-orange-600',
    wordDifficulty: 'advanced',
    minLetters: 7,
    maxLetters: 8,
  },
};

export const getDifficultyConfig = (difficulty: Difficulty): DifficultyConfig => {
  return DIFFICULTIES[difficulty] || DIFFICULTIES.normal;
};
