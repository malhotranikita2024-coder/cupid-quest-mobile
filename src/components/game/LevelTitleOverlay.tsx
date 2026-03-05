import React, { useEffect, useRef } from 'react';

interface LevelTitleOverlayProps {
  level: number;
  levelName: string;
  collectibleEmoji: string;
  onComplete: () => void;
}

const DURATION = 2800; // total ms before removal

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
          0% { opacity: 0; transform: scale(0.92) translateY(10px); }
          14% { opacity: 1; transform: scale(1) translateY(0); }
          80% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(1.01) translateY(-4px); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: '18vh',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 999,
          animation: `levelCardIn ${DURATION}ms ease-out forwards`,
        }}
      >
        <div
          style={{
            position: 'relative',
            padding: '18px 38px',
            borderRadius: '11px',
            transform: 'scale(0.8)',
            textAlign: 'center',
            background: `
              linear-gradient(150deg, rgba(252, 248, 240, 0.97), rgba(242, 234, 218, 0.94)),
              repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(180, 155, 110, 0.04) 28px, rgba(180, 155, 110, 0.04) 29px),
              repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(180, 155, 110, 0.03) 28px, rgba(180, 155, 110, 0.03) 29px)
            `,
            border: '2px solid rgba(195, 170, 120, 0.45)',
            boxShadow: '0 2px 8px rgba(160, 130, 80, 0.12), 0 12px 48px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 -2px 6px rgba(160, 130, 80, 0.06)',
            minWidth: '240px',
            maxWidth: '88vw',
            overflow: 'hidden',
          }}
        >
          {/* Corner flourishes */}
          <div style={{ position: 'absolute', top: 6, left: 10, fontSize: '10px', color: 'rgba(180, 150, 100, 0.35)' }}>❧</div>
          <div style={{ position: 'absolute', top: 6, right: 10, fontSize: '10px', color: 'rgba(180, 150, 100, 0.35)', transform: 'scaleX(-1)' }}>❧</div>
          <div style={{ position: 'absolute', bottom: 4, left: 10, fontSize: '10px', color: 'rgba(180, 150, 100, 0.35)', transform: 'scaleY(-1)' }}>❧</div>
          <div style={{ position: 'absolute', bottom: 4, right: 10, fontSize: '10px', color: 'rgba(180, 150, 100, 0.35)', transform: 'scale(-1)' }}>❧</div>
          <p
            style={{
              fontSize: 'clamp(10px, 2vw, 13px)',
              color: 'rgba(160, 130, 80, 0.9)',
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
              color: '#3a2e20',
              margin: '0 0 6px 0',
              textShadow: '0 1px 2px rgba(0,0,0,0.08)',
              letterSpacing: '2px',
            }}
          >
            {collectibleEmoji} World {level} {collectibleEmoji}
          </h1>

          <div
            style={{
              width: '50px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(180, 150, 100, 0.5), transparent)',
              margin: '6px auto',
            }}
          />

          {levelName && (
            <p
              style={{
                fontSize: 'clamp(13px, 2.8vw, 18px)',
                color: 'rgba(90, 70, 45, 0.85)',
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
