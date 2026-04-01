import { supabase } from '@/integrations/supabase/client';

export async function submitScore(playerName: string, score: number, levelReached: number) {
  if (!playerName.trim() || score <= 0) return;
  const { error } = await supabase.functions.invoke('submit-score', {
    body: {
      player_name: playerName.trim(),
      score,
      level_reached: levelReached,
    },
  });
  if (error) {
    console.error('Score submission failed');
  }
}
