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
      {/* Sky gradient background - vibrant blue to pink sunset */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(180deg, #6BA3D6 0%, #89B8E0 20%, #A8CCE8 40%, #C5DCF0 55%, #E8C8D8 75%, #F0B8C8 90%, #E89CB8 100%)' 
        }}
      />
      
      {/* Clouds - fluffy white clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large clouds */}
        <div className="absolute top-[18%] left-[8%] w-32 h-14 bg-white rounded-full opacity-95" />
        <div className="absolute top-[20%] left-[12%] w-24 h-12 bg-white rounded-full opacity-95" />
        <div className="absolute top-[16%] left-[5%] w-20 h-10 bg-white rounded-full opacity-90" />
        
        <div className="absolute top-[22%] right-[15%] w-36 h-16 bg-white rounded-full opacity-95" />
        <div className="absolute top-[20%] right-[10%] w-24 h-12 bg-white rounded-full opacity-90" />
        <div className="absolute top-[25%] right-[20%] w-20 h-10 bg-white rounded-full opacity-85" />
        
        {/* Sparkle stars */}
        <div className="absolute top-[8%] left-[30%] text-white text-xl animate-pulse" style={{ animationDuration: '2s' }}>✦</div>
        <div className="absolute top-[12%] left-[45%] text-white text-sm animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>✦</div>
        <div className="absolute top-[6%] right-[35%] text-white text-lg animate-pulse" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}>✦</div>
        <div className="absolute top-[10%] right-[20%] text-pink-300 text-xl animate-pulse" style={{ animationDuration: '2.2s', animationDelay: '0.7s' }}>✦</div>
        <div className="absolute top-[14%] left-[20%] text-pink-200 text-sm animate-pulse" style={{ animationDuration: '2s', animationDelay: '1s' }}>✦</div>
        
        {/* Floating hearts in sky */}
        <div 
          className="absolute top-[25%] left-[25%] text-red-400 text-lg opacity-70"
          style={{ 
            animation: 'float 4s ease-in-out infinite',
          }}
        >❤</div>
        <div 
          className="absolute top-[30%] right-[30%] text-red-400 text-sm opacity-60"
          style={{ 
            animation: 'float 5s ease-in-out infinite',
            animationDelay: '1s',
          }}
        >❤</div>
        <div 
          className="absolute top-[35%] left-[40%] text-pink-400 text-xs opacity-50"
          style={{ 
            animation: 'float 3.5s ease-in-out infinite',
            animationDelay: '0.5s',
          }}
        >❤</div>
        <div 
          className="absolute top-[20%] right-[45%] text-pink-300 text-sm opacity-50"
          style={{ 
            animation: 'float 4.5s ease-in-out infinite',
            animationDelay: '2s',
          }}
        >❤</div>
      </div>
      
      {/* Keyframe animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(3deg); }
          50% { transform: translateY(-4px) rotate(-2deg); }
          75% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes hero-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes flag-wave {
          0%, 100% { transform: skewX(0deg) scaleX(1); }
          25% { transform: skewX(-5deg) scaleX(0.95); }
          50% { transform: skewX(3deg) scaleX(1.02); }
          75% { transform: skewX(-3deg) scaleX(0.98); }
        }
      `}</style>
      
      {/* LEFT ISLAND */}
      <div className="absolute bottom-[15%] left-0 w-[38%] h-[50%]">
        {/* Island cliff base - brown earth */}
        <div 
          className="absolute bottom-0 left-0 right-[-10%] h-[70%]"
          style={{
            background: 'linear-gradient(180deg, #8B6914 0%, #6B4F12 50%, #4A3810 100%)',
            borderRadius: '0 40% 0 0',
          }}
        />
        {/* Grass layer on top */}
        <div 
          className="absolute bottom-[65%] left-0 right-[-5%] h-[15%]"
          style={{
            background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)',
            borderRadius: '20px 60% 0 0',
          }}
        />
        {/* Trees/bushes */}
        <div className="absolute bottom-[70%] left-[15%] w-14 h-16 bg-gradient-to-b from-[#2E7D32] to-[#1B5E20] rounded-full" />
        <div className="absolute bottom-[75%] left-[30%] w-18 h-20 bg-gradient-to-b from-[#388E3C] to-[#2E7D32] rounded-full" />
        <div className="absolute bottom-[68%] left-[50%] w-12 h-14 bg-gradient-to-b from-[#43A047] to-[#2E7D32] rounded-full" />
        <div className="absolute bottom-[72%] left-[65%] w-10 h-12 bg-gradient-to-b from-[#4CAF50] to-[#388E3C] rounded-full" />
        
        {/* Golden winding path */}
        <div className="absolute bottom-[50%] left-[20%] w-2 h-16 bg-gradient-to-b from-[#FFD700] to-[#DAA520] rounded-full rotate-12 opacity-80" />
        <div className="absolute bottom-[60%] left-[35%] w-2 h-12 bg-gradient-to-b from-[#FFD700] to-[#DAA520] rounded-full -rotate-6 opacity-80" />
      </div>
      
      {/* RIGHT ISLAND WITH CASTLE */}
      <div className="absolute bottom-[15%] right-0 w-[38%] h-[55%]">
        {/* Island cliff base */}
        <div 
          className="absolute bottom-0 right-0 left-[-10%] h-[65%]"
          style={{
            background: 'linear-gradient(180deg, #8B6914 0%, #6B4F12 50%, #4A3810 100%)',
            borderRadius: '40% 0 0 0',
          }}
        />
        {/* Grass layer */}
        <div 
          className="absolute bottom-[60%] right-0 left-[-5%] h-[12%]"
          style={{
            background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)',
            borderRadius: '60% 20px 0 0',
          }}
        />
        {/* Trees */}
        <div className="absolute bottom-[65%] right-[55%] w-12 h-14 bg-gradient-to-b from-[#388E3C] to-[#2E7D32] rounded-full" />
        <div className="absolute bottom-[68%] right-[40%] w-14 h-16 bg-gradient-to-b from-[#43A047] to-[#2E7D32] rounded-full" />
        
        {/* CASTLE */}
        <div className="absolute bottom-[60%] right-[10%] w-24">
          {/* Main castle body */}
          <div className="w-20 h-24 mx-auto bg-gradient-to-b from-[#F5E6D3] to-[#E8D5C4] relative">
            {/* Castle window */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-6 bg-[#4A90A4] rounded-t-full border border-[#D4C4B0]" />
            {/* Heart decoration */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 text-red-400 text-sm">❤</div>
          </div>
          {/* Left tower */}
          <div className="absolute -left-2 bottom-16 w-8 h-16 bg-gradient-to-b from-[#FFB6C1] to-[#F5E6D3]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-transparent border-b-[#FF69B4]" />
          </div>
          {/* Right tower */}
          <div className="absolute -right-2 bottom-20 w-8 h-20 bg-gradient-to-b from-[#FFB6C1] to-[#F5E6D3]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-transparent border-b-[#FF69B4]" />
            {/* Flag */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="w-1 h-6 bg-[#8B4513]" />
              <div className="absolute top-0 left-1 w-5 h-3 bg-[#FF1493]" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
            </div>
          </div>
        </div>
        
        {/* Golden path on right island */}
        <div className="absolute bottom-[45%] right-[35%] w-2 h-20 bg-gradient-to-b from-[#FFD700] to-[#DAA520] rounded-full -rotate-12 opacity-80" />
        
        {/* Hearts on right island */}
        <div className="absolute bottom-[55%] right-[50%] text-red-400 text-lg">❤</div>
        <div className="absolute bottom-[70%] right-[25%] text-red-400 text-sm">❤</div>
      </div>
      
      {/* OCEAN / WATER in center */}
      <div 
        className="absolute bottom-0 left-[25%] right-[25%] h-[20%]"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #5DADE2 30%, #3498DB 60%, #2980B9 100%)',
        }}
      />
      
      {/* GROUND LEVEL - Left platform area */}
      <div className="absolute bottom-0 left-0 w-[30%] h-[18%]">
        {/* Grass strip */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-[#4CAF50] to-[#388E3C]" />
        {/* Dirt */}
        <div className="absolute top-3 left-0 right-0 bottom-0 bg-gradient-to-b from-[#8B5A2B] to-[#6B4423]" />
        
        {/* Brick stack */}
        <div className="absolute bottom-[100%] left-[25%] flex flex-col">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex">
              {[0, 1].map((col) => (
                <div 
                  key={col} 
                  className="w-6 h-6"
                  style={{
                    background: 'linear-gradient(135deg, #D2691E 0%, #A0522D 50%, #8B4513 100%)',
                    border: '1px solid #654321',
                    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Golden block on brick stack */}
        <div 
          className="absolute bottom-[118%] left-[25%] w-7 h-7 flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 50%, #DAA520 100%)',
            border: '2px solid #B8860B',
            borderRadius: '3px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            position: 'relative',
          }}
        >
          <span className="text-red-500 text-sm">❤</span>
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
        
        {/* Pink Pipe */}
        <div className="absolute bottom-[100%] left-[55%]">
          <div className="w-10 h-4 bg-gradient-to-b from-[#FF69B4] to-[#DB7093] rounded-t-md border-2 border-[#C71585]" />
          <div className="w-8 h-14 bg-gradient-to-r from-[#DB7093] via-[#FF69B4] to-[#DB7093] mx-auto border-x-2 border-[#C71585]" />
        </div>
        
        {/* Rose */}
        <div className="absolute bottom-[120%] left-[60%] text-2xl">🌹</div>
        
        {/* Golden block near pipe */}
        <div 
          className="absolute bottom-[130%] left-[40%] w-7 h-7 flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 50%, #DAA520 100%)',
            border: '2px solid #B8860B',
            borderRadius: '3px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            position: 'relative',
          }}
        >
          <span className="text-red-500 text-sm">❤</span>
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              animationDelay: '0.5s',
            }}
          />
        </div>
      </div>
      
      {/* GROUND LEVEL - Right platform area */}
      <div className="absolute bottom-0 right-0 w-[30%] h-[18%]">
        {/* Grass strip */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-[#4CAF50] to-[#388E3C]" />
        {/* Dirt */}
        <div className="absolute top-3 left-0 right-0 bottom-0 bg-gradient-to-b from-[#8B5A2B] to-[#6B4423]" />
        
        {/* Brick wall - taller */}
        <div className="absolute bottom-[100%] right-[15%] flex flex-col">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex">
              {[0, 1, 2, 3, 4].map((col) => (
                <div 
                  key={col} 
                  className="w-5 h-5"
                  style={{
                    background: 'linear-gradient(135deg, #D2691E 0%, #A0522D 50%, #8B4513 100%)',
                    border: '1px solid #654321',
                    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Golden blocks on right */}
        <div className="absolute bottom-[100%] right-[55%] flex gap-0.5">
          <div 
            className="w-6 h-6 flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 50%, #DAA520 100%)',
              border: '2px solid #B8860B',
              borderRadius: '2px',
              position: 'relative',
            }}
          >
            <span className="text-red-500 text-xs">❤</span>
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
                animationDelay: '1s',
              }}
            />
          </div>
        </div>
        
        {/* HERO CHARACTER - cute, holding flag */}
        <div 
          className="absolute bottom-[100%] right-[35%]"
          style={{ animation: 'hero-bob 2s ease-in-out infinite' }}
        >
          <div className="relative w-14 h-16">
            {/* Head - large round */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #FFE4C4 0%, #FFDAB9 50%, #F5C6AA 100%)',
                border: '2px solid #DEB887',
              }}
            >
              {/* Eyes - big expressive */}
              <div className="absolute top-3 left-2 w-2.5 h-2.5 bg-[#2C1810] rounded-full">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
              </div>
              <div className="absolute top-3 right-2 w-2.5 h-2.5 bg-[#2C1810] rounded-full">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
              </div>
              {/* Blush */}
              <div className="absolute top-5 left-1 w-2 h-1.5 bg-pink-300 rounded-full opacity-60" />
              <div className="absolute top-5 right-1 w-2 h-1.5 bg-pink-300 rounded-full opacity-60" />
              {/* Big smile */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-2.5 border-b-2 border-[#2C1810] rounded-b-full" />
            </div>
            {/* Body - red outfit */}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 rounded-b-lg"
              style={{
                background: 'linear-gradient(180deg, #FF4444 0%, #E53935 50%, #C62828 100%)',
              }}
            />
            {/* Arm holding flag */}
            <div className="absolute top-6 -right-1 w-3 h-2 bg-[#FFE4C4] rounded-full border border-[#DEB887]" />
            {/* Flag */}
            <div className="absolute -top-3 right-0">
              <div className="w-1 h-7 bg-[#8B4513]" />
              <div 
                className="absolute top-0 left-1 w-5 h-4 bg-gradient-to-r from-[#FF1493] to-[#FF69B4]" 
                style={{ 
                  clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                  transformOrigin: 'left center',
                  animation: 'flag-wave 1.5s ease-in-out infinite',
                }} 
              />
            </div>
          </div>
        </div>
        
        {/* Dark enemy near hero */}
        <div className="absolute bottom-[100%] right-[18%]">
          <div 
            className="w-7 h-7 rounded-md"
            style={{ background: 'linear-gradient(180deg, #5C5C8A 0%, #3D3D6B 50%, #2E2E5E 100%)' }}
          >
            <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
            <div className="absolute top-2 right-1 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
          </div>
        </div>
        
        {/* Second enemy */}
        <div className="absolute bottom-[100%] right-[5%]">
          <div 
            className="w-6 h-6 rounded-md"
            style={{ background: 'linear-gradient(180deg, #5C5C8A 0%, #3D3D6B 50%, #2E2E5E 100%)' }}
          >
            <div className="absolute top-1.5 left-0.5 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
            <div className="absolute top-1.5 right-0.5 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
          </div>
        </div>
      </div>
      
      {/* 7-HEART PROGRESS BAR - Golden pill at top */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
        <div 
          className="px-4 py-2 flex items-center gap-1.5 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFE55C 0%, #FFD700 40%, #DAA520 100%)',
            border: '4px solid #B8860B',
            borderRadius: '999px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
            position: 'relative',
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span key={i} className="text-xl" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' }}>❤️</span>
          ))}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s infinite',
            }}
          />
        </div>
      </div>
      
      {/* TITLE - SUPER LOVE QUEST */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="flex items-start justify-center gap-1">
          <span 
            className="font-display text-3xl md:text-5xl font-black"
            style={{
              background: 'linear-gradient(180deg, #FF69B4 0%, #FF1493 50%, #C71585 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(2px 2px 0 #8B0051) drop-shadow(3px 3px 0 #4A0029)',
              letterSpacing: '3px',
            }}
          >
            SUPER
          </span>
          <span className="text-2xl md:text-3xl mt-1">💕</span>
        </div>
        <div className="flex items-center justify-center -mt-2">
          <span 
            className="font-display text-4xl md:text-6xl font-black"
            style={{
              background: 'linear-gradient(180deg, #6BB3D9 0%, #4A90A4 50%, #357A8C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(2px 2px 0 #2C5F6E) drop-shadow(3px 3px 0 #1A3D47)',
              letterSpacing: '3px',
            }}
          >
            LOVE
          </span>
          <span 
            className="font-display text-4xl md:text-6xl font-black ml-2"
            style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #E69500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(2px 2px 0 #B8860B) drop-shadow(3px 3px 0 #8B6914)',
              letterSpacing: '3px',
            }}
          >
            QUEST
          </span>
        </div>
      </div>
      
      {/* UI PANEL - Cream colored, rounded, centered in lower-middle */}
      <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-30">
        <div 
          className="px-6 py-4 min-w-[280px] md:min-w-[320px]"
          style={{
            background: 'linear-gradient(180deg, #FFF8F0 0%, #FFEFD5 50%, #FFE4C4 100%)',
            border: '3px solid #DEB887',
            borderRadius: '16px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Input with user icon */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                className="w-full pl-10 pr-4 py-2.5 text-base rounded-lg focus:outline-none"
                style={{ 
                  background: '#FFFFFF',
                  border: '2px solid #E0E0E0',
                  color: '#555',
                }}
                maxLength={20}
                autoComplete="off"
              />
            </div>
            
            {/* Play Button - Pink gradient */}
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 text-lg font-display font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(180deg, #FF6B9D 0%, #F05080 100%)',
                border: 'none',
                color: '#FFF',
                boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
              }}
            >
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white" />
              PLAY
            </button>
            
            {/* Secondary Buttons - Golden */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onHowToPlay}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-display font-bold rounded-lg transition-transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, #FFE082 0%, #FFD54F 100%)',
                  border: 'none',
                  color: '#5D4E37',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <HelpCircle className="w-4 h-4" />
                How to Play
              </button>
              
              <button
                type="button"
                onClick={onSettings}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-display font-bold rounded-lg transition-transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, #FFE082 0%, #FFD54F 100%)',
                  border: 'none',
                  color: '#5D4E37',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
