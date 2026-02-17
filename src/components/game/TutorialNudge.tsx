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
    const showTimer = setTimeout(() => setVisible(true), 50);
    const fadeTimer = setTimeout(() => setFading(true), nudge.displayDuration - 600);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
    };
  }, [nudge.displayDuration]);

  // Convert world coordinates to screen coordinates
  const screenX = nudge.worldX - cameraX;

  // Clamp horizontally so bubble stays on screen with margin
  const clampedX = Math.max(170, Math.min(screenX, window.innerWidth - 170));

  // Position bubble well above the object — use a fixed band in the upper portion of screen
  // so it's always clearly visible regardless of object Y position
  const bubbleY = Math.min(
    Math.max(20, nudge.worldY - 120), // Above the object
    window.innerHeight * 0.35 // Never below 35% of screen height
  );

  // Calculate tail offset to point at actual object position
  const tailOffsetX = screenX - clampedX; // How far off-center the object is
  const clampedTailOffset = Math.max(-80, Math.min(80, tailOffsetX));

  return (
    <div
      className={`fixed z-[60] pointer-events-none transition-all duration-500 ${
        visible && !fading ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      }`}
      style={{
        left: `${clampedX}px`,
        top: `${bubbleY}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div
        className="relative px-6 py-4 rounded-2xl max-w-[300px] text-center"
        style={{
          background: 'hsl(0 0% 100% / 0.97)',
          border: '2.5px solid hsl(340 70% 80% / 0.7)',
          boxShadow: '0 10px 40px hsl(0 0% 0% / 0.18), 0 4px 12px hsl(340 70% 60% / 0.12)',
        }}
      >
        <p
          className="font-display text-base leading-relaxed whitespace-pre-line font-semibold"
          style={{ color: 'hsl(340 40% 25%)' }}
        >
          {nudge.message}
        </p>
        {/* Tail pointing down toward the anchored object */}
        <div
          className="absolute -bottom-[10px] w-5 h-5 rotate-45"
          style={{
            left: `calc(50% + ${clampedTailOffset}px)`,
            transform: 'translateX(-50%) rotate(45deg)',
            background: 'hsl(0 0% 100% / 0.97)',
            borderRight: '2.5px solid hsl(340 70% 80% / 0.7)',
            borderBottom: '2.5px solid hsl(340 70% 80% / 0.7)',
          }}
        />
      </div>
    </div>
  );
}
