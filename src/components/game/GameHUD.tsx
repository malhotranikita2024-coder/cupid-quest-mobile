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
    <div className="fixed top-0 left-0 right-0 z-50 p-3 flex items-start justify-between pointer-events-none">
      {/* Left side - Lives */}
      <div className="hud-panel flex items-center gap-2 pointer-events-auto">
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-all duration-300 ${
                i < lives 
                  ? 'text-red-400 fill-red-400 drop-shadow-[0_0_4px_rgba(255,100,100,0.8)]' 
                  : 'text-gray-500/50'
              }`}
            />
          ))}
          {lives > 3 && (
            <span className="text-red-400 text-sm font-bold ml-1">+{lives - 3}</span>
          )}
        </div>
      </div>

      {/* Center - Level name & Timer */}
      <div className="flex flex-col items-center gap-1">
        <div className="hud-panel flex items-center gap-2">
          <span className="text-lg">{levelInfo.emoji}</span>
          <span className="text-sm font-semibold">{levelInfo.name}</span>
        </div>
        <div className={`hud-panel flex items-center gap-2 ${isLowTime ? 'animate-pulse bg-red-600/70' : ''}`}>
          <Clock className="w-4 h-4" />
          <span className={`font-mono font-bold ${isLowTime ? 'text-red-300' : ''}`}>
            {timeString}
          </span>
        </div>
      </div>

      {/* Right side - Score, Collectibles & Pause */}
      <div className="flex items-center gap-2">
        <div className="hud-panel flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold">{score}</span>
          </div>
          <div className="w-px h-4 bg-white/30" />
          <div className="flex items-center gap-1">
            <span className="text-lg">{collectibleEmoji}</span>
            <span className="font-bold">{collectibles}</span>
          </div>
        </div>
        
        <button
          className="hud-panel pointer-events-auto hover:bg-black/60 transition-colors"
          onClick={onPause}
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
