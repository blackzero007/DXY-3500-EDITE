import { Link } from 'react-router-dom';
import { Flame, Star, Calendar, Volume2, VolumeX, Trophy, Settings, HelpCircle, Moon, Sun, ChevronRight } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTheme } from '../hooks/useTheme';
import { formatDateDisplay, getTodayString } from '../utils/dateUtils';
import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
}

export function Header({ onOpenSettings, onOpenHelp }: HeaderProps) {
  const streak = useGameStore((s) => s.streak);
  const initFavorites = useFavoriteStore((s) => s.initFavorites);
  const favorites = useFavoriteStore((s) => s.favorites);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const { theme, toggleTheme, isDark } = useTheme();
  const todayStr = getTodayString();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initFavorites();
    initSettings();
  }, [initFavorites, initSettings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="w-full flex flex-col gap-3 py-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">拼</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">每日单词拼图</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
          {formatDateDisplay(todayStr)}
        </div>

        <button
          onClick={toggleTheme}
          className={[
            'flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300',
            isDark
              ? 'bg-slate-700 border-indigo-400 hover:bg-slate-600'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:from-indigo-100 hover:to-purple-100'
          ].join(' ')}
          title={isDark ? '切换到亮色模式' : '切换到暗黑模式'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-300 rotate-0" />
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={[
              'flex items-center justify-center w-9 h-9 rounded-full border transition-all',
              menuOpen
                ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-300 dark:from-indigo-900 dark:to-purple-900 dark:border-indigo-500'
                : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:from-indigo-100 hover:to-purple-100 dark:from-slate-700 dark:to-slate-700 dark:border-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-600'
            ].join(' ')}
            title="设置"
          >
            <Settings className={['w-4 h-4 transition-transform', menuOpen ? 'rotate-90 text-indigo-600 dark:text-indigo-300' : 'text-indigo-500 dark:text-indigo-300'].join(' ')} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">设置</span>
              </div>

              <button
                onClick={toggleTheme}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-indigo-500" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">暗黑模式</span>
                </div>
                <div className={[
                  'w-10 h-6 rounded-full transition-colors relative',
                  theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-300'
                ].join(' ')}>
                  <div className={[
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform',
                    theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'
                  ].join(' ')} />
                </div>
              </button>

              <button
                onClick={toggleSound}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-teal-500" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">音效</span>
                </div>
                <div className={[
                  'w-10 h-6 rounded-full transition-colors relative',
                  soundEnabled ? 'bg-teal-500' : 'bg-gray-300'
                ].join(' ')}>
                  <div className={[
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform',
                    soundEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  ].join(' ')} />
                </div>
              </button>

              {onOpenSettings && (
                <>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">更多设置</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="flex items-center justify-center w-9 h-9 rounded-full border transition-all bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 hover:from-cyan-100 hover:to-blue-100 dark:from-slate-700 dark:to-slate-700 dark:border-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-600"
            title="帮助"
          >
            <HelpCircle className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          </button>
        )}

        <Link
          to="/history"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-full border border-teal-200 hover:from-teal-100 hover:to-emerald-100 transition-colors dark:from-slate-700 dark:to-slate-700 dark:border-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-600"
          title="历史记录"
        >
          <Calendar className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <span className="text-sm font-semibold text-teal-600 dark:text-teal-300 hidden sm:inline">
            历史记录
          </span>
        </Link>

        <Link
          to="/leaderboard"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-full border border-yellow-200 hover:from-yellow-100 hover:to-amber-100 transition-colors dark:from-slate-700 dark:to-slate-700 dark:border-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-600"
          title="排行榜"
        >
          <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 hidden sm:inline">
            排行榜
          </span>
        </Link>

        <Link
          to="/favorites"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-full border border-amber-200 hover:from-amber-100 hover:to-yellow-100 transition-colors dark:from-slate-700 dark:to-slate-700 dark:border-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-600"
          title="我的生词本"
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400" />
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-300">
            {favorites.length} 生词
          </span>
        </Link>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-full border border-orange-200 dark:from-slate-700 dark:to-slate-700 dark:border-slate-600">
          <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-300">
            {streak} 天连续
          </span>
        </div>
      </div>
    </header>
  );
}
