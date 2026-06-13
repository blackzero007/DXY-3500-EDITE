import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Home } from 'lucide-react';
import { GameBoard } from '@/components/GameBoard';
import { ResultModal } from '@/components/ResultModal';
import { BadgeWall } from '@/components/BadgeWall';
import { useGameStore } from '@/store/useGameStore';
import { useAchievementStore } from '@/store/useAchievementStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getGameModeConfig } from '@/config/gameModes';
import { getDifficultyConfig } from '@/config/difficulty';
import type { GameMode, Difficulty } from '@/types';
import { loadGameState } from '@/utils/storage';
import { cn } from '@/lib/utils';

export default function GamePage() {
  const { mode } = useParams<{ mode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameMode = (mode as GameMode) || 'classic';
  const difficultyParam = searchParams.get('difficulty') as Difficulty | null;
  const difficulty: Difficulty = difficultyParam || 'normal';
  const config = getGameModeConfig(gameMode);
  const diffConfig = getDifficultyConfig(difficulty);
  
  const initGame = useGameStore((s) => s.initGame);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const currentWord = useGameStore((s) => s.currentWord);
  const retryGame = useGameStore((s) => s.retryGame);
  const saveGameState = useGameStore((s) => s.saveGameState);
  const restoreGameState = useGameStore((s) => s.restoreGameState);
  const clearSavedGameState = useGameStore((s) => s.clearSavedGameState);
  const initAchievements = useAchievementStore((s) => s.initAchievements);
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const initSettings = useSettingsStore((s) => s.initSettings);

  const [key, setKey] = useState(0);
  const restoredRef = useRef(false);

  useEffect(() => {
    initAchievements();
    checkAchievements();
    initSettings();
  }, [initAchievements, checkAchievements, initSettings]);

  useEffect(() => {
    if (!mode) return;
    const saved = loadGameState();
    if (saved && saved.gameMode === gameMode && saved.difficulty === difficulty && !restoredRef.current) {
      restoreGameState(saved);
      restoredRef.current = true;
    } else {
      initGame(gameMode, difficulty);
    }
    setKey(prev => prev + 1);
  }, [mode]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      saveGameState();
      const status = useGameStore.getState().gameStatus;
      if (status === 'playing' || status === 'paused') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveGameState();
    };
  }, [saveGameState]);

  useEffect(() => {
    if (gameStatus === 'success' || gameStatus === 'failed') {
      clearSavedGameState();
    }
  }, [gameStatus, clearSavedGameState]);

  const handleBack = () => {
    saveGameState();
    navigate('/');
  };

  const handleNextWord = () => {
    initGame(gameMode, difficulty);
    setKey(prev => prev + 1);
  };

  const bgGradient = {
    classic: 'from-amber-50 via-orange-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
    practice: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900',
    challenge: 'from-red-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-red-950 dark:to-slate-900',
  }[gameMode] || 'from-amber-50 via-orange-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900';

  const blobColors = {
    classic: ['bg-orange-200 dark:bg-orange-900', 'bg-teal-200 dark:bg-teal-900', 'bg-amber-200 dark:bg-amber-900'],
    practice: ['bg-blue-200 dark:bg-blue-900', 'bg-indigo-200 dark:bg-indigo-900', 'bg-purple-200 dark:bg-purple-900'],
    challenge: ['bg-red-200 dark:bg-red-900', 'bg-orange-200 dark:bg-orange-900', 'bg-yellow-200 dark:bg-yellow-900'],
  }[gameMode] || ['bg-orange-200 dark:bg-orange-900', 'bg-teal-200 dark:bg-teal-900', 'bg-amber-200 dark:bg-amber-900'];

  if (!currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gradient-to-br transition-colors duration-300', bgGradient)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn('absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob', blobColors[0])} />
        <div className={cn('absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-2000', blobColors[1])} />
        <div className={cn('absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob animation-delay-4000', blobColors[2])} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-full shadow-sm hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">返回首页</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <span className={cn('font-bold', 
              gameMode === 'classic' && 'text-teal-700 dark:text-teal-300',
              gameMode === 'practice' && 'text-blue-700 dark:text-blue-300',
              gameMode === 'challenge' && 'text-orange-700 dark:text-orange-300'
            )}>
              {config.name}
            </span>
          </div>
        </div>

        <main className="pt-4 pb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {gameMode === 'classic' ? '今日单词挑战' : 
               gameMode === 'practice' ? '轻松练习' : '极限挑战'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {gameMode === 'classic' && `拖拽字母，在${diffConfig.timeLimit}秒内拼出正确的单词`}
              {gameMode === 'practice' && '拖拽字母，不限时间，可随时查看答案'}
              {gameMode === 'challenge' && `拖拽字母，在${diffConfig.timeLimit}秒内拼出正确的单词${diffConfig.allowHints ? '' : '，禁止使用提示'}`}
            </p>
          </div>

          <GameBoard key={key} />

          {(gameStatus === 'success' || gameStatus === 'failed') && gameMode !== 'classic' && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={retryGame}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-gray-700 dark:text-gray-200"
              >
                <RotateCcw className="w-5 h-5" />
                再来一次
              </button>
              <button
                onClick={handleNextWord}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-white',
                  'bg-gradient-to-r',
                  config.bgGradient
                )}
              >
                <Home className="w-5 h-5" />
                下一个单词
              </button>
            </div>
          )}

          <BadgeWall />
        </main>

        <footer className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">
          <p>
            {gameMode === 'classic' && '每天一个新单词，积累词汇量 📚'}
            {gameMode === 'practice' && '轻松学习，积少成多 📖'}
            {gameMode === 'challenge' && '挑战自我，突破极限 🔥'}
          </p>
        </footer>
      </div>

      <ResultModal />

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
    </div>
  );
}
