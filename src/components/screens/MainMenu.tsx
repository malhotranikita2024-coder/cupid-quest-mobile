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
    <div className="fixed inset-0 overflow-hidden select-none">
      {/* Sky gradient background */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(180deg, #87CEEB 0%, #ADD8E6 40%, #B0E0E6 60%, #FFE4E1 100%)' 
        }}
      />
      
      {/* Decorative clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[12%] left-[5%] w-24 h-10 bg-white/80 rounded-full" style={{ filter: 'blur(3px)' }} />
        <div className="absolute top-[8%] left-[15%] w-16 h-8 bg-white/70 rounded-full" style={{ filter: 'blur(3px)' }} />
        <div className="absolute top-[15%] right-[10%] w-28 h-12 bg-white/80 rounded-full" style={{ filter: 'blur(3px)' }} />
        <div className="absolute top-[10%] right-[25%] w-20 h-9 bg-white/70 rounded-full" style={{ filter: 'blur(3px)' }} />
      </div>
      
      {/* Far background - distant hills */}
      <div className="absolute bottom-[35%] left-0 right-0 h-[20%] bg-gradient-to-t from-[#7CB97C] to-[#9ACD9A] opacity-60" style={{ borderRadius: '50% 50% 0 0' }} />
      
      {/* Main ground terrain - full width platformer ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%]">
        {/* Grass layer */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#4CAF50] to-[#388E3C]" />
        {/* Dirt/earth layer */}
        <div className="absolute top-4 left-0 right-0 bottom-0 bg-gradient-to-b from-[#8B5A2B] via-[#6B4423] to-[#4A3520]" />
        
        {/* Brick texture pattern in ground */}
        <div className="absolute top-6 left-0 right-0 bottom-0 opacity-30">
          {[...Array(8)].map((_, row) => (
            <div key={row} className="flex" style={{ marginTop: row > 0 ? '-1px' : '0' }}>
              {[...Array(30)].map((_, col) => (
                <div 
                  key={col} 
                  className="w-8 h-4 border-b border-r"
                  style={{ 
                    borderColor: 'rgba(0,0,0,0.2)',
                    marginLeft: row % 2 === 0 ? '0' : '-16px'
                  }} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Left side platformer elements */}
      <div className="absolute bottom-[40%] left-[2%]">
        {/* Pipe */}
        <div className="relative">
          <div className="w-12 h-5 bg-gradient-to-b from-[#32CD32] to-[#228B22] rounded-t-md border-2 border-[#006400]" />
          <div className="w-10 h-16 bg-gradient-to-r from-[#228B22] via-[#32CD32] to-[#228B22] mx-auto border-x-2 border-b-2 border-[#006400]" />
        </div>
      </div>
      
      {/* Left brick stack */}
      <div className="absolute bottom-[40%] left-[12%] flex flex-col">
        {[0, 1].map((row) => (
          <div key={row} className="flex">
            {[0, 1].map((col) => (
              <div 
                key={col} 
                className="w-7 h-7 relative"
                style={{
                  background: 'linear-gradient(135deg, #CD853F 0%, #A0522D 50%, #8B4513 100%)',
                  border: '2px solid #654321',
                  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.2), inset -1px -1px 0 rgba(0,0,0,0.2)',
                }}
              >
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#654321]" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#654321]" />
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Golden question block left */}
      <div 
        className="absolute bottom-[54%] left-[12%] w-8 h-8 flex items-center justify-center animate-pulse"
        style={{
          background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #DAA520 100%)',
          border: '2px solid #B8860B',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)',
          animationDuration: '2s',
        }}
      >
        <span className="text-[#8B4513] font-bold text-sm">?</span>
      </div>
      
      {/* Right side platformer elements */}
      <div className="absolute bottom-[40%] right-[3%]">
        {/* Pipe */}
        <div className="relative">
          <div className="w-12 h-5 bg-gradient-to-b from-[#32CD32] to-[#228B22] rounded-t-md border-2 border-[#006400]" />
          <div className="w-10 h-20 bg-gradient-to-r from-[#228B22] via-[#32CD32] to-[#228B22] mx-auto border-x-2 border-b-2 border-[#006400]" />
        </div>
      </div>
      
      {/* Right brick platform */}
      <div className="absolute bottom-[40%] right-[12%] flex">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="w-7 h-7 relative"
            style={{
              background: 'linear-gradient(135deg, #CD853F 0%, #A0522D 50%, #8B4513 100%)',
              border: '2px solid #654321',
              boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.2), inset -1px -1px 0 rgba(0,0,0,0.2)',
            }}
          >
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#654321]" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#654321]" />
          </div>
        ))}
      </div>
      
      {/* Golden blocks on right platform */}
      <div className="absolute bottom-[47%] right-[14%] flex gap-1">
        {[0, 1].map((i) => (
          <div 
            key={i}
            className="w-7 h-7 flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #DAA520 100%)',
              border: '2px solid #B8860B',
              borderRadius: '3px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-[#8B4513] font-bold text-xs">?</span>
          </div>
        ))}
      </div>
      
      {/* Enemy on right platform */}
      <div className="absolute bottom-[47%] right-[22%]">
        <div 
          className="w-7 h-7 rounded-md relative"
          style={{ background: 'linear-gradient(180deg, #4A4A8A 0%, #2E2E5E 100%)' }}
        >
          <div className="absolute top-1.5 left-1 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
          <div className="absolute top-1.5 right-1 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
        </div>
      </div>
      
      {/* Center elevated platform with path leading to it */}
      <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2">
        <div className="flex">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="w-8 h-8 relative"
              style={{
                background: 'linear-gradient(135deg, #CD853F 0%, #A0522D 50%, #8B4513 100%)',
                border: '2px solid #654321',
                boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#654321]" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#654321]" />
            </div>
          ))}
        </div>
      </div>
      
      {/* HERO CHARACTER - Standing at journey start, facing right */}
      <div className="absolute bottom-[48%] left-[25%] z-30">
        <div className="relative">
          {/* Body */}
          <div 
            className="w-10 h-10 rounded-full relative"
            style={{ background: 'linear-gradient(180deg, #FFE4C4 0%, #FFDAB9 100%)', border: '2px solid #DEB887' }}
          >
            {/* Eyes - looking right */}
            <div className="absolute top-2 left-3 w-2 h-2 bg-[#333] rounded-full" />
            <div className="absolute top-2 right-1.5 w-2 h-2 bg-[#333] rounded-full" />
            {/* Smile */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-2 border-b-2 border-[#333] rounded-b-full" />
          </div>
          {/* Red outfit */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-9 h-5 rounded-b-lg"
            style={{ background: 'linear-gradient(180deg, #FF4444 0%, #CC0000 100%)' }}
          />
          {/* Arm pointing forward */}
          <div 
            className="absolute top-4 -right-3 w-4 h-2 rounded-full"
            style={{ background: '#FFE4C4', border: '1px solid #DEB887' }}
          />
        </div>
      </div>
      
      {/* Rose collectible near hero */}
      <div className="absolute bottom-[52%] left-[32%] text-xl animate-bounce" style={{ animationDuration: '1.5s' }}>🌹</div>
      
      {/* 7-Heart Progress Bar - Subtle, wooden frame style */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div 
          className="px-3 py-1.5 flex items-center gap-1"
          style={{
            background: 'linear-gradient(180deg, #DEB887 0%, #D2691E 100%)',
            border: '3px solid #8B4513',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span key={i} className="text-sm opacity-50">❤️</span>
          ))}
        </div>
      </div>
      
      {/* TITLE - Mounted on wooden signboard */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 z-10">
        {/* Wooden sign backing */}
        <div 
          className="relative px-6 py-3"
          style={{
            background: 'linear-gradient(180deg, #DEB887 0%, #D2B48C 50%, #C4A574 100%)',
            border: '4px solid #8B4513',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
          }}
        >
          {/* Wooden texture lines */}
          <div className="absolute inset-0 opacity-20 overflow-hidden rounded">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[1px] bg-[#654321] mt-3" />
            ))}
          </div>
          
          {/* Title text */}
          <div className="relative text-center">
            <span 
              className="font-display text-2xl md:text-4xl font-black block"
              style={{
                color: '#FF1493',
                textShadow: '2px 2px 0 #8B0051, 3px 3px 0 #4A0029, 0 0 10px rgba(255,20,147,0.3)',
                letterSpacing: '2px',
              }}
            >
              SUPER
            </span>
            <div className="flex items-center justify-center gap-2 -mt-1">
              <span 
                className="font-display text-3xl md:text-5xl font-black"
                style={{
                  color: '#FF69B4',
                  textShadow: '2px 2px 0 #C71585, 3px 3px 0 #8B0051',
                  letterSpacing: '3px',
                }}
              >
                LOVE
              </span>
              <span 
                className="font-display text-3xl md:text-5xl font-black"
                style={{
                  color: '#FFD700',
                  textShadow: '2px 2px 0 #B8860B, 3px 3px 0 #8B6914',
                  letterSpacing: '3px',
                }}
              >
                QUEST
              </span>
            </div>
          </div>
          
          {/* Sign posts */}
          <div className="absolute -bottom-8 left-4 w-3 h-10 bg-gradient-to-b from-[#8B4513] to-[#654321] rounded-b" />
          <div className="absolute -bottom-8 right-4 w-3 h-10 bg-gradient-to-b from-[#8B4513] to-[#654321] rounded-b" />
        </div>
      </div>
      
      {/* UI Panel - Wooden board style, embedded in world */}
      <div className="absolute bottom-[48%] left-1/2 -translate-x-1/2 z-20">
        <div 
          className="relative px-4 py-3"
          style={{
            background: 'linear-gradient(180deg, #F5DEB3 0%, #DEB887 50%, #D2B48C 100%)',
            border: '3px solid #8B4513',
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            minWidth: '200px',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Name Input - Stone tablet style */}
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => onPlayerNameChange(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Enter Name..."
              className="w-full px-3 py-2 text-sm text-center font-display rounded focus:outline-none"
              style={{ 
                background: 'linear-gradient(180deg, #FFF8DC 0%, #F5DEB3 100%)',
                border: '2px solid #A0522D',
                color: '#5C4306',
              }}
              maxLength={20}
              autoComplete="off"
            />
            
            {/* Play Button */}
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-display font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(180deg, #FF69B4 0%, #FF1493 100%)',
                border: '2px solid #C71585',
                color: '#FFF',
                textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
                boxShadow: '0 3px 0 #8B0051',
              }}
            >
              <Play className="w-4 h-4 fill-white" />
              PLAY
            </button>
            
            {/* Secondary Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onHowToPlay}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-display font-bold rounded transition-transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #DAA520 100%)',
                  border: '2px solid #B8860B',
                  color: '#5C4306',
                  boxShadow: '0 2px 0 #8B6914',
                }}
              >
                <HelpCircle className="w-3 h-3" />
                How To
              </button>
              
              <button
                type="button"
                onClick={onSettings}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-display font-bold rounded transition-transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #DAA520 100%)',
                  border: '2px solid #B8860B',
                  color: '#5C4306',
                  boxShadow: '0 2px 0 #8B6914',
                }}
              >
                <Settings className="w-3 h-3" />
                Settings
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Decorative arrow pointing right (toward adventure) */}
      <div className="absolute bottom-[42%] left-[38%] text-2xl animate-pulse" style={{ animationDuration: '1s' }}>
        ➡️
      </div>
    </div>
  );
}
