import { useState, useCallback, useRef, useEffect } from 'react';

export type TutorialNudgeType = 'enemy' | 'rose' | 'shield' | 'cookie' | 'midFlag';

export interface EntityTrackingInfo {
  kind: 'enemy' | 'collectible' | 'midFlag';
  initialIndex?: number;
  initialX: number;
  initialY: number;
}

export interface ActiveNudge {
  type: TutorialNudgeType;
  message: string;
  worldX: number;
  worldY: number;
  pauseDuration: number;
  displayDuration: number;
  tracking?: EntityTrackingInfo;
}

const NUDGE_MESSAGES: Record<TutorialNudgeType, string> = {
  enemy: "Hey there… one touch and it's game over 😈",
  rose: "I'm valuable! Grab me for bonus points 🌹",
  shield: "❤️ I protect you from one hit!",
  cookie: "🥠 Extra life unlocked!",
  midFlag: "🚩 I'm mandatory!\nTake me to the end to win.",
};

const NUDGE_CONFIG: Record<TutorialNudgeType, { displayDuration: number; pauseDuration: number }> = {
  enemy: { displayDuration: 3200, pauseDuration: 1500 },
  rose: { displayDuration: 3000, pauseDuration: 0 },
  shield: { displayDuration: 3000, pauseDuration: 0 },
  cookie: { displayDuration: 3000, pauseDuration: 500 },
  midFlag: { displayDuration: 3500, pauseDuration: 1800 },
};

const GAP_MS = 2000;
const STORAGE_KEY = 'slq_tutorial_seen_v5';

/** Check if ?tutorialDebug=1 is in the URL */
function isTutorialDebug(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('tutorialDebug') === '1';
  } catch {
    return false;
  }
}

function getSeenNudges(): Set<TutorialNudgeType> {
  if (isTutorialDebug()) return new Set(); // Debug mode: nothing is "seen"
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set();
}

function markNudgeSeen(type: TutorialNudgeType) {
  if (isTutorialDebug()) return; // Debug mode: don't persist
  try {
    const seen = getSeenNudges();
    seen.add(type);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  } catch {}
}

export function resetTutorialStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

interface QueuedNudge {
  type: TutorialNudgeType;
  worldX: number;
  worldY: number;
  tracking?: EntityTrackingInfo;
}

export interface TutorialDebugInfo {
  mounted: boolean;
  lastTrigger: string | null;
  queueLength: number;
  activeType: string | null;
  seenCount: number;
  debugMode: boolean;
}

export function useTutorialNudges(currentLevel: number) {
  const [activeNudge, setActiveNudge] = useState<ActiveNudge | null>(null);
  const [isTutorialPaused, setIsTutorialPaused] = useState(false);
  const debugMode = useRef(isTutorialDebug()).current;
  const seenRef = useRef(getSeenNudges());
  const queueRef = useRef<QueuedNudge[]>([]);
  const activeRef = useRef(false);
  const cooldownRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTriggerRef = useRef<string | null>(null);

  // Re-check seen on every render in debug mode (so reset button works instantly)
  if (debugMode) {
    seenRef.current = new Set();
  }

  const [debugInfo, setDebugInfo] = useState<TutorialDebugInfo>({
    mounted: true,
    lastTrigger: null,
    queueLength: 0,
    activeType: null,
    seenCount: 0,
    debugMode,
  });

  // Keep debug info in sync
  useEffect(() => {
    if (!debugMode) return;
    const interval = setInterval(() => {
      setDebugInfo({
        mounted: true,
        lastTrigger: lastTriggerRef.current,
        queueLength: queueRef.current.length,
        activeType: activeRef.current ? (activeNudge?.type ?? null) : null,
        seenCount: seenRef.current.size,
        debugMode: true,
      });
    }, 500);
    return () => clearInterval(interval);
  }, [debugMode, activeNudge]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const processQueueRef = useRef<() => void>(() => {});

  const showNudge = useCallback((type: TutorialNudgeType, worldX: number, worldY: number, tracking?: EntityTrackingInfo) => {
    const config = NUDGE_CONFIG[type];
    activeRef.current = true;

    setActiveNudge({
      type,
      message: NUDGE_MESSAGES[type],
      worldX,
      worldY,
      pauseDuration: config.pauseDuration,
      displayDuration: config.displayDuration,
      tracking,
    });

    if (config.pauseDuration > 0) {
      setIsTutorialPaused(true);
      const unpauseTimer = setTimeout(() => {
        setIsTutorialPaused(false);
      }, config.pauseDuration);
      timersRef.current.push(unpauseTimer);
    }

    const dismissTimer = setTimeout(() => {
      setActiveNudge(null);
      setIsTutorialPaused(false);
      activeRef.current = false;

      cooldownRef.current = true;
      const gapTimer = setTimeout(() => {
        cooldownRef.current = false;
        processQueueRef.current();
      }, GAP_MS);
      timersRef.current.push(gapTimer);
    }, config.displayDuration);
    timersRef.current.push(dismissTimer);
  }, []);

  processQueueRef.current = () => {
    if (activeRef.current || cooldownRef.current) return;
    const next = queueRef.current.shift();
    if (next) {
      showNudge(next.type, next.worldX, next.worldY, next.tracking);
    }
  };

  const updateNudgePosition = useCallback((worldX: number, worldY: number) => {
    setActiveNudge(prev => prev ? { ...prev, worldX, worldY } : null);
  }, []);

  const triggerNudge = useCallback((type: TutorialNudgeType, worldX: number, worldY: number, tracking?: EntityTrackingInfo) => {
    if (currentLevel !== 1) return;

    // In debug mode, allow re-triggering but still prevent duplicate active/queued
    if (!debugMode && seenRef.current.has(type)) return;
    if (debugMode && (activeRef.current && activeNudge?.type === type)) return;

    // Mark as seen (no-op in debug mode)
    seenRef.current.add(type);
    markNudgeSeen(type);

    lastTriggerRef.current = `${type} @ ${Date.now()}`;

    if (activeRef.current || cooldownRef.current) {
      // Don't double-queue same type in debug mode
      if (!queueRef.current.some(q => q.type === type)) {
        queueRef.current.push({ type, worldX, worldY, tracking });
      }
      return;
    }

    showNudge(type, worldX, worldY, tracking);
  }, [currentLevel, showNudge, debugMode, activeNudge]);

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
    if (debugMode) return true; // Always eligible in debug mode
    return !seenRef.current.has(type);
  }, [currentLevel, debugMode]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return {
    activeNudge,
    triggerNudge,
    dismissNudge,
    canTrigger,
    isTutorialPaused,
    updateNudgePosition,
    debugInfo: debugMode ? debugInfo : null,
  };
}
