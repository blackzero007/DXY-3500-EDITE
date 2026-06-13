import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ModeSelector } from '@/components/ModeSelector';
import { DifficultySelector } from '@/components/DifficultySelector';
import { BadgeWall } from '@/components/BadgeWall';
import { SettingsModal } from '@/components/SettingsModal';
import { HelpGuideModal } from '@/components/HelpGuideModal';
import { useAchievementStore } from '@/store/useAchievementStore';
import { useGameStore } from '@/store/useGameStore';
import { hasShownGuide } from '@/utils/storage';
import type { Difficulty } from '@/types';

export default function Home() {
  const initAchievements = useAchievementStore((s) => s.initAchievements);
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');

  useEffect(() => {
    initAchievements();
    checkAchievements();
  }, [initAchievements, checkAchievements]);

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
