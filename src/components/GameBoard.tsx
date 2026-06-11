import { useEffect, useCallback, useState } from 'react';
import { RotateCcw, Lightbulb, Send, HelpCircle, Play } from 'lucide-react';
import { LetterCard } from './LetterCard';
import { Timer } from './Timer';
import { useGameStore } from '../store/useGameStore';
import { cn } from '../lib/utils';

export function GameBoard() {
  const {
    currentWord,
    shuffledLetters,
    answerLetters,
    gameStatus,
    hintsUsed,
    placeLetter,
    removeLetter,
    resetAnswer,
    submitAnswer,
    useHint,
    initGame,
    startGame,
  } = useGameStore();

  const [showMeaning, setShowMeaning] = useState(false);
  const [shakeAnswer, setShakeAnswer] = useState(false);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    const handleLetterDropped = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { fromIndex, toIndex, fromSource, toSource, letter } = customEvent.detail;

      if (fromSource === 'pool' && toSource === 'answer') {
        placeLetter(letter, fromIndex, toIndex);
      } else if (fromSource === 'answer' && toSource === 'pool') {
        removeLetter(fromIndex);
      }
    };

    document.addEventListener('letter-dropped', handleLetterDropped);
    return () => {
      document.removeEventListener('letter-dropped', handleLetterDropped);
    };
  }, [placeLetter, removeLetter]);

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
        } else if (fromSource === 'answer' && toSource === 'pool') {
          removeLetter(fromIndex);
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
    }
  };

  const handleAnswerCardClick = (index: number) => {
    if (gameStatus !== 'playing') return;
    removeLetter(index);
  };

  const handleSubmit = () => {
    const allFilled = answerLetters.every((l) => l !== null);
    if (!allFilled) return;

    const isCorrect = submitAnswer();
    if (!isCorrect) {
      setShakeAnswer(true);
      setTimeout(() => setShakeAnswer(false), 500);
    }
  };

  const handleHint = () => {
    useHint();
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
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl">🧩</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2">准备好了吗？</h3>
          <p className="text-gray-500 mb-6">
            你有 60 秒时间，通过拖拽字母拼出正确的单词
          </p>
          
          <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-100">
            <p className="text-sm text-orange-700">
              <span className="font-semibold">今日单词长度：</span>
              {currentWord.word.length} 个字母
            </p>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            开始挑战
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="flex justify-center mb-6">
        <Timer />
      </div>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm text-gray-500">单词长度</span>
          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
            {currentWord.word.length} 个字母
          </span>
        </div>

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

      <div className="flex justify-center gap-3">
        <button
          onClick={resetAnswer}
          disabled={isGameOver}
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">重置</span>
        </button>

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

        <button
          onClick={handleSubmit}
          disabled={!allFilled || isGameOver}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
            allFilled && !isGameOver
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl'
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
