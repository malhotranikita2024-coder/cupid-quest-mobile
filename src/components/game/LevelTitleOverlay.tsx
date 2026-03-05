import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LevelTitleOverlayProps {
  level: number;
  levelName: string;
  collectibleEmoji: string;
  onComplete: () => void;
}

const FADE_IN = 400;
const HOLD = 1400;
const FADE_OUT = 800;
const TOTAL = FADE_IN + HOLD + FADE_OUT; // 2600ms

export function LevelTitleOverlay({ level, levelName, collectibleEmoji, onComplete }: LevelTitleOverlayProps) {
  const [alpha, setAlpha] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [visible, setVisible] = useState(true);
  const startRef = useRef(0);
  const rafRef = useRef<number>();
  const completedRef = useRef(false);

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
        setAlpha(Math.min(elapsed / FADE_IN, 1));
        setOffsetY(0);
      } else if (elapsed < FADE_IN + HOLD) {
        setAlpha(1);
        setOffsetY(0);
      } else if (elapsed < TOTAL) {
        const p = Math.min((elapsed - FADE_IN - HOLD) / FADE_OUT, 1);
        setAlpha(1 - p);
        setOffsetY(-12 * p);
      } else {
        setAlpha(0);
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
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 999,
        opacity: alpha,
        transform: `translateY(${offsetY}px)`,
      }}
    >
      <div
        style={{
          padding: '24px 48px',
          borderRadius: '16px',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 200, 220, 0.2)',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 4px 0',
            textShadow: '0 0 24px rgba(255, 180, 200, 0.7), 0 2px 4px rgba(0,0,0,0.5)',
            letterSpacing: '2px',
          }}
        >
          {collectibleEmoji} WORLD {level} {collectibleEmoji}
        </h1>
        {levelName && (
          <p
            style={{
              fontSize: 'clamp(13px, 2.5vw, 18px)',
              color: 'rgba(255, 225, 235, 0.9)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '4px',
              textShadow: '0 0 12px rgba(255, 150, 180, 0.5)',
            }}
          >
            {levelName}
          </p>
        )}
      </div>
    </div>
  );
}
