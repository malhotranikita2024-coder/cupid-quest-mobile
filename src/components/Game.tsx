import React, { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
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
    goToMenu,
  } = useGameState();

  const [isPortrait, setIsPortrait] = useState(false);
  const [showStoryBefore, setShowStoryBefore] = useState(false);

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
    if (gameState.currentLevel < 7) {
      setShowStoryBefore(false);
      setScreen('story');
    } else {
      setScreen('finalEnding');
    }
  };

  // Handle story continue -> start next level
  const handleStoryContinue = () => {
    if (showStoryBefore) {
      startLevel(gameState.currentLevel);
    } else {
      // After level story, move to next level
      const nextLevelNum = gameState.currentLevel + 1;
      if (nextLevelNum <= 7) {
        if (nextLevelNum === 7) {
          // Show "before level 7" story
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
          onLoseLife={loseLife}
          onLevelComplete={completeLevel}
          onUpdateTimer={updateTimer}
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
          onRestart={restartGame}
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
