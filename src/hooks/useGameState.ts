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
  timeRemaining: 300,
  hasFinishedGame: false,
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

  // Called when player reaches the flag
  const completeLevel = useCallback(() => {
    setGameState(prev => {
      const newCompleted = prev.completedLevels.includes(prev.currentLevel)
        ? prev.completedLevels
        : [...prev.completedLevels, prev.currentLevel];
      
      // If completing level 7, mark game as finished
      const isLevel7 = prev.currentLevel === 7;
      
      return {
        ...prev,
        completedLevels: newCompleted,
        hasFinishedGame: isLevel7 ? true : prev.hasFinishedGame,
        screen: isLevel7 ? 'finalEnding' : 'levelComplete',
      };
    });
  }, []);

  // Called to advance to next level (after story screen)
  const nextLevel = useCallback(() => {
    setGameState(prev => {
      // Never go past level 7
      if (prev.currentLevel >= 7) {
        return { ...prev, screen: 'finalEnding', hasFinishedGame: true };
      }
      return {
        ...prev,
        currentLevel: prev.currentLevel + 1,
        screen: 'story',
      };
    });
  }, []);

  // Called when player loses a life - returns true if game over
  const loseLife = useCallback((): boolean => {
    let isGameOver = false;
    setGameState(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        isGameOver = true;
        return { ...prev, lives: 0, screen: 'gameOver' };
      }
      // Just reduce life, don't change screen - level restarts handled elsewhere
      return { ...prev, lives: newLives };
    });
    return isGameOver;
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

  // Full game restart - back to level 1 with 3 lives
  const restartGame = useCallback(() => {
    setGameState(prev => ({
      ...INITIAL_STATE,
      playerName: prev.playerName,
      musicEnabled: prev.musicEnabled,
      sfxEnabled: prev.sfxEnabled,
    }));
  }, []);

  // Restart current level (after death, keeps current lives)
  const restartCurrentLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      screen: 'game',
      collectibles: 0,
      fortuneCookieCollected: false,
      timeRemaining: 300,
      isPaused: false,
    }));
  }, []);

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
    restartCurrentLevel,
    goToMenu,
  };
}
