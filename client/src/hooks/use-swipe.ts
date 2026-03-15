import { useRef, useCallback, type RefObject } from 'react';

type SwipeDirection = 'left' | 'right';

type UseSwipeOptions = {
  onSwipe: (direction: SwipeDirection) => void;
  threshold?: number;
  maxTime?: number;
};

type SwipeHandlers = {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
};

export const useSwipe = ({
  onSwipe,
  threshold = 50,
  maxTime = 300,
}: UseSwipeOptions): { handlers: SwipeHandlers; offsetRef: RefObject<number> } => {
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const offsetRef = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTime.current = Date.now();
    offsetRef.current = 0;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    // Only track horizontal swipes (ignore vertical scrolling)
    if (Math.abs(dx) > Math.abs(dy)) {
      offsetRef.current = dx;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const elapsed = Date.now() - startTime.current;
    const dx = offsetRef.current;

    if (Math.abs(dx) >= threshold && elapsed <= maxTime) {
      onSwipe(dx < 0 ? 'left' : 'right');
    }

    offsetRef.current = 0;
  }, [onSwipe, threshold, maxTime]);

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    offsetRef,
  };
};
