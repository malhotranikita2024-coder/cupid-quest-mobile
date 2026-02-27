import { useState, useEffect } from 'react';

/** Check if we're on a mobile game device (touch + small screen) */
export function getIsMobileGame(): boolean {
  return window.innerWidth < 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

/** Get game scale — 1.0 on desktop, scaled on mobile to fit without extreme squeeze */
export function getMobileGameScale(): number {
  if (!getIsMobileGame()) return 1;
  // Use 500 as base so mobile doesn't squeeze as much (shows ~500px of world height)
  return Math.min(1, window.innerHeight / 500);
}

/** Get vertical camera offset for mobile — keeps ground visible by showing bottom of world */
export function getMobileCameraY(): number {
  if (!getIsMobileGame()) return 0;
  const scale = getMobileGameScale();
  const visibleHeight = window.innerHeight / scale;
  if (visibleHeight >= 720) return 0;
  return Math.max(0, 720 - visibleHeight);
}

export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isPortrait: boolean;
}

export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: getIsMobileGame(),
    isPortrait: window.innerHeight > window.innerWidth,
  }));

  useEffect(() => {
    const update = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: getIsMobileGame(),
        isPortrait: window.innerHeight > window.innerWidth,
      });
    };

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return viewport;
}
