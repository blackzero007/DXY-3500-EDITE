import { useEffect, useRef } from 'react';
import { Clock, Pause, Play } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { getGameModeConfig } from '../config/gameModes';
import { cn } from '../lib/utils';
import { soundManager } from '../utils/soundManager';

export function Timer() {
  const { timeLeft, gameStatus, gameMode, tick, pauseGame, resumeGame } = useGameStore();
  const config = getGameModeConfig(gameMode);
  const totalTime = config.timeLimit || 60;
  const lastTickTime = useRef<number>(timeLeft);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, tick]);

  useEffect(() => {
    if (gameStatus !== 'playing') {
      lastTickTime.current = timeLeft;
      return;
    }

    if (timeLeft < lastTickTime.current && timeLeft <= 5 && timeLeft > 0) {
      soundManager.play('countdownTick');
    }

    lastTickTime.current = timeLeft;
  }, [timeLeft, gameStatus]);

  const warningThreshold = Math.max(10, Math.floor(totalTime * 0.2));
  const criticalThreshold = Math.max(3, Math.floor(totalTime * 0.1));

  const isWarning = timeLeft <= warningThreshold && gameStatus === 'playing';
  const isCritical = timeLeft <= criticalThreshold && gameStatus === 'playing';

  const progress = (timeLeft / totalTime) * 100;
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (progress / 100) * circumference;

  const isPaused = gameStatus === 'paused';
  const canPause = gameStatus === 'playing' || gameStatus === 'paused';

  const handleTogglePause = () => {
    if (gameStatus === 'playing') {
      pauseGame();
    } else if (gameStatus === 'paused') {
      resumeGame();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className={cn(
                'text-gray-200 dark:text-slate-600 transition-colors',
                isWarning && 'text-orange-200 dark:text-orange-900',
                isCritical && 'text-red-200 dark:text-red-900',
                isPaused && 'text-gray-200'
              )}
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={cn(
                'text-teal-500 transition-all duration-1000 ease-linear',
                isWarning && 'text-orange-500',
                isCritical && 'text-red-500 animate-pulse',
                gameMode === 'challenge' && !isWarning && !isCritical && 'text-orange-500',
                isPaused && 'text-gray-400'
              )}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                'text-lg font-bold transition-colors',
                isWarning && 'text-orange-500',
                isCritical && 'text-red-500',
                !isWarning && !isCritical && gameMode === 'challenge' && 'text-orange-600',
                !isWarning && !isCritical && gameMode !== 'challenge' && 'text-gray-700 dark:text-gray-200',
                isPaused && 'text-gray-400'
              )}
            >
              {timeLeft}
            </span>
          </div>
        </div>

        {canPause && (
          <button
            onClick={handleTogglePause}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg',
              isPaused
                ? 'bg-teal-500 text-white hover:bg-teal-600'
                : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600'
            )}
            title={isPaused ? '继续游戏' : '暂停游戏'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 fill-current" />
            ) : (
              <Pause className="w-4 h-4 fill-current" />
            )}
          </button>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <Clock className="w-3 h-3" />
        <span>{isPaused ? '已暂停' : '秒'}</span>
      </div>
    </div>
  );
}
