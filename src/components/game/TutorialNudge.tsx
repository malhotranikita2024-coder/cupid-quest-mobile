import React, { useEffect, useState } from 'react';
import { ActiveNudge } from '@/hooks/useTutorialNudges';

interface TutorialNudgeProps {
  nudge: ActiveNudge;
  cameraX: number;
}

export function TutorialNudge({ nudge, cameraX }: TutorialNudgeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Convert world coordinates to screen coordinates
  const screenX = nudge.worldX - cameraX;
  const screenY = nudge.worldY;

  // Clamp horizontally so bubble stays on screen
  const clampedX = Math.max(110, Math.min(screenX, window.innerWidth - 110));

  return (
    <div
      className={`fixed z-[60] pointer-events-none transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      style={{
        left: `${clampedX}px`,
        top: `${Math.max(50, screenY - 75)}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div
        className="relative px-4 py-2.5 rounded-2xl shadow-lg max-w-[220px] text-center"
        style={{
          background: 'linear-gradient(135deg, hsl(340 90% 75% / 0.95), hsl(350 80% 60% / 0.92))',
          border: '2px solid hsl(40 95% 55% / 0.6)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px hsl(350 80% 60% / 0.35), 0 0 15px hsl(40 95% 55% / 0.2)',
        }}
      >
        <p className="font-display text-xs md:text-sm text-white leading-snug whitespace-pre-line drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          {nudge.message}
        </p>
        {/* Tail pointing down to the object */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 rotate-45"
          style={{
            background: 'hsl(350 80% 60% / 0.92)',
            borderRight: '2px solid hsl(40 95% 55% / 0.6)',
            borderBottom: '2px solid hsl(40 95% 55% / 0.6)',
          }}
        />
      </div>
    </div>
  );
}
