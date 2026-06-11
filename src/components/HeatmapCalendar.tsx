import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { GameRecord } from '../types';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatDateString,
  formatMonthYear,
  isFutureDate,
  getTodayString,
} from '../utils/dateUtils';
import { cn } from '../lib/utils';

interface HeatmapCalendarProps {
  year: number;
  month: number;
  records: GameRecord[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (dateStr: string) => void;
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function HeatmapCalendar({
  year,
  month,
  records,
  onPrevMonth,
  onNextMonth,
  onDateClick,
}: HeatmapCalendarProps) {
  const todayStr = getTodayString();

  const recordMap = useMemo(() => {
    const map = new Map<string, GameRecord>();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  const stats = useMemo(() => {
    const monthRecords = records.filter((r) => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const success = monthRecords.filter((r) => r.success).length;
    const failed = monthRecords.filter((r) => !r.success).length;
    return { total: monthRecords.length, success, failed };
  }, [records, year, month]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: Array<{ day: number | null; dateStr: string | null }> = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, dateStr: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateString(year, month, day);
    cells.push({ day, dateStr });
  }

  const getCellStyle = (dateStr: string | null, day: number | null) => {
    if (!dateStr || day === null) return '';

    const record = recordMap.get(dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = isFutureDate(dateStr);

    if (isFuture) {
      return 'bg-gray-50 text-gray-300 cursor-not-allowed';
    }

    if (!record) {
      return cn(
        'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer',
        isToday && 'ring-2 ring-orange-400 ring-offset-1'
      );
    }

    if (record.success) {
      return cn(
        'bg-gradient-to-br from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 cursor-pointer shadow-sm',
        isToday && 'ring-2 ring-orange-400 ring-offset-1'
      );
    }

    return cn(
      'bg-gradient-to-br from-red-400 to-rose-500 text-white hover:from-red-500 hover:to-rose-600 cursor-pointer shadow-sm',
      isToday && 'ring-2 ring-orange-400 ring-offset-1'
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/60">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {formatMonthYear(year, month)}
            </h2>
            <p className="text-xs text-gray-500">
              成功 {stats.success} 天 · 失败 {stats.failed} 天
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="上一个月"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="下一个月"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, index) => (
          <div
            key={index}
            onClick={() => {
              if (cell.dateStr && !isFutureDate(cell.dateStr)) {
                onDateClick(cell.dateStr);
              }
            }}
            className={cn(
              'aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200',
              cell.day === null ? 'bg-transparent' : getCellStyle(cell.dateStr, cell.day)
            )}
          >
            {cell.day}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-emerald-500" />
          <span className="text-xs text-gray-500">成功</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-red-400 to-rose-500" />
          <span className="text-xs text-gray-500">失败</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
          <span className="text-xs text-gray-500">未挑战</span>
        </div>
      </div>
    </div>
  );
}
