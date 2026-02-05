import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { MainMenu } from './screens/MainMenu';
import { HowToPlayScreen } from './screens/HowToPlayScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { GameEngine } from './game/GameEngine';
import { LevelCompleteScreen } from './screens/LevelCompleteScreen';
import { StoryScreen } from './screens/StoryScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import { FinalEndingScreen } from './screens/FinalEndingScreen';
import { BadgesScreen } from './screens/BadgesScreen';
import { LandscapeHint } from './screens/LandscapeHint';

export function Game() {
  const {
    gameState,
    setScreen,
    setPlayerName,
    startGame,
    startLevel,
    completeLevel,
    nextLevel,
    loseLife,
    collectItem,
    collectFortuneCookie,
    togglePause,
    toggleMusic,
    toggleSfx,
    updateTimer,
    restartGame,
    restartCurrentLevel,
    goToMenu,
  } = useGameState();

  const audio = useAudio(gameState.musicEnabled, gameState.sfxEnabled);

  const [isPortrait, setIsPortrait] = useState(false);
  const [showStoryBefore, setShowStoryBefore] = useState(false);
  const menuMusicStartedRef = useRef(false);

  // Handle menu music - play when on menu screen, stop when leaving
  useEffect(() => {
    if (gameState.screen === 'menu' && gameState.musicEnabled) {
      // Small delay to allow for user interaction first
      const startMusic = () => {
        if (!menuMusicStartedRef.current) {
          audio.initAudio();
          audio.startMenuMusic();
          menuMusicStartedRef.current = true;
        }
      };
      
      // Try to start immediately, or wait for user interaction
      const handleInteraction = () => {
        startMusic();
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };
      
      // Attempt to start, might fail without user gesture
      try {
        startMusic();
      } catch {
        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
      }
      
      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };
    } else if (gameState.screen !== 'menu' && menuMusicStartedRef.current) {
      // Stop menu music with fade when leaving menu
      audio.stopMenuMusic(true);
      menuMusicStartedRef.current = false;
    }
  }, [gameState.screen, gameState.musicEnabled, audio]);

  // Also stop menu music if music is disabled
  useEffect(() => {
    if (!gameState.musicEnabled && menuMusicStartedRef.current) {
      audio.stopMenuMusic(false);
      menuMusicStartedRef.current = false;
    }
  }, [gameState.musicEnabled, audio]);

  // Check orientation
  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode && gameState.screen === 'game');
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [gameState.screen]);

  // Handle level complete -> show story
  const handleLevelCompleteContinue = () => {
    // If we just completed level 7, go straight to final ending
    if (gameState.currentLevel === 7) {
      setScreen('finalEnding');
      return;
    }
    
    // Show story screen after completing levels 1-6
    setShowStoryBefore(false);
    setScreen('story');
  };

  // Handle story continue -> start next level
  const handleStoryContinue = () => {
    if (showStoryBefore) {
      // Story was for before level 7, now start level 7
      startLevel(7);
    } else {
      // Story was after a level, move to next level
      const nextLevelNum = gameState.currentLevel + 1;
      if (nextLevelNum <= 7) {
        if (nextLevelNum === 7) {
          // Show "before level 7" story first
          setShowStoryBefore(true);
          setScreen('story');
        } else {
          startLevel(nextLevelNum);
        }
      }
    }
  };

  // Start game from menu
  const handlePlay = () => {
    audio.initAudio();
    if (gameState.currentLevel === 1) {
      startGame();
    } else {
      startLevel(gameState.currentLevel);
    }
  };

  // Handle pause resume
  const handleResume = () => {
    togglePause();
  };

  // Handle game over restart
  const handleGameOverRestart = () => {
    audio.playGameOver();
    restartGame();
  };

  // Handle losing a life - returns true if game over
  const handleLoseLife = (): boolean => {
    return loseLife();
  };

  // Restart current level after death
  const handleRestartLevel = () => {
    restartCurrentLevel();
  };

  // Show landscape hint during game
  if (isPortrait) {
    return <LandscapeHint />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {gameState.screen === 'menu' && (
        <MainMenu
          playerName={gameState.playerName}
          onPlayerNameChange={setPlayerName}
          onPlay={handlePlay}
          onHowToPlay={() => setScreen('howToPlay')}
          onSettings={() => setScreen('settings')}
        />
      )}

      {gameState.screen === 'howToPlay' && (
        <HowToPlayScreen onBack={goToMenu} />
      )}

      {gameState.screen === 'settings' && (
        <SettingsScreen
          musicEnabled={gameState.musicEnabled}
          sfxEnabled={gameState.sfxEnabled}
          onToggleMusic={toggleMusic}
          onToggleSfx={toggleSfx}
          onBack={goToMenu}
        />
      )}

      {gameState.screen === 'game' && (
        <GameEngine
          currentLevel={gameState.currentLevel}
          lives={gameState.lives}
          score={gameState.score}
          collectibles={gameState.collectibles}
          timeRemaining={gameState.timeRemaining}
          isPaused={gameState.isPaused}
          musicEnabled={gameState.musicEnabled}
          sfxEnabled={gameState.sfxEnabled}
          onPause={togglePause}
          onResume={handleResume}
          onMainMenu={goToMenu}
          onToggleMusic={toggleMusic}
          onToggleSfx={toggleSfx}
          onCollectItem={collectItem}
          onCollectCookie={collectFortuneCookie}
          onLoseLife={handleLoseLife}
          onLevelComplete={completeLevel}
          onUpdateTimer={updateTimer}
          onRestartLevel={handleRestartLevel}
        />
      )}

      {gameState.screen === 'levelComplete' && (
        <LevelCompleteScreen
          level={gameState.currentLevel}
          score={gameState.score}
          collectibles={gameState.collectibles}
          fortuneCookieCollected={gameState.fortuneCookieCollected}
          completedLevels={gameState.completedLevels}
          onContinue={handleLevelCompleteContinue}
        />
      )}

      {gameState.screen === 'story' && (
        <StoryScreen
          level={showStoryBefore ? 7 : gameState.currentLevel}
          playerName={gameState.playerName}
          isBeforeLevel={showStoryBefore}
          onContinue={handleStoryContinue}
        />
      )}

      {gameState.screen === 'gameOver' && (
        <GameOverScreen
          score={gameState.score}
          level={gameState.currentLevel}
          playerName={gameState.playerName}
          onRestart={handleGameOverRestart}
          onMainMenu={goToMenu}
        />
      )}

      {gameState.screen === 'finalEnding' && (
        <FinalEndingScreen
          playerName={gameState.playerName}
          score={gameState.score}
          onPlayAgain={restartGame}
          onMainMenu={goToMenu}
          onBadges={() => setScreen('badges')}
        />
      )}

      {gameState.screen === 'badges' && (
        <BadgesScreen
          completedLevels={gameState.completedLevels}
          onBack={goToMenu}
        />
      )}
    </div>
  );
}
