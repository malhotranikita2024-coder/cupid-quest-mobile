
-- Leaderboard table for persisting high scores
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  level_reached INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can view the leaderboard
CREATE POLICY "Leaderboard is publicly readable"
ON public.leaderboard
FOR SELECT
USING (true);

-- Anyone can submit scores (no auth required for casual game)
CREATE POLICY "Anyone can submit scores"
ON public.leaderboard
FOR INSERT
WITH CHECK (true);

-- Create index for fast top-scores queries
CREATE INDEX idx_leaderboard_score ON public.leaderboard (score DESC);
