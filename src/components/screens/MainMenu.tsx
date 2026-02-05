import React, { useState } from 'react';
import { Play, HelpCircle, Settings } from 'lucide-react';

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
      className="fixed inset-0 flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #FFB6C1 50%, #FF69B4 100%)' }}
    >
      {/* Arcade-style background - pixel clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Static cloud pattern for arcade feel */}
        <div className="absolute top-10 left-[10%] text-6xl opacity-60">☁️</div>
        <div className="absolute top-20 left-[30%] text-4xl opacity-50">☁️</div>
        <div className="absolute top-8 left-[60%] text-5xl opacity-55">☁️</div>
        <div className="absolute top-16 right-[10%] text-6xl opacity-60">☁️</div>
        
        {/* Ground/grass at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#228B22] to-[#32CD32]" />
        <div className="absolute bottom-16 left-0 right-0 h-4 bg-[#8B4513]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg mx-auto text-center">
        {/* Hero character */}
        <div className="absolute -left-4 bottom-[30%] text-6xl md:text-8xl animate-bounce" style={{ animationDuration: '1.5s' }}>
          🏃
        </div>
        <div className="absolute -right-4 bottom-[35%] text-5xl md:text-7xl">
          ❤️
        </div>

        {/* Title */}
        <div className="mb-4">
          {/* Arcade-style title with shadow */}
          <div className="relative">
            <h1 
              className="font-display text-4xl md:text-6xl font-bold tracking-wider"
              style={{
                color: '#FFD700',
                textShadow: '4px 4px 0 #8B0000, 6px 6px 0 #000, 2px 2px 8px rgba(0,0,0,0.5)',
                letterSpacing: '2px',
              }}
            >
              SUPER LOVE
            </h1>
            <h1 
              className="font-display text-5xl md:text-7xl font-bold"
              style={{
                color: '#FF1493',
                textShadow: '4px 4px 0 #8B0000, 6px 6px 0 #000, 2px 2px 8px rgba(0,0,0,0.5)',
                letterSpacing: '3px',
              }}
            >
              QUEST ❤️
            </h1>
          </div>
          
          <p 
            className="mt-2 text-lg md:text-xl font-display"
            style={{
              color: '#FFF',
              textShadow: '2px 2px 0 #000',
            }}
          >
            A Valentine Adventure 💕
          </p>
        </div>

        {/* Card with form */}
        <div 
          className="mt-6 p-6 rounded-lg"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: '4px solid #FFD700',
            boxShadow: '0 0 20px rgba(255,215,0,0.5)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="playerName" 
                className="block text-yellow-400 font-display font-bold mb-2 text-lg"
                style={{ textShadow: '1px 1px 0 #000' }}
              >
                ENTER YOUR NAME
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => onPlayerNameChange(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Hero..."
                className="w-full px-4 py-3 text-xl text-center font-display bg-white border-4 border-yellow-500 rounded focus:border-pink-500 focus:outline-none"
                style={{ 
                  color: '#333',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}
                maxLength={20}
                autoComplete="off"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="w-full flex items-center justify-center gap-3 py-4 text-2xl font-display font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #FF69B4 0%, #FF1493 100%)',
                  border: '4px solid #FFD700',
                  color: '#FFF',
                  textShadow: '2px 2px 0 #8B0000',
                  boxShadow: '0 4px 0 #8B0000, 0 6px 10px rgba(0,0,0,0.3)',
                }}
              >
                <Play className="w-6 h-6" />
                START GAME
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onHowToPlay}
                  className="flex items-center justify-center gap-2 py-3 font-display font-bold rounded transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                    border: '3px solid #8B4513',
                    color: '#333',
                    boxShadow: '0 3px 0 #8B4513',
                  }}
                >
                  <HelpCircle className="w-5 h-5" />
                  How to Play
                </button>

                <button
                  type="button"
                  onClick={onSettings}
                  className="flex items-center justify-center gap-2 py-3 font-display font-bold rounded transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                    border: '3px solid #8B4513',
                    color: '#333',
                    boxShadow: '0 3px 0 #8B4513',
                  }}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p 
          className="mt-4 text-sm font-display"
          style={{
            color: '#FFF',
            textShadow: '1px 1px 0 #000',
          }}
        >
          🎮 Run • Jump • Collect • Win! 🎮
        </p>
      </div>
    </div>
  );
}
