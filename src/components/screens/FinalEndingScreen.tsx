import React, { useState } from 'react';
import { RotateCcw, Home, Share2, Award, Sparkles, Upload } from 'lucide-react';
import { LEVEL_INFO } from '@/types/game';
import { submitScore } from '@/hooks/useLeaderboard';

interface FinalEndingScreenProps {
  playerName: string;
  score: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onBadges: () => void;
}

export function FinalEndingScreen({
  playerName,
  score,
  onPlayAgain,
  onMainMenu,
  onBadges,
}: FinalEndingScreenProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitScore = async () => {
    await submitScore(playerName, score, 7);
    setSubmitted(true);
  };

  const handleShare = () => {
    const text = `I completed Super Love Quest with ${score} points! 💕🎮`;
    if (navigator.share) {
      navigator.share({
        title: 'Super Love Quest',
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-6 overflow-auto"
      style={{ background: 'var(--gradient-sky)' }}
    >
      {/* Celebration effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              fontSize: `${16 + Math.random() * 24}px`,
            }}
          >
            {['💖', '✨', '💕', '⭐', '🌹', '💗', '🎉'][Math.floor(Math.random() * 7)]}
          </div>
        ))}
      </div>

      <div className="card-love max-w-lg w-full text-center relative z-10">
        {/* Trophy and title */}
        <div className="mb-6">
          <div className="relative inline-block">
            <span className="text-6xl animate-bounce-soft">💘</span>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-love-gold animate-sparkle" />
            <Sparkles className="absolute -bottom-1 -left-2 w-5 h-5 text-love-gold animate-sparkle" style={{ animationDelay: '0.3s' }} />
          </div>
          <h1 className="game-title text-3xl md:text-4xl mt-4 mb-2">
            The Valentine Surprise
          </h1>
        </div>

        {/* Personalized message */}
        <div className="bg-gradient-to-br from-love-rose/40 to-love-cream rounded-2xl p-6 mb-6">
          <p className="text-xl md:text-2xl font-display text-love-dark leading-relaxed">
            <span className="font-bold">{playerName || 'Hero'}</span>, you collected every piece of love.
          </p>
          <p className="text-xl md:text-2xl font-display text-love-dark leading-relaxed mt-2">
            The surprise is ready… just for you ❤️
          </p>
          <p className="text-2xl md:text-3xl font-display font-bold text-love-pink mt-4 animate-pulse-love">
            Will you be my Valentine? 💕
          </p>
        </div>

        {/* All badges collected */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">All badges collected!</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {LEVEL_INFO.map((info, i) => (
              <div
                key={i}
                className="text-3xl animate-bounce-soft drop-shadow-lg"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {info.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-love-gold/20 text-love-gold font-display font-bold mb-6">
          <Award className="w-5 h-5" />
          <span>Final Score: {score}</span>
        </div>

        {/* Footer message */}
        <p className="text-sm text-muted-foreground mb-6">
          Powered by roses, chocolates, and a brave little hero. 💕
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSubmitScore}
            disabled={submitted}
            className="btn-love flex items-center justify-center gap-2 py-3 col-span-2"
          >
            <Upload className="w-5 h-5" />
            {submitted ? 'Score Submitted ✓' : 'Submit Score'}
          </button>

          <button
            onClick={onPlayAgain}
            className="btn-love flex items-center justify-center gap-2 py-3"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
          
          <button
            onClick={onMainMenu}
            className="btn-gold flex items-center justify-center gap-2 py-3"
          >
            <Home className="w-5 h-5" />
            Menu
          </button>
          
          <button
            onClick={onBadges}
            className="btn-gold flex items-center justify-center gap-2 py-3"
          >
            <Award className="w-5 h-5" />
            Badges
          </button>
          
          <button
            onClick={handleShare}
            className="btn-gold flex items-center justify-center gap-2 py-3"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
