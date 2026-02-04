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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2 flex items-start justify-between pointer-events-none">
      {/* Left side - Lives */}
      <div className="retro-hud-panel pointer-events-auto">
        <div className="flex items-center gap-1">
          <span className="retro-text text-sm text-red-400">❤️</span>
          <span className="retro-text text-sm">×</span>
          <span className="retro-text text-lg text-white">{lives}</span>
        </div>
      </div>

      {/* Center - Level name & Timer */}
      <div className="flex flex-col items-center gap-1">
        <div className="retro-hud-panel">
          <div className="flex items-center gap-2">
            <span className="text-lg">{levelInfo.emoji}</span>
            <span className="retro-text text-sm">WORLD {currentLevel}</span>
          </div>
        </div>
        <div className={`retro-hud-panel ${isLowTime ? 'animate-pulse border-red-500' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="retro-text text-xs">TIME</span>
            <span className={`retro-text text-lg ${isLowTime ? 'text-red-400' : 'text-white'}`}>
              {timeString}
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Score, Collectibles & Pause */}
      <div className="flex items-center gap-2">
        <div className="retro-hud-panel">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <span className="retro-text text-xs text-yellow-400">SCORE</span>
            </div>
            <span className="retro-text text-lg text-white">{score.toString().padStart(6, '0')}</span>
          </div>
        </div>
        
        <div className="retro-hud-panel">
          <div className="flex items-center gap-1">
            <span className="text-lg">{collectibleEmoji}</span>
            <span className="retro-text text-lg text-white">×{collectibles}</span>
          </div>
        </div>
        
        <button
          className="retro-hud-panel pointer-events-auto hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={onPause}
        >
          <Pause className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
