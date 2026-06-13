import { create } from 'zustand';
import type { GameState, GameStatus, Word, GameMode, Difficulty, WordDifficulty } from '../types';
import { wordList } from '../data/words';
import { seededShuffle, shuffle } from '../utils/shuffle';
import { getDateSeed, getTodayString, isYesterday } from '../utils/dateUtils';
import {
  getStreak,
  saveStreak,
  saveLastPlayDate,
  getLastPlayDate,
  saveGameRecord,
  getTodayRecord,
} from '../utils/storage';
import { useAchievementStore } from './useAchievementStore';
import { getGameModeConfig } from '../config/gameModes';
import { getDifficultyConfig, DIFFICULTIES } from '../config/difficulty';

const DEFAULT_GAME_TIME = 60;

interface GameStore extends GameState {
  initGame: (mode?: GameMode, difficulty?: Difficulty) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  placeLetter: (letter: string, fromIndex: number, toIndex: number) => void;
  removeLetter: (index: number) => void;
  resetAnswer: () => void;
  submitAnswer: () => boolean;
  useHint: () => number;
  tick: () => void;
  setGameStatus: (status: GameStatus) => void;
  retryGame: () => void;
  setGameMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  revealAnswer: () => void;
}

function getWordsByDifficulty(wordDifficulty: WordDifficulty): Word[] {
  return wordList.filter((word) => word.difficulty === wordDifficulty);
}

function getWordOfDay(difficulty: Difficulty): Word {
  const today = getTodayString();
  const diffConfig = DIFFICULTIES[difficulty];
  const filteredWords = getWordsByDifficulty(diffConfig.wordDifficulty);
  const seed = getDateSeed(today + difficulty);
  const index = seed % filteredWords.length;
  return filteredWords[index];
}

function getRandomWord(difficulty: Difficulty): Word {
  const diffConfig = DIFFICULTIES[difficulty];
  const filteredWords = getWordsByDifficulty(diffConfig.wordDifficulty);
  const randomIndex = Math.floor(Math.random() * filteredWords.length);
  return filteredWords[randomIndex];
}

function getWordForMode(mode: GameMode, difficulty: Difficulty): Word {
  if (mode === 'classic') {
    return getWordOfDay(difficulty);
  }
  return getRandomWord(difficulty);
}

function calculateNewStreak(lastDate: string | null): number {
  const currentStreak = getStreak();
  const today = getTodayString();

  if (!lastDate) {
    return 1;
  }

  if (lastDate === today) {
    return currentStreak;
  }

  if (isYesterday(lastDate)) {
    return currentStreak + 1;
  }

  return 1;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentWord: null,
  shuffledLetters: [],
  answerLetters: [],
  timeLeft: DEFAULT_GAME_TIME,
  gameStatus: 'idle',
  gameMode: 'classic',
  difficulty: 'normal',
  streak: 0,
  lastPlayDate: null,
  hintsUsed: 0,
  startTime: null,
  totalPausedDuration: 0,
  pauseStartTime: null,

  setGameMode: (mode: GameMode) => {
    const config = getGameModeConfig(mode);
    set({
      gameMode: mode,
      timeLeft: config.timeLimit || DEFAULT_GAME_TIME,
    });
  },

  setDifficulty: (difficulty: Difficulty) => {
    const config = getDifficultyConfig(difficulty);
    const { gameMode } = get();
    const modeConfig = getGameModeConfig(gameMode);
    
    let newTimeLeft = config.timeLimit;
    if (modeConfig.timeLimit === null) {
      newTimeLeft = DEFAULT_GAME_TIME;
    }
    
    set({
      difficulty: difficulty,
      timeLeft: newTimeLeft,
    });
  },

  initGame: (mode: GameMode = 'classic', difficulty: Difficulty = 'normal') => {
    const modeConfig = getGameModeConfig(mode);
    const diffConfig = getDifficultyConfig(difficulty);
    const word = getWordForMode(mode, difficulty);
    const today = getTodayString();
    const todayRecord = getTodayRecord(today, mode);
    const lastDate = getLastPlayDate();
    const streak = getStreak();

    const letters = word.word.split('');
    let shuffled: string[];
    
    if (mode === 'classic') {
      shuffled = seededShuffle(letters, getDateSeed(today) + 1);
    } else {
      shuffled = shuffle([...letters]);
    }

    if (shuffled.join('') === word.word) {
      [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
    }

    let initialTime: number;
    if (modeConfig.timeLimit === null) {
      initialTime = DEFAULT_GAME_TIME;
    } else {
      initialTime = diffConfig.timeLimit;
    }

    if (mode === 'classic' && todayRecord) {
      set({
        currentWord: word,
        shuffledLetters: shuffled,
        answerLetters: new Array(word.word.length).fill(null),
        timeLeft: initialTime,
        gameStatus: todayRecord.success ? 'success' : 'failed',
        gameMode: mode,
        difficulty: difficulty,
        streak: streak,
        lastPlayDate: lastDate,
        hintsUsed: todayRecord.hintsUsed,
        startTime: null,
        totalPausedDuration: 0,
        pauseStartTime: null,
      });
    } else {
      set({
        currentWord: word,
        shuffledLetters: shuffled,
        answerLetters: new Array(word.word.length).fill(null),
        timeLeft: initialTime,
        gameStatus: 'idle',
        gameMode: mode,
        difficulty: difficulty,
        streak: streak,
        lastPlayDate: lastDate,
        hintsUsed: 0,
        startTime: null,
        totalPausedDuration: 0,
        pauseStartTime: null,
      });
    }
  },

  startGame: () => {
    set({
      gameStatus: 'playing',
      startTime: Date.now(),
      totalPausedDuration: 0,
      pauseStartTime: null,
    });
  },

  pauseGame: () => {
    const { gameStatus } = get();
    if (gameStatus !== 'playing') return;
    set({
      gameStatus: 'paused',
      pauseStartTime: Date.now(),
    });
  },

  resumeGame: () => {
    const { gameStatus, totalPausedDuration, pauseStartTime } = get();
    if (gameStatus !== 'paused' || pauseStartTime === null) return;
    const pausedMs = Date.now() - pauseStartTime;
    set({
      gameStatus: 'playing',
      totalPausedDuration: totalPausedDuration + pausedMs,
      pauseStartTime: null,
    });
  },

  placeLetter: (letter: string, fromIndex: number, toIndex: number) => {
    const { answerLetters, shuffledLetters } = get();

    if (answerLetters[toIndex] !== null) {
      return;
    }

    const newAnswer = [...answerLetters];
    newAnswer[toIndex] = letter;

    const newShuffled = [...shuffledLetters];
    newShuffled[fromIndex] = '';

    set({
      answerLetters: newAnswer,
      shuffledLetters: newShuffled,
    });
  },

  removeLetter: (index: number) => {
    const { answerLetters, shuffledLetters } = get();
    const letter = answerLetters[index];

    if (!letter) return;

    const newAnswer = [...answerLetters];
    newAnswer[index] = null;

    const newShuffled = [...shuffledLetters];
    const emptyIndex = newShuffled.findIndex(l => l === '');
    if (emptyIndex >= 0) {
      newShuffled[emptyIndex] = letter;
    }

    set({
      answerLetters: newAnswer,
      shuffledLetters: newShuffled,
    });
  },

  resetAnswer: () => {
    const { currentWord, gameMode } = get();
    if (!currentWord) return;

    const today = getTodayString();
    const letters = currentWord.word.split('');
    let shuffled: string[];
    
    if (gameMode === 'classic') {
      shuffled = seededShuffle(letters, getDateSeed(today) + 1);
    } else {
      shuffled = shuffle([...letters]);
    }

    if (shuffled.join('') === currentWord.word) {
      [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
    }

    set({
      shuffledLetters: shuffled,
      answerLetters: new Array(currentWord.word.length).fill(null),
    });
  },

  submitAnswer: (): boolean => {
    const { answerLetters, currentWord, hintsUsed, startTime, gameMode, totalPausedDuration, pauseStartTime } = get();
    if (!currentWord) return false;

    const answer = answerLetters.join('');
    const isCorrect = answer === currentWord.word;

    if (isCorrect) {
      const today = getTodayString();
      let timeUsed = 0;
      if (startTime) {
        const currentPaused = pauseStartTime ? (Date.now() - pauseStartTime) : 0;
        timeUsed = Math.round((Date.now() - startTime - totalPausedDuration - currentPaused) / 1000);
      }

      let newStreak = get().streak;
      if (gameMode === 'classic') {
        newStreak = calculateNewStreak(getLastPlayDate());
        saveStreak(newStreak);
        saveLastPlayDate(today);
      }

      saveGameRecord({
        date: today,
        word: currentWord.word,
        success: true,
        timeUsed: timeUsed,
        hintsUsed: hintsUsed,
        mode: gameMode,
      });

      set({
        gameStatus: 'success',
        streak: newStreak,
        lastPlayDate: today,
      });

      return true;
    }

    return false;
  },

  useHint: (): number => {
    const { currentWord, answerLetters, shuffledLetters, hintsUsed, gameStatus, gameMode, difficulty } = get();
    const modeConfig = getGameModeConfig(gameMode);
    const diffConfig = getDifficultyConfig(difficulty);
    
    const allowHints = modeConfig.allowHints && diffConfig.allowHints;
    
    if (!currentWord || gameStatus !== 'playing' || !allowHints) return hintsUsed;

    const word = currentWord.word;
    
    let firstEmptyIndex = -1;
    for (let i = 0; i < answerLetters.length; i++) {
      if (answerLetters[i] === null) {
        firstEmptyIndex = i;
        break;
      }
    }

    if (firstEmptyIndex === -1) return hintsUsed;

    const hintLetter = word[firstEmptyIndex];

    const newAnswer = [...answerLetters];
    newAnswer[firstEmptyIndex] = hintLetter;

    const newShuffled = [...shuffledLetters];
    const letterIndex = newShuffled.findIndex(l => l === hintLetter);
    if (letterIndex >= 0) {
      newShuffled[letterIndex] = '';
    }

    const newHintsUsed = hintsUsed + 1;

    set({
      answerLetters: newAnswer,
      shuffledLetters: newShuffled,
      hintsUsed: newHintsUsed,
    });

    useAchievementStore.getState().checkAchievements();

    return newHintsUsed;
  },

  tick: () => {
    const { timeLeft, gameStatus, currentWord, hintsUsed, gameMode, startTime, totalPausedDuration, pauseStartTime } = get();
    const config = getGameModeConfig(gameMode);
    
    if (gameStatus !== 'playing' || config.timeLimit === null) return;

    const newTimeLeft = timeLeft - 1;

    if (newTimeLeft <= 0) {
      const today = getTodayString();
      let timeUsed = config.timeLimit;
      if (startTime) {
        const currentPaused = pauseStartTime ? (Date.now() - pauseStartTime) : 0;
        timeUsed = Math.round((Date.now() - startTime - totalPausedDuration - currentPaused) / 1000);
      }

      saveGameRecord({
        date: today,
        word: currentWord?.word || '',
        success: false,
        timeUsed: timeUsed,
        hintsUsed: hintsUsed,
        mode: gameMode,
      });
      
      if (gameMode === 'classic') {
        saveLastPlayDate(today);
      }

      set({
        timeLeft: 0,
        gameStatus: 'failed',
        lastPlayDate: today,
      });
    } else {
      set({ timeLeft: newTimeLeft });
    }
  },

  setGameStatus: (status: GameStatus) => {
    set({ gameStatus: status });
  },

  retryGame: () => {
    const { currentWord, gameMode, difficulty } = get();
    if (!currentWord) return;

    const modeConfig = getGameModeConfig(gameMode);
    const diffConfig = getDifficultyConfig(difficulty);
    const today = getTodayString();
    const letters = currentWord.word.split('');
    let shuffled: string[];
    
    if (gameMode === 'classic') {
      shuffled = seededShuffle(letters, getDateSeed(today) + Date.now());
    } else {
      shuffled = shuffle([...letters]);
    }

    if (shuffled.join('') === currentWord.word) {
      [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
    }

    let resetTime: number;
    if (modeConfig.timeLimit === null) {
      resetTime = DEFAULT_GAME_TIME;
    } else {
      resetTime = diffConfig.timeLimit;
    }

    set({
      shuffledLetters: shuffled,
      answerLetters: new Array(currentWord.word.length).fill(null),
      timeLeft: resetTime,
      gameStatus: 'playing',
      hintsUsed: 0,
      startTime: Date.now(),
      totalPausedDuration: 0,
      pauseStartTime: null,
    });
  },

  revealAnswer: () => {
    const { currentWord, gameMode } = get();
    const config = getGameModeConfig(gameMode);
    
    if (!currentWord || !config.showAnswer) return;

    const letters = currentWord.word.split('');
    set({
      answerLetters: letters,
      shuffledLetters: new Array(letters.length).fill(''),
    });
  },
}));
