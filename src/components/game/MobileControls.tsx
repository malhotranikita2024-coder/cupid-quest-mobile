import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, Zap } from 'lucide-react';

interface MobileControlsProps {
  onLeftStart: () => void;
  onLeftEnd: () => void;
  onRightStart: () => void;
  onRightEnd: () => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onRunStart: () => void;
  onRunEnd: () => void;
}

export function MobileControls({
  onLeftStart,
  onLeftEnd,
  onRightStart,
  onRightEnd,
  onJumpStart,
  onJumpEnd,
  onRunStart,
  onRunEnd,
}: MobileControlsProps) {
  const handleTouchStart = (e: React.TouchEvent, callback: () => void) => {
    e.preventDefault();
    callback();
  };

  const handleTouchEnd = (e: React.TouchEvent, callback: () => void) => {
    e.preventDefault();
    callback();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-40 pointer-events-none z-40">
      {/* Left side - Movement controls */}
      <div className="absolute bottom-6 left-6 flex gap-3 pointer-events-auto">
        {/* Left button */}
        <button
          className="game-control-btn w-20 h-20 active:scale-95"
          onTouchStart={(e) => handleTouchStart(e, onLeftStart)}
          onTouchEnd={(e) => handleTouchEnd(e, onLeftEnd)}
          onTouchCancel={(e) => handleTouchEnd(e, onLeftEnd)}
          onMouseDown={onLeftStart}
          onMouseUp={onLeftEnd}
          onMouseLeave={onLeftEnd}
        >
          <ChevronLeft className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={3} />
        </button>
        
        {/* Right button */}
        <button
          className="game-control-btn w-20 h-20 active:scale-95"
          onTouchStart={(e) => handleTouchStart(e, onRightStart)}
          onTouchEnd={(e) => handleTouchEnd(e, onRightEnd)}
          onTouchCancel={(e) => handleTouchEnd(e, onRightEnd)}
          onMouseDown={onRightStart}
          onMouseUp={onRightEnd}
          onMouseLeave={onRightEnd}
        >
          <ChevronRight className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={3} />
        </button>
      </div>

      {/* Right side - Spacebar jump hint */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 pointer-events-none">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              fontFamily: 'monospace',
              boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
            }}
          >
            SPACE
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, letterSpacing: '1px' }}>
            JUMP
          </span>
        </div>
      </div>

      {/* Control labels (subtle) */}
      <div className="absolute bottom-1 left-6 text-white/50 text-xs font-medium tracking-wide">
        MOVE
      </div>
    </div>
  );
}
