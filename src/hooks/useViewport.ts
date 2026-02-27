import { useState, useEffect } from 'react';

/** Check if we're on a mobile game device (touch + small screen) */
export function getIsMobileGame(): boolean {
  return window.innerWidth < 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

/** Get game scale — always 1.0. Mobile shows cropped desktop view, not scaled down. */
export function getMobileGameScale(): number {
  return 1;
}

/** Get vertical camera offset for mobile — dynamically follows player to keep them visible */
export function getMobileCameraY(playerY: number = 400): number {
  if (!getIsMobileGame()) return 0;
  const height = window.innerHeight;
  if (height >= 720) return 0;
  // Center player vertically in the visible area, clamped to world bounds
  const targetY = playerY - height / 2 + 25; // 25 ≈ PLAYER_HEIGHT / 2
  return Math.max(0, Math.min(720 - height, targetY));
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
