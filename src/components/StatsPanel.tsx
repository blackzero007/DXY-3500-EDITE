import { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Target, Flame, Calendar, Award } from 'lucide-react';
import { getGameRecords } from '@/utils/storage';
import { getTodayString } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import type { GameRecord } from '@/types';

interface DayStats {
  date: string;
  label: string;
  success: boolean;
  timeUsed: number;
}

export function StatsPanel() {
  const [expanded, setExpanded] = useState(false);
  const [records, setRecords] = useState<GameRecord[]>([]);

  useEffect(() => {
    setRecords(getGameRecords());
  }, []);

  const weekDays = useMemo(() => {
    const days: DayStats[] = [];
    const today = new Date();
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const record = records.find(r => r.date === dateStr && (r.mode || 'classic') === 'classic');
      
      days.push({
        date: dateStr,
        label: i === 0 ? '今天' : `周${dayNames[date.getDay()]}`,
        success: record?.success ?? false,
        timeUsed: record?.success ? record.timeUsed : 0,
      });
    }
    return days;
  }, [records]);

  const weeklyStats = useMemo(() => {
    const total = weekDays.filter(d => records.find(r => r.date === d.date && (r.mode || 'classic') === 'classic')).length;
    const successCount = weekDays.filter(d => d.success).length;
    const winRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
    return { total, successCount, winRate };
  }, [weekDays, records]);

  const avgTimeData = useMemo(() => {
    return weekDays.map(d => ({
      ...d,
      hasData: d.timeUsed > 0,
      displayTime: d.timeUsed > 0 ? d.timeUsed : 0,
    }));
  }, [weekDays]);

  const maxTime = Math.max(...avgTimeData.map(d => d.displayTime), 60);

  const overallStats = useMemo(() => {
    const uniqueDates = new Set(records.filter(r => (r.mode || 'classic') === 'classic').map(r => r.date));
    const totalDays = uniqueDates.size;

    let longestStreak = 0;
    let currentStreak = 0;
    const sortedRecords = [...records]
      .filter(r => r.success && (r.mode || 'classic') === 'classic')
      .sort((a, b) => a.date.localeCompare(b.date));

    for (let i = 0; i < sortedRecords.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedRecords[i - 1].date);
        const currDate = new Date(sortedRecords[i].date);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    return { totalDays, longestStreak };
  }, [records]);

  const todayStr = getTodayString();
  const currentStreak = useMemo(() => {
    let streak = 0;
    const checkDate = new Date(todayStr);
    
    for (let i = 0; i < 365; i++) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const record = records.find(r => r.date === dateStr && (r.mode || 'classic') === 'classic' && r.success);
      
      if (record) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [records, todayStr]);

  const ringRadius = 40;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (weeklyStats.winRate / 100) * ringCircumference;

  return (
    <div className="w-full max-w-lg mx-auto px-4 mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">数据统计</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              本周胜率 {weeklyStats.winRate}% · 已完成 {overallStats.totalDays} 天
            </p>
          </div>
        </div>
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
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          expanded ? 'max-h-[1000px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        )}
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-md p-5 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/50 dark:to-emerald-950/50 rounded-2xl p-4 border border-teal-100 dark:border-teal-900">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-teal-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">本周胜率</span>
              </div>
              <div className="flex items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-teal-100 dark:text-teal-900"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={ringRadius}
                    fill="none"
                    stroke="url(#ringGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 60 60)"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <text
                    x="60"
                    y="55"
                    textAnchor="middle"
                    className="text-2xl font-bold fill-teal-600 dark:fill-teal-400"
                  >
                    {weeklyStats.winRate}%
                  </text>
                  <text
                    x="60"
                    y="72"
                    textAnchor="middle"
                    className="text-xs fill-gray-500 dark:fill-gray-400"
                  >
                    {weeklyStats.successCount}/{weeklyStats.total}
                  </text>
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 rounded-2xl p-4 border border-orange-100 dark:border-orange-900">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">平均用时</span>
              </div>
              <div className="flex items-end justify-between h-[100px] gap-1.5">
                {avgTimeData.map((day) => (
                  <div key={day.date} className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all duration-500 ease-out relative group',
                        day.hasData
                          ? 'bg-gradient-to-t from-orange-400 to-amber-400 dark:from-orange-500 dark:to-amber-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      )}
                      style={{
                        height: day.hasData ? `${Math.max((day.displayTime / maxTime) * 70, 4)}px` : '4px',
                      }}
                    >
                      {day.hasData && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                          {day.displayTime}秒
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      'text-[10px] mt-1.5',
                      day.success ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400 dark:text-gray-500'
                    )}>
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">累计完成</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {overallStats.totalDays}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">天</span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((overallStats.totalDays / 30) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">
                  {overallStats.totalDays >= 30 ? '🏆' : `${overallStats.totalDays}/30`}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-2xl p-4 border border-amber-100 dark:border-amber-900">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">最长连胜</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {overallStats.longestStreak}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">天</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(overallStats.longestStreak, 7) }).map((_, i) => (
                    <span
                      key={i}
                      className="text-sm"
                      style={{
                        opacity: 0.4 + (i / Math.min(overallStats.longestStreak, 7)) * 0.6,
                        transform: `scale(${0.8 + (i / Math.min(overallStats.longestStreak, 7)) * 0.2})`,
                      }}
                    >
                      🔥
                    </span>
                  ))}
                </div>
                {overallStats.longestStreak > 7 && (
                  <span className="text-[10px] text-amber-500 font-medium">+{overallStats.longestStreak - 7}</span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2 pt-2 border-t border-amber-100 dark:border-amber-900">
                <Award className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-[11px] text-gray-600 dark:text-gray-400">
                  当前连续 <span className="font-semibold text-teal-600 dark:text-teal-400">{currentStreak}</span> 天
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 pt-1">
            {weekDays.map((day) => (
              <div
                key={day.date}
                className={cn(
                  'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-medium transition-all',
                  records.find(r => r.date === day.date && (r.mode || 'classic') === 'classic')
                    ? day.success
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                )}
                title={`${day.date}: ${records.find(r => r.date === day.date && (r.mode || 'classic') === 'classic') ? (day.success ? '成功' : '失败') : '无记录'}`}
              >
                {day.success ? '✓' : records.find(r => r.date === day.date && (r.mode || 'classic') === 'classic') ? '✗' : '·'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
