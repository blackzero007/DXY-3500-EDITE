import { X, Clock, Lightbulb, Trophy, XCircle, BookOpen } from 'lucide-react';
import type { GameRecord } from '../types';
import { formatDateDisplay } from '../utils/dateUtils';
import { cn } from '../lib/utils';
import { wordList } from '../data/words';

interface DateDetailModalProps {
  dateStr: string | null;
  record: GameRecord | null;
  onClose: () => void;
}

export function DateDetailModal({ dateStr, record, onClose }: DateDetailModalProps) {
  if (!dateStr) return null;

  const wordInfo = record
    ? wordList.find((w) => w.word === record.word)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div
          className={cn(
            'h-28 flex items-center justify-center',
            record
              ? record.success
                ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                : 'bg-gradient-to-br from-red-400 to-rose-600'
              : 'bg-gradient-to-br from-gray-300 to-gray-500'
          )}
        >
          <div className="text-center">
            {record ? (
              record.success ? (
                <>
                  <Trophy className="w-12 h-12 text-white mx-auto mb-1" />
                  <p className="text-white text-lg font-bold">挑战成功</p>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-white mx-auto mb-1" />
                  <p className="text-white text-lg font-bold">挑战失败</p>
                </>
              )
            ) : (
              <>
                <BookOpen className="w-12 h-12 text-white mx-auto mb-1" />
                <p className="text-white text-lg font-bold">未挑战</p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-1">挑战日期</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {formatDateDisplay(dateStr)}
            </h3>
          </div>

          {record ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 tracking-wide">
                  {record.word.toUpperCase()}
                </h2>
                {wordInfo?.phonetic && (
                  <p className="text-sm text-gray-500 mt-1">{wordInfo.phonetic}</p>
                )}
                {wordInfo?.meaning && (
                  <p className="text-lg text-gray-600 mt-2">{wordInfo.meaning}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Clock className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-800">{record.timeUsed}</p>
                  <p className="text-xs text-gray-500">用时秒</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Lightbulb className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-800">{record.hintsUsed}</p>
                  <p className="text-xs text-gray-500">提示次数</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  {record.success ? (
                    <>
                      <Trophy className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-green-600">成功</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-red-600">失败</p>
                    </>
                  )}
                  <p className="text-xs text-gray-500">状态</p>
                </div>
              </div>

              {wordInfo?.example && (
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                  <p className="text-sm text-teal-700 italic">
                    "{wordInfo.example}"
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500">这一天没有进行挑战</p>
              <p className="text-gray-400 text-sm mt-1">每天坚持挑战，记录你的进步</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
