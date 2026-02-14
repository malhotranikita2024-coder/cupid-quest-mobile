import React from 'react';

export function GameWorldBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden select-none">
      {/* Sky gradient background */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(180deg, #6BA3D6 0%, #89B8E0 20%, #A8CCE8 40%, #C5DCF0 55%, #E8C8D8 75%, #F0B8C8 90%, #E89CB8 100%)' 
        }}
      />
      
      {/* Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[18%] left-[8%] w-32 h-14 bg-white rounded-full opacity-95" />
        <div className="absolute top-[20%] left-[12%] w-24 h-12 bg-white rounded-full opacity-95" />
        <div className="absolute top-[16%] left-[5%] w-20 h-10 bg-white rounded-full opacity-90" />
        <div className="absolute top-[22%] right-[15%] w-36 h-16 bg-white rounded-full opacity-95" />
        <div className="absolute top-[20%] right-[10%] w-24 h-12 bg-white rounded-full opacity-90" />
        <div className="absolute top-[25%] right-[20%] w-20 h-10 bg-white rounded-full opacity-85" />
        
        {/* Sparkle stars */}
        {[
          { top: '8%', left: '30%', size: 'xl', delay: '0s', dur: '2s', color: 'text-white' },
          { top: '12%', left: '45%', size: 'sm', delay: '0.5s', dur: '2.5s', color: 'text-white' },
          { top: '6%', right: '35%', size: 'lg', delay: '0.3s', dur: '1.8s', color: 'text-white' },
          { top: '10%', right: '20%', size: 'xl', delay: '0.7s', dur: '2.2s', color: 'text-pink-300' },
          { top: '14%', left: '20%', size: 'sm', delay: '1s', dur: '2s', color: 'text-pink-200' },
          { top: '5%', left: '55%', size: 'xs', delay: '0.2s', dur: '1.5s', color: 'text-white' },
          { top: '9%', right: '45%', size: 'base', delay: '1.3s', dur: '2.3s', color: 'text-pink-100' },
        ].map((s, i) => (
          <div 
            key={i}
            className={`absolute ${s.color} text-${s.size}`}
            style={{ 
              top: s.top, 
              left: s.left, 
              right: s.right,
              animation: `gwb-twinkle ${s.dur} ease-in-out infinite`, 
              animationDelay: s.delay, 
              textShadow: '0 0 8px currentColor' 
            }}
          >✦</div>
        ))}
        
        {/* Floating hearts in sky */}
        <div className="absolute top-[25%] left-[25%] text-red-400 text-lg opacity-70" style={{ animation: 'gwb-float 4s ease-in-out infinite' }}>❤</div>
        <div className="absolute top-[30%] right-[30%] text-red-400 text-sm opacity-60" style={{ animation: 'gwb-float 5s ease-in-out infinite', animationDelay: '1s' }}>❤</div>
        <div className="absolute top-[35%] left-[40%] text-pink-400 text-xs opacity-50" style={{ animation: 'gwb-float 3.5s ease-in-out infinite', animationDelay: '0.5s' }}>❤</div>
        <div className="absolute top-[20%] right-[45%] text-pink-300 text-sm opacity-50" style={{ animation: 'gwb-float 4.5s ease-in-out infinite', animationDelay: '2s' }}>❤</div>
      </div>
      
      {/* Keyframe styles */}
      <style>{`
        @keyframes gwb-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(3deg); }
          50% { transform: translateY(-4px) rotate(-2deg); }
          75% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes gwb-twinkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          25% { opacity: 0.4; transform: scale(0.8) rotate(15deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(0deg); }
          75% { opacity: 0.6; transform: scale(0.9) rotate(-15deg); }
        }
        @keyframes gwb-tree-sway {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          25% { transform: rotate(1.5deg) scaleY(0.99); }
          50% { transform: rotate(0deg) scaleY(1); }
          75% { transform: rotate(-1.5deg) scaleY(0.99); }
        }
        @keyframes gwb-water-ripple {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        @keyframes gwb-water-shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes gwb-tower-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(255,105,180,0.3); }
          50% { box-shadow: 0 0 16px rgba(255,105,180,0.6), 0 0 24px rgba(255,182,193,0.4); }
        }
      `}</style>
      
      {/* LEFT ISLAND */}
      <div className="absolute bottom-[15%] left-0 w-[38%] h-[50%]">
        <div className="absolute bottom-0 left-0 right-[-10%] h-[70%]" style={{ background: 'linear-gradient(180deg, #8B6914 0%, #6B4F12 50%, #4A3810 100%)', borderRadius: '0 40% 0 0' }} />
        <div className="absolute bottom-[65%] left-0 right-[-5%] h-[15%]" style={{ background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)', borderRadius: '20px 60% 0 0' }} />
        <div className="absolute bottom-[70%] left-[15%] w-14 h-16 bg-gradient-to-b from-[#2E7D32] to-[#1B5E20] rounded-full" style={{ transformOrigin: 'bottom center', animation: 'gwb-tree-sway 4s ease-in-out infinite' }} />
        <div className="absolute bottom-[75%] left-[30%] w-18 h-20 bg-gradient-to-b from-[#388E3C] to-[#2E7D32] rounded-full" style={{ transformOrigin: 'bottom center', animation: 'gwb-tree-sway 4.5s ease-in-out infinite', animationDelay: '0.5s' }} />
        <div className="absolute bottom-[68%] left-[50%] w-12 h-14 bg-gradient-to-b from-[#43A047] to-[#2E7D32] rounded-full" style={{ transformOrigin: 'bottom center', animation: 'gwb-tree-sway 3.8s ease-in-out infinite', animationDelay: '1s' }} />
        <div className="absolute bottom-[72%] left-[65%] w-10 h-12 bg-gradient-to-b from-[#4CAF50] to-[#388E3C] rounded-full" style={{ transformOrigin: 'bottom center', animation: 'gwb-tree-sway 4.2s ease-in-out infinite', animationDelay: '0.3s' }} />
        <div className="absolute bottom-[50%] left-[20%] w-2 h-16 bg-gradient-to-b from-[#FFD700] to-[#DAA520] rounded-full rotate-12 opacity-80" />
        <div className="absolute bottom-[60%] left-[35%] w-2 h-12 bg-gradient-to-b from-[#FFD700] to-[#DAA520] rounded-full -rotate-6 opacity-80" />
      </div>
      
      {/* RIGHT ISLAND WITH CASTLE */}
      <div className="absolute bottom-[15%] right-0 w-[38%] h-[55%]">
        <div className="absolute bottom-0 right-0 left-[-10%] h-[65%]" style={{ background: 'linear-gradient(180deg, #8B6914 0%, #6B4F12 50%, #4A3810 100%)', borderRadius: '40% 0 0 0' }} />
        <div className="absolute bottom-[60%] right-0 left-[-5%] h-[12%]" style={{ background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)', borderRadius: '60% 20px 0 0' }} />
        <div className="absolute bottom-[65%] right-[55%] w-12 h-14 bg-gradient-to-b from-[#388E3C] to-[#2E7D32] rounded-full" style={{ transformOrigin: 'bottom center', animation: 'gwb-tree-sway 4.3s ease-in-out infinite', animationDelay: '0.7s' }} />
        <div className="absolute bottom-[68%] right-[40%] w-14 h-16 bg-gradient-to-b from-[#43A047] to-[#2E7D32] rounded-full" style={{ transformOrigin: 'bottom center', animation: 'gwb-tree-sway 3.9s ease-in-out infinite', animationDelay: '1.2s' }} />
        
        {/* Castle */}
        <div className="absolute bottom-[60%] right-[10%] w-24">
          <div className="w-20 h-24 mx-auto bg-gradient-to-b from-[#F5E6D3] to-[#E8D5C4] relative">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-6 bg-[#4A90A4] rounded-t-full border border-[#D4C4B0]" />
            <div className="absolute top-16 left-1/2 -translate-x-1/2 text-red-400 text-sm">❤</div>
          </div>
          <div className="absolute -left-2 bottom-16 w-8 h-16 bg-gradient-to-b from-[#FFB6C1] to-[#F5E6D3]" style={{ animation: 'gwb-tower-glow 3s ease-in-out infinite' }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-transparent border-b-[#FF69B4]" />
          </div>
          <div className="absolute -right-2 bottom-20 w-8 h-20 bg-gradient-to-b from-[#FFB6C1] to-[#F5E6D3]" style={{ animation: 'gwb-tower-glow 3s ease-in-out infinite', animationDelay: '1.5s' }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-transparent border-b-[#FF69B4]" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="w-1 h-6 bg-[#8B4513]" />
              <div className="absolute top-0 left-1 w-5 h-3 bg-[#FF1493]" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-[45%] right-[35%] w-2 h-20 bg-gradient-to-b from-[#FFD700] to-[#DAA520] rounded-full -rotate-12 opacity-80" />
        <div className="absolute bottom-[55%] right-[50%] text-red-400 text-lg">❤</div>
        <div className="absolute bottom-[70%] right-[25%] text-red-400 text-sm">❤</div>
      </div>
      
      {/* OCEAN / WATER */}
      <div className="absolute bottom-0 left-[25%] right-[25%] h-[20%] overflow-hidden" style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #5DADE2 30%, #3498DB 60%, #2980B9 100%)' }}>
        {[15, 30, 45, 60, 75].map((top, i) => (
          <div key={i} className={`absolute top-[${top}%] left-0 right-0 h-[${i % 2 === 0 ? 2 : 1}px] bg-white/${i % 2 === 0 ? 20 : 15}`} style={{ animation: `gwb-water-ripple ${2.8 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />
        ))}
        <div className="absolute top-[20%] left-[20%] w-8 h-1 bg-white/30 rounded-full" style={{ animation: 'gwb-water-shimmer 2s ease-in-out infinite' }} />
        <div className="absolute top-[50%] left-[50%] w-6 h-1 bg-white/25 rounded-full" style={{ animation: 'gwb-water-shimmer 2.5s ease-in-out infinite', animationDelay: '0.7s' }} />
        <div className="absolute top-[35%] right-[25%] w-10 h-1 bg-white/30 rounded-full" style={{ animation: 'gwb-water-shimmer 2.2s ease-in-out infinite', animationDelay: '1.2s' }} />
      </div>
      
      {/* GROUND - Left */}
      <div className="absolute bottom-0 left-0 w-[30%] h-[18%]">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-[#4CAF50] to-[#388E3C]" />
        <div className="absolute top-3 left-0 right-0 bottom-0 bg-gradient-to-b from-[#8B5A2B] to-[#6B4423]" />
      </div>
      
      {/* GROUND - Right */}
      <div className="absolute bottom-0 right-0 w-[30%] h-[18%]">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-[#4CAF50] to-[#388E3C]" />
        <div className="absolute top-3 left-0 right-0 bottom-0 bg-gradient-to-b from-[#8B5A2B] to-[#6B4423]" />
      </div>
      
      {/* Content overlay */}
      {children}
    </div>
  );
}
