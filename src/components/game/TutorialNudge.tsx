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
    const fadeTimer = setTimeout(() => setFading(true), nudge.displayDuration - 400);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
    };
  }, [nudge.displayDuration]);

  // Convert world coordinates to screen coordinates
  const screenX = nudge.worldX - cameraX;
  const screenY = nudge.worldY;

  // Clamp horizontally so bubble stays on screen
  const clampedX = Math.max(160, Math.min(screenX, window.innerWidth - 160));

  return (
    <div
      className={`fixed z-[60] pointer-events-none transition-all duration-300 ${
        visible && !fading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      style={{
        left: `${clampedX}px`,
        top: `${Math.max(30, screenY - 85)}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div
        className="relative px-5 py-3 rounded-2xl max-w-[300px] text-center"
        style={{
          background: 'hsl(0 0% 100% / 0.96)',
          border: '2px solid hsl(340 70% 80% / 0.6)',
          boxShadow: '0 8px 32px hsl(0 0% 0% / 0.12), 0 2px 8px hsl(340 70% 60% / 0.08)',
        }}
      >
        <p className="font-display text-sm leading-snug whitespace-pre-line" style={{ color: 'hsl(340 40% 25%)' }}>
          {nudge.message}
        </p>
        {/* Tail pointing down toward the anchored object */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[9px] w-4 h-4 rotate-45"
          style={{
            background: 'hsl(0 0% 100% / 0.96)',
            borderRight: '2px solid hsl(340 70% 80% / 0.6)',
            borderBottom: '2px solid hsl(340 70% 80% / 0.6)',
          }}
        />
      </div>
    </div>
  );
}
