import { Link } from 'react-router-dom';
import { Flame, Star } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { formatDateDisplay, getTodayString } from '../utils/dateUtils';
import { useEffect } from 'react';

export function Header() {
  const streak = useGameStore((s) => s.streak);
  const initFavorites = useFavoriteStore((s) => s.initFavorites);
  const favorites = useFavoriteStore((s) => s.favorites);
  const todayStr = getTodayString();

  useEffect(() => {
    initFavorites();
  }, [initFavorites]);

  return (
    <header className="w-full flex items-center justify-between py-4 px-6">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">拼</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800">每日单词拼图</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500 hidden sm:block">
          {formatDateDisplay(todayStr)}
        </div>

        <Link
          to="/favorites"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-full border border-amber-200 hover:from-amber-100 hover:to-yellow-100 transition-colors"
          title="我的生词本"
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-semibold text-amber-600">
            {favorites.length} 生词
          </span>
        </Link>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-full border border-orange-200">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-600">
            {streak} 天连续
          </span>
        </div>
      </div>
    </header>
  );
}
