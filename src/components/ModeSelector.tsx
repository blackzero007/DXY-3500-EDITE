import { useNavigate } from 'react-router-dom';
import { Clock, Lightbulb, Eye, Flame, BookOpen, Target } from 'lucide-react';
import { GAME_MODES } from '../config/gameModes';
import type { GameMode, GameModeConfig } from '../types';
import { cn } from '../lib/utils';

interface ModeSelectorProps {
  onSelectMode?: (mode: GameMode) => void;
}

const modeIcons: Record<GameMode, typeof Target> = {
  classic: Target,
  practice: BookOpen,
  challenge: Flame,
};

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  const navigate = useNavigate();

  const handleModeClick = (mode: GameMode) => {
    if (onSelectMode) {
      onSelectMode(mode);
    } else {
      navigate(`/game/${mode}`);
    }
  };

  const renderModeCard = (config: GameModeConfig) => {
    const Icon = modeIcons[config.id];
    
    return (
      <button
        key={config.id}
        onClick={() => handleModeClick(config.id)}
        className={cn(
          'group relative w-full p-6 rounded-2xl border-2 transition-all duration-300',
          'hover:scale-105 hover:shadow-xl',
          'text-left',
          config.id === 'classic' && 'border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 hover:border-teal-400 dark:border-teal-800 dark:from-teal-950 dark:to-emerald-950 dark:hover:border-teal-600',
          config.id === 'practice' && 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950 dark:hover:border-blue-600',
          config.id === 'challenge' && 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 hover:border-orange-400 dark:border-orange-800 dark:from-orange-950 dark:to-red-950 dark:hover:border-orange-600'
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg',
              'bg-gradient-to-br',
              config.bgGradient
            )}
          >
            <span>{config.icon}</span>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
              {config.name}
              <Icon
                className={cn(
                  'w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity',
                  config.id === 'classic' && 'text-teal-500',
                  config.id === 'practice' && 'text-blue-500',
                  config.id === 'challenge' && 'text-orange-500'
                )}
              />
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{config.description}</p>

            <div className="flex flex-wrap gap-2">
              {config.timeLimit !== null && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    config.id === 'classic' && 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
                    config.id === 'practice' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    config.id === 'challenge' && 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  )}
                >
                  <Clock className="w-3 h-3" />
                  {config.timeLimit}秒限时
                </span>
              )}
              {config.timeLimit === null && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'
                  )}
                >
                  <Clock className="w-3 h-3" />
                  不限时间
                </span>
              )}
              {config.allowHints && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    config.id === 'classic' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                    config.id === 'practice' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                  )}
                >
                  <Lightbulb className="w-3 h-3" />
                  可用提示
                </span>
              )}
              {!config.allowHints && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  )}
                >
                  <Lightbulb className="w-3 h-3" />
                  禁止提示
                </span>
              )}
              {config.showAnswer && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  )}
                >
                  <Eye className="w-3 h-3" />
                  可看答案
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-transform origin-left scale-x-0 group-hover:scale-x-100',
            'bg-gradient-to-r',
            config.bgGradient
          )}
        />
      </button>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          选择游戏模式
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          根据你的需求，选择最适合的学习方式
        </p>
      </div>

      <div className="space-y-4">
        {Object.values(GAME_MODES).map(renderModeCard)}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 transition-colors duration-300">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 模式说明</h4>
        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <li>• <strong>经典模式</strong>：每天一个固定单词，60秒限时挑战，记录连续打卡天数</li>
          <li>• <strong>练习模式</strong>：随机单词，无时间限制，可随时查看答案，轻松学习</li>
          <li>• <strong>挑战模式</strong>：30秒限时，禁止使用提示，考验你的真实词汇水平</li>
        </ul>
      </div>
    </div>
  );
}
