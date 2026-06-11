import { create } from 'zustand';
import type { GameState, GameStatus, Word } from '../types';
import { wordList } from '../data/words';
import { seededShuffle } from '../utils/shuffle';
import { getDateSeed, getTodayString, isYesterday } from '../utils/dateUtils';
import {
  getStreak,
  saveStreak,
  saveLastPlayDate,
  getLastPlayDate,
  saveGameRecord,
  getTodayRecord,
} from '../utils/storage';

const GAME_TIME = 60;

interface GameStore extends GameState {
  initGame: () => void;
  startGame: () => void;
  placeLetter: (letter: string, fromIndex: number, toIndex: number) => void;
  removeLetter: (index: number) => void;
  resetAnswer: () => void;
  submitAnswer: () => boolean;
  useHint: () => number;
  tick: () => void;
  setGameStatus: (status: GameStatus) => void;
  retryGame: () => void;
}

function getWordOfDay(): Word {
  const today = getTodayString();
  const seed = getDateSeed(today);
  const index = seed % wordList.length;
  return wordList[index];
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
  timeLeft: GAME_TIME,
  gameStatus: 'idle',
  streak: 0,
  lastPlayDate: null,
  hintsUsed: 0,
  startTime: null,

  initGame: () => {
    const word = getWordOfDay();
    const today = getTodayString();
    const todayRecord = getTodayRecord(today);
    const lastDate = getLastPlayDate();
    const streak = getStreak();

    const letters = word.word.split('');
    const shuffled = seededShuffle(letters, getDateSeed(today) + 1);

    if (shuffled.join('') === word.word) {
      [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
    }

    if (todayRecord) {
      set({
        currentWord: word,
        shuffledLetters: shuffled,
        answerLetters: new Array(word.word.length).fill(null),
        timeLeft: GAME_TIME,
        gameStatus: todayRecord.success ? 'success' : 'failed',
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
        timeLeft: GAME_TIME,
        gameStatus: 'idle',
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
    const { currentWord } = get();
    if (!currentWord) return;

    const today = getTodayString();
    const letters = currentWord.word.split('');
    const shuffled = seededShuffle(letters, getDateSeed(today) + 1);

    if (shuffled.join('') === currentWord.word) {
      [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
    }

    set({
      shuffledLetters: shuffled,
      answerLetters: new Array(currentWord.word.length).fill(null),
    });
  },

  submitAnswer: (): boolean => {
    const { answerLetters, currentWord, hintsUsed, timeLeft, startTime } = get();
    if (!currentWord) return false;

    const answer = answerLetters.join('');
    const isCorrect = answer === currentWord.word;

    if (isCorrect) {
      const today = getTodayString();
      const timeUsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      const newStreak = calculateNewStreak(getLastPlayDate());

      saveGameRecord({
        date: today,
        word: currentWord.word,
        success: true,
        timeUsed: timeUsed,
        hintsUsed: hintsUsed,
      });
      saveLastPlayDate(today);
      saveStreak(newStreak);

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
    const { currentWord, answerLetters, shuffledLetters, hintsUsed, gameStatus } = get();
    if (!currentWord || gameStatus !== 'playing') return hintsUsed;

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

    return newHintsUsed;
  },

  tick: () => {
    const { timeLeft, gameStatus, currentWord, hintsUsed } = get();
    
    if (gameStatus !== 'playing') return;

    const newTimeLeft = timeLeft - 1;

    if (newTimeLeft <= 0) {
      const today = getTodayString();
      const timeUsed = 60;

      saveGameRecord({
        date: today,
        word: currentWord?.word || '',
        success: false,
        timeUsed: timeUsed,
        hintsUsed: hintsUsed,
      });
      saveLastPlayDate(today);

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
    const { currentWord } = get();
    if (!currentWord) return;

    const today = getTodayString();
    const letters = currentWord.word.split('');
    const shuffled = seededShuffle(letters, getDateSeed(today) + Date.now());

    if (shuffled.join('') === currentWord.word) {
      [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
    }

    set({
      shuffledLetters: shuffled,
      answerLetters: new Array(currentWord.word.length).fill(null),
      timeLeft: GAME_TIME,
      gameStatus: 'playing',
      hintsUsed: 0,
      startTime: Date.now(),
    });
  },
}));
