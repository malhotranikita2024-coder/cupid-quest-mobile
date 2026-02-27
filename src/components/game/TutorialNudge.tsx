import React, { useEffect, useState } from 'react';
import { ActiveNudge } from '@/hooks/useTutorialNudges';
import { TutorialNudgeType } from '@/hooks/useTutorialNudges';
import { getIsMobileGame, getMobileCameraY } from '@/hooks/useViewport';

const SPEAKER_BADGES: Record<TutorialNudgeType, string> = {
  enemy: '😈',
  rose: '🌹',
  shield: '❤️',
  cookie: '🥠',
  midFlag: '🚩',
};

interface TutorialNudgeProps {
  nudge: ActiveNudge;
  cameraX: number;
  playerY?: number;
}

export function TutorialNudge({ nudge, cameraX, playerY = 400 }: TutorialNudgeProps) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('visible'), 60);
    const exitTimer = setTimeout(
      () => setPhase('exit'),
      nudge.displayDuration - 600
    );
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [nudge.displayDuration]);

  // Vertical camera offset for mobile (no scaling — same object sizes as desktop)
  const isMobile = getIsMobileGame();
  const cameraY = isMobile ? getMobileCameraY(playerY) : 0;

  // World → screen coordinates (1:1, no scaling)
  const screenX = nudge.worldX - cameraX;
  const anchorScreenY = nudge.worldY - cameraY;

  // Clamp so bubble stays on-screen
  const margin = 150;
  const clampedX = Math.max(margin, Math.min(screenX, window.innerWidth - margin));

  // Anchor bubble above the object
  const bubbleBottom = window.innerHeight - Math.max(80, anchorScreenY - 30);

  // Tail points toward the actual object
  const tailOffsetX = screenX - clampedX;
  const clampedTail = Math.max(-80, Math.min(80, tailOffsetX));

  const badge = SPEAKER_BADGES[nudge.type];

  const isVisible = phase === 'visible';
  const isExiting = phase === 'exit';

  return (
    <div
      className="fixed z-[60] pointer-events-none"
      style={{
        left: `${clampedX}px`,
        bottom: `${bubbleBottom}px`,
        transform: 'translateX(-50%)',
        opacity: isExiting ? 0 : isVisible ? 1 : 0,
        scale: isExiting ? '0.92' : isVisible ? '1' : '0.85',
        transition: isVisible
          ? 'opacity 400ms cubic-bezier(0.34,1.56,0.64,1), scale 400ms cubic-bezier(0.34,1.56,0.64,1)'
          : 'opacity 500ms ease-out, scale 500ms ease-out',
      }}
    >
      {/* Speaker badge */}
      <div
        className="absolute -top-3 -left-3 w-9 h-9 rounded-full flex items-center justify-center text-lg z-10"
        style={{
          background: 'hsl(0 0% 100%)',
          border: '2px solid hsl(340 70% 72% / 0.7)',
          boxShadow: '0 2px 8px hsl(0 0% 0% / 0.15)',
        }}
      >
        {badge}
      </div>

      {/* Bubble body */}
      <div
        className="relative px-5 py-3 rounded-2xl text-center"
        style={{
          maxWidth: '300px',
          minWidth: '170px',
          background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.98), hsl(340 30% 97% / 0.96))',
          border: '2px solid hsl(340 75% 75% / 0.7)',
          boxShadow:
            '0 6px 24px hsl(0 0% 0% / 0.18), 0 2px 6px hsl(340 60% 60% / 0.12), inset 0 1px 0 hsl(0 0% 100% / 0.7)',
        }}
      >
        <p
          className="font-display text-[14px] leading-relaxed whitespace-pre-line font-bold tracking-wide"
          style={{ color: 'hsl(340 40% 24%)' }}
        >
          {nudge.message}
        </p>

        {/* Speech bubble tail — triangle pointing DOWN toward object */}
        <div
          className="absolute -bottom-[10px]"
          style={{
            left: `calc(50% + ${clampedTail}px)`,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '12px solid hsl(340 75% 75% / 0.7)',
            filter: 'drop-shadow(0 2px 2px hsl(0 0% 0% / 0.08))',
          }}
        />
        {/* Inner tail (fills the border gap) */}
        <div
          className="absolute -bottom-[8px]"
          style={{
            left: `calc(50% + ${clampedTail}px)`,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '10px solid hsl(340 30% 97% / 0.96)',
          }}
        />
      </div>
    </div>
  );
}
