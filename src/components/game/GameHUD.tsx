import React from 'react';
import { Pause, Heart, Clock, Star } from 'lucide-react';
import { LEVEL_INFO } from '@/types/game';

interface GameHUDProps {
  lives: number;
  score: number;
  collectibles: number;
  currentLevel: number;
  timeRemaining: number;
  collectibleEmoji: string;
  onPause: () => void;
}

export function GameHUD({
  lives,
  score,
  collectibles,
  currentLevel,
  timeRemaining,
  collectibleEmoji,
  onPause,
}: GameHUDProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isLowTime = timeRemaining <= 60;

  const levelInfo = LEVEL_INFO[currentLevel - 1] || LEVEL_INFO[0];

  // Responsive: smaller on short screens
  const isShort = typeof window !== 'undefined' && window.innerHeight < 500;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between pointer-events-none"
      style={{
        padding: `max(0.5rem, env(safe-area-inset-top, 0.5rem)) max(0.5rem, env(safe-area-inset-right, 0.5rem)) 0 max(0.5rem, env(safe-area-inset-left, 0.5rem))`,
      }}
    >
      {/* Left side - Lives */}
      <div className="retro-hud-panel pointer-events-auto" style={isShort ? { padding: '4px 8px' } : undefined}>
        <div className="flex items-center gap-1">
          <span className={`retro-text ${isShort ? 'text-xs' : 'text-sm'} text-red-400`}>❤️</span>
          <span className={`retro-text ${isShort ? 'text-xs' : 'text-sm'}`}>×</span>
          <span className={`retro-text ${isShort ? 'text-sm' : 'text-lg'} text-white`}>{lives}</span>
        </div>
      </div>

      {/* Center - Level name & Timer */}
      <div className="flex flex-col items-center gap-1">
        <div className="retro-hud-panel" style={isShort ? { padding: '2px 8px' } : undefined}>
          <div className="flex items-center gap-2">
            <span className={isShort ? 'text-sm' : 'text-lg'}>{levelInfo.emoji}</span>
            <span className={`retro-text ${isShort ? 'text-[10px]' : 'text-sm'}`}>WORLD {currentLevel}</span>
          </div>
        </div>
        <div className={`retro-hud-panel ${isLowTime ? 'animate-pulse border-red-500' : ''}`} style={isShort ? { padding: '2px 8px' } : undefined}>
          <div className="flex items-center gap-2">
            <span className={`retro-text ${isShort ? 'text-[10px]' : 'text-xs'}`}>TIME</span>
            <span className={`retro-text ${isShort ? 'text-sm' : 'text-lg'} ${isLowTime ? 'text-red-400' : 'text-white'}`}>
              {timeString}
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Score, Collectibles & Pause */}
      <div className="flex items-center gap-2">
        <div className="retro-hud-panel" style={isShort ? { padding: '4px 8px' } : undefined}>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <span className={`retro-text ${isShort ? 'text-[10px]' : 'text-xs'} text-yellow-400`}>SCORE</span>
            </div>
            <span className={`retro-text ${isShort ? 'text-sm' : 'text-lg'} text-white`}>{score.toString().padStart(6, '0')}</span>
          </div>
        </div>
        
        <div className="retro-hud-panel" style={isShort ? { padding: '4px 8px' } : undefined}>
          <div className="flex items-center gap-1">
            <span className={isShort ? 'text-sm' : 'text-lg'}>{collectibleEmoji}</span>
            <span className={`retro-text ${isShort ? 'text-sm' : 'text-lg'} text-white`}>×{collectibles}</span>
          </div>
        </div>
        
        <button
          className="retro-hud-panel pointer-events-auto hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={onPause}
          style={isShort ? { padding: '4px 6px' } : undefined}
        >
          <Pause className={`${isShort ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
        </button>
      </div>
    </div>
  );
}
