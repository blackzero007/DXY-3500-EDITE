import { create } from 'zustand';
import type { Word, FavoriteWord } from '../types';
import {
  getFavorites,
  saveFavorite,
  removeFavorite,
  isFavorite as checkIsFavorite,
} from '../utils/storage';

export type SortOrder = 'desc' | 'asc';

interface FavoriteStore {
  favorites: FavoriteWord[];
  sortOrder: SortOrder;
  initFavorites: () => void;
  addFavorite: (word: Word) => void;
  removeFavoriteWord: (word: string) => void;
  toggleFavorite: (word: Word) => void;
  isFavoriteWord: (word: string) => boolean;
  setSortOrder: (order: SortOrder) => void;
  getSortedFavorites: () => FavoriteWord[];
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  sortOrder: 'desc',

  initFavorites: () => {
    set({ favorites: getFavorites() });
  },

  addFavorite: (word: Word) => {
    const saved = saveFavorite(word);
    set((state) => ({
      favorites: [...state.favorites, saved],
    }));
  },

  removeFavoriteWord: (word: string) => {
    removeFavorite(word);
    set((state) => ({
      favorites: state.favorites.filter((f) => f.word !== word),
    }));
  },

  toggleFavorite: (word: Word) => {
    const exists = get().isFavoriteWord(word.word);
    if (exists) {
      get().removeFavoriteWord(word.word);
    } else {
      get().addFavorite(word);
    }
  },

  isFavoriteWord: (word: string) => {
    return get().favorites.some((f) => f.word === word) || checkIsFavorite(word);
  },

  setSortOrder: (order: SortOrder) => {
    set({ sortOrder: order });
  },

  getSortedFavorites: () => {
    const { favorites, sortOrder } = get();
    return [...favorites].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.addedAt - a.addedAt;
      }
      return a.addedAt - b.addedAt;
    });
  },
}));
