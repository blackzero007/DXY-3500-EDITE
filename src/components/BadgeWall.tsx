import { useState } from 'react';
import { Award } from 'lucide-react';
import { useAchievementStore, ACHIEVEMENTS } from '../store/useAchievementStore';
import { cn } from '../lib/utils';
import type { AchievementId } from '../types';

export function BadgeWall() {
  const progress = useAchievementStore((s) => s.progress);
  const newlyUnlocked = useAchievementStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useAchievementStore((s) => s.clearNewlyUnlocked);
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<AchievementId | null>(null);

  const unlockedCount = progress.filter((p) => p.unlockedAt !== null).length;

  const handleExpand = () => {
    setExpanded(!expanded);
    if (newlyUnlocked.length > 0) {
      clearNewlyUnlocked();
    }
  };

  const selectedAchievement = selectedId
    ? ACHIEVEMENTS.find((a) => a.id === selectedId)
    : null;
  const selectedProgress = selectedId
    ? progress.find((p) => p.id === selectedId)
    : null;

  return (
    <div className="w-full max-w-lg mx-auto px-4 mb-8">
      <button
        onClick={handleExpand}
        className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">成就徽章</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              已解锁 {unlockedCount}/{ACHIEVEMENTS.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {newlyUnlocked.length > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
              {newlyUnlocked.length} 新
            </span>
          )}
          <svg
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform duration-300',
              expanded && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          expanded ? 'max-h-[800px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        )}
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-700"
                style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-purple-600">
              {unlockedCount}/{ACHIEVEMENTS.length}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((achievement) => {
              const p = progress.find((pr) => pr.id === achievement.id)!;
              const isUnlocked = p.unlockedAt !== null;
              const percent = Math.min(100, Math.round((p.current / achievement.target) * 100));
              const isNew = newlyUnlocked.includes(achievement.id);

              return (
                <button
                  key={achievement.id}
                  onClick={() => setSelectedId(selectedId === achievement.id ? null : achievement.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 relative',
                    isUnlocked
                      ? 'bg-gradient-to-b from-purple-50 to-white dark:from-purple-950 dark:to-slate-800 border border-purple-200 dark:border-purple-800 hover:shadow-md'
                      : 'bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 opacity-60 hover:opacity-80',
                    selectedId === achievement.id && 'ring-2 ring-purple-400',
                    isNew && 'animate-bounce'
                  )}
                >
                  {isNew && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                  <span
                    className={cn(
                      'text-2xl transition-transform duration-300',
                      isUnlocked ? 'scale-110' : 'grayscale'
                    )}
                  >
                    {achievement.icon}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold text-center leading-tight',
                      isUnlocked ? 'text-purple-700 dark:text-purple-300' : 'text-gray-400 dark:text-gray-500'
                    )}
                  >
                    {achievement.name}
                  </span>
                  {!isUnlocked && (
                    <div className="w-full h-1 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                  {isUnlocked && (
                    <span className="text-[8px] text-purple-400 font-medium">✓ 已解锁</span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedAchievement && selectedProgress && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-xl border border-purple-100 dark:border-purple-900">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedAchievement.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{selectedAchievement.name}</h4>
                    {selectedProgress.unlockedAt !== null && (
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] rounded-full font-medium">
                        已解锁
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedAchievement.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-white dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          selectedProgress.unlockedAt !== null
                            ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                            : 'bg-gray-400 dark:bg-gray-500'
                        )}
                        style={{
                          width: `${Math.min(100, Math.round((selectedProgress.current / selectedAchievement.target) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {selectedProgress.current}/{selectedAchievement.target}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
