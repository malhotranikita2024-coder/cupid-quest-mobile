import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LevelTitleOverlayProps {
  level: number;
  levelName: string;
  collectibleEmoji: string;
  onComplete: () => void;
}

const FADE_IN = 350;
const HOLD = 1800;
const FADE_OUT = 500;
const TOTAL = FADE_IN + HOLD + FADE_OUT;

export function LevelTitleOverlay({ level, levelName, collectibleEmoji, onComplete }: LevelTitleOverlayProps) {
  const [alpha, setAlpha] = useState(0);
  const [scale, setScale] = useState(0.85);
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
        const p = Math.min(elapsed / FADE_IN, 1);
        setAlpha(p);
        setScale(0.85 + 0.15 * p);
      } else if (elapsed < FADE_IN + HOLD) {
        setAlpha(1);
        setScale(1);
      } else if (elapsed < TOTAL) {
        const p = Math.min((elapsed - FADE_IN - HOLD) / FADE_OUT, 1);
        setAlpha(1 - p);
        setScale(1 + 0.05 * p);
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
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          padding: '28px 52px',
          borderRadius: '20px',
          textAlign: 'center',
          background: 'linear-gradient(145deg, rgba(30, 20, 40, 0.92), rgba(15, 10, 25, 0.88))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '2px solid rgba(255, 215, 100, 0.5)',
          boxShadow: '0 0 40px rgba(255, 200, 60, 0.15), 0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          minWidth: '260px',
          maxWidth: '90vw',
        }}
      >
        {/* Welcome text */}
        <p
          style={{
            fontSize: 'clamp(11px, 2vw, 14px)',
            color: 'rgba(255, 215, 100, 0.85)',
            margin: '0 0 6px 0',
            textTransform: 'uppercase',
            letterSpacing: '5px',
            fontWeight: 600,
          }}
        >
          ✦ Welcome To ✦
        </p>

        {/* World number */}
        <h1
          style={{
            fontSize: 'clamp(26px, 6vw, 40px)',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 4px 0',
            textShadow: '0 0 20px rgba(255, 215, 100, 0.6), 0 2px 6px rgba(0,0,0,0.6)',
            letterSpacing: '3px',
          }}
        >
          {collectibleEmoji} WORLD {level} {collectibleEmoji}
        </h1>

        {/* Divider line */}
        <div
          style={{
            width: '60px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 215, 100, 0.7), transparent)',
            margin: '8px auto',
          }}
        />

        {/* Level name */}
        {levelName && (
          <p
            style={{
              fontSize: 'clamp(14px, 3vw, 20px)',
              color: 'rgba(255, 240, 220, 0.95)',
              margin: '4px 0 0 0',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              fontWeight: 500,
              textShadow: '0 0 10px rgba(255, 200, 100, 0.3)',
            }}
          >
            {levelName}
          </p>
        )}
      </div>
    </div>
  );
}
