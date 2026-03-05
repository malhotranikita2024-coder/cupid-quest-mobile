import React, { useEffect, useRef } from 'react';

interface LevelTitleOverlayProps {
  level: number;
  levelName: string;
  collectibleEmoji: string;
  onComplete: () => void;
}

const DURATION = 2200; // total ms before removal

export function LevelTitleOverlay({ level, levelName, collectibleEmoji, onComplete }: LevelTitleOverlayProps) {
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    const timer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, DURATION);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <style>{`
        @keyframes levelCardIn {
          0% { opacity: 0; transform: scale(0.9) translateY(8px); }
          18% { opacity: 1; transform: scale(1) translateY(0); }
          75% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(1.02) translateY(-6px); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 999,
          animation: `levelCardIn ${DURATION}ms ease-out forwards`,
        }}
      >
        <div
          style={{
            padding: '22px 44px',
            borderRadius: '16px',
            textAlign: 'center',
            background: 'linear-gradient(150deg, rgba(25, 15, 35, 0.94), rgba(10, 8, 20, 0.9))',
            border: '2px solid rgba(255, 210, 80, 0.55)',
            boxShadow: '0 0 30px rgba(255, 200, 60, 0.12), 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            minWidth: '240px',
            maxWidth: '88vw',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(10px, 2vw, 13px)',
              color: 'rgba(255, 210, 80, 0.9)',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              fontWeight: 600,
            }}
          >
            ✦ Welcome To ✦
          </p>

          <h1
            style={{
              fontSize: 'clamp(22px, 5.5vw, 36px)',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0 0 6px 0',
              textShadow: '0 0 16px rgba(255, 210, 80, 0.5), 0 2px 4px rgba(0,0,0,0.5)',
              letterSpacing: '2px',
            }}
          >
            {collectibleEmoji} World {level} {collectibleEmoji}
          </h1>

          <div
            style={{
              width: '50px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 210, 80, 0.6), transparent)',
              margin: '6px auto',
            }}
          />

          {levelName && (
            <p
              style={{
                fontSize: 'clamp(13px, 2.8vw, 18px)',
                color: 'rgba(255, 240, 215, 0.92)',
                margin: '4px 0 0 0',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                fontWeight: 500,
              }}
            >
              {levelName}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
