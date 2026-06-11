import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, XCircle, Target, Flame, TrendingUp } from 'lucide-react';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { DateDetailModal } from '@/components/DateDetailModal';
import { getGameRecords } from '@/utils/storage';
import type { GameRecord } from '@/types';
import { getTodayString } from '@/utils/dateUtils';

export default function History() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  useEffect(() => {
    setRecords(getGameRecords());
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();

    if (currentYear === nowYear && currentMonth === nowMonth) {
      return;
    }

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  const selectedRecord = useMemo(() => {
    if (!selectedDate) return null;
    return records.find((r) => r.date === selectedDate) || null;
  }, [selectedDate, records]);

  const stats = useMemo(() => {
    const totalDays = records.length;
    const successDays = records.filter((r) => r.success).length;
    const failedDays = records.filter((r) => !r.success).length;
    const successRate = totalDays > 0 ? Math.round((successDays / totalDays) * 100) : 0;

    let currentStreak = 0;
    const todayStr = getTodayString();
    const sortedRecords = [...records]
      .filter((r) => r.success)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (sortedRecords.length > 0) {
      const checkDate = new Date(todayStr);
      let idx = 0;
      while (idx < sortedRecords.length) {
        const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (sortedRecords[idx].date === dateStr) {
          currentStreak++;
          idx++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (sortedRecords[idx].date > dateStr) {
          idx++;
        } else {
          break;
        }
      }
    }

    return { totalDays, successDays, failedDays, successRate, currentStreak };
  }, [records]);

  const isCurrentMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth();

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">历史记录</h1>
          </div>
        </header>

        <main className="px-4 sm:px-6 pb-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-xs text-gray-500">总挑战</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDays}</p>
                <p className="text-xs text-gray-400">天</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-xs text-gray-500">成功</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.successDays}</p>
                <p className="text-xs text-gray-400">天</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-xs text-gray-500">失败</span>
                </div>
                <p className="text-2xl font-bold text-red-500">{stats.failedDays}</p>
                <p className="text-xs text-gray-400">天</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs text-gray-500">连续</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{stats.currentStreak}</p>
                <p className="text-xs text-gray-400">天 · 成功率 {stats.successRate}%</p>
              </div>
            </div>

            <HeatmapCalendar
              year={currentYear}
              month={currentMonth}
              records={records}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onDateClick={handleDateClick}
            />

            {isCurrentMonth && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">坚持每日挑战</h3>
                    <p className="text-sm text-gray-600">
                      每天完成一个单词挑战，保持学习节奏。
                      当前已连续成功 <span className="font-semibold text-teal-600">{stats.currentStreak}</span> 天，
                      继续加油！
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <DateDetailModal
        dateStr={selectedDate}
        record={selectedRecord}
        onClose={handleCloseModal}
      />

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
