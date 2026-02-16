import { useState, useCallback, useRef } from 'react';

export type TutorialNudgeType = 'enemy' | 'rose' | 'shield' | 'cookie' | 'midFlag';

const NUDGE_MESSAGES: Record<TutorialNudgeType, string> = {
  enemy: "Hey there… one touch and it's game over 😈",
  rose: "I'm valuable! Grab me for bonus points 🌹",
  shield: "❤️ I protect you from one hit!",
  cookie: "🥠 Extra life unlocked!",
  midFlag: "🚩 I'm mandatory!\nTake me to the end to win.",
};

const NUDGE_DURATIONS: Record<TutorialNudgeType, number> = {
  enemy: 3500,
  rose: 3500,
  shield: 3500,
  cookie: 3500,
  midFlag: 5000, // Stays longer to emphasize importance
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
  const [activeNudge, setActiveNudge] = useState<TutorialNudgeType | null>(null);
  const seenRef = useRef(getSeenNudges());
  // Queue to show nudges one at a time
  const queueRef = useRef<TutorialNudgeType[]>([]);
  const isShowingRef = useRef(false);

  const triggerNudge = useCallback((type: TutorialNudgeType) => {
    // Only show in Level 1
    if (currentLevel !== 1) return;
    // Only show each nudge once ever
    if (seenRef.current.has(type)) return;

    // Mark as seen immediately so it won't re-trigger
    seenRef.current.add(type);
    markNudgeSeen(type);

    if (isShowingRef.current) {
      // Queue it
      queueRef.current.push(type);
      return;
    }

    isShowingRef.current = true;
    setActiveNudge(type);
  }, [currentLevel]);

  const dismissNudge = useCallback(() => {
    setActiveNudge(null);
    isShowingRef.current = false;

    // Show next queued nudge after a short gap
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setTimeout(() => {
        isShowingRef.current = true;
        setActiveNudge(next);
      }, 400);
    }
  }, []);

  const nudgeMessage = activeNudge ? NUDGE_MESSAGES[activeNudge] : null;
  const nudgeDuration = activeNudge ? NUDGE_DURATIONS[activeNudge] : 3500;

  return {
    activeNudge,
    nudgeMessage,
    nudgeDuration,
    triggerNudge,
    dismissNudge,
  };
}
