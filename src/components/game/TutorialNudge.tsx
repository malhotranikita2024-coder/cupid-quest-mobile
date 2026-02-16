import React, { useEffect, useState } from 'react';

interface TutorialNudgeProps {
  message: string;
  duration?: number; // ms before auto-dismiss
  onDismiss: () => void;
}

export function TutorialNudge({ message, duration = 3500, onDismiss }: TutorialNudgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Start fade out
    const fadeTimer = setTimeout(() => setIsFading(true), duration - 500);

    // Dismiss
    const dismissTimer = setTimeout(onDismiss, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onDismiss]);

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-[60] pointer-events-none transition-all duration-500 ${
        isVisible && !isFading
          ? 'opacity-100 translate-y-0'
          : isFading
          ? 'opacity-0 -translate-y-4'
          : 'opacity-0 translate-y-4'
      }`}
      style={{ top: '72px' }}
    >
      {/* Speech bubble */}
      <div
        className="relative px-5 py-3 rounded-2xl shadow-lg max-w-xs text-center"
        style={{
          background: 'linear-gradient(135deg, hsl(340 90% 75% / 0.95), hsl(350 80% 60% / 0.92))',
          border: '2px solid hsl(40 95% 55% / 0.6)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <p className="font-display text-sm md:text-base text-white leading-snug whitespace-pre-line drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          {message}
        </p>
        {/* Tail */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45"
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
