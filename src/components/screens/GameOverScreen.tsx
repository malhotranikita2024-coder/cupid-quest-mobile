import React, { useState } from 'react';
import { RotateCcw, Home, Heart, Upload } from 'lucide-react';
import { submitScore } from '@/hooks/useLeaderboard';

interface GameOverScreenProps {
  score: number;
  level: number;
  playerName: string;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function GameOverScreen({
  score,
  level,
  playerName,
  onRestart,
  onMainMenu,
}: GameOverScreenProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitScore = async () => {
    await submitScore(playerName, score, level);
    setSubmitted(true);
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-6"
      style={{ 
        background: 'linear-gradient(180deg, #1a0f0f 0%, #0d0505 100%)'
      }}
    >
      {/* Broken hearts floating */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${20 + Math.random() * 20}px`,
            }}
          >
            💔
          </div>
        ))}
      </div>

      {/* Game Over overlay - centered popup style */}
      <div className="relative z-10 text-center">
        {/* Retro GAME OVER text */}
        <div className="mb-8">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="game-over-title text-red-500">
            GAME OVER
          </h1>
        </div>

        {/* Stats panel */}
        <div className="retro-hud-panel mb-6 inline-block">
          <div className="flex flex-col gap-2 text-left px-4 py-2">
            <div className="flex justify-between gap-8">
              <span className="retro-text text-xs text-gray-400">WORLD</span>
              <span className="retro-text text-sm text-white">{level}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="retro-text text-xs text-gray-400">SCORE</span>
              <span className="retro-text text-sm text-yellow-400">{score.toString().padStart(6, '0')}</span>
            </div>
          </div>
        </div>

        {/* Encouragement */}
        <p className="text-pink-400 mb-6 font-display text-lg">
          Don't give up, {playerName || 'Hero'}! 💕
        </p>
        <p className="text-gray-400 mb-8 text-sm">
          Lives reset to 3. Try again from World 1!
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={handleSubmitScore}
            disabled={submitted}
            className="btn-love flex items-center justify-center gap-3 min-w-[200px]"
          >
            <Upload className="w-5 h-5" />
            {submitted ? 'SCORE SUBMITTED ✓' : 'SUBMIT SCORE'}
          </button>

          <button
            onClick={onRestart}
            className="btn-love flex items-center justify-center gap-3 min-w-[200px]"
          >
            <RotateCcw className="w-5 h-5" />
            TRY AGAIN
          </button>
          
          <button
            onClick={onMainMenu}
            className="btn-gold flex items-center justify-center gap-3 min-w-[200px]"
          >
            <Home className="w-5 h-5" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
