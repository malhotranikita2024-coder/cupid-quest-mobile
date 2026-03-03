import React, { useState, useEffect } from 'react';

interface LevelTitleOverlayProps {
  level: number;
  levelName: string;
  collectibleEmoji: string;
  onComplete: () => void;
}

export function LevelTitleOverlay({ level, levelName, collectibleEmoji, onComplete }: LevelTitleOverlayProps) {
  const [phase, setPhase] = useState<'fadeIn' | 'hold' | 'fadeOut' | 'done'>('fadeIn');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('fadeOut'), 1600);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === 'done') return null;

  const opacity = phase === 'fadeIn' ? 0 : phase === 'hold' ? 1 : 0;
  const translateY = phase === 'fadeOut' ? -12 : 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: phase === 'fadeIn'
          ? 'opacity 400ms ease-out'
          : phase === 'fadeOut'
          ? 'opacity 500ms ease-in, transform 500ms ease-in'
          : 'none',
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
