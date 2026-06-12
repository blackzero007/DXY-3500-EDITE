import { useEffect, useState } from 'react';
import { Trophy, XCircle, Clock, Lightbulb, Volume2, Share2, RotateCcw, Star, Image, Download, X, Loader2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { useAchievementStore } from '../store/useAchievementStore';
import { useSpeech } from '../hooks/useSpeech';
import { getGameModeConfig } from '../config/gameModes';
import { cn } from '../lib/utils';
import { soundManager } from '../utils/soundManager';
import { generatePoster, shareImage, saveToAlbum, type PosterData, type SaveMethod } from '../utils/posterGenerator';

type SpeechRate = 'normal' | 'slow';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export function ResultModal() {
  const { gameStatus, currentWord, timeLeft, hintsUsed, streak, gameMode, startTime, retryGame } = useGameStore();
  const config = getGameModeConfig(gameMode);
  const initFavorites = useFavoriteStore((s) => s.initFavorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const favorites = useFavoriteStore((s) => s.favorites);
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [speechRate, setSpeechRate] = useState<SpeechRate>('normal');
  const [showPoster, setShowPoster] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { speak, isSpeaking, isSupported } = useSpeech();

  const isSuccess = gameStatus === 'success';
  const isFailed = gameStatus === 'failed';
  const isFavorited = currentWord ? favorites.some((f) => f.word === currentWord.word) : false;

  useEffect(() => {
    initFavorites();
  }, [initFavorites]);

  useEffect(() => {
    if (isSuccess || isFailed) {
      const timer = setTimeout(() => {
        setShow(true);
        if (isSuccess) {
          soundManager.play('success');
        } else {
          soundManager.play('failed');
        }
      }, 300);
      checkAchievements();
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isSuccess, isFailed, checkAchievements]);

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

  const timeUsed = startTime && config.timeLimit !== null 
    ? config.timeLimit - timeLeft 
    : startTime 
      ? Math.round((Date.now() - startTime) / 1000) 
      : 0;

  const handleShare = () => {
    const modeText = gameMode === 'classic' ? '经典模式' : gameMode === 'practice' ? '练习模式' : '挑战模式';
    const timeText = config.timeLimit !== null ? `在${config.timeLimit}秒内` : '';
    
    const text = isSuccess
      ? `🎉 我在每日单词拼图【${modeText}】中${timeText}用了 ${timeUsed} 秒，${hintsUsed > 0 ? `使用了 ${hintsUsed} 次提示，` : ''}成功拼出了单词 "${currentWord?.word}"！来挑战我吧！`
      : `😢 我在每日单词拼图【${modeText}】中${timeText}没能完成，单词是 "${currentWord?.word}" - ${currentWord?.meaning}。再来挑战一次！`;
    
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

  const getShareText = () => {
    const modeText = gameMode === 'classic' ? '经典模式' : gameMode === 'practice' ? '练习模式' : '挑战模式';
    const timeText = config.timeLimit !== null ? `在${config.timeLimit}秒内` : '';
    
    return isSuccess
      ? `🎉 我在每日单词拼图【${modeText}】中${timeText}用了 ${timeUsed} 秒，${hintsUsed > 0 ? `使用了 ${hintsUsed} 次提示，` : ''}成功拼出了单词 "${currentWord?.word}"！来挑战我吧！`
      : `😢 我在每日单词拼图【${modeText}】中${timeText}没能完成，单词是 "${currentWord?.word}" - ${currentWord?.meaning}。再来挑战一次！`;
  };

  const handleGeneratePoster = async () => {
    if (!currentWord) return;

    setIsGenerating(true);
    try {
      const posterData: PosterData = {
        word: currentWord.word,
        meaning: currentWord.meaning,
        phonetic: currentWord.phonetic,
        timeUsed: timeUsed,
        isSuccess: isSuccess,
        streak: streak,
        hintsUsed: hintsUsed,
        gameMode: gameMode,
      };

      const dataUrl = await generatePoster(posterData);
      setPosterUrl(dataUrl);
      setShowPoster(true);
    } catch (error) {
      console.error('生成海报失败:', error);
      alert('生成海报失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSaveMessage = (method?: SaveMethod) => {
    switch (method) {
      case 'download':
        return '海报已保存到下载文件夹';
      case 'clipboard':
        return '海报已复制到剪贴板，您可以粘贴到相册或聊天窗口';
      default:
        return '保存失败，请重试';
    }
  };

  const handleSaveToAlbum = async () => {
    if (!posterUrl) return;
    
    try {
      const result = await saveToAlbum(posterUrl);
      alert(getSaveMessage(result.method));
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleSharePoster = async () => {
    if (!posterUrl) return;
    
    try {
      const text = getShareText();
      const success = await shareImage(posterUrl, text);
      if (!success) {
        const result = await saveToAlbum(posterUrl);
        alert(`当前浏览器不支持直接分享图片，${getSaveMessage(result.method)}`);
      }
    } catch (error) {
      console.error('分享失败:', error);
      alert('分享失败，请重试');
    }
  };

  const handleClosePoster = () => {
    setShowPoster(false);
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
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-3xl font-bold text-gray-800 tracking-wide">
                {currentWord?.word.toUpperCase()}
              </h2>
              <button
                onClick={() => currentWord && toggleFavorite(currentWord)}
                className="p-2 hover:bg-amber-50 rounded-full transition-colors group"
                title={isFavorited ? '取消收藏' : '收藏单词'}
              >
                <Star
                  className={cn(
                    'w-6 h-6 transition-all',
                    isFavorited
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300 group-hover:text-amber-400'
                  )}
                />
              </button>
            </div>
            {currentWord?.phonetic && (
              <div className="flex items-center justify-center gap-2 text-gray-500 mt-1">
                <span className="text-sm">{currentWord.phonetic}</span>
              </div>
            )}
            {isSupported && (
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  onClick={() => currentWord && speak(currentWord.word, speechRate)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all',
                    isSpeaking
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
                  )}
                  title="播放发音"
                >
                  <Volume2 className={cn('w-4 h-4', isSpeaking && 'animate-pulse')} />
                  <span className="text-sm font-medium">
                    {isSpeaking ? '播放中...' : '跟读'}
                  </span>
                </button>
                <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                  <button
                    onClick={() => setSpeechRate('normal')}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                      speechRate === 'normal'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    正常
                  </button>
                  <button
                    onClick={() => setSpeechRate('slow')}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                      speechRate === 'slow'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    慢速
                  </button>
                </div>
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

          <div className="flex gap-3 mb-3">
            <button
              onClick={handleShare}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              分享
            </button>
            <button
              onClick={handleGeneratePoster}
              disabled={isGenerating}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                isSuccess
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white disabled:from-purple-300 disabled:to-purple-400'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:from-blue-300 disabled:to-blue-400'
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Image className="w-4 h-4" />
              )}
              {isGenerating ? '生成中...' : '生成海报'}
            </button>
          </div>
          <div className="flex gap-3">
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

      {showPoster && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClosePoster}
          />
          <div className="relative w-full max-w-sm">
            <button
              onClick={handleClosePoster}
              className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500">
                <p className="text-center text-white font-medium">分享海报</p>
              </div>

              <div className="p-4">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt="分享海报"
                    className="w-full rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="w-full aspect-[9/16] bg-gray-100 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>

              <div className="p-4 pt-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveToAlbum}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    保存到相册
                  </button>
                  <button
                    onClick={handleSharePoster}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    直接分享
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
