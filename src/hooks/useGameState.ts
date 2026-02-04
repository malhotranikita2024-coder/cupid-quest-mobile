import { useState, useCallback } from 'react';
import { GameState, GameScreen } from '@/types/game';

const INITIAL_STATE: GameState = {
  screen: 'menu',
  playerName: '',
  currentLevel: 1,
  lives: 3,
  score: 0,
  collectibles: 0,
  fortuneCookieCollected: false,
  completedLevels: [],
  musicEnabled: true,
  sfxEnabled: true,
  isPaused: false,
  timeRemaining: 300, // 5 minutes in seconds
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  const setScreen = useCallback((screen: GameScreen) => {
    setGameState(prev => ({ ...prev, screen }));
  }, []);

  const setPlayerName = useCallback((name: string) => {
    setGameState(prev => ({ ...prev, playerName: name }));
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      screen: 'game',
      isPaused: false,
      collectibles: 0,
      fortuneCookieCollected: false,
      timeRemaining: 300,
    }));
  }, []);

  const startLevel = useCallback((level: number) => {
    setGameState(prev => ({
      ...prev,
      currentLevel: level,
      screen: 'game',
      collectibles: 0,
      fortuneCookieCollected: false,
      timeRemaining: 300,
      isPaused: false,
    }));
  }, []);

  const completeLevel = useCallback(() => {
    setGameState(prev => {
      const newCompleted = prev.completedLevels.includes(prev.currentLevel)
        ? prev.completedLevels
        : [...prev.completedLevels, prev.currentLevel];
      
      return {
        ...prev,
        completedLevels: newCompleted,
        screen: prev.currentLevel === 7 ? 'finalEnding' : 'levelComplete',
      };
    });
  }, []);

  const nextLevel = useCallback(() => {
    setGameState(prev => {
      if (prev.currentLevel >= 7) {
        return { ...prev, screen: 'finalEnding' };
      }
      return {
        ...prev,
        currentLevel: prev.currentLevel + 1,
        screen: 'story',
      };
    });
  }, []);

  const loseLife = useCallback(() => {
    setGameState(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        return { ...prev, lives: 0, screen: 'gameOver' };
      }
      return { ...prev, lives: newLives };
    });
  }, []);

  const addLife = useCallback(() => {
    setGameState(prev => ({ ...prev, lives: prev.lives + 1 }));
  }, []);

  const addScore = useCallback((points: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + points }));
  }, []);

  const collectItem = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      collectibles: prev.collectibles + 1,
      score: prev.score + 100,
    }));
  }, []);

  const collectFortuneCookie = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      fortuneCookieCollected: true,
      lives: prev.lives + 1,
      score: prev.score + 500,
    }));
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const toggleMusic = useCallback(() => {
    setGameState(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }));
  }, []);

  const toggleSfx = useCallback(() => {
    setGameState(prev => ({ ...prev, sfxEnabled: !prev.sfxEnabled }));
  }, []);

  const updateTimer = useCallback((time: number) => {
    setGameState(prev => ({ ...prev, timeRemaining: time }));
  }, []);

  const restartGame = useCallback(() => {
    setGameState({
      ...INITIAL_STATE,
      playerName: gameState.playerName,
      musicEnabled: gameState.musicEnabled,
      sfxEnabled: gameState.sfxEnabled,
    });
  }, [gameState.playerName, gameState.musicEnabled, gameState.sfxEnabled]);

  const goToMenu = useCallback(() => {
    setGameState(prev => ({ ...prev, screen: 'menu' }));
  }, []);

  return {
    gameState,
    setScreen,
    setPlayerName,
    startGame,
    startLevel,
    completeLevel,
    nextLevel,
    loseLife,
    addLife,
    addScore,
    collectItem,
    collectFortuneCookie,
    togglePause,
    toggleMusic,
    toggleSfx,
    updateTimer,
    restartGame,
    goToMenu,
  };
}
