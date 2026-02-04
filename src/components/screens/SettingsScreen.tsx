import React from 'react';
import { ArrowLeft, Music, Music2, Volume2, VolumeX } from 'lucide-react';

interface SettingsScreenProps {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onBack: () => void;
}

export function SettingsScreen({
  musicEnabled,
  sfxEnabled,
  onToggleMusic,
  onToggleSfx,
  onBack,
}: SettingsScreenProps) {
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--gradient-sky)' }}
    >
      {/* Header */}
      <div className="absolute top-4 left-4">
        <button
          onClick={onBack}
          className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-love-dark" />
        </button>
      </div>

      <div className="card-love max-w-sm w-full">
        <h1 className="game-title text-3xl text-center mb-8">Settings</h1>

        <div className="space-y-4">
          {/* Music toggle */}
          <button
            onClick={onToggleMusic}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-love-cream hover:bg-love-rose/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              {musicEnabled ? (
                <Music className="w-6 h-6 text-love-pink" />
              ) : (
                <Music2 className="w-6 h-6 text-muted-foreground" />
              )}
              <span className="font-display font-semibold text-love-dark">
                Background Music
              </span>
            </div>
            <div
              className={`w-14 h-8 rounded-full relative transition-colors ${
                musicEnabled ? 'bg-love-pink' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  musicEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </div>
          </button>

          {/* SFX toggle */}
          <button
            onClick={onToggleSfx}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-love-cream hover:bg-love-rose/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              {sfxEnabled ? (
                <Volume2 className="w-6 h-6 text-love-pink" />
              ) : (
                <VolumeX className="w-6 h-6 text-muted-foreground" />
              )}
              <span className="font-display font-semibold text-love-dark">
                Sound Effects
              </span>
            </div>
            <div
              className={`w-14 h-8 rounded-full relative transition-colors ${
                sfxEnabled ? 'bg-love-pink' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  sfxEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </div>
          </button>
        </div>

        <button
          onClick={onBack}
          className="btn-love w-full mt-8"
        >
          Save & Back
        </button>
      </div>
    </div>
  );
}
