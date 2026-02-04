import { useState, useCallback, useRef } from 'react';
import { TouchControls } from '@/types/game';

export function useTouchControls() {
  const [controls, setControls] = useState<TouchControls>({
    left: false,
    right: false,
    jump: false,
    run: false,
  });

  const jumpPressedRef = useRef(false);

  const handleLeftStart = useCallback(() => {
    setControls(prev => ({ ...prev, left: true }));
  }, []);

  const handleLeftEnd = useCallback(() => {
    setControls(prev => ({ ...prev, left: false }));
  }, []);

  const handleRightStart = useCallback(() => {
    setControls(prev => ({ ...prev, right: true }));
  }, []);

  const handleRightEnd = useCallback(() => {
    setControls(prev => ({ ...prev, right: false }));
  }, []);

  const handleJumpStart = useCallback(() => {
    if (!jumpPressedRef.current) {
      jumpPressedRef.current = true;
      setControls(prev => ({ ...prev, jump: true }));
    }
  }, []);

  const handleJumpEnd = useCallback(() => {
    jumpPressedRef.current = false;
    setControls(prev => ({ ...prev, jump: false }));
  }, []);

  const handleRunStart = useCallback(() => {
    setControls(prev => ({ ...prev, run: true }));
  }, []);

  const handleRunEnd = useCallback(() => {
    setControls(prev => ({ ...prev, run: false }));
  }, []);

  const resetControls = useCallback(() => {
    jumpPressedRef.current = false;
    setControls({
      left: false,
      right: false,
      jump: false,
      run: false,
    });
  }, []);

  return {
    controls,
    handleLeftStart,
    handleLeftEnd,
    handleRightStart,
    handleRightEnd,
    handleJumpStart,
    handleJumpEnd,
    handleRunStart,
    handleRunEnd,
    resetControls,
  };
}
