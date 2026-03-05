import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LevelTitleOverlayProps {
  level: number;
  levelName: string;
  collectibleEmoji: string;
  onComplete: () => void;
}

export function LevelTitleOverlay({ level, levelName, collectibleEmoji, onComplete }: LevelTitleOverlayProps) {
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [visible, setVisible] = useState(true);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>();
  const completedRef = useRef(false);

  const FADE_IN = 380;
  const HOLD = 1200;
  const FADE_OUT = 680;
  const TOTAL = FADE_IN + HOLD + FADE_OUT; // 2260ms ≈ 2.3s

  const stableOnComplete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    startRef.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startRef.current;

      if (elapsed < FADE_IN) {
        const progress = Math.min(elapsed / FADE_IN, 1);
        setOpacity(progress);
        setTranslateY(0);
      } else if (elapsed < FADE_IN + HOLD) {
        setOpacity(1);
        setTranslateY(0);
      } else if (elapsed < TOTAL) {
        const fadeProgress = Math.min((elapsed - FADE_IN - HOLD) / FADE_OUT, 1);
        setOpacity(1 - fadeProgress);
        setTranslateY(-14 * fadeProgress);
      } else {
        setOpacity(0);
        setVisible(false);
        stableOnComplete();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stableOnComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{
        zIndex: 50,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        className="px-10 py-5 rounded-2xl text-center"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 200, 220, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h1
          className="text-2xl sm:text-3xl font-bold mb-1"
          style={{
            color: '#fff',
            textShadow: '0 0 24px rgba(255, 180, 200, 0.6), 0 2px 4px rgba(0,0,0,0.4)',
          }}
        >
          {collectibleEmoji} WORLD {level} {collectibleEmoji}
        </h1>
        {levelName && (
          <p
            className="text-sm sm:text-base tracking-widest uppercase"
            style={{
              color: 'rgba(255, 225, 235, 0.85)',
              textShadow: '0 0 10px rgba(255, 150, 180, 0.4)',
            }}
          >
            {levelName}
          </p>
        )}
      </div>
    </div>
  );
}
