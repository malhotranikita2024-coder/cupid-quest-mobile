import React, { useEffect, useState } from 'react';
import { ActiveNudge } from '@/hooks/useTutorialNudges';

interface TutorialNudgeProps {
  nudge: ActiveNudge;
  cameraX: number;
}

export function TutorialNudge({ nudge, cameraX }: TutorialNudgeProps) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 80);
    const fadeTimer = setTimeout(() => setFading(true), nudge.displayDuration - 800);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
    };
  }, [nudge.displayDuration]);

  // Convert world X to screen X (camera only scrolls horizontally)
  const screenX = nudge.worldX - cameraX;

  // Clamp horizontally so bubble stays on screen
  const margin = 160;
  const clampedX = Math.max(margin, Math.min(screenX, window.innerWidth - margin));

  // Position bubble ABOVE the anchored object in screen space
  // worldY IS screen Y in this game (no vertical camera scroll)
  // Place bubble 90-110px above the object so the tail visually connects
  const anchorScreenY = nudge.worldY;
  const bubbleBottomY = Math.max(60, anchorScreenY - 25); // bottom of bubble (where tail starts)

  // Tail offset: point tail toward actual object screen position
  const tailOffsetX = screenX - clampedX;
  const clampedTailOffset = Math.max(-90, Math.min(90, tailOffsetX));

  return (
    <div
      className={`fixed z-[60] pointer-events-none transition-all ${
        visible && !fading
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-90'
      }`}
      style={{
        left: `${clampedX}px`,
        bottom: `${window.innerHeight - bubbleBottomY}px`,
        transform: 'translateX(-50%)',
        transitionDuration: visible && !fading ? '500ms' : '600ms',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        className="relative px-5 py-3.5 rounded-2xl text-center"
        style={{
          maxWidth: '300px',
          minWidth: '180px',
          background: 'hsl(0 0% 100% / 0.97)',
          border: '2.5px solid hsl(340 82% 76% / 0.8)',
          boxShadow:
            '0 8px 32px hsl(0 0% 0% / 0.22), 0 2px 8px hsl(340 70% 60% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.6)',
        }}
      >
        <p
          className="font-display text-[15px] leading-relaxed whitespace-pre-line font-bold tracking-wide"
          style={{ color: 'hsl(340 45% 22%)' }}
        >
          {nudge.message}
        </p>

        {/* Speech bubble tail pointing DOWN toward the object */}
        <div
          className="absolute -bottom-[11px] w-[18px] h-[18px] rotate-45"
          style={{
            left: `calc(50% + ${clampedTailOffset}px)`,
            transform: 'translateX(-50%) rotate(45deg)',
            background: 'hsl(0 0% 100% / 0.97)',
            borderRight: '2.5px solid hsl(340 82% 76% / 0.8)',
            borderBottom: '2.5px solid hsl(340 82% 76% / 0.8)',
          }}
        />
      </div>
    </div>
  );
}
