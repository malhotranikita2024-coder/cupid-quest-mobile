import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ArrowUp, Zap, Heart, Cookie, Flag, Star, AlertTriangle } from 'lucide-react';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  const instructions = [
    {
      icon: <div className="flex gap-1"><ChevronLeft className="w-6 h-6" /><ChevronRight className="w-6 h-6" /></div>,
      title: 'Move',
      description: 'Use left/right buttons to move your character',
    },
    {
      icon: <ArrowUp className="w-8 h-8" />,
      title: 'Jump',
      description: 'Tap the jump button to leap over obstacles and enemies',
    },
    {
      icon: <Zap className="w-8 h-8 text-love-gold" />,
      title: 'Run',
      description: 'Hold the run button to move faster',
    },
    {
      icon: <span className="text-3xl">🌹</span>,
      title: 'Collect Items',
      description: 'Gather Valentine items for points',
    },
    {
      icon: <span className="text-3xl">🍪</span>,
      title: 'Fortune Cookie',
      description: 'Find the hidden cookie for +1 extra life!',
    },
    {
      icon: <span className="text-3xl">💗</span>,
      title: 'Hit Blocks',
      description: 'Jump into blocks from below to reveal items',
    },
    {
      icon: <span className="text-3xl">💔</span>,
      title: 'Defeat Enemies',
      description: 'Jump on enemies to defeat them, avoid pipes!',
    },
    {
      icon: <span className="text-3xl">❤️🏁</span>,
      title: 'Reach the Flag',
      description: 'Get to the heart flag to complete the level',
    },
  ];

  return (
    <div 
      className="fixed inset-0 flex flex-col p-4 overflow-auto"
      style={{ background: 'var(--gradient-sky)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-love-dark" />
        </button>
        <h1 className="game-title text-3xl">How to Play</h1>
      </div>

      {/* Instructions grid */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        <div className="grid gap-2">
          {instructions.map((item, index) => (
            <div
              key={index}
              className="card-love flex items-center gap-4 p-3"
            >
              <div className="w-12 h-12 rounded-xl bg-love-rose/30 flex items-center justify-center text-love-pink flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-love-dark text-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lives Warning */}
        <div className="card-love mt-3 p-3 border-2 border-red-300 bg-red-50/50">
          <h3 className="font-display font-bold text-red-600 mb-1 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Lives System
          </h3>
          <ul className="text-xs text-red-700 space-y-1">
            <li>• You start with 3 lives ❤️❤️❤️</li>
            <li>• If you die, the level restarts from the beginning</li>
            <li>• At 0 lives = Game Over → Restart from World 1</li>
            <li>• Find Fortune Cookies 🍪 for extra lives!</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="card-love mt-3 p-3">
          <h3 className="font-display font-bold text-love-dark mb-1 flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-love-gold fill-love-gold" />
            Pro Tips
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Watch out for pipe enemies - they pop out periodically!</li>
            <li>• Falling hazards trigger when you get close</li>
            <li>• Higher platforms often have more items</li>
            <li>• Each level takes about 4-5 minutes</li>
          </ul>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="btn-love mt-3 mx-auto"
      >
        Got it! 💕
      </button>
    </div>
  );
}
