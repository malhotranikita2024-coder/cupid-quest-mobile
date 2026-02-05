import React, { useState } from 'react';
import { Play, HelpCircle, Settings, User } from 'lucide-react';

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
          background: 'linear-gradient(180deg, #7EC8E3 0%, #A8D8EA 30%, #B5E2FA 50%, #FFB5C5 80%, #FF9EBA 100%)' 
        }}
      />
      
      {/* Decorative clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[5%] w-32 h-16 bg-white rounded-full opacity-90" style={{ filter: 'blur(2px)' }} />
        <div className="absolute top-[5%] left-[8%] w-24 h-14 bg-white rounded-full opacity-90" style={{ filter: 'blur(2px)' }} />
        <div className="absolute top-[12%] left-[25%] w-28 h-12 bg-white rounded-full opacity-80" style={{ filter: 'blur(2px)' }} />
        <div className="absolute top-[6%] right-[20%] w-36 h-16 bg-white rounded-full opacity-90" style={{ filter: 'blur(2px)' }} />
        <div className="absolute top-[10%] right-[25%] w-20 h-12 bg-white rounded-full opacity-85" style={{ filter: 'blur(2px)' }} />
        <div className="absolute top-[15%] right-[5%] w-28 h-14 bg-white rounded-full opacity-80" style={{ filter: 'blur(2px)' }} />
        
        {/* Sparkle effects */}
        <div className="absolute top-[8%] left-[40%] text-white text-xl animate-pulse">✦</div>
        <div className="absolute top-[12%] right-[35%] text-white text-lg animate-pulse" style={{ animationDelay: '0.5s' }}>✦</div>
        <div className="absolute top-[5%] right-[15%] text-pink-200 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>✦</div>
      </div>
      
      {/* World map landscape */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left island with greenery */}
        <div className="absolute bottom-[20%] left-0 w-[35%] h-[45%]">
          {/* Island base */}
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#8B6914] via-[#A67C00] to-[#5D8A3C] rounded-tr-[60px]" />
          {/* Grass top */}
          <div className="absolute bottom-[55%] left-0 right-[10%] h-[25%] bg-gradient-to-t from-[#4A7C2F] to-[#6BAF47] rounded-t-[30px]" />
          {/* Trees */}
          <div className="absolute bottom-[65%] left-[20%] w-12 h-16 bg-[#2D5A1E] rounded-full" />
          <div className="absolute bottom-[70%] left-[35%] w-16 h-20 bg-[#3D7A2E] rounded-full" />
          <div className="absolute bottom-[60%] left-[55%] w-10 h-14 bg-[#4A8A3A] rounded-full" />
        </div>
        
        {/* Right island with castle */}
        <div className="absolute bottom-[20%] right-0 w-[35%] h-[50%]">
          {/* Island base */}
          <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-[#8B6914] via-[#A67C00] to-[#5D8A3C] rounded-tl-[60px]" />
          {/* Grass */}
          <div className="absolute bottom-[50%] left-[10%] right-0 h-[20%] bg-gradient-to-t from-[#4A7C2F] to-[#6BAF47] rounded-t-[30px]" />
          {/* Castle */}
          <div className="absolute bottom-[55%] right-[15%] w-20 h-28">
            {/* Castle body */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-[#F5E6D3] to-[#E8D5C4]" />
            {/* Castle towers */}
            <div className="absolute bottom-[70%] left-0 w-6 h-12 bg-gradient-to-b from-[#FFB6C1] to-[#F5E6D3]" />
            <div className="absolute bottom-[75%] right-0 w-6 h-14 bg-gradient-to-b from-[#FFB6C1] to-[#F5E6D3]" />
            {/* Tower tops */}
            <div className="absolute bottom-[100%] left-0 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-transparent border-b-[#FF69B4]" style={{ transform: 'translateX(-3px)' }} />
            <div className="absolute bottom-[105%] right-0 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-transparent border-b-[#FF69B4]" style={{ transform: 'translateX(3px)' }} />
            {/* Flags */}
            <div className="absolute -top-2 left-1 w-1 h-6 bg-[#8B4513]" />
            <div className="absolute -top-2 left-2 w-4 h-3 bg-[#FF1493]" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
          </div>
          {/* Trees */}
          <div className="absolute bottom-[55%] left-[15%] w-10 h-14 bg-[#3D7A2E] rounded-full" />
        </div>
        
        {/* Water/ocean in middle */}
        <div className="absolute bottom-0 left-[30%] right-[30%] h-[25%] bg-gradient-to-b from-[#87CEEB] via-[#5DADE2] to-[#3498DB] opacity-80" />
        
        {/* Winding golden path on left island */}
        <div className="absolute bottom-[35%] left-[5%] w-3 h-20 bg-gradient-to-b from-[#FFD700] to-[#DAA520] rounded-full opacity-80" />
        <div className="absolute bottom-[45%] left-[10%] w-3 h-16 bg-gradient-to-b from-[#FFD700] to-[#DAA520] rounded-full opacity-80 rotate-12" />
        
        {/* Golden path on right */}
        <div className="absolute bottom-[40%] right-[25%] w-3 h-24 bg-gradient-to-b from-[#FFD700] to-[#DAA520] rounded-full opacity-80 -rotate-12" />
      </div>
      
      {/* Ground level with platformer elements */}
      <div className="absolute bottom-0 left-0 right-0 h-[22%]">
        {/* Main ground */}
        <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-[#5D8A3C] to-[#7AB356]" />
        
        {/* Brick platform left */}
        <div className="absolute bottom-[80%] left-[3%] flex">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-8 h-8 bg-gradient-to-b from-[#CD853F] to-[#8B4513] border border-[#654321] flex items-center justify-center">
              <div className="w-full h-[2px] bg-[#654321] absolute top-1/2" />
              <div className="h-full w-[2px] bg-[#654321] absolute left-1/2" />
            </div>
          ))}
        </div>
        
        {/* Golden question block left */}
        <div className="absolute bottom-[80%] left-[22%] w-10 h-10 bg-gradient-to-b from-[#FFD700] to-[#DAA520] border-2 border-[#B8860B] rounded flex items-center justify-center shadow-lg">
          <span className="text-[#B8860B] font-bold text-xl">❤</span>
        </div>
        
        {/* Pipe left */}
        <div className="absolute bottom-[60%] left-[12%]">
          <div className="w-10 h-6 bg-gradient-to-b from-[#FF69B4] to-[#DB7093] rounded-t-lg border-2 border-[#C71585]" />
          <div className="w-8 h-12 bg-gradient-to-b from-[#FF69B4] to-[#DB7093] mx-auto border-x-2 border-b-2 border-[#C71585]" />
        </div>
        
        {/* Rose decoration */}
        <div className="absolute bottom-[95%] left-[15%] text-3xl">🌹</div>
        
        {/* Brick platform right */}
        <div className="absolute bottom-[60%] right-[3%] flex">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 bg-gradient-to-b from-[#CD853F] to-[#8B4513] border border-[#654321] relative">
              <div className="w-full h-[2px] bg-[#654321] absolute top-1/2" />
              <div className="h-full w-[2px] bg-[#654321] absolute left-1/2" />
            </div>
          ))}
        </div>
        
        {/* Golden question blocks right */}
        <div className="absolute bottom-[60%] right-[25%] flex gap-1">
          <div className="w-10 h-10 bg-gradient-to-b from-[#FFD700] to-[#DAA520] border-2 border-[#B8860B] rounded flex items-center justify-center shadow-lg">
            <span className="text-[#B8860B] font-bold text-xl">❤</span>
          </div>
        </div>
        
        {/* Hero character (right side) */}
        <div className="absolute bottom-[60%] right-[8%] animate-bounce" style={{ animationDuration: '1s' }}>
          <div className="relative">
            {/* Hero body */}
            <div className="w-12 h-12 bg-gradient-to-b from-[#FFE4C4] to-[#FFDAB9] rounded-full border-2 border-[#DEB887]" />
            {/* Happy face */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-[#333] rounded-full" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#333] rounded-full" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-2 border-b-2 border-[#333] rounded-b-full" />
            {/* Red outfit */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-6 bg-gradient-to-b from-[#FF4444] to-[#CC0000] rounded-b-lg" />
            {/* Flag in hand */}
            <div className="absolute -top-4 -right-2">
              <div className="w-1 h-8 bg-[#8B4513]" />
              <div className="absolute top-0 left-1 w-6 h-4 bg-[#FF1493]" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
            </div>
          </div>
        </div>
        
        {/* Enemy characters (decorative) */}
        <div className="absolute bottom-[55%] right-[35%]">
          <div className="w-8 h-8 bg-gradient-to-b from-[#4A4A8A] to-[#2E2E5E] rounded-lg">
            <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
            <div className="absolute top-2 right-1 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
          </div>
        </div>
        
        <div className="absolute bottom-[55%] left-[28%]">
          <div className="w-8 h-8 bg-gradient-to-b from-[#4A4A8A] to-[#2E2E5E] rounded-lg">
            <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
            <div className="absolute top-2 right-1 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
          </div>
        </div>
      </div>
      
      {/* 7-Heart Progress Bar (Top) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div 
          className="px-6 py-2 rounded-full flex items-center gap-2"
          style={{
            background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 50%, #DAA520 100%)',
            border: '4px solid #B8860B',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span key={i} className="text-2xl drop-shadow-md" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
              ❤️
            </span>
          ))}
        </div>
      </div>
      
      {/* Title */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 z-10 text-center">
        <div className="relative">
          {/* SUPER */}
          <span 
            className="font-display text-3xl md:text-5xl font-black tracking-wide inline-block"
            style={{
              background: 'linear-gradient(180deg, #FF69B4 0%, #FF1493 50%, #C71585 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(3px 3px 0 #7B0041) drop-shadow(5px 5px 0 #3D0020)',
              letterSpacing: '4px',
            }}
          >
            SUPER
          </span>
          <span className="text-3xl md:text-4xl ml-2">💕</span>
        </div>
        <div className="relative -mt-1">
          {/* LOVE */}
          <span 
            className="font-display text-4xl md:text-6xl font-black tracking-wide inline-block"
            style={{
              background: 'linear-gradient(180deg, #87CEEB 0%, #4169E1 50%, #1E3A8A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(3px 3px 0 #1E3A8A) drop-shadow(5px 5px 0 #0A1628)',
              letterSpacing: '4px',
            }}
          >
            LOVE
          </span>
          {/* QUEST */}
          <span 
            className="font-display text-4xl md:text-6xl font-black tracking-wide inline-block ml-3"
            style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(3px 3px 0 #B8860B) drop-shadow(5px 5px 0 #5C4306)',
              letterSpacing: '4px',
            }}
          >
            QUEST
          </span>
        </div>
      </div>
      
      {/* Center Menu Panel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 mt-8">
        <div 
          className="px-8 py-6 rounded-2xl min-w-[300px] md:min-w-[380px]"
          style={{
            background: 'linear-gradient(180deg, #FFFAF0 0%, #FFF5E6 50%, #FFE4C4 100%)',
            border: '4px solid #DEB887',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25), inset 0 2px 8px rgba(255,255,255,0.5)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => onPlayerNameChange(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Enter Your Name"
                className="w-full pl-12 pr-4 py-3 text-lg rounded-xl bg-white border-2 border-gray-200 focus:border-pink-400 focus:outline-none transition-colors"
                style={{ 
                  color: '#555',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                }}
                maxLength={20}
                autoComplete="off"
              />
            </div>
            
            {/* Play Button */}
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full flex items-center justify-center gap-3 py-4 text-xl font-display font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(180deg, #FF69B4 0%, #FF1493 100%)',
                border: '3px solid #C71585',
                color: '#FFF',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                boxShadow: '0 4px 0 #8B0051, 0 6px 12px rgba(0,0,0,0.2)',
              }}
            >
              <Play className="w-5 h-5 fill-white" />
              PLAY
            </button>
            
            {/* Secondary Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onHowToPlay}
                className="flex items-center justify-center gap-2 py-3 text-sm font-display font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 100%)',
                  border: '3px solid #B8860B',
                  color: '#5C4306',
                  boxShadow: '0 3px 0 #8B6914, 0 4px 8px rgba(0,0,0,0.15)',
                }}
              >
                <HelpCircle className="w-4 h-4" />
                How to Play
              </button>
              
              <button
                type="button"
                onClick={onSettings}
                className="flex items-center justify-center gap-2 py-3 text-sm font-display font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 100%)',
                  border: '3px solid #B8860B',
                  color: '#5C4306',
                  boxShadow: '0 3px 0 #8B6914, 0 4px 8px rgba(0,0,0,0.15)',
                }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
