import { create } from 'zustand';
import type { Word, FavoriteWord } from '../types';
import {
  getFavorites,
  saveFavorite,
  removeFavorite,
} from '../utils/storage';

export type SortOrder = 'desc' | 'asc';

interface FavoriteStore {
  favorites: FavoriteWord[];
  sortOrder: SortOrder;
  initFavorites: () => void;
  addFavorite: (word: Word) => void;
  removeFavoriteWord: (word: string) => void;
  toggleFavorite: (word: Word) => void;
  setSortOrder: (order: SortOrder) => void;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  sortOrder: 'desc',

  initFavorites: () => {
    const data = getFavorites();
    set({ favorites: data });
  },

  addFavorite: (word: Word) => {
    const { favorites } = get();
    if (favorites.some((f) => f.word === word.word)) {
      return;
    }
    const newFavorite: FavoriteWord = {
      ...word,
      addedAt: Date.now(),
    };
    saveFavorite(word);
    set({ favorites: [...favorites, newFavorite] });
  },

  removeFavoriteWord: (word: string) => {
    removeFavorite(word);
    set((state) => ({
      favorites: state.favorites.filter((f) => f.word !== word),
    }));
  },

  toggleFavorite: (word: Word) => {
    const { favorites, addFavorite, removeFavoriteWord } = get();
    const exists = favorites.some((f) => f.word === word.word);
    if (exists) {
      removeFavoriteWord(word.word);
    } else {
      addFavorite(word);
    }
  },

  setSortOrder: (order: SortOrder) => {
    set({ sortOrder: order });
  },
}));
