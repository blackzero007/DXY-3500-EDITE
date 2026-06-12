import { useEffect, useCallback, useState, useRef } from 'react';
import { RotateCcw, Lightbulb, Send, HelpCircle, Play, Volume2, Eye } from 'lucide-react';
import { LetterCard } from './LetterCard';
import { Timer } from './Timer';
import { useGameStore } from '../store/useGameStore';
import { useSpeech } from '../hooks/useSpeech';
import { getGameModeConfig } from '../config/gameModes';
import { cn } from '../lib/utils';
import { soundManager } from '../utils/soundManager';

type SpeechRate = 'normal' | 'slow';

export function GameBoard() {
  const {
    currentWord,
    shuffledLetters,
    answerLetters,
    gameStatus,
    gameMode,
    hintsUsed,
    placeLetter,
    removeLetter,
    resetAnswer,
    submitAnswer,
    useHint: applyHint,
    initGame,
    startGame,
    revealAnswer,
  } = useGameStore();

  const config = getGameModeConfig(gameMode);
  const [showMeaning, setShowMeaning] = useState(false);
  const [shakeAnswer, setShakeAnswer] = useState(false);
  const [speechRate, setSpeechRate] = useState<SpeechRate>('normal');
  const { speak, isSpeaking, isSupported } = useSpeech();

  const poolRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameStatus === 'idle' && !currentWord) {
      initGame(gameMode);
    }
  }, [initGame, gameMode, gameStatus, currentWord]);

  useEffect(() => {
    const handleLetterDropped = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { fromIndex, toIndex, fromSource, toSource, letter } = customEvent.detail;

      if (fromSource === 'pool' && toSource === 'answer') {
        placeLetter(letter, fromIndex, toIndex);
        soundManager.play('placeLetter');
      } else if (fromSource === 'answer' && toSource === 'pool') {
        removeLetter(fromIndex);
        soundManager.play('removeLetter');
      }
    };

    document.addEventListener('letter-dropped', handleLetterDropped);
    return () => {
      document.removeEventListener('letter-dropped', handleLetterDropped);
    };
  }, [placeLetter, removeLetter]);

  useEffect(() => {
    const getFocusableCards = (container: HTMLDivElement | null) => {
      if (!container) return [] as HTMLElement[];
      return Array.from(container.querySelectorAll<HTMLElement>('[role="button"]:not([aria-disabled="true"])'));
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;

      const activeElement = document.activeElement as HTMLElement;
      const isInPool = poolRef.current?.contains(activeElement);
      const isInAnswer = answerRef.current?.contains(activeElement);

      if (e.key === 'Backspace') {
        e.preventDefault();
        const lastFilledIndex = [...answerLetters].map((l, i) => l !== null ? i : -1).filter(i => i !== -1).pop();
        if (lastFilledIndex !== undefined && lastFilledIndex >= 0) {
          removeLetter(lastFilledIndex);
          soundManager.play('removeLetter');
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (!isInPool && !isInAnswer) return;

        e.preventDefault();
        const container = isInPool ? poolRef.current : answerRef.current;
        const cards = getFocusableCards(container);
        if (cards.length === 0) return;

        const currentIndex = cards.findIndex(card => card === activeElement);
        let nextIndex = currentIndex;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % cards.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIndex = (currentIndex - 1 + cards.length) % cards.length;
        }

        cards[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameStatus, answerLetters, removeLetter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number, toSource: 'pool' | 'answer') => {
      e.preventDefault();
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const { index: fromIndex, source: fromSource, letter } = data;

        if (fromSource === 'pool' && toSource === 'answer') {
          placeLetter(letter, fromIndex, toIndex);
          soundManager.play('placeLetter');
        } else if (fromSource === 'answer' && toSource === 'pool') {
          removeLetter(fromIndex);
          soundManager.play('removeLetter');
        }
      } catch {
        // 忽略无效数据
      }
    },
    [placeLetter, removeLetter]
  );

  const handlePoolCardClick = (letter: string, index: number) => {
    if (gameStatus !== 'playing' || !letter) return;

    const firstEmptyIndex = answerLetters.findIndex((l) => l === null);
    if (firstEmptyIndex >= 0) {
      placeLetter(letter, index, firstEmptyIndex);
      soundManager.play('placeLetter');
    }
  };

  const handleAnswerCardClick = (index: number) => {
    if (gameStatus !== 'playing') return;
    removeLetter(index);
    soundManager.play('removeLetter');
  };

  const handleSubmit = () => {
    const allFilled = answerLetters.every((l) => l !== null);
    if (!allFilled) return;

    const isCorrect = submitAnswer();
    if (isCorrect) {
      soundManager.play('submitCorrect');
    } else {
      soundManager.play('submitWrong');
      setShakeAnswer(true);
      setTimeout(() => setShakeAnswer(false), 500);
    }
  };

  const handleHint = () => {
    if (!config.allowHints) return;
    applyHint();
  };

  const handleRevealAnswer = () => {
    if (!config.showAnswer) return;
    revealAnswer();
  };

  const allFilled = answerLetters.every((l) => l !== null);
  const isGameOver = gameStatus === 'success' || gameStatus === 'failed';

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (gameStatus === 'idle') {
    return (
      <div className="w-full max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className={cn(
            'w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg',
            'bg-gradient-to-br',
            config.bgGradient
          )}>
            <span className="text-3xl">{config.icon}</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2">准备好了吗？</h3>
          <p className="text-gray-500 mb-6">
            {config.timeLimit !== null 
              ? `你有 ${config.timeLimit} 秒时间，通过拖拽字母拼出正确的单词`
              : '不限时间，通过拖拽字母拼出正确的单词'}
          </p>
          
          <div className={cn(
            'rounded-xl p-4 mb-6 border',
            gameMode === 'classic' && 'bg-orange-50 border-orange-100',
            gameMode === 'practice' && 'bg-blue-50 border-blue-100',
            gameMode === 'challenge' && 'bg-red-50 border-red-100'
          )}>
            <p className={cn('text-sm mb-3',
              gameMode === 'classic' && 'text-orange-700',
              gameMode === 'practice' && 'text-blue-700',
              gameMode === 'challenge' && 'text-red-700'
            )}>
              <span className="font-semibold">单词长度：</span>
              {currentWord.word.length} 个字母
            </p>
            {isSupported && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => speak(currentWord.word, speechRate)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all',
                    isSpeaking
                      ? 'bg-teal-200 text-teal-800'
                      : cn('bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 border',
                          gameMode === 'classic' && 'border-orange-200',
                          gameMode === 'practice' && 'border-blue-200',
                          gameMode === 'challenge' && 'border-red-200'
                        )
                  )}
                  title="播放发音"
                >
                  <Volume2 className={cn('w-4 h-4', isSpeaking && 'animate-pulse')} />
                  <span className="text-sm font-medium">
                    {isSpeaking ? '播放中...' : '听发音'}
                  </span>
                </button>
                <div className="flex items-center bg-white rounded-full p-0.5 border border-gray-200">
                  <button
                    onClick={() => setSpeechRate('normal')}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium transition-all',
                      speechRate === 'normal'
                        ? cn('text-white shadow-sm',
                            gameMode === 'classic' && 'bg-orange-400',
                            gameMode === 'practice' && 'bg-blue-400',
                            gameMode === 'challenge' && 'bg-red-400'
                          )
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    正常
                  </button>
                  <button
                    onClick={() => setSpeechRate('slow')}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium transition-all',
                      speechRate === 'slow'
                        ? cn('text-white shadow-sm',
                            gameMode === 'classic' && 'bg-orange-400',
                            gameMode === 'practice' && 'bg-blue-400',
                            gameMode === 'challenge' && 'bg-red-400'
                          )
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    慢速
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={startGame}
            className={cn(
              'w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group',
              'bg-gradient-to-r hover:brightness-110 text-white',
              config.bgGradient
            )}
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            开始{config.name}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {config.timeLimit !== null && (
        <div className="flex justify-center mb-6">
          <Timer />
        </div>
      )}

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm text-gray-500">单词长度</span>
          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
            {currentWord.word.length} 个字母
          </span>
        </div>

        {isSupported && (
          <div className="flex items-center justify-center gap-3 mb-3">
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
                {isSpeaking ? '播放中...' : '听发音'}
              </span>
            </button>

            <div className="flex items-center bg-gray-100 rounded-full p-0.5">
              <button
                onClick={() => setSpeechRate('normal')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
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
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
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

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setShowMeaning(!showMeaning)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showMeaning ? '隐藏释义' : '显示提示'}</span>
          </button>
        </div>

        {showMeaning && (
          <p className="mt-2 text-gray-600 text-sm animate-fade-in">
            💡 {currentWord.meaning}
          </p>
        )}
      </div>

      <div
        ref={answerRef}
        data-answer-slot
        className={cn(
          'flex justify-center gap-2 sm:gap-3 mb-8 p-4',
          'bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200',
          'min-h-24 sm:min-h-28 items-center',
          shakeAnswer && 'animate-shake'
        )}
      >
        {answerLetters.map((letter, index) => (
          <div
            key={`answer-${index}`}
            data-answer-slot
            data-index={index}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index, 'answer')}
            className={cn(
              'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
              'flex items-center justify-center',
              'rounded-xl transition-all duration-200',
              letter ? '' : 'bg-white border-2 border-dashed border-gray-300'
            )}
          >
            {letter ? (
              <LetterCard
                letter={letter}
                index={index}
                source="answer"
                onClick={() => handleAnswerCardClick(index)}
                disabled={isGameOver}
              />
            ) : (
              <span className="text-gray-300 text-xs">{index + 1}</span>
            )}
          </div>
        ))}
      </div>

      <div
        ref={poolRef}
        data-pool-slot
        className="flex flex-wrap justify-center gap-2 sm:gap-3 p-4 bg-white rounded-2xl shadow-inner mb-6 min-h-24 sm:min-h-28"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 0, 'pool')}
      >
        {shuffledLetters.map((letter, index) => (
          <div
            key={`pool-${index}`}
            data-pool-slot
            data-index={index}
          >
            <LetterCard
              letter={letter}
              index={index}
              source="pool"
              onClick={() => handlePoolCardClick(letter, index)}
              disabled={isGameOver}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 flex-wrap">
        <button
          onClick={resetAnswer}
          disabled={isGameOver}
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">重置</span>
        </button>

        {config.allowHints ? (
          <button
            onClick={handleHint}
            disabled={isGameOver}
            className="flex items-center gap-2 px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lightbulb className="w-4 h-4" />
            <span>提示</span>
            <span className="bg-amber-200 px-2 py-0.5 rounded-full text-xs">
              {hintsUsed}
            </span>
          </button>
        ) : (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-xl font-medium cursor-not-allowed"
            title="挑战模式禁止使用提示"
          >
            <Lightbulb className="w-4 h-4" />
            <span>提示</span>
            <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs">
              禁用
            </span>
          </button>
        )}

        {config.showAnswer && (
          <button
            onClick={handleRevealAnswer}
            disabled={isGameOver}
            className="flex items-center gap-2 px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            <span>看答案</span>
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allFilled || isGameOver}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
            allFilled && !isGameOver
              ? cn('text-white shadow-lg hover:shadow-xl',
                  'bg-gradient-to-r hover:brightness-110',
                  config.bgGradient
                )
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
          <span>提交</span>
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
