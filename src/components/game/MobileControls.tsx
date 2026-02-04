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

      {/* Right side - Action controls */}
      <div className="absolute bottom-6 right-6 flex gap-3 pointer-events-auto">
        {/* Run button (smaller, positioned above/left of jump) */}
        <button
          className="game-control-btn w-16 h-16 self-start mt-4 active:scale-95"
          style={{ 
            background: 'rgba(255, 215, 0, 0.35)',
            borderColor: 'rgba(255, 215, 0, 0.6)'
          }}
          onTouchStart={(e) => handleTouchStart(e, onRunStart)}
          onTouchEnd={(e) => handleTouchEnd(e, onRunEnd)}
          onTouchCancel={(e) => handleTouchEnd(e, onRunEnd)}
          onMouseDown={onRunStart}
          onMouseUp={onRunEnd}
          onMouseLeave={onRunEnd}
        >
          <Zap className="w-8 h-8 text-yellow-200 drop-shadow-lg" strokeWidth={2.5} />
        </button>
        
        {/* Jump button (largest) */}
        <button
          className="game-control-btn w-24 h-24 active:scale-95"
          style={{ 
            background: 'rgba(255, 105, 180, 0.35)',
            borderColor: 'rgba(255, 182, 193, 0.6)'
          }}
          onTouchStart={(e) => handleTouchStart(e, onJumpStart)}
          onTouchEnd={(e) => handleTouchEnd(e, onJumpEnd)}
          onTouchCancel={(e) => handleTouchEnd(e, onJumpEnd)}
          onMouseDown={onJumpStart}
          onMouseUp={onJumpEnd}
          onMouseLeave={onJumpEnd}
        >
          <ArrowUp className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={3} />
        </button>
      </div>

      {/* Control labels (subtle) */}
      <div className="absolute bottom-1 left-6 text-white/50 text-xs font-medium tracking-wide">
        MOVE
      </div>
      <div className="absolute bottom-1 right-6 text-white/50 text-xs font-medium tracking-wide">
        RUN + JUMP
      </div>
    </div>
  );
}
