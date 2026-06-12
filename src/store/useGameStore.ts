import { create } from 'zustand';
import type { GameState, GameStatus, Word, GameMode } from '../types';
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

const DEFAULT_GAME_TIME = 60;

interface GameStore extends GameState {
  initGame: (mode?: GameMode) => void;
  startGame: () => void;
  placeLetter: (letter: string, fromIndex: number, toIndex: number) => void;
  removeLetter: (index: number) => void;
  resetAnswer: () => void;
  submitAnswer: () => boolean;
  useHint: () => number;
  tick: () => void;
  setGameStatus: (status: GameStatus) => void;
  retryGame: () => void;
  setGameMode: (mode: GameMode) => void;
  revealAnswer: () => void;
}

function getWordOfDay(): Word {
  const today = getTodayString();
  const seed = getDateSeed(today);
  const index = seed % wordList.length;
  return wordList[index];
}

function getRandomWord(): Word {
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

function getWordForMode(mode: GameMode): Word {
  if (mode === 'classic') {
    return getWordOfDay();
  }
  return getRandomWord();
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
  streak: 0,
  lastPlayDate: null,
  hintsUsed: 0,
  startTime: null,

  setGameMode: (mode: GameMode) => {
    const config = getGameModeConfig(mode);
    set({
      gameMode: mode,
      timeLeft: config.timeLimit || DEFAULT_GAME_TIME,
    });
  },

  initGame: (mode: GameMode = 'classic') => {
    const config = getGameModeConfig(mode);
    const word = getWordForMode(mode);
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

    const initialTime = config.timeLimit || DEFAULT_GAME_TIME;

    if (mode === 'classic' && todayRecord) {
      set({
        currentWord: word,
        shuffledLetters: shuffled,
        answerLetters: new Array(word.word.length).fill(null),
        timeLeft: initialTime,
        gameStatus: todayRecord.success ? 'success' : 'failed',
        gameMode: mode,
        streak: streak,
        lastPlayDate: lastDate,
        hintsUsed: todayRecord.hintsUsed,
        startTime: null,
      });
    } else {
      set({
        currentWord: word,
        shuffledLetters: shuffled,
        answerLetters: new Array(word.word.length).fill(null),
        timeLeft: initialTime,
        gameStatus: 'idle',
        gameMode: mode,
        streak: streak,
        lastPlayDate: lastDate,
        hintsUsed: 0,
        startTime: null,
      });
    }
  },

  startGame: () => {
    set({
      gameStatus: 'playing',
      startTime: Date.now(),
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
    const { answerLetters, currentWord, hintsUsed, timeLeft, startTime, gameMode } = get();
    if (!currentWord) return false;

    const answer = answerLetters.join('');
    const isCorrect = answer === currentWord.word;

    if (isCorrect) {
      const today = getTodayString();
      const config = getGameModeConfig(gameMode);
      const timeUsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      
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
    const { currentWord, answerLetters, shuffledLetters, hintsUsed, gameStatus, gameMode } = get();
    const config = getGameModeConfig(gameMode);
    
    if (!currentWord || gameStatus !== 'playing' || !config.allowHints) return hintsUsed;

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
    const { timeLeft, gameStatus, currentWord, hintsUsed, gameMode } = get();
    const config = getGameModeConfig(gameMode);
    
    if (gameStatus !== 'playing' || config.timeLimit === null) return;

    const newTimeLeft = timeLeft - 1;

    if (newTimeLeft <= 0) {
      const today = getTodayString();
      const timeUsed = config.timeLimit;

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
    const { currentWord, gameMode } = get();
    if (!currentWord) return;

    const config = getGameModeConfig(gameMode);
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

    set({
      shuffledLetters: shuffled,
      answerLetters: new Array(currentWord.word.length).fill(null),
      timeLeft: config.timeLimit || DEFAULT_GAME_TIME,
      gameStatus: 'playing',
      hintsUsed: 0,
      startTime: Date.now(),
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
