import React, { useState } from 'react';
import { ArrowLeft, Music, Music2, Volume2, VolumeX, LogOut, GraduationCap } from 'lucide-react';
import { getTutorialMode, setTutorialMode, TutorialMode } from '@/hooks/useTutorialNudges';

interface SettingsScreenProps {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onBack: () => void;
  onSignOut: () => void;
}

export function SettingsScreen({
  musicEnabled,
  sfxEnabled,
  onToggleMusic,
  onToggleSfx,
  onBack,
  onSignOut,
}: SettingsScreenProps) {
  const [tutorialMode, setTutorialModeState] = useState<TutorialMode>(getTutorialMode);

  const handleTutorialModeChange = (mode: TutorialMode) => {
    setTutorialMode(mode);
    setTutorialModeState(mode);
  };

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

          {/* Tutorial mode */}
          <div className="p-4 rounded-2xl bg-love-cream">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="w-6 h-6 text-love-pink" />
              <span className="font-display font-semibold text-love-dark">
                Tutorials
              </span>
            </div>
            <div className="space-y-2 pl-9">
              <button
                onClick={() => handleTutorialModeChange('first_time')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tutorialMode === 'first_time'
                    ? 'bg-love-pink text-white'
                    : 'bg-white/60 text-love-dark hover:bg-white'
                }`}
              >
                🎮 First time only <span className="opacity-60">(Player)</span>
              </button>
              <button
                onClick={() => handleTutorialModeChange('always_level1')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tutorialMode === 'always_level1'
                    ? 'bg-love-pink text-white'
                    : 'bg-white/60 text-love-dark hover:bg-white'
                }`}
              >
                🧪 Every Level 1 start <span className="opacity-60">(Tester)</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="btn-love w-full mt-8"
        >
          Save & Back
        </button>

        <button
          onClick={onSignOut}
          className="w-full mt-3 flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-base transition-all duration-200 border-2"
          style={{
            fontFamily: "'Fredoka', sans-serif",
            borderColor: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive))',
            background: 'transparent',
          }}
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
