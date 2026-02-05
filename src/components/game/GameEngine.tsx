import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { MobileControls } from './MobileControls';
import { GameHUD } from './GameHUD';
import { PauseMenu } from './PauseMenu';
import { useTouchControls } from '@/hooks/useTouchControls';
import { useAudio } from '@/hooks/useAudio';
import { getLevelData, COLLECTIBLE_EMOJIS } from '@/data/levels';
import { PlayerState, LevelData, Collectible, Fireball } from '@/types/game';

interface GameEngineProps {
  currentLevel: number;
  lives: number;
  score: number;
  collectibles: number;
  timeRemaining: number;
  isPaused: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  hasShield: boolean;
  onPause: () => void;
  onResume: () => void;
  onMainMenu: () => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onCollectItem: () => void;
  onCollectCookie: () => void;
  onCollectShield: () => void;
  onUseShield: () => void;
  onCollectBurst: (amount?: number) => void;
  onLoseLife: () => boolean;
  onLevelComplete: () => void;
  onUpdateTimer: (time: number) => void;
  onRestartLevel: () => void;
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
  hasShield,
  onPause,
  onResume,
  onMainMenu,
  onToggleMusic,
  onToggleSfx,
  onCollectItem,
  onCollectCookie,
  onCollectShield,
  onUseShield,
  onCollectBurst,
  onLoseLife,
  onLevelComplete,
  onUpdateTimer,
  onRestartLevel,
}: GameEngineProps) {
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [levelData, setLevelData] = useState<LevelData>(() => getLevelData(currentLevel));
  const [cameraX, setCameraX] = useState(0);
  const [checkpointPosition, setCheckpointPosition] = useState({ x: 100, y: 400 });
  const [showDeathOverlay, setShowDeathOverlay] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const deathTimeoutRef = useRef<NodeJS.Timeout>();
  
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

  const audio = useAudio(musicEnabled, sfxEnabled);

  // Store audio functions in refs to avoid dependency issues
  const audioRef = useRef(audio);
  audioRef.current = audio;

  // Initialize level and start music
  useEffect(() => {
    const data = getLevelData(currentLevel);
    setLevelData(data);
    setPlayer({ ...INITIAL_PLAYER, x: 100, y: 400 });
    setCameraX(0);
    setCheckpointPosition({ x: 100, y: 400 });
    resetControls();
    setShowDeathOverlay(false);
    
    // Start background music
    audioRef.current.initAudio();
    // Small delay to ensure audio context is ready
    const musicTimeout = setTimeout(() => {
      audioRef.current.startBackgroundMusic();
    }, 100);
    
    return () => {
      clearTimeout(musicTimeout);
      audioRef.current.stopBackgroundMusic();
    };
  }, [currentLevel, resetControls]);

  // Timer countdown
  useEffect(() => {
    if (isPaused || showDeathOverlay) return;

    timerRef.current = setInterval(() => {
      onUpdateTimer(Math.max(0, timeRemaining - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, showDeathOverlay, timeRemaining, onUpdateTimer]);

  // Handle time running out
  useEffect(() => {
    if (timeRemaining === 0 && !showDeathOverlay) {
      handlePlayerDeath();
    }
  }, [timeRemaining]);

  // Update pipe enemies
  useEffect(() => {
    if (isPaused || showDeathOverlay) return;

    const interval = setInterval(() => {
      setLevelData(prev => {
        const newPipes = prev.pipes.map(pipe => {
          // Handle fire pipes
          if (pipe.hasFire) {
            let newFireTimer = (pipe.fireTimer || 0) + 1;
            let newFireActive = pipe.fireActive || false;
            
            // Fire shoots every 3 seconds (180 frames), stays on for 1.5 seconds
            if (newFireTimer >= 180) {
              newFireActive = true;
              if (newFireTimer >= 270) {
                newFireActive = false;
                newFireTimer = 0;
              }
            }
            
            return { ...pipe, fireTimer: newFireTimer, fireActive: newFireActive };
          }
          
          if (!pipe.hasEnemy) return pipe;
          
          let newTimer = pipe.enemyTimer + 1;
          let newVisible = pipe.enemyVisible;
          let newDirection = pipe.enemyDirection;
          
          // Pop out every ~2-4 seconds, stay visible longer for readability
          if (newTimer >= 120) {
            if (!newVisible && newDirection === 'up') {
              newVisible = true;
              newDirection = 'down';
              newTimer = 0;
            }
          }
          // Stay visible for 2 seconds before retreating
          if (newVisible && newDirection === 'down' && newTimer >= 120) {
              newVisible = false;
              newDirection = 'up';
              newTimer = 0;
          }
          
          return { ...pipe, enemyTimer: newTimer, enemyVisible: newVisible, enemyDirection: newDirection };
        });
        
        return { ...prev, pipes: newPipes };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isPaused, showDeathOverlay]);

  // Update enemy fireballs
  useEffect(() => {
    if (isPaused || showDeathOverlay) return;

    const interval = setInterval(() => {
      setLevelData(prev => {
        // Update existing fireballs
        let newFireballs = (prev.fireballs || []).map(fb => {
          if (!fb.isActive) return fb;
          const newX = fb.x + fb.velocityX;
          // Deactivate if off screen
          if (newX < cameraX - 100 || newX > cameraX + window.innerWidth + 100) {
            return { ...fb, isActive: false };
          }
          return { ...fb, x: newX };
        }).filter(fb => fb.isActive);

        // Check if enemies should shoot
        const newEnemies = prev.enemies.map(enemy => {
          if (enemy.isDefeated || !enemy.canShoot || enemy.isGrouped) return enemy;
          
          let newShootTimer = (enemy.shootTimer || 0) + 1;
          
          // Shoot every 2-3 seconds based on level
          const shootInterval = 180 - (prev.id * 10); // Faster at higher levels
          
          if (newShootTimer >= Math.max(120, shootInterval)) {
            // Spawn fireball
            const direction = enemy.direction;
            newFireballs.push({
              x: enemy.x + (direction === 1 ? enemy.width : 0),
              y: enemy.y + enemy.height / 2,
              velocityX: direction * 4,
              width: 20,
              height: 20,
              isActive: true,
            });
            newShootTimer = 0;
          }
          
          return { ...enemy, shootTimer: newShootTimer };
        });

        return { ...prev, fireballs: newFireballs, enemies: newEnemies };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isPaused, showDeathOverlay, cameraX]);

  // Update hit block bounce timers
  useEffect(() => {
    if (isPaused || showDeathOverlay) return;

    const interval = setInterval(() => {
      setLevelData(prev => {
        const newBlocks = prev.hitBlocks.map(block => {
          if (block.bounceTimer > 0) {
            return { ...block, bounceTimer: block.bounceTimer - 1 };
          }
          return block;
        });
        return { ...prev, hitBlocks: newBlocks };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isPaused, showDeathOverlay]);

  // Update falling hazards
  useEffect(() => {
    if (isPaused || showDeathOverlay) return;

    const interval = setInterval(() => {
      setLevelData(prev => {
        const newHazards = prev.fallingHazards.map(hazard => {
          if (!hazard.isActive) return hazard;
          
          // Trigger falling when player is near
          if (!hazard.isFalling && player.x >= hazard.triggerX - 50 && player.x <= hazard.triggerX + 100) {
            return { ...hazard, isFalling: true };
          }
          
          // Update falling position
          if (hazard.isFalling) {
            const newVelocity = hazard.velocityY + 0.5;
            const newY = hazard.y + newVelocity;
            
            // Deactivate when off screen
            if (newY > 700) {
              return { ...hazard, isActive: false };
            }
            
            return { ...hazard, y: newY, velocityY: newVelocity };
          }
          
          return hazard;
        });
        
        return { ...prev, fallingHazards: newHazards };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isPaused, showDeathOverlay, player.x]);

  // Update enemy positions
  useEffect(() => {
    if (isPaused || showDeathOverlay) return;

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
  }, [isPaused, showDeathOverlay]);

  // Update moving platforms
  useEffect(() => {
    if (isPaused || showDeathOverlay) return;

    const interval = setInterval(() => {
      setLevelData(prev => {
        const newPlatforms = prev.platforms.map(platform => {
          if (platform.type !== 'moving' || !platform.originalX || !platform.originalY) return platform;
          
          const time = Date.now() / 1000;
          const speed = platform.moveSpeed || 2;
          const range = platform.moveRange || 100;
          
          if (platform.moveDirection === 'horizontal') {
            const newX = platform.originalX + Math.sin(time * speed) * range;
            return { ...platform, x: newX };
          } else {
            const newY = platform.originalY + Math.sin(time * speed) * range;
            return { ...platform, y: newY };
          }
        });
        
        return { ...prev, platforms: newPlatforms };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isPaused, showDeathOverlay]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDeathOverlay) return;
      
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
  }, [handleLeftStart, handleLeftEnd, handleRightStart, handleRightEnd, handleJumpStart, handleJumpEnd, handleRunStart, handleRunEnd, onPause, showDeathOverlay]);

  const handlePlayerDeath = useCallback(() => {
    if (showDeathOverlay) return;
    
    audio.playDeath();
    setShowDeathOverlay(true);
    
    // After death animation, either restart level or game over
    deathTimeoutRef.current = setTimeout(() => {
      const isGameOver = onLoseLife();
      if (!isGameOver) {
        // Restart current level from beginning
        setShowDeathOverlay(false);
        onRestartLevel();
      }
    }, 1500);
  }, [audio, onLoseLife, onRestartLevel, showDeathOverlay]);

  const handlePlayerUpdate = useCallback((newPlayer: PlayerState) => {
    setPlayer(newPlayer);
  }, []);

  const handleCollectItem = useCallback((index: number) => {
    setLevelData(prev => {
      const newCollectibles = [...prev.collectibles];
      newCollectibles[index] = { ...newCollectibles[index], collected: true };
      return { ...prev, collectibles: newCollectibles };
    });
    audio.playCollect();
    onCollectItem();
  }, [audio, onCollectItem]);

  const handleCollectCookie = useCallback((index: number) => {
    setLevelData(prev => {
      const newCollectibles = [...prev.collectibles];
      newCollectibles[index] = { ...newCollectibles[index], collected: true };
      return { ...prev, collectibles: newCollectibles };
    });
    audio.playCookieCollect();
    onCollectCookie();
  }, [audio, onCollectCookie]);

  const handleCollectShield = useCallback((index: number) => {
    setLevelData(prev => {
      const newCollectibles = [...prev.collectibles];
      newCollectibles[index] = { ...newCollectibles[index], collected: true };
      return { ...prev, collectibles: newCollectibles };
    });
    // If already has shield, convert to burst reward instead
    if (hasShield) {
      audio.playCollect();
      onCollectBurst(5);
    } else {
      audio.playCookieCollect(); // Special sound for shield
      onCollectShield();
    }
  }, [audio, hasShield, onCollectShield, onCollectBurst]);

  const handleCollectBurst = useCallback((index: number) => {
    setLevelData(prev => {
      const newCollectibles = [...prev.collectibles];
      newCollectibles[index] = { ...newCollectibles[index], collected: true };
      return { ...prev, collectibles: newCollectibles };
    });
    audio.playCookieCollect(); // Special sound for burst
    onCollectBurst(5); // +5 collectibles
  }, [audio, onCollectBurst]);

  const handleEnemyDefeated = useCallback((index: number) => {
    setLevelData(prev => {
      const newEnemies = [...prev.enemies];
      newEnemies[index] = { ...newEnemies[index], isDefeated: true };
      return { ...prev, enemies: newEnemies };
    });
    audio.playEnemyStomp();
  }, [audio]);

  const handlePlayerHit = useCallback(() => {
    // If player has shield, absorb the hit instead of dying
    if (hasShield) {
      onUseShield();
      audio.playBlockHit(); // Play a sound for shield absorption
      return;
    }
    handlePlayerDeath();
  }, [handlePlayerDeath, hasShield, onUseShield, audio]);

  const handleBlockHit = useCallback((index: number) => {
    setLevelData(prev => {
      const newBlocks = [...prev.hitBlocks];
      const block = newBlocks[index];
      
      if (block.isHit) return prev;
      
      newBlocks[index] = { ...block, isHit: true, bounceTimer: 15 };
      
      // Spawn MOVING collectible if block has contents
      let newCollectibles = [...prev.collectibles];
      if (block.contents === 'burst') {
        // Burst reward: spawn larger glowing collectible worth +5
        newCollectibles.push({
          x: block.x + block.width / 2,
          y: block.y - 30,
          type: prev.collectibleType as any,
          collected: false,
          animationOffset: 0,
          fromBlock: true,
          velocityX: 1.5,
          velocityY: -6,
          isBurst: true,
          sparkleTimer: 60,
        });
      } else if (block.contents === 'shield') {
        // Shield reward: spawn heart power-up
        newCollectibles.push({
          x: block.x + block.width / 2,
          y: block.y - 30,
          type: 'shield',
          collected: false,
          animationOffset: 0,
          fromBlock: true,
          velocityX: 0,
          velocityY: -7,
        });
      } else if (block.contents === 'collectible') {
        // Legacy support for 'collectible' type
        newCollectibles.push({
          x: block.x + block.width / 2,
          y: block.y - 30,
          type: prev.collectibleType as any,
          collected: false,
          animationOffset: 0,
          fromBlock: true,
          velocityX: 2,
          velocityY: -5,
        });
      } else if (block.contents === 'cookie') {
        newCollectibles.push({
          x: block.x + block.width / 2,
          y: block.y - 30,
          type: 'cookie',
          collected: false,
          animationOffset: 0,
          fromBlock: true,
          velocityX: 0,
          velocityY: -8,
        });
      }
      // 'none' content = empty block, no collectible spawned
      
      return { ...prev, hitBlocks: newBlocks, collectibles: newCollectibles };
    });
    audio.playBlockHit();
  }, [audio]);

  const handleJump = useCallback(() => {
    audio.playJump();
  }, [audio]);

  const handleCheckpointReached = useCallback(() => {
    setLevelData(prev => ({
      ...prev,
      checkpoint: { ...prev.checkpoint, activated: true },
    }));
    setCheckpointPosition({ x: levelData.checkpoint.x, y: levelData.checkpoint.y - 50 });
    audio.playCheckpoint();
  }, [levelData.checkpoint, audio]);

  const handleFlagReached = useCallback(() => {
    setLevelData(prev => ({
      ...prev,
      flag: { ...prev.flag, reached: true },
    }));
    audio.playLevelComplete();
    audio.stopBackgroundMusic();
    onLevelComplete();
  }, [audio, onLevelComplete]);

  const handleCameraUpdate = useCallback((x: number) => {
    setCameraX(x);
  }, []);

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
        onCollectShield={handleCollectShield}
        onCollectBurst={handleCollectBurst}
        onEnemyDefeated={handleEnemyDefeated}
        onPlayerHit={handlePlayerHit}
        onCheckpointReached={handleCheckpointReached}
        onFlagReached={handleFlagReached}
        onBlockHit={handleBlockHit}
        onJump={handleJump}
        isPaused={isPaused || showDeathOverlay}
        cameraX={cameraX}
        onCameraUpdate={handleCameraUpdate}
        onFireballHit={handlePlayerHit}
        hasShield={hasShield}
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
      
      {!showDeathOverlay && (
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
      )}
      
      {isPaused && !showDeathOverlay && (
        <PauseMenu
          onResume={onResume}
          onMainMenu={onMainMenu}
          musicEnabled={musicEnabled}
          sfxEnabled={sfxEnabled}
          onToggleMusic={onToggleMusic}
          onToggleSfx={onToggleSfx}
        />
      )}
      
      {/* Death overlay */}
      {showDeathOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">💔</div>
            <div className="retro-text text-4xl text-white">OUCH!</div>
          </div>
        </div>
      )}
    </div>
  );
}
