import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { MobileControls } from './MobileControls';
import { GameHUD } from './GameHUD';
import { PauseMenu } from './PauseMenu';
import { TutorialNudge } from './TutorialNudge';
import { TutorialDebugOverlay } from './TutorialDebugOverlay';
import { LevelTitleOverlay } from './LevelTitleOverlay';
import { setTutorialDebugMode } from '@/hooks/useTutorialNudges';
import { useTouchControls } from '@/hooks/useTouchControls';
import { useAudio } from '@/hooks/useAudio';
import { useTutorialNudges } from '@/hooks/useTutorialNudges';
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
  const [isPlantingFlag, setIsPlantingFlag] = useState(false);
  const [isDying, setIsDying] = useState(false);
  const [showNeedFlagMessage, setShowNeedFlagMessage] = useState(false);
  const [showLevelCompleteOverlay, setShowLevelCompleteOverlay] = useState(false);
  const [showLevelTitle, setShowLevelTitle] = useState(false);
  const [debugIntroText, setDebugIntroText] = useState<string | null>(null);
  const [debugIntroElapsed, setDebugIntroElapsed] = useState(0);
  const debugIntroTimerRef = useRef<NodeJS.Timeout>();
  const debugIntroStartRef = useRef(0);
  const debugIntroRafRef = useRef<number>();
  const [fireworkParticles, setFireworkParticles] = useState<Array<{id: number; x: number; y: number; vx: number; vy: number; color: string; life: number; size: number}>>([]);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const deathTimeoutRef = useRef<NodeJS.Timeout>();
  const plantingTimeoutRef = useRef<NodeJS.Timeout>();
  // Synchronous death lock ref - prevents race conditions with async state updates
  const isDeathLockedRef = useRef(false);
  // Track which level the title overlay has already been shown for
  const levelTitleShownForRef = useRef<number | null>(null);
  
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
  const { activeNudge, triggerNudge, dismissNudge, canTrigger, isTutorialPaused, updateNudgePosition, debugInfo } = useTutorialNudges(currentLevel);

  // Keyboard shortcut to toggle tutorial debug: Ctrl+Shift+T
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        const isNowDebug = !debugInfo?.debugMode;
        setTutorialDebugMode(isNowDebug);
        if (isNowDebug) {
          // Force re-render by reloading to pick up debug state
          window.location.reload();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [debugInfo?.debugMode]);

  // Store audio functions in refs to avoid dependency issues
  const audioRef = useRef(audio);
  audioRef.current = audio;

  // LEVEL START SPAWN POSITION - always respawn here
  const LEVEL_START_SPAWN = { x: 100, y: 400 };

  // Initialize level and start music
  useEffect(() => {
    const data = getLevelData(currentLevel);
    setLevelData(data);
    // ALWAYS spawn at level start position
    setPlayer({ ...INITIAL_PLAYER, x: LEVEL_START_SPAWN.x, y: LEVEL_START_SPAWN.y });
    setCameraX(0);
    // Remove checkpoint usage - we always restart from level start
    setCheckpointPosition(LEVEL_START_SPAWN);
    resetControls();
    setShowDeathOverlay(false);
    
    // Only show level title overlay for NEW level entries, not retries
    if (levelTitleShownForRef.current !== currentLevel) {
      setShowLevelTitle(true);
      levelTitleShownForRef.current = currentLevel;
    } else {
      setShowLevelTitle(false);
    }

    // DEBUG: Always show debug intro proof on every level load
    const debugMsg = `INTRO DEBUG: Level ${currentLevel} World ${currentLevel} (timestamp: ${Date.now()})`;
    setDebugIntroText(debugMsg);
    debugIntroStartRef.current = performance.now();
    if (debugIntroTimerRef.current) clearTimeout(debugIntroTimerRef.current);
    if (debugIntroRafRef.current) cancelAnimationFrame(debugIntroRafRef.current);
    const tickDebug = () => {
      setDebugIntroElapsed(Math.round(performance.now() - debugIntroStartRef.current));
      debugIntroRafRef.current = requestAnimationFrame(tickDebug);
    };
    debugIntroRafRef.current = requestAnimationFrame(tickDebug);
    debugIntroTimerRef.current = setTimeout(() => {
      setDebugIntroText(null);
      if (debugIntroRafRef.current) cancelAnimationFrame(debugIntroRafRef.current);
    }, 3000);
    
    setIsDying(false); // Reset death lock on level start
    isDeathLockedRef.current = false; // Reset synchronous death lock
    
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

   // Update burst collectibles (movement, bouncing, expiry)
   useEffect(() => {
     if (isPaused || showDeathOverlay) return;

     const EXPIRY_TIME = 4000; // 4 seconds
     const FADE_DURATION = 300; // 0.3 seconds burst

     const interval = setInterval(() => {
       const now = Date.now();
       
       setLevelData(prev => {
         const newCollectibles = prev.collectibles.map(collectible => {
           // Skip non-burst items, collected items, and shield items (shields don't expire)
           if (collectible.collected) return collectible;
           if (!collectible.isBurst && collectible.type !== 'shield') return collectible;
           if (!collectible.fromBlock) return collectible;

           // Initialize spawn time if not set
           let spawnTime = collectible.spawnTime || now;
           if (!collectible.spawnTime) {
             return { ...collectible, spawnTime: now };
           }

           // Check expiry
           const elapsed = now - spawnTime;
           if (elapsed >= EXPIRY_TIME) {
             // Start fade out or mark as collected
             if (collectible.isExpiring) {
               const fadeElapsed = elapsed - EXPIRY_TIME;
               if (fadeElapsed >= FADE_DURATION) {
                 // Fully expired - mark as collected (no points)
                 return { ...collectible, collected: true };
               }
               return { ...collectible, expiryProgress: fadeElapsed / FADE_DURATION };
             }
             return { ...collectible, isExpiring: true, expiryProgress: 0 };
           }

           // Physics: apply gravity and movement
           let newVelX = collectible.velocityX || 0;
           let newVelY = collectible.velocityY || 0;
           let grounded = collectible.isGrounded || false;

           // Apply gravity if not grounded
           if (!grounded) {
             newVelY += 0.4; // Gravity
             if (newVelY > 10) newVelY = 10; // Terminal velocity
           }

            // Apply movement
            let newX = collectible.x + newVelX;
            let newY = collectible.y + newVelY;

           // Check platform collisions
           for (const platform of prev.platforms) {
             const collectibleBottom = newY + 20;
             const collectibleTop = newY - 20;
             const collectibleLeft = newX - 15;
             const collectibleRight = newX + 15;

             const platTop = platform.y;
             const platBottom = platform.y + platform.height;
             const platLeft = platform.x;
             const platRight = platform.x + platform.width;

             // Landing on platform
             if (
               collectibleBottom >= platTop &&
               collectibleBottom <= platTop + 15 &&
               collectibleRight > platLeft &&
               collectibleLeft < platRight &&
               newVelY >= 0
             ) {
               newY = platTop - 20;
               newVelY = 0;
               grounded = true;
             }

             // Side collisions - bounce off walls
             if (grounded && collectibleBottom > platTop + 5 && collectibleTop < platBottom - 5) {
               if (collectibleRight > platLeft && collectibleLeft < platLeft && newVelX > 0) {
                 newX = platLeft - 15;
                 newVelX = -newVelX * 0.8; // Bounce with friction
               }
               if (collectibleLeft < platRight && collectibleRight > platRight && newVelX < 0) {
                 newX = platRight + 15;
                 newVelX = -newVelX * 0.8; // Bounce with friction
               }
             }
           }

           // Check hit block collisions (bounce off blocks)
           for (const block of prev.hitBlocks) {
             const collectibleLeft = newX - 15;
             const collectibleRight = newX + 15;
             const collectibleBottom = newY + 20;
             const collectibleTop = newY - 20;

             const blockTop = block.y;
             const blockBottom = block.y + block.height;
             const blockLeft = block.x;
             const blockRight = block.x + block.width;

             // Landing on block
             if (
               collectibleBottom >= blockTop &&
               collectibleBottom <= blockTop + 15 &&
               collectibleRight > blockLeft &&
               collectibleLeft < blockRight &&
               newVelY >= 0
             ) {
               newY = blockTop - 20;
               newVelY = 0;
               grounded = true;
             }

             // Side collisions - bounce
             if (grounded && collectibleBottom > blockTop + 5 && collectibleTop < blockBottom - 5) {
               if (collectibleRight > blockLeft && collectibleLeft < blockLeft && newVelX > 0) {
                 newX = blockLeft - 15;
                 newVelX = -newVelX * 0.8;
               }
               if (collectibleLeft < blockRight && collectibleRight > blockRight && newVelX < 0) {
                 newX = blockRight + 15;
                 newVelX = -newVelX * 0.8;
               }
             }
           }

           // Check pipe collisions (bounce off pipes)
           for (const pipe of prev.pipes) {
             const collectibleLeft = newX - 15;
             const collectibleRight = newX + 15;
             const collectibleBottom = newY + 20;
             const collectibleTop = newY - 20;

             const pipeTop = pipe.y;
             const pipeBottom = pipe.y + pipe.height;
             const pipeLeft = pipe.x;
             const pipeRight = pipe.x + pipe.width;

             // Landing on pipe
             if (
               collectibleBottom >= pipeTop &&
               collectibleBottom <= pipeTop + 15 &&
               collectibleRight > pipeLeft + 5 &&
               collectibleLeft < pipeRight - 5 &&
               newVelY >= 0
             ) {
               newY = pipeTop - 20;
               newVelY = 0;
               grounded = true;
             }

             // Side collisions - bounce
             if (collectibleBottom > pipeTop + 10 && collectibleTop < pipeBottom - 5) {
               if (collectibleRight > pipeLeft && collectibleLeft < pipeLeft && newVelX > 0) {
                 newX = pipeLeft - 15;
                 newVelX = -newVelX * 0.8;
               }
               if (collectibleLeft < pipeRight && collectibleRight > pipeRight && newVelX < 0) {
                 newX = pipeRight + 15;
                 newVelX = -newVelX * 0.8;
               }
             }
           }

           // Edge of level boundaries
           if (newX < 30) {
             newX = 30;
             newVelX = Math.abs(newVelX) * 0.8;
           }
           if (newX > prev.levelWidth - 30) {
             newX = prev.levelWidth - 30;
             newVelX = -Math.abs(newVelX) * 0.8;
           }

           // Check if fell into pit - remove
           if (newY > 700) {
             return { ...collectible, collected: true };
           }

           // Apply friction when grounded
           if (grounded) {
              newVelX *= 0.99;
              // Keep minimum speed when grounded
              if (Math.abs(newVelX) < 2) {
                newVelX = newVelX >= 0 ? 2.5 : -2.5;
             }
           }

           return {
             ...collectible,
             x: newX,
             y: newY,
             velocityX: newVelX,
             velocityY: newVelY,
             isGrounded: grounded,
           };
         });

         return { ...prev, collectibles: newCollectibles };
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

  // Tutorial: enemy nudge - visible in viewport AND player within ~250px proximity
  useEffect(() => {
    if (currentLevel !== 1 || isPaused || showDeathOverlay) return;
    if (!canTrigger('enemy')) return;

    const screenWidth = window.innerWidth;
    const playerCenterX = player.x + 20; // PLAYER_WIDTH / 2

    for (let i = 0; i < levelData.enemies.length; i++) {
      const enemy = levelData.enemies[i];
      if (enemy.isDefeated) continue;
      const enemyCenterX = enemy.x + enemy.width / 2;
      // Must be visible in viewport
      if (enemy.x + enemy.width < cameraX || enemy.x > cameraX + screenWidth) continue;
      // Must be within ~250px of player
      const dist = Math.abs(playerCenterX - enemyCenterX);
      if (dist <= 250) {
        triggerNudge('enemy', enemyCenterX, enemy.y - 20, { kind: 'enemy', initialIndex: i, initialX: enemy.x, initialY: enemy.y });
        break;
      }
    }
  }, [cameraX, player.x, currentLevel, levelData.enemies, isPaused, showDeathOverlay, canTrigger, triggerNudge]);

  // Tutorial: mid-flag nudge - trigger on approach (~220px) BEFORE pickup
  useEffect(() => {
    if (currentLevel !== 1 || isPaused || showDeathOverlay) return;
    if (!canTrigger('midFlag')) return;
    if (levelData.midFlag.collected) return;

    const screenWidth = window.innerWidth;
    const mfx = levelData.midFlag.x;
    const mfy = levelData.midFlag.y;
    // Must be visible in viewport
    if (mfx + 30 < cameraX || mfx > cameraX + screenWidth) return;

    const playerCenterX = player.x + 20;
    const dist = Math.abs(playerCenterX - mfx);
    if (dist <= 220) {
      triggerNudge('midFlag', mfx + 15, mfy - 15, { kind: 'midFlag', initialX: mfx, initialY: mfy });
    }
  }, [cameraX, player.x, currentLevel, levelData.midFlag, isPaused, showDeathOverlay, canTrigger, triggerNudge]);

  // Tutorial: cookie nudge - trigger when cookie first enters camera viewport
  useEffect(() => {
    if (currentLevel !== 1 || isPaused || showDeathOverlay) return;
    if (!canTrigger('cookie')) return;

    const screenWidth = window.innerWidth;
    for (let i = 0; i < levelData.collectibles.length; i++) {
      const c = levelData.collectibles[i];
      if (c.collected || c.type !== 'cookie') continue;
      // Check if visible in viewport
      if (c.x > cameraX && c.x < cameraX + screenWidth) {
        triggerNudge('cookie', c.x, c.y - 25, { kind: 'collectible', initialIndex: i, initialX: c.x, initialY: c.y });
        break;
      }
    }
  }, [cameraX, currentLevel, levelData.collectibles, isPaused, showDeathOverlay, canTrigger, triggerNudge]);

  // Tutorial: live-track moving entities so bubble follows them
  // SAFE: never dismiss due to viewport exit; only dismiss on collect/defeat/despawn
  useEffect(() => {
    if (!activeNudge?.tracking) return;
    const { kind, initialIndex, initialX, initialY } = activeNudge.tracking;

    // Fallback position: anchor near player
    const playerFallbackX = player.x + 20;
    const playerFallbackY = player.y - 60;

    if (kind === 'enemy') {
      let enemy = initialIndex !== undefined ? levelData.enemies[initialIndex] : undefined;
      if (enemy && enemy.isDefeated) {
        // Enemy was defeated → dismiss
        dismissNudge();
        return;
      }
      if (!enemy || enemy.isDefeated) {
        enemy = levelData.enemies.find(e => !e.isDefeated && Math.abs(e.x - initialX) < 200 && Math.abs(e.y - initialY) < 100);
      }
      if (enemy && !enemy.isDefeated) {
        updateNudgePosition(enemy.x + enemy.width / 2, enemy.y - 20);
      } else {
        // Entity not found (despawned) but NOT defeated → fallback to player
        updateNudgePosition(playerFallbackX, playerFallbackY);
      }
    } else if (kind === 'collectible') {
      let collectible = initialIndex !== undefined ? levelData.collectibles[initialIndex] : undefined;
      if (collectible && collectible.collected) {
        // Collected → dismiss
        dismissNudge();
        return;
      }
      if (!collectible || collectible.collected) {
        collectible = levelData.collectibles.find(c => !c.collected && Math.abs(c.x - initialX) < 200 && Math.abs(c.y - initialY) < 100);
      }
      if (collectible && !collectible.collected) {
        updateNudgePosition(collectible.x, collectible.y - 25);
      } else {
        // Not found → fallback to player
        updateNudgePosition(playerFallbackX, playerFallbackY);
      }
    } else if (kind === 'midFlag') {
      if (levelData.midFlag.collected) {
        dismissNudge();
        return;
      }
      updateNudgePosition(levelData.midFlag.x + 15, levelData.midFlag.y - 15);
    }
  }, [activeNudge, levelData.enemies, levelData.collectibles, levelData.midFlag, cameraX, player.x, player.y, dismissNudge, updateNudgePosition]);

  const handlePlayerDeath = useCallback(() => {
    // SYNCHRONOUS death lock check using ref - prevents race conditions
    // This is critical because React state updates are async
    if (isDeathLockedRef.current) return;
    
    // Also check state-based locks as fallback
    if (showDeathOverlay || isDying) return;
    
    // Engage SYNCHRONOUS death lock IMMEDIATELY - this is the first line of defense
    isDeathLockedRef.current = true;
    
    // Also set state-based lock
    setIsDying(true);
    
    // Freeze player completely to prevent any further collisions/triggers
    setPlayer(prev => ({ 
      ...prev, 
      velocityX: 0, 
      velocityY: 0,
      // Clamp position to prevent falling further
      y: Math.min(prev.y, 700)
    }));
    
    audio.playDeath();
    setShowLevelTitle(false); // Kill any active level title overlay on death
    setShowDeathOverlay(true);
    
    // Clear any existing death timeout
    if (deathTimeoutRef.current) {
      clearTimeout(deathTimeoutRef.current);
    }
    
    // After death animation (~1 second), either restart level or game over
    deathTimeoutRef.current = setTimeout(() => {
      const isGameOver = onLoseLife();
      if (!isGameOver) {
        // FORCE RESPAWN AT LEVEL START - reload level data and reset everything
        const freshLevelData = getLevelData(currentLevel);
        setLevelData(freshLevelData);
        
        // Reset player to LEVEL START position (x: 100, y: 400)
        setPlayer({ 
          ...INITIAL_PLAYER, 
          x: 100, 
          y: 400 
        });
        
        // Reset camera to start
        setCameraX(0);
        
        // Reset controls
        resetControls();
        
        // Clear ALL death locks (both ref and state)
        isDeathLockedRef.current = false;
        setShowDeathOverlay(false);
        setIsDying(false);
        
        // Notify parent to reset level-specific state (collectibles, shield, etc.)
        onRestartLevel();
      }
      // If game over, death locks stay true (screen changes to game over)
    }, 1000);
  }, [audio, onLoseLife, onRestartLevel, showDeathOverlay, isDying, currentLevel, resetControls]);

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
       audio.playShieldActivate();
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
    // SYNCHRONOUS check using ref - prevents multiple hits in same frame
    if (isDeathLockedRef.current) return;
    
    // Ignore hits if already dying (state-based lock as fallback)
    if (isDying || showDeathOverlay) return;
    
    // If player has shield, absorb the hit instead of dying
    if (hasShield) {
      onUseShield();
      audio.playBlockHit(); // Play a sound for shield absorption
      return;
    }
    handlePlayerDeath();
  }, [handlePlayerDeath, hasShield, onUseShield, audio, isDying, showDeathOverlay]);

  const handleBlockHit = useCallback((index: number) => {
    setLevelData(prev => {
      const newBlocks = [...prev.hitBlocks];
      const block = newBlocks[index];
      
      if (block.isHit) return prev;
      
      newBlocks[index] = { ...block, isHit: true, bounceTimer: 15 };
      
      // Spawn MOVING collectible if block has contents
      let newCollectibles = [...prev.collectibles];
      if (block.contents === 'burst') {
         const direction = Math.random() > 0.5 ? 1 : -1;
        newCollectibles.push({
          x: block.x + block.width / 2,
           y: block.y - 40,
          type: prev.collectibleType as any,
          collected: false,
          animationOffset: 0,
          fromBlock: true,
           velocityX: direction * (4 + Math.random() * 2),
           velocityY: -8,
          isBurst: true,
          sparkleTimer: 60,
           spawnTime: Date.now(),
           isGrounded: false,
        });
        // Tutorial nudge for rose/collectible popping from block - track the newly added collectible
        const newIdx = newCollectibles.length - 1;
        triggerNudge('rose', block.x + block.width / 2, block.y - 50, { kind: 'collectible', initialIndex: newIdx, initialX: block.x + block.width / 2, initialY: block.y - 40 });
      } else if (block.contents === 'shield') {
         const direction = Math.random() > 0.5 ? 1 : -1;
        newCollectibles.push({
          x: block.x + block.width / 2,
           y: block.y - 40,
          type: 'shield',
          collected: false,
          animationOffset: 0,
          fromBlock: true,
           velocityX: direction * (4 + Math.random() * 2),
           velocityY: -8,
           isBurst: true,
           spawnTime: Date.now(),
           isGrounded: false,
        });
        // Tutorial nudge for shield popping from block
        const shieldIdx = newCollectibles.length - 1;
        triggerNudge('shield', block.x + block.width / 2, block.y - 50, { kind: 'collectible', initialIndex: shieldIdx, initialX: block.x + block.width / 2, initialY: block.y - 40 });
      } else if (block.contents === 'collectible') {
         const direction = Math.random() > 0.5 ? 1 : -1;
        newCollectibles.push({
          x: block.x + block.width / 2,
           y: block.y - 40,
          type: prev.collectibleType as any,
          collected: false,
          animationOffset: 0,
          fromBlock: true,
           velocityX: direction * (4 + Math.random() * 2),
           velocityY: -8,
           isBurst: true,
           spawnTime: Date.now(),
           isGrounded: false,
        });
        // Tutorial nudge for rose/collectible popping from block
        const collectIdx = newCollectibles.length - 1;
        triggerNudge('rose', block.x + block.width / 2, block.y - 50, { kind: 'collectible', initialIndex: collectIdx, initialX: block.x + block.width / 2, initialY: block.y - 40 });
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
           isBurst: false,
        });
        // Tutorial nudge for cookie popping from block
        const cookieIdx = newCollectibles.length - 1;
        triggerNudge('cookie', block.x + block.width / 2, block.y - 50, { kind: 'collectible', initialIndex: cookieIdx, initialX: block.x + block.width / 2, initialY: block.y - 30 });
      }
      // 'none' content = empty block, no collectible spawned
      
      return { ...prev, hitBlocks: newBlocks, collectibles: newCollectibles };
    });
    audio.playBlockHit();
  }, [audio, triggerNudge]);

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
    if (isPlantingFlag) return;
    
    setIsPlantingFlag(true);
    setLevelData(prev => ({
      ...prev,
      flag: { ...prev.flag, isPlanting: true, plantProgress: 0 },
    }));
    audio.playCheckpoint();
    
    // Run planting animation (1.5 seconds)
    let progress = 0;
    const plantInterval = setInterval(() => {
      progress += 3;
      setLevelData(prev => ({
        ...prev,
        flag: { ...prev.flag, plantProgress: progress },
      }));
      
      // Spawn firework particles during planting
      if (progress % 12 === 0) {
        const flagScreenX = levelData.flag.x - cameraX + 20;
        const flagScreenY = 120;
        const colors = ['#FF69B4', '#FFD700', '#FF1493', '#00FF7F', '#FF6347', '#DA70D6', '#87CEEB'];
        const newParticles = Array.from({ length: 8 }, (_, i) => ({
          id: Date.now() + i + progress,
          x: flagScreenX + (Math.random() - 0.5) * 200,
          y: flagScreenY + Math.random() * 80,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 4 - 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 60 + Math.random() * 40,
          size: 3 + Math.random() * 4,
        }));
        setFireworkParticles(prev => [...prev, ...newParticles]);
      }
      
      if (progress >= 100) {
        clearInterval(plantInterval);
        setLevelData(prev => ({
          ...prev,
          flag: { ...prev.flag, reached: true, isPlanting: false, plantedFlag: true },
        }));
        setIsPlantingFlag(false);
        audio.playLevelComplete();
        audio.stopBackgroundMusic();
        
        // Big firework burst at completion
        const flagScreenX = levelData.flag.x - cameraX + 20;
        const colors = ['#FF69B4', '#FFD700', '#FF1493', '#00FF7F', '#FF6347', '#DA70D6', '#87CEEB', '#FFF'];
        const burstParticles = Array.from({ length: 30 }, (_, i) => {
          const angle = (i / 30) * Math.PI * 2;
          const speed = 2 + Math.random() * 5;
          return {
            id: Date.now() + 1000 + i,
            x: flagScreenX,
            y: 100,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 80 + Math.random() * 40,
            size: 3 + Math.random() * 5,
          };
        });
        setFireworkParticles(prev => [...prev, ...burstParticles]);
        
        // Show Level Complete overlay after a beat
        setTimeout(() => {
          setShowLevelCompleteOverlay(true);
        }, 800);
        
        // Auto-continue after 4 seconds
        setTimeout(() => {
          setShowLevelCompleteOverlay(false);
          setFireworkParticles([]);
          onLevelComplete();
        }, 4000);
      }
    }, 45);
    
    plantingTimeoutRef.current = plantInterval as unknown as NodeJS.Timeout;
  }, [audio, onLevelComplete, isPlantingFlag, levelData.flag.x, cameraX]);

  const handleFlagReachedNoFlag = useCallback(() => {
    if (showNeedFlagMessage) return;
    setShowNeedFlagMessage(true);
    // Shake the flag pole with decrementing timer
    let shakeVal = 30;
    setLevelData(prev => ({
      ...prev,
      flag: { ...prev.flag, shakeTimer: shakeVal },
    }));
    const shakeInterval = setInterval(() => {
      shakeVal -= 1;
      if (shakeVal <= 0) {
        clearInterval(shakeInterval);
        setLevelData(prev => ({ ...prev, flag: { ...prev.flag, shakeTimer: 0 } }));
      } else {
        setLevelData(prev => ({ ...prev, flag: { ...prev.flag, shakeTimer: shakeVal } }));
      }
    }, 30);
    setTimeout(() => setShowNeedFlagMessage(false), 2500);
  }, [showNeedFlagMessage]);

  const handleMidFlagCollected = useCallback(() => {
    setLevelData(prev => ({
      ...prev,
      midFlag: { ...prev.midFlag, collected: true },
    }));
    audio.playCheckpoint();
  }, [audio]);

  const handleCameraUpdate = useCallback((x: number) => {
    setCameraX(x);
  }, []);

  const collectibleEmoji = COLLECTIBLE_EMOJIS[levelData.collectibleType] || '🌹';
  // Firework particle animation
  useEffect(() => {
    if (fireworkParticles.length === 0) return;
    const interval = setInterval(() => {
      setFireworkParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.08,
            life: p.life - 1,
            size: p.size * 0.98,
          }))
          .filter(p => p.life > 0)
      );
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [fireworkParticles.length > 0]);

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
        onFlagReachedNoFlag={handleFlagReachedNoFlag}
        onMidFlagCollected={handleMidFlagCollected}
        onBlockHit={handleBlockHit}
        onJump={handleJump}
        isPaused={isPaused || showDeathOverlay || isDying || isTutorialPaused}
        cameraX={cameraX}
        onCameraUpdate={handleCameraUpdate}
        onFireballHit={handlePlayerHit}
        hasShield={hasShield}
        hasMidFlag={levelData.midFlag.collected}
        isPlantingFlag={isPlantingFlag}
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

      {/* Tutorial nudges - Level 1 only, anchored to world objects */}
      {activeNudge && (
        <TutorialNudge
          nudge={activeNudge}
          cameraX={cameraX}
        />
      )}

      {/* Tutorial debug overlay - always mounted, shows when debug mode active */}
      {debugInfo?.debugMode && (
        <TutorialDebugOverlay info={debugInfo} levelId={currentLevel} />
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

      {/* Firework particles overlay */}
      {fireworkParticles.length > 0 && (
        <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
          {fireworkParticles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                opacity: Math.min(1, p.life / 30),
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Level title cinematic overlay */}
      {showLevelTitle && (
        <LevelTitleOverlay
          key={`level-title-${currentLevel}`}
          level={levelData.id}
          levelName={levelData.name}
          collectibleEmoji={levelData.collectibleEmoji}
          onComplete={() => setShowLevelTitle(false)}
        />
      )}

      {/* DEBUG: Big centered intro proof overlay */}
      {debugIntroText && (
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          <div
            style={{
              background: 'rgba(255, 0, 0, 0.85)',
              color: '#fff',
              fontSize: '28px',
              fontWeight: 'bold',
              padding: '30px 40px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '4px solid #ff0',
              maxWidth: '90vw',
            }}
          >
            {debugIntroText}
          </div>
        </div>
      )}

      {/* DEBUG: Persistent tiny top-left debug line */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: 60,
          left: 8,
          zIndex: 9999,
          color: '#0f0',
          fontSize: '12px',
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 6px',
          borderRadius: '4px',
        }}
      >
        introActive={showLevelTitle ? 'true' : 'false'} elapsedMs={debugIntroElapsed}
      </div>

      {showNeedFlagMessage && (
        <div className="fixed inset-x-0 top-24 z-50 flex justify-center pointer-events-none animate-fade-in">
          <div className="bg-black/80 text-white px-6 py-3 rounded-2xl text-lg font-display flex items-center gap-2 shadow-lg border border-white/20">
            <span className="text-2xl">🚩</span>
            You need the flag to finish!
          </div>
        </div>
      )}

      {/* Level Complete overlay */}
      {showLevelCompleteOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <div className="font-display text-5xl text-white mb-2" style={{ textShadow: '0 0 20px rgba(255,215,0,0.8), 0 2px 4px rgba(0,0,0,0.5)' }}>
              Level Complete!
            </div>
            <div className="text-3xl mt-2">🎉✨🎊</div>
            <button
              onClick={() => {
                setShowLevelCompleteOverlay(false);
                setFireworkParticles([]);
                onLevelComplete();
              }}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-display text-lg rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white/30"
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
