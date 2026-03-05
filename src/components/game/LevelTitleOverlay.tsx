import React, { useState, useEffect, useRef } from 'react';

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
  const startRef = useRef(performance.now());
  const rafRef = useRef<number>();

  const FADE_IN = 300;
  const HOLD = 1200;
  const FADE_OUT = 700;
  const TOTAL = FADE_IN + HOLD + FADE_OUT;

  useEffect(() => {
    startRef.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startRef.current;

      if (elapsed < FADE_IN) {
        setOpacity(elapsed / FADE_IN);
        setTranslateY(0);
      } else if (elapsed < FADE_IN + HOLD) {
        setOpacity(1);
        setTranslateY(0);
      } else if (elapsed < TOTAL) {
        const fadeProgress = (elapsed - FADE_IN - HOLD) / FADE_OUT;
        setOpacity(1 - fadeProgress);
        setTranslateY(-12 * fadeProgress);
      } else {
        setVisible(false);
        onComplete();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{
        zIndex: 40,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        className="px-8 py-4 rounded-2xl text-center"
        style={{
          background: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <p
          className="text-sm tracking-[0.3em] uppercase mb-1"
          style={{
            color: 'rgba(255, 220, 230, 0.8)',
            textShadow: '0 0 10px rgba(255, 150, 180, 0.4)',
          }}
        >
          World {level}
        </p>
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{
            color: 'rgba(255, 245, 248, 0.95)',
            textShadow: '0 0 20px rgba(255, 180, 200, 0.5), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {collectibleEmoji} {levelName} {collectibleEmoji}
        </h1>
      </div>
    </div>
  );
}
