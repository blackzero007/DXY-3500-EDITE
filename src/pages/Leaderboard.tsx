import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, Clock, Flame, Medal } from 'lucide-react';
import { getGameRecords, getStreak } from '@/utils/storage';
import type { GameRecord } from '@/types';

type LeaderboardType = 'correct' | 'avgTime' | 'streak';

interface PlayerData {
  id: string;
  name: string;
  avatar: string;
  correctCount: number;
  avgTime: number;
  maxStreak: number;
  isCurrentPlayer: boolean;
}

const SIMULATED_PLAYERS: Omit<PlayerData, 'isCurrentPlayer'>[] = [
  { id: 'p1', name: '词汇大师', avatar: '🦊', correctCount: 156, avgTime: 18, maxStreak: 45 },
  { id: 'p2', name: '闪电手', avatar: '🐯', correctCount: 142, avgTime: 12, maxStreak: 38 },
  { id: 'p3', name: '坚持者', avatar: '🦁', correctCount: 128, avgTime: 25, maxStreak: 52 },
  { id: 'p4', name: '学霸小王', avatar: '🐼', correctCount: 115, avgTime: 22, maxStreak: 33 },
  { id: 'p5', name: '单词达人', avatar: '🐨', correctCount: 98, avgTime: 28, maxStreak: 28 },
  { id: 'p6', name: '早起鸟', avatar: '🐦', correctCount: 87, avgTime: 32, maxStreak: 41 },
  { id: 'p7', name: '夜猫子', avatar: '🦉', correctCount: 82, avgTime: 20, maxStreak: 25 },
  { id: 'p8', name: '小蜜蜂', avatar: '🐝', correctCount: 76, avgTime: 35, maxStreak: 22 },
  { id: 'p9', name: '书虫', avatar: '🐛', correctCount: 71, avgTime: 24, maxStreak: 19 },
  { id: 'p10', name: '探险家', avatar: '🐻', correctCount: 65, avgTime: 30, maxStreak: 18 },
  { id: 'p11', name: '思考者', avatar: '🦋', correctCount: 58, avgTime: 40, maxStreak: 15 },
  { id: 'p12', name: '勤奋生', avatar: '🐿️', correctCount: 52, avgTime: 33, maxStreak: 16 },
  { id: 'p13', name: '语言爱好者', avatar: '🦜', correctCount: 48, avgTime: 27, maxStreak: 14 },
  { id: 'p14', name: '初学者', avatar: '🐰', correctCount: 35, avgTime: 45, maxStreak: 10 },
  { id: 'p15', name: '努力中', avatar: '🐹', correctCount: 28, avgTime: 38, maxStreak: 8 },
  { id: 'p16', name: '词汇新星', avatar: '⭐', correctCount: 22, avgTime: 42, maxStreak: 7 },
  { id: 'p17', name: '进步君', avatar: '🌱', correctCount: 18, avgTime: 50, maxStreak: 5 },
  { id: 'p18', name: '小树苗', avatar: '🌿', correctCount: 12, avgTime: 55, maxStreak: 4 },
  { id: 'p19', name: '新手上路', avatar: '🐣', correctCount: 6, avgTime: 58, maxStreak: 2 },
  { id: 'p20', name: '刚刚加入', avatar: '🥚', correctCount: 2, avgTime: 62, maxStreak: 1 },
];

function calculateMaxStreak(records: GameRecord[]): number {
  const successDates = [...new Set(records.filter(r => r.success).map(r => r.date))].sort();
  if (successDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < successDates.length; i++) {
    const prev = new Date(successDates[i - 1]);
    const curr = new Date(successDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [activeTab, setActiveTab] = useState<LeaderboardType>('correct');

  useEffect(() => {
    setRecords(getGameRecords());
  }, []);

  const currentPlayerStats = useMemo(() => {
    const correctRecords = records.filter(r => r.success);
    const correctCount = correctRecords.length;
    const totalTime = correctRecords.reduce((sum, r) => sum + r.timeUsed, 0);
    const avgTime = correctCount > 0 ? Math.round(totalTime / correctCount) : 0;
    const maxStreak = Math.max(getStreak(), calculateMaxStreak(records));

    return { correctCount, avgTime, maxStreak };
  }, [records]);

  const leaderboardData = useMemo((): PlayerData[] => {
    const currentPlayer: PlayerData = {
      id: 'current',
      name: '我',
      avatar: '👤',
      correctCount: currentPlayerStats.correctCount,
      avgTime: currentPlayerStats.avgTime,
      maxStreak: currentPlayerStats.maxStreak,
      isCurrentPlayer: true,
    };

    const allPlayers: PlayerData[] = [
      currentPlayer,
      ...SIMULATED_PLAYERS.map(p => ({ ...p, isCurrentPlayer: false })),
    ];

    switch (activeTab) {
      case 'correct':
        return [...allPlayers].sort((a, b) => b.correctCount - a.correctCount).slice(0, 20);
      case 'avgTime':
        return [...allPlayers]
          .filter(p => p.correctCount > 0)
          .sort((a, b) => a.avgTime - b.avgTime)
          .slice(0, 20);
      case 'streak':
        return [...allPlayers].sort((a, b) => b.maxStreak - a.maxStreak).slice(0, 20);
      default:
        return [];
    }
  }, [activeTab, currentPlayerStats]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-500">{rank}</span>;
  };

  const getTabIcon = (type: LeaderboardType) => {
    switch (type) {
      case 'correct':
        return <Target className="w-4 h-4" />;
      case 'avgTime':
        return <Clock className="w-4 h-4" />;
      case 'streak':
        return <Flame className="w-4 h-4" />;
    }
  };

  const getTabLabel = (type: LeaderboardType) => {
    switch (type) {
      case 'correct':
        return '累计答对';
      case 'avgTime':
        return '平均用时';
      case 'streak':
        return '最长连续';
    }
  };

  const getTabColor = (type: LeaderboardType, active: boolean) => {
    if (!active) return 'text-gray-500 hover:bg-gray-100';
    switch (type) {
      case 'correct':
        return 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border-teal-300';
      case 'avgTime':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300';
      case 'streak':
        return 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-300';
    }
  };

  const getValueColor = (type: LeaderboardType) => {
    switch (type) {
      case 'correct':
        return 'text-teal-600';
      case 'avgTime':
        return 'text-blue-600';
      case 'streak':
        return 'text-orange-600';
    }
  };

  const getValueDisplay = (player: PlayerData, type: LeaderboardType) => {
    switch (type) {
      case 'correct':
        return `${player.correctCount} 题`;
      case 'avgTime':
        return `${player.avgTime} 秒`;
      case 'streak':
        return `${player.maxStreak} 天`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-teal-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        <header className="w-full flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/60 rounded-xl transition-colors"
              title="返回首页"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">排行榜</h1>
          </div>
        </header>

        <main className="px-4 sm:px-6 pb-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-white/60">
              {(['correct', 'avgTime', 'streak'] as LeaderboardType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${getTabColor(
                    type,
                    activeTab === type
                  )}`}
                >
                  {getTabIcon(type)}
                  <span>{getTabLabel(type)}</span>
                </button>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {leaderboardData.map((player, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  const isCurrent = player.isCurrentPlayer;

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${
                        isCurrent
                          ? 'bg-gradient-to-r from-teal-50/80 to-emerald-50/80'
                          : isTop3
                          ? 'bg-gradient-to-r from-yellow-50/50 to-transparent'
                          : 'hover:bg-gray-50/60'
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 flex justify-center">
                        {getRankIcon(rank)}
                      </div>

                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                          isTop3
                            ? 'bg-gradient-to-br from-yellow-100 to-amber-100'
                            : isCurrent
                            ? 'bg-gradient-to-br from-teal-100 to-emerald-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        {player.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold truncate ${
                              isCurrent ? 'text-teal-700' : 'text-gray-800'
                            }`}
                          >
                            {player.name}
                          </span>
                          {isCurrent && (
                            <span className="flex-shrink-0 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                              我
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`flex-shrink-0 font-bold text-lg ${getValueColor(
                          activeTab
                        )}`}
                      >
                        {getValueDisplay(player, activeTab)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">我的成绩</h3>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-teal-600">{currentPlayerStats.correctCount}</p>
                      <p className="text-xs text-gray-500 mt-1">累计答对</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{currentPlayerStats.avgTime || '-'}</p>
                      <p className="text-xs text-gray-500 mt-1">平均用时(秒)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{currentPlayerStats.maxStreak}</p>
                      <p className="text-xs text-gray-500 mt-1">最长连续(天)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
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
    </div>
  );
}
