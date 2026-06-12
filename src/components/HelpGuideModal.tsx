import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, HelpCircle, MousePointer2, Lightbulb, Clock, Share2, Puzzle } from 'lucide-react';
import { cn } from '../lib/utils';
import { markGuideAsShown } from '../utils/storage';

interface HelpGuideModalProps {
  open: boolean;
  onClose: () => void;
}

interface GuidePage {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  tips: string[];
}

const guidePages: GuidePage[] = [
  {
    icon: <Puzzle className="w-12 h-12" />,
    iconBg: 'bg-gradient-to-br from-teal-400 to-teal-600',
    iconColor: 'text-teal-600',
    title: '游戏规则',
    description: '每天一个新单词，通过拖拽打乱的字母拼出正确的英文单词，在游戏中积累词汇量。',
    tips: [
      '经典模式：60秒限时，可使用提示',
      '练习模式：不限时间，可随时查看答案',
      '挑战模式：30秒限时，禁止使用提示',
      '完成每日挑战可获得连续天数奖励',
    ],
  },
  {
    icon: <MousePointer2 className="w-12 h-12" />,
    iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
    iconColor: 'text-indigo-600',
    title: '拖拽操作方式',
    description: '通过拖拽或点击字母卡片，将字母从下方字母池移动到上方答案区域。',
    tips: [
      '拖拽字母卡片到答案槽位中',
      '点击字母池中的字母自动填入下一个空位',
      '点击答案区的字母可将其移回字母池',
      '使用「重置」按钮清空所有已填入的字母',
    ],
  },
  {
    icon: <Lightbulb className="w-12 h-12" />,
    iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    iconColor: 'text-amber-600',
    title: '提示功能说明',
    description: '遇到困难时可以使用提示功能，但挑战模式下提示功能会被禁用。',
    tips: [
      '点击「提示」按钮自动填入一个正确字母',
      '点击「显示提示」查看单词中文释义',
      '练习模式可点击「看答案」直接查看完整单词',
      '提示使用次数会记录在最终成绩中',
    ],
  },
  {
    icon: <Clock className="w-12 h-12" />,
    iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    iconColor: 'text-orange-600',
    title: '计时器说明',
    description: '经典模式和挑战模式设有时间限制，在规定时间内拼出单词才能获胜。',
    tips: [
      '经典模式：60秒内完成拼写',
      '挑战模式：30秒内完成拼写',
      '练习模式：无时间限制，轻松学习',
      '用时越短，成绩越优秀',
    ],
  },
  {
    icon: <Share2 className="w-12 h-12" />,
    iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    iconColor: 'text-purple-600',
    title: '成绩分享方式',
    description: '完成游戏后可以将成绩分享给朋友，或者生成精美的海报保存到相册。',
    tips: [
      '点击「分享」按钮一键分享成绩文案',
      '点击「生成海报」创建专属成绩海报',
      '海报可保存到相册或直接分享到社交平台',
      '邀请朋友一起挑战，比拼词汇量！',
    ],
  },
];

export function HelpGuideModal({ open, onClose }: HelpGuideModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [show, setShow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = guidePages.length;
  const isLastPage = currentPage === totalPages - 1;
  const isFirstPage = currentPage === 0;

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      setCurrentPage(0);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    markGuideAsShown();
    onClose();
  }, [onClose]);

  const goToNextPage = useCallback(() => {
    if (isLastPage) {
      handleClose();
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLastPage, handleClose]);

  const goToPrevPage = useCallback(() => {
    if (!isFirstPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [isFirstPage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;

    if (
      (isFirstPage && diff < 0) ||
      (isLastPage && diff > 0) ||
      (!isFirstPage && !isLastPage)
    ) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchCurrentX.current === null) return;

    const diff = touchCurrentX.current - touchStartX.current;
    const threshold = 50;

    if (diff > threshold && !isFirstPage) {
      goToPrevPage();
    } else if (diff < -threshold && !isLastPage) {
      goToNextPage();
    }

    touchStartX.current = null;
    touchCurrentX.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    touchCurrentX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStartX.current === null) return;
    touchCurrentX.current = e.clientX;
    const diff = touchCurrentX.current - touchStartX.current;

    if (
      (isFirstPage && diff < 0) ||
      (isLastPage && diff > 0) ||
      (!isFirstPage && !isLastPage)
    ) {
      setDragOffset(diff);
    }
  };

  const handleMouseUp = () => {
    if (touchStartX.current === null || touchCurrentX.current === null) return;

    const diff = touchCurrentX.current - touchStartX.current;
    const threshold = 50;

    if (diff > threshold && !isFirstPage) {
      goToPrevPage();
    } else if (diff < -threshold && !isLastPage) {
      goToNextPage();
    }

    touchStartX.current = null;
    touchCurrentX.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, goToNextPage, goToPrevPage, handleClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div
        className={cn(
          'relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden',
          'transform transition-all duration-300 ease-out',
          show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 bg-gradient-to-br from-indigo-400 to-purple-500">
          <div className="flex items-center gap-2 text-white">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-lg font-bold">使用引导</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            title="跳过"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div
            className="flex transition-transform ease-out"
            style={{
              transform: `translateX(calc(-${currentPage * 100}% + ${dragOffset}px))`,
              transitionDuration: isDragging ? '0ms' : '300ms',
            }}
          >
            {guidePages.map((page, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 px-6 py-6"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      'w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg mb-5 text-white',
                      page.iconBg
                    )}
                  >
                    {page.icon}
                  </div>

                  <h3 className={cn('text-2xl font-bold mb-3', page.iconColor)}>
                    {page.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {page.description}
                  </p>

                  <div className="w-full space-y-2">
                    {page.tips.map((tip, tipIndex) => (
                      <div
                        key={tipIndex}
                        className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl text-left"
                      >
                        <span className={cn('text-sm mt-0.5', page.iconColor)}>✓</span>
                        <p className="text-sm text-gray-600">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-center justify-center gap-2 mb-5">
            {guidePages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  currentPage === index
                    ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`跳转到第 ${index + 1} 页`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!isFirstPage && (
              <button
                onClick={goToPrevPage}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                title="上一页"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {!isLastPage ? (
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium transition-colors"
              >
                跳过
              </button>
            ) : (
              <div className="flex-1" />
            )}

            <button
              onClick={goToNextPage}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5',
                isLastPage
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
              )}
            >
              {isLastPage ? '开始使用' : '下一页'}
              {!isLastPage && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
