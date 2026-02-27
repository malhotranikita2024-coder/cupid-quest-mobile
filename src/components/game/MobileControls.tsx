import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, Zap } from 'lucide-react';
import { getIsMobileGame } from '@/hooks/useViewport';

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

  // Only apply compact sizing on actual mobile devices — desktop stays full size
  const isMobile = getIsMobileGame();
  const isShort = isMobile && window.innerHeight < 500;
  const btnSize = isShort ? 'w-14 h-14' : 'w-20 h-20';
  const jumpSize = isShort ? 'w-18 h-18' : 'w-24 h-24';
  const runSize = isShort ? 'w-12 h-12' : 'w-16 h-16';
  const iconSm = isShort ? 'w-7 h-7' : 'w-10 h-10';
  const iconLg = isShort ? 'w-9 h-9' : 'w-12 h-12';
  const iconRun = isShort ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none z-40"
      style={{
        height: isShort ? '100px' : '160px',
        paddingBottom: isMobile ? 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' : '0.5rem',
        paddingLeft: isMobile ? 'max(0.5rem, env(safe-area-inset-left, 0.5rem))' : '0.5rem',
        paddingRight: isMobile ? 'max(0.5rem, env(safe-area-inset-right, 0.5rem))' : '0.5rem',
      }}
    >
      {/* Left side - Movement controls */}
      <div className={`absolute ${isShort ? 'bottom-2 left-2' : 'bottom-6 left-6'} flex gap-3 pointer-events-auto`}>
        {/* Left button */}
        <button
          className={`game-control-btn ${btnSize} active:scale-95`}
          onTouchStart={(e) => handleTouchStart(e, onLeftStart)}
          onTouchEnd={(e) => handleTouchEnd(e, onLeftEnd)}
          onTouchCancel={(e) => handleTouchEnd(e, onLeftEnd)}
          onMouseDown={onLeftStart}
          onMouseUp={onLeftEnd}
          onMouseLeave={onLeftEnd}
        >
          <ChevronLeft className={`${iconSm} text-white drop-shadow-lg`} strokeWidth={3} />
        </button>
        
        {/* Right button */}
        <button
          className={`game-control-btn ${btnSize} active:scale-95`}
          onTouchStart={(e) => handleTouchStart(e, onRightStart)}
          onTouchEnd={(e) => handleTouchEnd(e, onRightEnd)}
          onTouchCancel={(e) => handleTouchEnd(e, onRightEnd)}
          onMouseDown={onRightStart}
          onMouseUp={onRightEnd}
          onMouseLeave={onRightEnd}
        >
          <ChevronRight className={`${iconSm} text-white drop-shadow-lg`} strokeWidth={3} />
        </button>
      </div>

      {/* Right side - Action controls */}
      <div className={`absolute ${isShort ? 'bottom-2 right-2' : 'bottom-6 right-6'} flex gap-3 pointer-events-auto`}>
        {/* Run button */}
        <button
          className={`game-control-btn ${runSize} self-start ${isShort ? 'mt-2' : 'mt-4'} active:scale-95`}
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
          <Zap className={`${iconRun} text-yellow-200 drop-shadow-lg`} strokeWidth={2.5} />
        </button>
        
        {/* Jump button */}
        <button
          className={`game-control-btn ${jumpSize} active:scale-95`}
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
          <ArrowUp className={`${iconLg} text-white drop-shadow-lg`} strokeWidth={3} />
        </button>
      </div>

      {/* Control labels */}
      <div className={`absolute ${isShort ? 'bottom-0 left-2' : 'bottom-1 left-6'} text-white/50 text-xs font-medium tracking-wide`}>
        MOVE
      </div>
      <div className={`absolute ${isShort ? 'bottom-0 right-2' : 'bottom-1 right-6'} text-white/50 text-xs font-medium tracking-wide`}>
        RUN + JUMP
      </div>
    </div>
  );
}
