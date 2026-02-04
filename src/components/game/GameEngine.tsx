import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { MobileControls } from './MobileControls';
import { GameHUD } from './GameHUD';
import { PauseMenu } from './PauseMenu';
import { useTouchControls } from '@/hooks/useTouchControls';
import { getLevelData, COLLECTIBLE_EMOJIS } from '@/data/levels';
import { PlayerState, LevelData } from '@/types/game';

interface GameEngineProps {
  currentLevel: number;
  lives: number;
  score: number;
  collectibles: number;
  timeRemaining: number;
  isPaused: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onPause: () => void;
  onResume: () => void;
  onMainMenu: () => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onCollectItem: () => void;
  onCollectCookie: () => void;
  onLoseLife: () => void;
  onLevelComplete: () => void;
  onUpdateTimer: (time: number) => void;
}

const INITIAL_PLAYER: PlayerState = {
  x: 100,
  y: 400,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  isRunning: false,
  facingRight: true,
  isGrounded: false,
  isInvincible: false,
  invincibleTimer: 0,
};

export function GameEngine({
  currentLevel,
  lives,
  score,
  collectibles,
  timeRemaining,
  isPaused,
  musicEnabled,
  sfxEnabled,
  onPause,
  onResume,
  onMainMenu,
  onToggleMusic,
  onToggleSfx,
  onCollectItem,
  onCollectCookie,
  onLoseLife,
  onLevelComplete,
  onUpdateTimer,
}: GameEngineProps) {
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [levelData, setLevelData] = useState<LevelData>(() => getLevelData(currentLevel));
  const [cameraX, setCameraX] = useState(0);
  const [checkpointPosition, setCheckpointPosition] = useState({ x: 100, y: 400 });
  
  const timerRef = useRef<NodeJS.Timeout>();
  
  const {
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
  } = useTouchControls();

  // Initialize level
  useEffect(() => {
    const data = getLevelData(currentLevel);
    setLevelData(data);
    setPlayer({ ...INITIAL_PLAYER, x: 100, y: 400 });
    setCameraX(0);
    setCheckpointPosition({ x: 100, y: 400 });
    resetControls();
  }, [currentLevel, resetControls]);

  // Timer countdown
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      onUpdateTimer(Math.max(0, timeRemaining - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, timeRemaining, onUpdateTimer]);

  // Handle time running out
  useEffect(() => {
    if (timeRemaining === 0) {
      onLoseLife();
      // Respawn at checkpoint
      setPlayer(prev => ({
        ...INITIAL_PLAYER,
        x: checkpointPosition.x,
        y: checkpointPosition.y,
      }));
      onUpdateTimer(300); // Reset timer
    }
  }, [timeRemaining, onLoseLife, onUpdateTimer, checkpointPosition]);

  // Keyboard controls (for desktop testing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          handleLeftStart();
          break;
        case 'ArrowRight':
        case 'd':
          handleRightStart();
          break;
        case 'ArrowUp':
        case 'w':
        case ' ':
          handleJumpStart();
          break;
        case 'Shift':
          handleRunStart();
          break;
        case 'Escape':
          onPause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          handleLeftEnd();
          break;
        case 'ArrowRight':
        case 'd':
          handleRightEnd();
          break;
        case 'ArrowUp':
        case 'w':
        case ' ':
          handleJumpEnd();
          break;
        case 'Shift':
          handleRunEnd();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleLeftStart, handleLeftEnd, handleRightStart, handleRightEnd, handleJumpStart, handleJumpEnd, handleRunStart, handleRunEnd, onPause]);

  const handlePlayerUpdate = useCallback((newPlayer: PlayerState) => {
    setPlayer(newPlayer);
  }, []);

  const handleCollectItem = useCallback((index: number) => {
    setLevelData(prev => {
      const newCollectibles = [...prev.collectibles];
      newCollectibles[index] = { ...newCollectibles[index], collected: true };
      return { ...prev, collectibles: newCollectibles };
    });
    onCollectItem();
  }, [onCollectItem]);

  const handleCollectCookie = useCallback((index: number) => {
    setLevelData(prev => {
      const newCollectibles = [...prev.collectibles];
      newCollectibles[index] = { ...newCollectibles[index], collected: true };
      return { ...prev, collectibles: newCollectibles };
    });
    onCollectCookie();
  }, [onCollectCookie]);

  const handleEnemyDefeated = useCallback((index: number) => {
    setLevelData(prev => {
      const newEnemies = [...prev.enemies];
      newEnemies[index] = { ...newEnemies[index], isDefeated: true };
      return { ...prev, enemies: newEnemies };
    });
  }, []);

  const handlePlayerHit = useCallback(() => {
    onLoseLife();
    // Respawn at checkpoint
    setPlayer(prev => ({
      ...INITIAL_PLAYER,
      x: checkpointPosition.x,
      y: checkpointPosition.y,
      isInvincible: true,
      invincibleTimer: 120,
    }));
  }, [onLoseLife, checkpointPosition]);

  const handleCheckpointReached = useCallback(() => {
    setLevelData(prev => ({
      ...prev,
      checkpoint: { ...prev.checkpoint, activated: true },
    }));
    setCheckpointPosition({ x: levelData.checkpoint.x, y: levelData.checkpoint.y - 50 });
  }, [levelData.checkpoint]);

  const handleFlagReached = useCallback(() => {
    setLevelData(prev => ({
      ...prev,
      flag: { ...prev.flag, reached: true },
    }));
    onLevelComplete();
  }, [onLevelComplete]);

  const handleCameraUpdate = useCallback((x: number) => {
    setCameraX(x);
  }, []);

  // Update enemy positions
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setLevelData(prev => {
        const newEnemies = prev.enemies.map(enemy => {
          if (enemy.isDefeated) return enemy;
          
          let newX = enemy.x + enemy.velocityX * enemy.direction;
          let newDirection = enemy.direction;
          
          if (newX <= enemy.patrolStart || newX >= enemy.patrolEnd) {
            newDirection = (enemy.direction * -1) as 1 | -1;
          }
          
          return { ...enemy, x: newX, direction: newDirection };
        });
        
        return { ...prev, enemies: newEnemies };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isPaused]);

  const collectibleEmoji = COLLECTIBLE_EMOJIS[levelData.collectibleType] || '🌹';

  return (
    <div className="fixed inset-0 overflow-hidden game-active">
      <GameCanvas
        levelData={levelData}
        player={player}
        controls={controls}
        onPlayerUpdate={handlePlayerUpdate}
        onCollectItem={handleCollectItem}
        onCollectCookie={handleCollectCookie}
        onEnemyDefeated={handleEnemyDefeated}
        onPlayerHit={handlePlayerHit}
        onCheckpointReached={handleCheckpointReached}
        onFlagReached={handleFlagReached}
        isPaused={isPaused}
        cameraX={cameraX}
        onCameraUpdate={handleCameraUpdate}
      />
      
      <GameHUD
        lives={lives}
        score={score}
        collectibles={collectibles}
        currentLevel={currentLevel}
        timeRemaining={timeRemaining}
        collectibleEmoji={collectibleEmoji}
        onPause={onPause}
      />
      
      <MobileControls
        onLeftStart={handleLeftStart}
        onLeftEnd={handleLeftEnd}
        onRightStart={handleRightStart}
        onRightEnd={handleRightEnd}
        onJumpStart={handleJumpStart}
        onJumpEnd={handleJumpEnd}
        onRunStart={handleRunStart}
        onRunEnd={handleRunEnd}
      />
      
      {isPaused && (
        <PauseMenu
          onResume={onResume}
          onMainMenu={onMainMenu}
          musicEnabled={musicEnabled}
          sfxEnabled={sfxEnabled}
          onToggleMusic={onToggleMusic}
          onToggleSfx={onToggleSfx}
        />
      )}
    </div>
  );
}
