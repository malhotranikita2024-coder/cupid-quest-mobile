import React from 'react';
import { RotateCcw, Home, Heart } from 'lucide-react';

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
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-6"
      style={{ 
        background: 'linear-gradient(180deg, #2D1F2D 0%, #1A0F1A 100%)'
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

      <div className="card-love max-w-sm w-full text-center relative z-10">
        {/* Game over title */}
        <div className="mb-6">
          <div className="text-5xl mb-3">💔</div>
          <h1 className="text-4xl font-display font-bold text-love-pink mb-2">
            Game Over
          </h1>
          <p className="text-muted-foreground">
            Don't give up, {playerName || 'Hero'}!
          </p>
        </div>

        {/* Stats */}
        <div className="bg-love-cream rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Level Reached</p>
              <p className="text-2xl font-display font-bold text-love-dark">{level}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Final Score</p>
              <p className="text-2xl font-display font-bold text-love-dark">{score}</p>
            </div>
          </div>
        </div>

        {/* Encouragement */}
        <p className="text-love-pink/80 mb-6 font-display">
          Love conquers all! Try again? 💕
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="btn-love w-full flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          
          <button
            onClick={onMainMenu}
            className="btn-gold w-full flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
