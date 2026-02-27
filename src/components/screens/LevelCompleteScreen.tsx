import React from 'react';
import { Star, Cookie, ArrowRight, Heart } from 'lucide-react';
import { LEVEL_INFO } from '@/types/game';

interface LevelCompleteScreenProps {
  level: number;
  score: number;
  collectibles: number;
  fortuneCookieCollected: boolean;
  completedLevels: number[];
  onContinue: () => void;
}

export function LevelCompleteScreen({
  level,
  score,
  collectibles,
  fortuneCookieCollected,
  completedLevels,
  onContinue,
}: LevelCompleteScreenProps) {
  const levelInfo = LEVEL_INFO[level - 1] || LEVEL_INFO[0];

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-start overflow-y-auto p-6 pt-10 max-[1023px]:pt-4 max-[1023px]:p-4"
      style={{ background: 'var(--gradient-sky)' }}
    >
      {/* Celebration effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${20 + Math.random() * 20}px`,
              opacity: 0.6,
            }}
          >
            {['⭐', '✨', '💖', '🌟', '💕'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="card-love max-w-md w-full text-center relative z-10">
        {/* Title */}
        <div className="mb-6">
          <div className="text-5xl mb-2">🎉</div>
          <h1 className="game-title text-4xl mb-2">Level Complete!</h1>
          <p className="text-love-pink font-display">
            {levelInfo.emoji} {levelInfo.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-love-cream rounded-2xl p-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-5 h-5 text-love-gold fill-love-gold" />
              <span className="font-display font-bold text-2xl text-love-dark">{score}</span>
            </div>
            <p className="text-sm text-muted-foreground">Score</p>
          </div>
          
          <div className="bg-love-cream rounded-2xl p-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl">{levelInfo.emoji}</span>
              <span className="font-display font-bold text-2xl text-love-dark">{collectibles}</span>
            </div>
            <p className="text-sm text-muted-foreground">Collected</p>
          </div>
        </div>

        {/* Fortune cookie status */}
        <div className={`rounded-2xl p-4 mb-6 flex items-center justify-center gap-3 ${
          fortuneCookieCollected ? 'bg-love-gold/20' : 'bg-gray-100'
        }`}>
          <span className="text-3xl">🍪</span>
          <div className="text-left">
            <p className="font-display font-bold text-love-dark">
              Fortune Cookie
            </p>
            <p className={`text-sm ${fortuneCookieCollected ? 'text-love-gold' : 'text-muted-foreground'}`}>
              {fortuneCookieCollected ? '+1 Life Earned! 💕' : 'Not found this time'}
            </p>
          </div>
        </div>

        {/* Progress hearts */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Your Progress</p>
          <div className="flex justify-center gap-2">
            {LEVEL_INFO.map((info, i) => (
              <div
                key={i}
                className={`text-2xl transition-all duration-300 ${
                  completedLevels.includes(i + 1)
                    ? 'animate-pulse-love drop-shadow-[0_0_8px_rgba(255,105,180,0.8)]'
                    : 'opacity-30 grayscale'
                }`}
              >
                {completedLevels.includes(i + 1) ? '❤️' : '🤍'}
              </div>
            ))}
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="btn-love w-full flex items-center justify-center gap-3"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
