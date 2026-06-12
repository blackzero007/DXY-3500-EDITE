import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Home } from 'lucide-react';
import { Header } from '@/components/Header';
import { GameBoard } from '@/components/GameBoard';
import { ResultModal } from '@/components/ResultModal';
import { BadgeWall } from '@/components/BadgeWall';
import { useGameStore } from '@/store/useGameStore';
import { useAchievementStore } from '@/store/useAchievementStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getGameModeConfig } from '@/config/gameModes';
import type { GameMode } from '@/types';
import { cn } from '@/lib/utils';

export default function GamePage() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const gameMode = (mode as GameMode) || 'classic';
  const config = getGameModeConfig(gameMode);
  
  const initGame = useGameStore((s) => s.initGame);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const currentWord = useGameStore((s) => s.currentWord);
  const retryGame = useGameStore((s) => s.retryGame);
  const initAchievements = useAchievementStore((s) => s.initAchievements);
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const initSettings = useSettingsStore((s) => s.initSettings);

  const [key, setKey] = useState(0);

  useEffect(() => {
    initAchievements();
    checkAchievements();
    initSettings();
  }, [initAchievements, checkAchievements, initSettings]);

  useEffect(() => {
    if (mode) {
      initGame(gameMode);
      setKey(prev => prev + 1);
    }
  }, [mode, gameMode, initGame]);

  const handleBack = () => {
    navigate('/');
  };

  const handleNextWord = () => {
    initGame(gameMode);
    setKey(prev => prev + 1);
  };

  const bgGradient = {
    classic: 'from-amber-50 via-orange-50 to-teal-50',
    practice: 'from-blue-50 via-indigo-50 to-purple-50',
    challenge: 'from-red-50 via-orange-50 to-yellow-50',
  }[gameMode] || 'from-amber-50 via-orange-50 to-teal-50';

  const blobColors = {
    classic: ['bg-orange-200', 'bg-teal-200', 'bg-amber-200'],
    practice: ['bg-blue-200', 'bg-indigo-200', 'bg-purple-200'],
    challenge: ['bg-red-200', 'bg-orange-200', 'bg-yellow-200'],
  }[gameMode] || ['bg-orange-200', 'bg-teal-200', 'bg-amber-200'];

  if (!currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gradient-to-br', bgGradient)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn('absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob', blobColors[0])} />
        <div className={cn('absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000', blobColors[1])} />
        <div className={cn('absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000', blobColors[2])} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">返回首页</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <span className={cn('font-bold', 
              gameMode === 'classic' && 'text-teal-700',
              gameMode === 'practice' && 'text-blue-700',
              gameMode === 'challenge' && 'text-orange-700'
            )}>
              {config.name}
            </span>
          </div>
        </div>

        <main className="pt-4 pb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {gameMode === 'classic' ? '今日单词挑战' : 
               gameMode === 'practice' ? '轻松练习' : '极限挑战'}
            </h2>
            <p className="text-gray-500 text-sm">
              {gameMode === 'classic' && '拖拽字母，在60秒内拼出正确的单词'}
              {gameMode === 'practice' && '拖拽字母，不限时间，可随时查看答案'}
              {gameMode === 'challenge' && '拖拽字母，在30秒内拼出正确的单词，禁止使用提示'}
            </p>
          </div>

          <GameBoard key={key} />

          {(gameStatus === 'success' || gameStatus === 'failed') && gameMode !== 'classic' && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={retryGame}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-gray-700"
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

        <footer className="text-center py-6 text-gray-400 text-xs">
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
