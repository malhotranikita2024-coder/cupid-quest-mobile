import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  level_reached: number;
  created_at: string;
}

interface LeaderboardScreenProps {
  onBack: () => void;
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(20);
      setEntries(data || []);
      setLoading(false);
    };
    fetchScores();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 text-center font-bold text-sm opacity-60">{index + 1}</span>;
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(180deg, #6BA3D6 0%, #E8C8D8 75%, #F0B8C8 100%)' }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-6 relative"
        style={{
          background: 'linear-gradient(180deg, #FFF8F0 0%, #FFEFD5 50%, #FFE4C4 100%)',
          border: '3px solid #DEB887',
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full transition-transform hover:scale-110"
          style={{
            background: 'linear-gradient(180deg, #FFE082 0%, #FFD54F 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-[#5D4E37]" />
        </button>

        <div className="text-center mb-4">
          <span className="text-3xl">🏆</span>
          <h2
            className="font-display text-2xl font-black mt-1"
            style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #E69500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LEADERBOARD
          </h2>
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <p className="text-center text-[#5D4E37] opacity-60 py-8">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-center text-[#5D4E37] opacity-60 py-8">No scores yet. Be the first! 💕</p>
          ) : (
            entries.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{
                  background: i < 3
                    ? 'linear-gradient(90deg, rgba(255,215,0,0.15), transparent)'
                    : 'rgba(255,255,255,0.5)',
                  border: i === 0 ? '2px solid #FFD700' : '1px solid rgba(222,184,135,0.3)',
                }}
              >
                <div className="flex-shrink-0 w-6 flex justify-center">
                  {getRankIcon(i)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[#5D4E37] truncate text-sm">
                    {entry.player_name}
                  </p>
                  <p className="text-xs text-[#5D4E37] opacity-50">
                    Level {entry.level_reached}
                  </p>
                </div>
                <div className="font-display font-bold text-[#E69500] text-sm">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
