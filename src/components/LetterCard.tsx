import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface LetterCardProps {
  letter: string;
  index: number;
  source: 'pool' | 'answer';
  onDragStart?: (index: number, source: 'pool' | 'answer') => void;
  onDragEnd?: () => void;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  isHinted?: boolean;
  ariaLabel?: string;
}

const COLORS = [
  'from-orange-400 to-orange-500',
  'from-teal-400 to-teal-500',
  'from-amber-400 to-amber-500',
  'from-cyan-400 to-cyan-500',
  'from-rose-400 to-rose-500',
  'from-emerald-400 to-emerald-500',
  'from-violet-400 to-violet-500',
  'from-pink-400 to-pink-500',
];

export function LetterCard({
  letter,
  index,
  source,
  onDragStart,
  onDragEnd,
  onClick,
  onKeyDown,
  disabled = false,
  isHinted = false,
  ariaLabel,
}: LetterCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const colorIndex = (letter.charCodeAt(0) + index) % COLORS.length;
  const gradient = COLORS[colorIndex];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
    onKeyDown?.(e);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled || !letter) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, source, letter }));
    onDragStart?.(index, source);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || !letter) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsTouchDragging(true);
    onDragStart?.(index, source);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDragging) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouchDragging) return;
    
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element) {
      const answerSlot = element.closest('[data-answer-slot]');
      const poolSlot = element.closest('[data-pool-slot]');
      
      if (answerSlot && source === 'pool') {
        const slotIndex = parseInt(answerSlot.getAttribute('data-index') || '0', 10);
        const customEvent = new CustomEvent('letter-dropped', {
          detail: { fromIndex: index, toIndex: slotIndex, fromSource: source, toSource: 'answer', letter },
        });
        document.dispatchEvent(customEvent);
      } else if (poolSlot && source === 'answer') {
        const slotIndex = parseInt(poolSlot.getAttribute('data-index') || '0', 10);
        const customEvent = new CustomEvent('letter-dropped', {
          detail: { fromIndex: index, toIndex: slotIndex, fromSource: source, toSource: 'pool', letter },
        });
        document.dispatchEvent(customEvent);
      }
    }
    
    setIsTouchDragging(false);
    touchStartRef.current = null;
    onDragEnd?.();
  };

  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (isTouchDragging) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventDefault);
    };
  }, [isTouchDragging]);

  if (!letter) {
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
    );
  }

  const defaultAriaLabel = source === 'pool'
    ? `字母 ${letter.toUpperCase()}，在字母池中第 ${index + 1} 位`
    : `字母 ${letter.toUpperCase()}，答案区第 ${index + 1} 位，按回车或空格移回字母池`;

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      draggable={!disabled && !!letter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel || defaultAriaLabel}
      aria-disabled={disabled}
      className={cn(
        'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
        'flex items-center justify-center',
        'rounded-xl text-white font-bold text-xl sm:text-2xl',
        'bg-gradient-to-br shadow-lg',
        'cursor-grab active:cursor-grabbing',
        'select-none touch-none',
        'transition-all duration-200',
        'hover:scale-105 hover:shadow-xl',
        'active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 focus:scale-105',
        gradient,
        isDragging && 'opacity-50 scale-110',
        isTouchDragging && 'opacity-70 scale-110 z-50',
        disabled && 'cursor-default opacity-60',
        isHinted && 'ring-2 ring-yellow-300 ring-offset-2'
      )}
    >
      {letter.toUpperCase()}
    </div>
  );
}
