import { useSettingsStore } from '../store/useSettingsStore';

export function useTheme() {
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark'
  };
}