import { useState, useCallback, useRef } from 'react';

export type TutorialNudgeType = 'enemy' | 'rose' | 'shield' | 'cookie' | 'midFlag';

export interface ActiveNudge {
  type: TutorialNudgeType;
  message: string;
  worldX: number;
  worldY: number;
  pauseGame: boolean;
  duration: number;
}

const NUDGE_MESSAGES: Record<TutorialNudgeType, string> = {
  enemy: "Hey there… one touch and it's game over 😈",
  rose: "I'm valuable! Grab me for bonus points 🌹",
  shield: "❤️ I protect you from one hit!",
  cookie: "🥠 Extra life unlocked!",
  midFlag: "🚩 I'm mandatory!\nTake me to the end to win.",
};

const NUDGE_CONFIG: Record<TutorialNudgeType, { duration: number; pauseGame: boolean }> = {
  enemy: { duration: 2000, pauseGame: true },
  rose: { duration: 3500, pauseGame: false },
  shield: { duration: 3500, pauseGame: false },
  cookie: { duration: 3500, pauseGame: false },
  midFlag: { duration: 3000, pauseGame: true },
};

const STORAGE_KEY = 'slq_tutorial_seen';

function getSeenNudges(): Set<TutorialNudgeType> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set();
}

function markNudgeSeen(type: TutorialNudgeType) {
  try {
    const seen = getSeenNudges();
    seen.add(type);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  } catch {}
}

export function useTutorialNudges(currentLevel: number) {
  const [activeNudge, setActiveNudge] = useState<ActiveNudge | null>(null);
  const seenRef = useRef(getSeenNudges());
  const dismissTimerRef = useRef<NodeJS.Timeout>();

  const triggerNudge = useCallback((type: TutorialNudgeType, worldX: number, worldY: number) => {
    if (currentLevel !== 1) return;
    if (seenRef.current.has(type)) return;
    // Don't interrupt an active nudge
    if (dismissTimerRef.current) return;

    seenRef.current.add(type);
    markNudgeSeen(type);

    const config = NUDGE_CONFIG[type];
    const nudge: ActiveNudge = {
      type,
      message: NUDGE_MESSAGES[type],
      worldX,
      worldY,
      pauseGame: config.pauseGame,
      duration: config.duration,
    };

    setActiveNudge(nudge);

    dismissTimerRef.current = setTimeout(() => {
      setActiveNudge(null);
      dismissTimerRef.current = undefined;
    }, config.duration);
  }, [currentLevel]);

  const dismissNudge = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = undefined;
    }
    setActiveNudge(null);
  }, []);

  const canTrigger = useCallback((type: TutorialNudgeType): boolean => {
    if (currentLevel !== 1) return false;
    if (seenRef.current.has(type)) return false;
    if (dismissTimerRef.current) return false;
    return true;
  }, [currentLevel]);

  return {
    activeNudge,
    triggerNudge,
    dismissNudge,
    canTrigger,
    isTutorialPaused: activeNudge?.pauseGame ?? false,
  };
}
