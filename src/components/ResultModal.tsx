import { useEffect, useState } from 'react';
import { Trophy, XCircle, Clock, Lightbulb, Volume2, Share2, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { cn } from '../lib/utils';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export function ResultModal() {
  const { gameStatus, currentWord, timeLeft, hintsUsed, streak, retryGame } = useGameStore();
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const isSuccess = gameStatus === 'success';
  const isFailed = gameStatus === 'failed';

  useEffect(() => {
    if (isSuccess || isFailed) {
      const timer = setTimeout(() => setShow(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isSuccess, isFailed]);

  useEffect(() => {
    if (isSuccess && show) {
      const pieces: ConfettiPiece[] = [];
      const colors = ['#FF6B35', '#00B4D8', '#FFD700', '#FF69B4', '#32CD32'];
      
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      setConfetti(pieces);
    }
  }, [isSuccess, show]);

  if (!isSuccess && !isFailed) return null;

  const timeUsed = 60 - timeLeft;

  const handleShare = () => {
    const text = isSuccess
      ? `🎉 我在每日单词拼图中用了 ${timeUsed} 秒，${hintsUsed > 0 ? `使用了 ${hintsUsed} 次提示，` : ''}成功拼出了单词 "${currentWord?.word}"！来挑战我吧！`
      : `😢 今天的每日单词拼图我没能在60秒内完成，单词是 "${currentWord?.word}" - ${currentWord?.meaning}。明天再来挑战！`;
    
    if (navigator.share) {
      navigator.share({
        title: '每日单词拼图',
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板');
      }).catch(() => {});
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {isSuccess && confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-sm pointer-events-none"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            backgroundColor: piece.color,
            animation: `fall ${piece.duration}s ease-in ${piece.delay}s forwards`,
          }}
        />
      ))}

      <div
        className={cn(
          'relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden',
          'transform transition-all duration-500 ease-out',
          show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        )}
      >
        <div
          className={cn(
            'h-32 flex items-center justify-center',
            isSuccess ? 'bg-gradient-to-br from-teal-400 to-teal-600' : 'bg-gradient-to-br from-orange-400 to-orange-600'
          )}
        >
          <div className="text-center">
            {isSuccess ? (
              <>
                <Trophy className="w-16 h-16 text-white mx-auto mb-2 animate-bounce" />
                <p className="text-white text-2xl font-bold">太棒了！</p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-white mx-auto mb-2" />
                <p className="text-white text-2xl font-bold">时间到！</p>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-1 tracking-wide">
              {currentWord?.word.toUpperCase()}
            </h2>
            {currentWord?.phonetic && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <span className="text-sm">{currentWord.phonetic}</span>
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-lg text-gray-600 mt-2">{currentWord?.meaning}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-teal-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{timeUsed}</p>
              <p className="text-xs text-gray-500">用时秒</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Lightbulb className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{hintsUsed}</p>
              <p className="text-xs text-gray-500">提示次数</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Trophy className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{streak}</p>
              <p className="text-xs text-gray-500">连续天数</p>
            </div>
          </div>

          {currentWord?.example && (
            <div className="bg-teal-50 rounded-xl p-4 mb-6 border border-teal-100">
              <p className="text-sm text-teal-700 italic">
                "{currentWord.example}"
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              分享
            </button>
            <button
              onClick={retryGame}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                isSuccess
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
              )}
            >
              <RotateCcw className="w-4 h-4" />
              再玩一次
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
