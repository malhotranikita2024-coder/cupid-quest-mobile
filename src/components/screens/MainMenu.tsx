import React, { useState } from 'react';
import { Play, HelpCircle, Settings, Heart, Sparkles } from 'lucide-react';

interface MainMenuProps {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onPlay: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
}

export function MainMenu({
  playerName,
  onPlayerNameChange,
  onPlay,
  onHowToPlay,
  onSettings,
}: MainMenuProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onPlay();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ background: 'var(--gradient-sky)' }}
    >
      {/* Floating hearts background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float text-2xl md:text-4xl opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {['❤️', '💕', '💗', '💖', '🌹'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        {/* Title */}
        <div className="mb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-love-gold animate-sparkle" />
            <Heart className="w-8 h-8 text-love-pink animate-heart-beat fill-current" />
            <Sparkles className="w-6 h-6 text-love-gold animate-sparkle" style={{ animationDelay: '0.5s' }} />
          </div>
          <h1 className="game-title text-5xl md:text-6xl mb-2">
            Super Love Quest
          </h1>
          <p className="text-love-pink/80 text-lg font-medium font-display">
            A Valentine Adventure Made with Love 💕
          </p>
        </div>

        {/* Card with form */}
        <div className="card-love mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="playerName" 
                className="block text-love-dark font-display font-semibold mb-2"
              >
                Enter Your Name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => onPlayerNameChange(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Your lovely name..."
                className="input-love"
                maxLength={20}
                autoComplete="off"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="btn-love w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Play className="w-6 h-6" />
                PLAY
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onHowToPlay}
                  className="btn-gold flex items-center justify-center gap-2 py-3"
                >
                  <HelpCircle className="w-5 h-5" />
                  How to Play
                </button>

                <button
                  type="button"
                  onClick={onSettings}
                  className="btn-gold flex items-center justify-center gap-2 py-3"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-love-pink/60 text-sm">
          🌹 Collect love, defeat enemies, find your Valentine! 🌹
        </p>
      </div>
    </div>
  );
}
