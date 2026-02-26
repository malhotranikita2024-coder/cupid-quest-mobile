import { useState, useEffect } from 'react';

const BASE_HEIGHT = 720;

/** Compute the game scale factor: 1 on desktop, <1 on short mobile screens */
export function getGameScale(): number {
  return Math.min(1, window.innerHeight / BASE_HEIGHT);
}

/** Get virtual (game-world) dimensions after scaling */
export function getVirtualDimensions() {
  const scale = getGameScale();
  return {
    scale,
    virtualWidth: window.innerWidth / scale,
    virtualHeight: window.innerHeight / scale,
  };
}

export interface ViewportInfo {
  width: number;
  height: number;
  scale: number;
  virtualWidth: number;
  virtualHeight: number;
  isMobile: boolean;
  isPortrait: boolean;
}

export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(() => {
    const dims = getVirtualDimensions();
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      ...dims,
      isMobile: window.innerWidth <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
      isPortrait: window.innerHeight > window.innerWidth,
    };
  });

  useEffect(() => {
    const update = () => {
      const dims = getVirtualDimensions();
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        ...dims,
        isMobile: window.innerWidth <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
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
