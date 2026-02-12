import { supabase } from '@/integrations/supabase/client';

export async function submitScore(playerName: string, score: number, levelReached: number) {
  if (!playerName.trim() || score <= 0) return;
  await supabase.from('leaderboard').insert({
    player_name: playerName.trim(),
    score,
    level_reached: levelReached,
  });
}
