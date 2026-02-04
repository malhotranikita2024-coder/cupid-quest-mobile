import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LEVEL_STORIES, LEVEL_INFO } from '@/types/game';

interface StoryScreenProps {
  level: number;
  playerName: string;
  isBeforeLevel: boolean;
  onContinue: () => void;
}

export function StoryScreen({
  level,
  playerName,
  isBeforeLevel,
  onContinue,
}: StoryScreenProps) {
  const story = LEVEL_STORIES[level];
  const levelInfo = LEVEL_INFO[level - 1] || LEVEL_INFO[0];
  
  const message = isBeforeLevel 
    ? story?.before 
    : story?.after;
  
  if (!message) {
    onContinue();
    return null;
  }

  const displayMessage = message.replace('{name}', playerName || 'Hero');

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--gradient-sky)' }}
    >
      {/* Sparkle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-love-gold animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              width: `${16 + Math.random() * 16}px`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <div className="card-love max-w-lg w-full text-center relative z-10">
        {/* Level indicator */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-love-rose/30 text-love-pink font-display font-semibold">
            <span className="text-2xl">{levelInfo.emoji}</span>
            <span>Level {level}</span>
          </div>
        </div>

        {/* Story message */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl font-display text-love-dark leading-relaxed">
            {displayMessage}
          </p>
        </div>

        {/* Progress hearts */}
        <div className="flex justify-center gap-2 mb-6">
          {LEVEL_INFO.map((info, i) => (
            <div
              key={i}
              className={`text-xl transition-all ${
                i < level - 1 
                  ? 'text-love-pink drop-shadow-[0_0_8px_rgba(255,105,180,0.6)]' 
                  : i === level - 1 
                    ? 'animate-heart-beat' 
                    : 'opacity-30 grayscale'
              }`}
            >
              {i < level ? '❤️' : '🤍'}
            </div>
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="btn-love flex items-center justify-center gap-3 mx-auto"
        >
          {isBeforeLevel ? 'Start Level' : 'Next Level'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
