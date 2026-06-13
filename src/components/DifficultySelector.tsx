import { Clock, Lightbulb, Zap } from 'lucide-react';
import { DIFFICULTIES } from '../config/difficulty';
import type { Difficulty } from '../types';
import { cn } from '../lib/utils';

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

export function DifficultySelector({ selectedDifficulty, onSelect }: DifficultySelectorProps) {
  const difficulties = Object.values(DIFFICULTIES);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          选择难度
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          根据你的水平，选择合适的挑战难度
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
        {difficulties.map((diff) => {
          const isSelected = selectedDifficulty === diff.id;
          
          return (
            <button
              key={diff.id}
              onClick={() => onSelect(diff.id)}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300',
                'flex flex-col items-center gap-1',
                isSelected
                  ? cn('bg-white dark:bg-slate-700 shadow-md text-gray-800 dark:text-gray-100')
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <span className="text-lg">
                {diff.id === 'easy' && '🌱'}
                {diff.id === 'normal' && '🎯'}
                {diff.id === 'hard' && '🔥'}
              </span>
              <span className="text-sm font-semibold">{diff.name}</span>
              <div className="flex items-center gap-1 text-xs opacity-80">
                <Clock className="w-3 h-3" />
                <span>{diff.timeLimit}秒</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>
            {DIFFICULTIES[selectedDifficulty].allowHints ? '可用提示' : '禁用提示'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          <span>{DIFFICULTIES[selectedDifficulty].description}</span>
        </div>
      </div>
    </div>
  );
}
