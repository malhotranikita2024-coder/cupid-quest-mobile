import React from 'react';
import { Play, Home, Volume2, VolumeX, Music, Music2 } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onMainMenu: () => void;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}

export function PauseMenu({
  onResume,
  onMainMenu,
  musicEnabled,
  sfxEnabled,
  onToggleMusic,
  onToggleSfx,
}: PauseMenuProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card-love max-w-sm w-full mx-4 text-center">
        <h2 className="game-title text-3xl mb-6">Paused</h2>
        
        <div className="space-y-3 mb-6">
          <button
            onClick={onResume}
            className="btn-love w-full flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5" />
            Resume
          </button>
          
          <button
            onClick={onMainMenu}
            className="btn-gold w-full flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            Main Menu
          </button>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={onToggleMusic}
            className={`p-4 rounded-xl transition-all ${
              musicEnabled 
                ? 'bg-love-rose/30 text-love-pink' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {musicEnabled ? (
              <Music className="w-6 h-6" />
            ) : (
              <Music2 className="w-6 h-6" />
            )}
          </button>
          
          <button
            onClick={onToggleSfx}
            className={`p-4 rounded-xl transition-all ${
              sfxEnabled 
                ? 'bg-love-rose/30 text-love-pink' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {sfxEnabled ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
