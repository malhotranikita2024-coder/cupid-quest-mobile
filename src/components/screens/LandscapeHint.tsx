import React from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

export function LandscapeHint() {
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-6 z-[100]"
      style={{ background: 'var(--gradient-sky)' }}
    >
      <div className="card-love max-w-sm text-center">
        <div className="relative mb-6">
          <Smartphone className="w-16 h-16 mx-auto text-love-pink rotate-90" />
          <RotateCw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-love-gold animate-spin" style={{ animationDuration: '2s' }} />
        </div>
        
        <h2 className="game-title text-2xl mb-3">Rotate Your Device</h2>
        
        <p className="text-muted-foreground">
          Super Love Quest plays best in landscape mode! 📱↔️
        </p>
        
        <div className="mt-6 flex justify-center gap-2">
          <span className="text-2xl animate-bounce-soft">🌹</span>
          <span className="text-2xl animate-bounce-soft" style={{ animationDelay: '0.1s' }}>💕</span>
          <span className="text-2xl animate-bounce-soft" style={{ animationDelay: '0.2s' }}>🍫</span>
        </div>
      </div>
    </div>
  );
}
