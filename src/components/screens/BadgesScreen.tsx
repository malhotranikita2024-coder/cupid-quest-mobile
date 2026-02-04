import React from 'react';
import { ArrowLeft, Lock, Check, Sparkles } from 'lucide-react';
import { LEVEL_INFO } from '@/types/game';

interface BadgesScreenProps {
  completedLevels: number[];
  onBack: () => void;
}

export function BadgesScreen({ completedLevels, onBack }: BadgesScreenProps) {
  const allCompleted = completedLevels.length === 7;

  return (
    <div 
      className="fixed inset-0 flex flex-col p-4 overflow-auto"
      style={{ background: 'var(--gradient-sky)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-love-dark" />
        </button>
        <h1 className="game-title text-3xl">Valentine Badges</h1>
      </div>

      {/* Completion message */}
      {allCompleted && (
        <div className="card-love mb-4 text-center relative overflow-hidden">
          <Sparkles className="absolute top-2 left-4 w-6 h-6 text-love-gold animate-sparkle" />
          <Sparkles className="absolute top-2 right-4 w-6 h-6 text-love-gold animate-sparkle" style={{ animationDelay: '0.5s' }} />
          <p className="font-display font-bold text-love-pink text-xl">
            🏆 You completed the Super Love Quest! ❤️
          </p>
        </div>
      )}

      {/* Badges grid */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {LEVEL_INFO.map((level, i) => {
            const isCompleted = completedLevels.includes(i + 1);
            return (
              <div
                key={i}
                className={`card-love flex flex-col items-center p-4 transition-all ${
                  isCompleted 
                    ? 'border-love-pink/50' 
                    : 'opacity-60 grayscale'
                }`}
              >
                <div className="relative mb-2">
                  <span className={`text-5xl ${isCompleted ? 'animate-bounce-soft' : ''}`}>
                    {level.emoji}
                  </span>
                  {isCompleted ? (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="font-display font-semibold text-love-dark text-center text-sm">
                  {level.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Level {i + 1}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 text-center">
        <p className="text-muted-foreground">
          {completedLevels.length} of 7 badges collected
        </p>
        <div className="w-full max-w-xs mx-auto h-3 bg-love-cream rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-love-pink to-love-coral rounded-full transition-all duration-500"
            style={{ width: `${(completedLevels.length / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="btn-love mt-4 mx-auto"
      >
        Back
      </button>
    </div>
  );
}
