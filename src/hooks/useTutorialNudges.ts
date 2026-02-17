import { useState, useCallback, useRef, useEffect } from 'react';

export type TutorialNudgeType = 'enemy' | 'rose' | 'shield' | 'cookie' | 'midFlag';

export interface ActiveNudge {
  type: TutorialNudgeType;
  message: string;
  worldX: number;
  worldY: number;
  pauseDuration: number;
  displayDuration: number;
}

const NUDGE_MESSAGES: Record<TutorialNudgeType, string> = {
  enemy: "Hey there… one touch and it's game over 😈",
  rose: "I'm valuable! Grab me for bonus points 🌹",
  shield: "❤️ I protect you from one hit!",
  cookie: "🥠 Extra life unlocked!",
  midFlag: "🚩 I'm mandatory!\nTake me to the end to win.",
};

const NUDGE_CONFIG: Record<TutorialNudgeType, { displayDuration: number; pauseDuration: number }> = {
  enemy: { displayDuration: 2500, pauseDuration: 1400 },
  rose: { displayDuration: 3000, pauseDuration: 0 },
  shield: { displayDuration: 3000, pauseDuration: 0 },
  cookie: { displayDuration: 3000, pauseDuration: 700 },
  midFlag: { displayDuration: 3500, pauseDuration: 1800 },
};

const GAP_MS = 2000;
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

interface QueuedNudge {
  type: TutorialNudgeType;
  worldX: number;
  worldY: number;
}

export function useTutorialNudges(currentLevel: number) {
  const [activeNudge, setActiveNudge] = useState<ActiveNudge | null>(null);
  const [isTutorialPaused, setIsTutorialPaused] = useState(false);
  const seenRef = useRef(getSeenNudges());
  const queueRef = useRef<QueuedNudge[]>([]);
  const activeRef = useRef(false);
  const cooldownRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Use a ref for processQueue to break circular dependency
  const processQueueRef = useRef<() => void>(() => {});

  const showNudge = useCallback((type: TutorialNudgeType, worldX: number, worldY: number) => {
    const config = NUDGE_CONFIG[type];
    activeRef.current = true;

    setActiveNudge({
      type,
      message: NUDGE_MESSAGES[type],
      worldX,
      worldY,
      pauseDuration: config.pauseDuration,
      displayDuration: config.displayDuration,
    });

    // Pause gameplay if needed
    if (config.pauseDuration > 0) {
      setIsTutorialPaused(true);
      const unpauseTimer = setTimeout(() => {
        setIsTutorialPaused(false);
      }, config.pauseDuration);
      timersRef.current.push(unpauseTimer);
    }

    // Dismiss after display duration
    const dismissTimer = setTimeout(() => {
      setActiveNudge(null);
      setIsTutorialPaused(false);
      activeRef.current = false;

      // Cooldown gap before next queued nudge
      cooldownRef.current = true;
      const gapTimer = setTimeout(() => {
        cooldownRef.current = false;
        processQueueRef.current();
      }, GAP_MS);
      timersRef.current.push(gapTimer);
    }, config.displayDuration);
    timersRef.current.push(dismissTimer);
  }, []);

  // Keep processQueueRef in sync
  processQueueRef.current = () => {
    if (activeRef.current || cooldownRef.current) return;
    const next = queueRef.current.shift();
    if (next) {
      showNudge(next.type, next.worldX, next.worldY);
    }
  };

  const triggerNudge = useCallback((type: TutorialNudgeType, worldX: number, worldY: number) => {
    if (currentLevel !== 1) return;
    if (seenRef.current.has(type)) return;

    // Mark as seen immediately to prevent re-triggers
    seenRef.current.add(type);
    markNudgeSeen(type);

    if (activeRef.current || cooldownRef.current) {
      queueRef.current.push({ type, worldX, worldY });
      return;
    }

    showNudge(type, worldX, worldY);
  }, [currentLevel, showNudge]);

  const dismissNudge = useCallback(() => {
    clearAllTimers();
    setActiveNudge(null);
    setIsTutorialPaused(false);
    activeRef.current = false;

    cooldownRef.current = true;
    const gapTimer = setTimeout(() => {
      cooldownRef.current = false;
      processQueueRef.current();
    }, GAP_MS);
    timersRef.current.push(gapTimer);
  }, [clearAllTimers]);

  const canTrigger = useCallback((type: TutorialNudgeType): boolean => {
    if (currentLevel !== 1) return false;
    return !seenRef.current.has(type);
  }, [currentLevel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return {
    activeNudge,
    triggerNudge,
    dismissNudge,
    canTrigger,
    isTutorialPaused,
  };
}
