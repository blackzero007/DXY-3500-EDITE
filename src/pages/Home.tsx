import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, X, RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { ModeSelector } from '@/components/ModeSelector';
import { DifficultySelector } from '@/components/DifficultySelector';
import { BadgeWall } from '@/components/BadgeWall';
import { StatsPanel } from '@/components/StatsPanel';
import { SettingsModal } from '@/components/SettingsModal';
import { HelpGuideModal } from '@/components/HelpGuideModal';
import { useAchievementStore } from '@/store/useAchievementStore';
import { useGameStore } from '@/store/useGameStore';
import { hasShownGuide, hasUnfinishedGame, clearGameState } from '@/utils/storage';
import { getGameModeConfig } from '@/config/gameModes';
import type { Difficulty, SavedGameState } from '@/types';

export default function Home() {
  const initAchievements = useAchievementStore((s) => s.initAchievements);
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const clearSavedGameState = useGameStore((s) => s.clearSavedGameState);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
  const [unfinishedGame, setUnfinishedGame] = useState<SavedGameState | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    initAchievements();
    checkAchievements();
  }, [initAchievements, checkAchievements]);

  useEffect(() => {
    const saved = hasUnfinishedGame();
    if (saved) {
      setUnfinishedGame(saved);
    }
  }, []);

  useEffect(() => {
    if (!hasShownGuide()) {
      const timer = setTimeout(() => {
        setShowHelpGuide(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setDifficulty(difficulty);
  };

  const handleContinueGame = () => {
    if (!unfinishedGame) return;
    const searchParams = new URLSearchParams();
    searchParams.set('difficulty', unfinishedGame.difficulty);
    navigate(`/game/${unfinishedGame.gameMode}?${searchParams.toString()}`);
    setUnfinishedGame(null);
  };

  const handleDiscardGame = () => {
    clearGameState();
    clearSavedGameState();
    setUnfinishedGame(null);
  };

  const modeConfig = unfinishedGame ? getGameModeConfig(unfinishedGame.gameMode) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-200 dark:bg-amber-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        <Header 
          onOpenSettings={() => setShowSettings(true)} 
          onOpenHelp={() => setShowHelpGuide(true)} 
        />
        
        <main className="pt-8 pb-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              每日单词拼图
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              每天一个新单词，积累词汇量 📚
            </p>
          </div>

          {unfinishedGame && (
            <div className="w-full max-w-md mx-auto px-4 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-800 overflow-hidden transition-colors duration-300">
                <div className="px-6 py-4 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="font-bold text-amber-700 dark:text-amber-300">有未完成的对局</span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                    检测到你有一局未完成的{modeConfig?.name || '游戏'}，是否继续？
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-4">
                    <span>单词: {unfinishedGame.currentWord.word.length}个字母</span>
                    <span>·</span>
                    <span>剩余时间: {unfinishedGame.timeLeft}秒</span>
                    <span>·</span>
                    <span>已用提示: {unfinishedGame.hintsUsed}次</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleContinueGame}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110"
                    >
                      <Play className="w-4 h-4" />
                      继续对局
                    </button>
                    <button
                      onClick={handleDiscardGame}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                    >
                      <X className="w-4 h-4" />
                      放弃
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DifficultySelector 
            selectedDifficulty={selectedDifficulty} 
            onSelect={handleDifficultyChange} 
          />

          <div className="mt-8">
            <ModeSelector difficulty={selectedDifficulty} />
          </div>

          <div className="mt-12">
            <BadgeWall />
          </div>

          <div className="mt-4">
            <StatsPanel />
          </div>
        </main>

        <footer className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">
          <p>选择适合你的模式，开始学习之旅 ✨</p>
        </footer>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <HelpGuideModal
        open={showHelpGuide}
        onClose={() => setShowHelpGuide(false)}
      />
    </div>
  );
}
