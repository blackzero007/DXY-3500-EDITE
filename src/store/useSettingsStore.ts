import { create } from 'zustand';
import { getSettings, saveSettings, type AppSettings } from '../utils/storage';
import { soundManager } from '../utils/soundManager';

interface SettingsStore extends AppSettings {
  initSettings: () => void;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  soundEnabled: true,

  initSettings: () => {
    const saved = getSettings();
    soundManager.setEnabled(saved.soundEnabled);
    set({ soundEnabled: saved.soundEnabled });
  },

  toggleSound: () => {
    const current = get().soundEnabled;
    const newValue = !current;
    soundManager.setEnabled(newValue);
    saveSettings({ soundEnabled: newValue });
    set({ soundEnabled: newValue });

    if (newValue) {
      soundManager.play('placeLetter');
    }
  },

  setSoundEnabled: (enabled: boolean) => {
    soundManager.setEnabled(enabled);
    saveSettings({ soundEnabled: enabled });
    set({ soundEnabled: enabled });

    if (enabled) {
      soundManager.play('placeLetter');
    }
  },
}));
