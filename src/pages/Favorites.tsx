import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Trash2, ArrowUpDown, Volume2, BookOpen } from 'lucide-react';
import { useFavoriteStore, type SortOrder } from '../store/useFavoriteStore';
import { cn } from '../lib/utils';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

export default function Favorites() {
  const navigate = useNavigate();
  const { initFavorites, getSortedFavorites, removeFavoriteWord, setSortOrder, sortOrder } = useFavoriteStore();
  const [sortedFavorites, setSortedFavorites] = useState(getSortedFavorites());

  useEffect(() => {
    initFavorites();
  }, [initFavorites]);

  useEffect(() => {
    setSortedFavorites(getSortedFavorites());
  }, [getSortedFavorites, sortOrder]);

  const handleToggleSort = () => {
    const newOrder: SortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">我的生词本</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              共 <span className="font-semibold text-amber-600">{sortedFavorites.length}</span> 个单词
            </div>
            <button
              onClick={handleToggleSort}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                sortOrder === 'desc'
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
              title={sortOrder === 'desc' ? '最新收藏' : '最早收藏'}
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'desc' ? '最新' : '最早'}
            </button>
          </div>
        </header>

        <main className="px-4 sm:px-6 pb-12">
          {sortedFavorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                <BookOpen className="w-12 h-12 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">生词本是空的</h3>
              <p className="text-gray-500 text-center mb-6 max-w-xs">
                完成每日挑战后，点击星星图标即可收藏单词
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                开始挑战
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {sortedFavorites.map((item) => (
                <div
                  key={item.word}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/60 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-800 tracking-wide">
                          {item.word.toUpperCase()}
                        </h3>
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      </div>
                      {item.phonetic && (
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <span className="text-sm">{item.phonetic}</span>
                          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFavoriteWord(item.word)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="取消收藏"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-lg text-gray-700 mb-3">{item.meaning}</p>

                  {item.example && (
                    <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                      <p className="text-sm text-teal-700 italic">
                        "{item.example}"
                      </p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    收藏于 {formatDate(item.addedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
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
