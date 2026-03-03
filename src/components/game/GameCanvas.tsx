import React, { useRef, useEffect, useCallback } from 'react';
import { PlayerState, TouchControls, LevelData, HitBlock, Pipe, FallingHazard, Fireball, LevelFlag, MidLevelFlag } from '@/types/game';
import { COLLECTIBLE_EMOJIS } from '@/data/levels';

interface GameCanvasProps {
  levelData: LevelData;
  player: PlayerState;
  controls: TouchControls;
  onPlayerUpdate: (player: PlayerState) => void;
  onCollectItem: (index: number) => void;
  onCollectCookie: (index: number) => void;
  onCollectShield: (index: number) => void;
  onCollectBurst: (index: number) => void;
  onEnemyDefeated: (index: number) => void;
  onPlayerHit: () => void;
  onCheckpointReached: () => void;
  onFlagReached: () => void;
  onFlagReachedNoFlag: () => void;
  onMidFlagCollected: () => void;
  onBlockHit: (index: number) => void;
  onJump: () => void;
  isPaused: boolean;
  cameraX: number;
  onCameraUpdate: (x: number) => void;
  onFireballHit?: () => void;
  hasShield: boolean;
  hasMidFlag: boolean;
  isPlantingFlag: boolean;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -14;
const WALK_SPEED = 5;
const RUN_SPEED = 8;
const MAX_FALL_SPEED = 15;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 50;

export function GameCanvas({
  levelData,
  player,
  controls,
  onPlayerUpdate,
  onCollectItem,
  onCollectCookie,
  onCollectShield,
  onCollectBurst,
  onEnemyDefeated,
  onPlayerHit,
  onCheckpointReached,
  onFlagReached,
  onFlagReachedNoFlag,
  onMidFlagCollected,
  onBlockHit,
  onJump,
  isPaused,
  cameraX,
  onCameraUpdate,
  onFireballHit,
  hasShield,
  hasMidFlag,
  isPlantingFlag,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const wasJumpingRef = useRef(false);

  // Dust particle system
  interface DustParticle {
    x: number; y: number;
    vx: number; vy: number;
    life: number; maxLife: number;
    size: number;
  }
  const dustParticlesRef = useRef<DustParticle[]>([]);
  const lastDustSpawnRef = useRef(0);
  const wasGroundedRef = useRef(true);
  
  interface SquishEntry { x: number; y: number; type: string; elapsed: number; duration: number; }
  const squishParticlesRef = useRef<SquishEntry[]>([]);

  const updatePlayer = useCallback(() => {
    if (isPaused) return;
    
    // Freeze player during flag planting animation
    if (isPlantingFlag) return;

    let newPlayer = { ...player };
    
    // Horizontal movement
    const speed = controls.run ? RUN_SPEED : WALK_SPEED;
    if (controls.left) {
      newPlayer.velocityX = -speed;
      newPlayer.facingRight = false;
    } else if (controls.right) {
      newPlayer.velocityX = speed;
      newPlayer.facingRight = true;
    } else {
      newPlayer.velocityX *= 0.8;
      if (Math.abs(newPlayer.velocityX) < 0.1) newPlayer.velocityX = 0;
    }

    // Jumping
    if (controls.jump && newPlayer.isGrounded && !newPlayer.isJumping) {
      newPlayer.velocityY = JUMP_FORCE;
      newPlayer.isJumping = true;
      newPlayer.isGrounded = false;
      if (!wasJumpingRef.current) {
        onJump();
        wasJumpingRef.current = true;
      }
    }
    if (!controls.jump) {
      wasJumpingRef.current = false;
    }

    // Apply gravity
    newPlayer.velocityY += GRAVITY;
    if (newPlayer.velocityY > MAX_FALL_SPEED) {
      newPlayer.velocityY = MAX_FALL_SPEED;
    }

    // Update position
    newPlayer.x += newPlayer.velocityX;
    newPlayer.y += newPlayer.velocityY;

    // Platform collision
    let onGround = false;
    for (const platform of levelData.platforms) {
      const playerBottom = newPlayer.y + PLAYER_HEIGHT;
      const playerTop = newPlayer.y;
      const playerLeft = newPlayer.x;
      const playerRight = newPlayer.x + PLAYER_WIDTH;
      
      const platTop = platform.y;
      const platBottom = platform.y + platform.height;
      const platLeft = platform.x;
      const platRight = platform.x + platform.width;

      // Ground collision
      if (
        playerBottom >= platTop &&
        playerBottom <= platTop + 20 &&
        playerRight > platLeft &&
        playerLeft < platRight &&
        newPlayer.velocityY >= 0
      ) {
        newPlayer.y = platTop - PLAYER_HEIGHT;
        newPlayer.velocityY = 0;
        newPlayer.isGrounded = true;
        newPlayer.isJumping = false;
        onGround = true;
      }

      // Side collisions
      if (playerBottom > platTop + 5 && playerTop < platBottom - 5) {
        if (playerRight > platLeft && playerLeft < platLeft && newPlayer.velocityX > 0) {
          newPlayer.x = platLeft - PLAYER_WIDTH;
          newPlayer.velocityX = 0;
        }
        if (playerLeft < platRight && playerRight > platRight && newPlayer.velocityX < 0) {
          newPlayer.x = platRight;
          newPlayer.velocityX = 0;
        }
      }

      // Bottom collision (hitting head)
      if (
        playerTop <= platBottom &&
        playerTop >= platBottom - 10 &&
        playerRight > platLeft &&
        playerLeft < platRight &&
        newPlayer.velocityY < 0
      ) {
        newPlayer.y = platBottom;
        newPlayer.velocityY = 0;
      }
    }

    // Hit block collision from below
    levelData.hitBlocks.forEach((block, index) => {
      if (block.isHit) return;
      
      const playerTop = newPlayer.y;
      const playerLeft = newPlayer.x;
      const playerRight = newPlayer.x + PLAYER_WIDTH;
      
      const blockBottom = block.y + block.height;
      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;

      // Landing on block
      if (
        newPlayer.y + PLAYER_HEIGHT >= blockTop &&
        newPlayer.y + PLAYER_HEIGHT <= blockTop + 20 &&
        playerRight > blockLeft &&
        playerLeft < blockRight &&
        newPlayer.velocityY >= 0
      ) {
        newPlayer.y = blockTop - PLAYER_HEIGHT;
        newPlayer.velocityY = 0;
        newPlayer.isGrounded = true;
        newPlayer.isJumping = false;
        onGround = true;
      }

      // Hitting from below
      if (
        playerTop <= blockBottom &&
        playerTop >= blockBottom - 15 &&
        playerRight > blockLeft &&
        playerLeft < blockRight &&
        newPlayer.velocityY < 0
      ) {
        newPlayer.y = blockBottom;
        newPlayer.velocityY = 0;
        onBlockHit(index);
      }
    });

    // Pipe collision (solid)
    levelData.pipes.forEach(pipe => {
      const playerBottom = newPlayer.y + PLAYER_HEIGHT;
      const playerTop = newPlayer.y;
      const playerLeft = newPlayer.x;
      const playerRight = newPlayer.x + PLAYER_WIDTH;
      
      const pipeTop = pipe.y;
      const pipeBottom = pipe.y + pipe.height;
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + pipe.width;

      // Landing on pipe
      if (
        playerBottom >= pipeTop &&
        playerBottom <= pipeTop + 15 &&
        playerRight > pipeLeft + 5 &&
        playerLeft < pipeRight - 5 &&
        newPlayer.velocityY >= 0
      ) {
        newPlayer.y = pipeTop - PLAYER_HEIGHT;
        newPlayer.velocityY = 0;
        newPlayer.isGrounded = true;
        newPlayer.isJumping = false;
        onGround = true;
      }

      // Side collisions
      if (playerBottom > pipeTop + 10 && playerTop < pipeBottom - 5) {
        if (playerRight > pipeLeft && playerLeft < pipeLeft && newPlayer.velocityX > 0) {
          newPlayer.x = pipeLeft - PLAYER_WIDTH;
          newPlayer.velocityX = 0;
        }
        if (playerLeft < pipeRight && playerRight > pipeRight && newPlayer.velocityX < 0) {
          newPlayer.x = pipeRight;
          newPlayer.velocityX = 0;
        }
      }
    });

    if (!onGround && newPlayer.velocityY > 0) {
      newPlayer.isGrounded = false;
    }

    // Boundary checks
    if (newPlayer.x < 0) newPlayer.x = 0;
    if (newPlayer.x > levelData.levelWidth - PLAYER_WIDTH) {
      newPlayer.x = levelData.levelWidth - PLAYER_WIDTH;
    }

    // Fall into pit detection - trigger death ONCE and stop all processing
    if (newPlayer.y > 700) {
      // Freeze player immediately to prevent further fall triggers
      newPlayer.velocityX = 0;
      newPlayer.velocityY = 0;
      newPlayer.y = 700; // Clamp to prevent further fall
      onPlayerHit();
      // CRITICAL: Update player state with frozen position, then return
      onPlayerUpdate(newPlayer);
      return;
    }

    // Invincibility timer
    if (newPlayer.isInvincible) {
      newPlayer.invincibleTimer -= 1;
      if (newPlayer.invincibleTimer <= 0) {
        newPlayer.isInvincible = false;
      }
    }

    // Collectible collision
    levelData.collectibles.forEach((collectible, index) => {
      if (collectible.collected) return;
      
      const distance = Math.sqrt(
        Math.pow(newPlayer.x + PLAYER_WIDTH / 2 - collectible.x, 2) +
        Math.pow(newPlayer.y + PLAYER_HEIGHT / 2 - collectible.y, 2)
      );
      
      if (distance < 40) {
        if (collectible.type === 'cookie') {
          onCollectCookie(index);
        } else if (collectible.type === 'shield') {
          onCollectShield(index);
        } else if (collectible.isBurst) {
          onCollectBurst(index);
        } else {
          onCollectItem(index);
        }
      }
    });

    // Enemy collision
    levelData.enemies.forEach((enemy, index) => {
      if (enemy.isDefeated) return;
      
      const playerBottom = newPlayer.y + PLAYER_HEIGHT;
      const playerTop = newPlayer.y;
      const playerLeft = newPlayer.x;
      const playerRight = newPlayer.x + PLAYER_WIDTH;
      
      const enemyTop = enemy.y;
      const enemyBottom = enemy.y + enemy.height;
      const enemyLeft = enemy.x;
      const enemyRight = enemy.x + enemy.width;

      if (
        playerRight > enemyLeft &&
        playerLeft < enemyRight &&
        playerBottom > enemyTop &&
        playerTop < enemyBottom
      ) {
        if (playerBottom <= enemyTop + 20 && newPlayer.velocityY > 0) {
          onEnemyDefeated(index);
          newPlayer.velocityY = JUMP_FORCE * 0.6;
          
          squishParticlesRef.current.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            type: enemy.type,
            elapsed: 0,
            duration: 350,
          });
        } else if (!newPlayer.isInvincible) {
          onPlayerHit();
          newPlayer.isInvincible = true;
          newPlayer.invincibleTimer = 120;
        }
      }
    });

    // Pipe enemy collision
    levelData.pipes.forEach(pipe => {
      if (!pipe.hasEnemy || !pipe.enemyVisible) return;
      
      const enemyX = pipe.x + pipe.width / 2 - 20;
      const enemyY = pipe.y - 30;
      const enemyWidth = 40;
      const enemyHeight = 30;

      const playerLeft = newPlayer.x;
      const playerRight = newPlayer.x + PLAYER_WIDTH;
      const playerTop = newPlayer.y;
      const playerBottom = newPlayer.y + PLAYER_HEIGHT;

      if (
        playerRight > enemyX &&
        playerLeft < enemyX + enemyWidth &&
        playerBottom > enemyY &&
        playerTop < enemyY + enemyHeight &&
        !newPlayer.isInvincible
      ) {
        onPlayerHit();
        newPlayer.isInvincible = true;
        newPlayer.invincibleTimer = 120;
      }
    });

    // Falling hazard collision
    levelData.fallingHazards.forEach(hazard => {
      if (!hazard.isActive || !hazard.isFalling) return;
      
      const playerLeft = newPlayer.x;
      const playerRight = newPlayer.x + PLAYER_WIDTH;
      const playerTop = newPlayer.y;
      const playerBottom = newPlayer.y + PLAYER_HEIGHT;

      if (
        playerRight > hazard.x &&
        playerLeft < hazard.x + hazard.width &&
        playerBottom > hazard.y &&
        playerTop < hazard.y + hazard.height &&
        !newPlayer.isInvincible
      ) {
        onPlayerHit();
        newPlayer.isInvincible = true;
        newPlayer.invincibleTimer = 120;
      }
    });

    // Fireball collision
    levelData.fireballs?.forEach(fireball => {
      if (!fireball.isActive) return;
      
      const playerLeft = newPlayer.x;
      const playerRight = newPlayer.x + PLAYER_WIDTH;
      const playerTop = newPlayer.y;
      const playerBottom = newPlayer.y + PLAYER_HEIGHT;

      if (
        playerRight > fireball.x &&
        playerLeft < fireball.x + fireball.width &&
        playerBottom > fireball.y &&
        playerTop < fireball.y + fireball.height &&
        !newPlayer.isInvincible
      ) {
        onPlayerHit();
        newPlayer.isInvincible = true;
        newPlayer.invincibleTimer = 120;
      }
    });

    // Fire pipe collision
    levelData.pipes.forEach(pipe => {
      if (!pipe.hasFire || !pipe.fireActive) return;
      
      const fireX = pipe.x + 10;
      const fireY = pipe.y - 80;
      const fireWidth = pipe.width - 20;
      const fireHeight = 80;

      const playerLeft = newPlayer.x;
      const playerRight = newPlayer.x + PLAYER_WIDTH;
      const playerTop = newPlayer.y;
      const playerBottom = newPlayer.y + PLAYER_HEIGHT;

      if (
        playerRight > fireX &&
        playerLeft < fireX + fireWidth &&
        playerBottom > fireY &&
        playerTop < fireY + fireHeight &&
        !newPlayer.isInvincible
      ) {
        onPlayerHit();
        newPlayer.isInvincible = true;
        newPlayer.invincibleTimer = 120;
      }
    });

    // Checkpoint collision
    if (!levelData.checkpoint.activated) {
      const cx = levelData.checkpoint.x;
      const cy = levelData.checkpoint.y;
      if (
        newPlayer.x + PLAYER_WIDTH > cx &&
        newPlayer.x < cx + 60 &&
        newPlayer.y + PLAYER_HEIGHT > cy &&
        newPlayer.y < cy + 80
      ) {
        onCheckpointReached();
      }
    }

    // Flag collision
    if (!levelData.flag.reached) {
      const fx = levelData.flag.x;
      const fy = levelData.flag.y;
      
      // Find the end platform (elevated platform at the end of the level, around x=5750)
      const endPlatform = levelData.platforms.find(p => 
        p.x >= 5700 && p.x <= 5800 && p.type === 'ground' && p.height === 60
      );
      
      // Player must be standing on the end platform to trigger flag planting
      const isOnEndPlatform = endPlatform && newPlayer.isGrounded &&
        newPlayer.x + PLAYER_WIDTH > endPlatform.x &&
        newPlayer.x < endPlatform.x + endPlatform.width &&
        Math.abs((newPlayer.y + PLAYER_HEIGHT) - endPlatform.y) < 10;
      
      if (
        isOnEndPlatform &&
        newPlayer.x + PLAYER_WIDTH > fx - 50 &&
        newPlayer.x < fx + 80
      ) {
        // Only complete level if mid-flag is collected
        if (levelData.midFlag.collected) {
          onFlagReached();
        } else {
          onFlagReachedNoFlag();
        }
      }
    }

    // Mid-flag collision
    if (!levelData.midFlag.collected) {
      const mfx = levelData.midFlag.x;
      const mfy = levelData.midFlag.y;
      if (
        newPlayer.x + PLAYER_WIDTH > mfx - 30 &&
        newPlayer.x < mfx + 60 &&
        newPlayer.y + PLAYER_HEIGHT > mfy &&
        newPlayer.y < mfy + 90
      ) {
        onMidFlagCollected();
      }
    }

    // Camera follow
    const screenWidth = window.innerWidth;
    let newCameraX = newPlayer.x - screenWidth / 3;
    if (newCameraX < 0) newCameraX = 0;
    if (newCameraX > levelData.levelWidth - screenWidth) {
      newCameraX = Math.max(0, levelData.levelWidth - screenWidth);
    }
    onCameraUpdate(newCameraX);

    onPlayerUpdate(newPlayer);
  }, [player, controls, levelData, isPaused, onPlayerUpdate, onCollectItem, onCollectCookie, onEnemyDefeated, onPlayerHit, onCheckpointReached, onFlagReached, onFlagReachedNoFlag, onMidFlagCollected, onBlockHit, onJump, onCameraUpdate, onFireballHit]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = levelData.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // === STARS IN THE SKY ===
    drawStars(ctx, width, height, cameraX * 0.05, levelData.id);

    // === SUN OR MOON ===
    drawCelestialBody(ctx, width, height, cameraX * 0.02, levelData.id);

    // === PARALLAX BACKGROUND LAYERS ===
    const bgOffset = cameraX * 0.2;
    const midOffset = cameraX * 0.4;
    
    // Layer 1: Distant hills (very back)
    drawDistantHills(ctx, width, height, bgOffset * 0.5, levelData.id);
    
    // Layer 2: Mid-ground hills
    drawMidHills(ctx, width, height, bgOffset * 0.8, levelData.id);
    
    // Layer 3: Clouds (parallax)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 10; i++) {
      const cloudX = (i * 450 - bgOffset) % (width + 500) - 250;
      const cloudY = 30 + (i % 4) * 35;
      drawCloud(ctx, cloudX, cloudY, 60 + (i % 2) * 30);
    }
    
    // Layer 3.5: Flying creatures (birds/butterflies)
    drawFlyingCreatures(ctx, width, height, time, levelData.id);
    
    // Layer 4: Background bushes/trees (behind gameplay)
    drawBackgroundVegetation(ctx, width, height, midOffset, levelData.id);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw platforms
    levelData.platforms.forEach(platform => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(platform.x + 5, platform.y + 5, platform.width, platform.height);
      
      const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
      if (platform.type === 'ground') {
        // Brown ground like classic Mario
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.3, '#A0522D');
        gradient.addColorStop(1, '#654321');
      } else {
        // Brown brick platforms
        gradient.addColorStop(0, '#CD853F');
        gradient.addColorStop(0.5, '#A0522D');
        gradient.addColorStop(1, '#8B4513');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(platform.x, platform.y, platform.width, 4);
      
      // Enhanced ground texture with brick pattern
      if (platform.type === 'ground') {
        // Brick pattern for ground
        ctx.strokeStyle = 'rgba(101, 67, 33, 0.5)';
        ctx.lineWidth = 1;
        const brickWidth = 40;
        const brickHeight = 20;
        for (let by = platform.y; by < platform.y + platform.height; by += brickHeight) {
          const offset = (Math.floor((by - platform.y) / brickHeight) % 2) * (brickWidth / 2);
          for (let bx = platform.x - offset; bx < platform.x + platform.width; bx += brickWidth) {
            const drawX = Math.max(bx, platform.x);
            const drawWidth = Math.min(bx + brickWidth, platform.x + platform.width) - drawX;
            if (drawWidth > 0) {
              ctx.strokeRect(drawX, by, drawWidth, brickHeight);
            }
          }
        }
        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(platform.x, platform.y, platform.width, 3);
      } else if (platform.type === 'floating') {
        // Brick pattern for floating platforms
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let bx = platform.x; bx < platform.x + platform.width; bx += 32) {
          ctx.beginPath();
          ctx.moveTo(bx, platform.y);
          ctx.lineTo(bx, platform.y + platform.height);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(platform.x, platform.y + platform.height / 2);
        ctx.lineTo(platform.x + platform.width, platform.y + platform.height / 2);
        ctx.stroke();
      }
      
      if (platform.type === 'ground') {
        // Improved grass on top of ground
        drawGrass(ctx, platform.x, platform.y, platform.width);
      }
    });

    // Draw pipes
    levelData.pipes.forEach(pipe => {
      // Pipe body (Classic green with higher saturation)
      const pipeGradient = ctx.createLinearGradient(pipe.x, pipe.y, pipe.x + pipe.width, pipe.y);
      pipeGradient.addColorStop(0, '#4CAF50');
      pipeGradient.addColorStop(0.3, '#2E7D32');
      pipeGradient.addColorStop(0.7, '#2E7D32');
      pipeGradient.addColorStop(1, '#1B5E20');
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
      
      // Pipe rim
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(pipe.x - 5, pipe.y, pipe.width + 10, 15);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(pipe.x - 5, pipe.y, pipe.width + 10, 4);

      // Pipe enemy
      if (pipe.hasEnemy && pipe.enemyVisible) {
        // Scaled 30%: 48->34
        ctx.font = '34px Arial';
        ctx.textAlign = 'center';
        // Dark outline for visibility
        ctx.fillStyle = '#222200';
        const outlineOffsets = [[-1.5,0], [1.5,0], [0,-1.5], [0,1.5]];
        outlineOffsets.forEach(([ox, oy]) => {
          ctx.fillText('🌵', pipe.x + pipe.width / 2 + ox, pipe.y - 15 + oy);
        });
        ctx.fillText('🌵', pipe.x + pipe.width / 2, pipe.y - 20);
      }

      // Fire pipe
      if (pipe.hasFire && pipe.fireActive) {
        // Enhanced fire visibility - brighter, more saturated
        const fireHeight = 70;
        for (let i = 0; i < fireHeight; i += 15) {
          const fireAlpha = 1 - (i / fireHeight) * 0.3; // More visible
          const wobble = Math.sin(time / 50 + i * 0.2) * 5;
          // Brighter orange/yellow core
          ctx.fillStyle = `rgba(255, ${180 + i * 0.5}, 50, ${fireAlpha})`;
          ctx.beginPath();
          ctx.arc(pipe.x + pipe.width / 2 + wobble, pipe.y - i, 18 - i * 0.12, 0, Math.PI * 2);
          ctx.fill();
          // Inner bright core
          ctx.fillStyle = `rgba(255, 255, 150, ${fireAlpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(pipe.x + pipe.width / 2 + wobble, pipe.y - i, 8 - i * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
        // Dark outline glow for contrast
        ctx.strokeStyle = 'rgba(150, 50, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pipe.x + pipe.width / 2 - 15, pipe.y);
        ctx.quadraticCurveTo(pipe.x + pipe.width / 2, pipe.y - 70, pipe.x + pipe.width / 2 + 15, pipe.y);
        ctx.stroke();
        
        // Fire emoji at top
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔥', pipe.x + pipe.width / 2, pipe.y - 45);
      }
    });

    // Draw hit blocks
    levelData.hitBlocks.forEach(block => {
      const bounceOffset = block.bounceTimer > 0 ? Math.sin(block.bounceTimer * 0.5) * 5 : 0;
      const blockY = block.y - bounceOffset;
      
      if (block.type === 'question' && !block.isHit) {
        // Golden question block - bright and visible
        const goldGradient = ctx.createLinearGradient(block.x, blockY, block.x, blockY + block.height);
        goldGradient.addColorStop(0, '#FFD700');
        goldGradient.addColorStop(0.5, '#FFA500');
        goldGradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = goldGradient;
        ctx.fillRect(block.x, blockY, block.width, block.height);
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(block.x, blockY + block.height - 5, block.width, 5);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(block.x, blockY, block.width, 5);
        
        // Question mark with heart
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#8B4513';
        ctx.textAlign = 'center';
        ctx.fillText('?', block.x + block.width / 2, blockY + 28);
        ctx.font = '12px Arial';
        ctx.fillText('💗', block.x + block.width / 2, blockY + 12);
      } else if (block.type === 'brick') {
        // Brown brick block
        const brickGradient = ctx.createLinearGradient(block.x, blockY, block.x, blockY + block.height);
        brickGradient.addColorStop(0, '#CD853F');
        brickGradient.addColorStop(1, '#8B4513');
        ctx.fillStyle = brickGradient;
        ctx.fillRect(block.x, blockY, block.width, block.height);
        ctx.fillStyle = '#654321';
        ctx.fillRect(block.x, blockY + block.height - 4, block.width, 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(block.x, blockY, block.width, 4);
        // Brick lines
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x + 2, blockY + 2, block.width - 4, block.height - 4);
        ctx.beginPath();
        ctx.moveTo(block.x + block.width / 2, blockY);
        ctx.lineTo(block.x + block.width / 2, blockY + block.height);
        ctx.stroke();
      } else {
        // Used block
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(block.x, blockY, block.width, block.height);
        ctx.fillStyle = '#6B5344';
        ctx.fillRect(block.x, blockY + block.height - 4, block.width, 4);
      }
    });

    // Draw fireballs (from enemies)
    levelData.fireballs?.forEach(fireball => {
      if (!fireball.isActive) return;
      const wobble = Math.sin(time / 50) * 3;
      // Enhanced fireball visibility - brighter core with dark outline
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      
      // Bright glow behind fireball
      ctx.beginPath();
      ctx.arc(fireball.x + fireball.width / 2, fireball.y + wobble + 8, 14, 0, Math.PI * 2);
      const fireGlow = ctx.createRadialGradient(
        fireball.x + fireball.width / 2, fireball.y + wobble + 8, 2,
        fireball.x + fireball.width / 2, fireball.y + wobble + 8, 14
      );
      fireGlow.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
      fireGlow.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
      fireGlow.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = fireGlow;
      ctx.fill();
      
      // Dark outline around emoji
      const outlineOffsets = [[-1.5,0], [1.5,0], [0,-1.5], [0,1.5]];
      ctx.fillStyle = '#331100';
      outlineOffsets.forEach(([ox, oy]) => {
        ctx.fillText('🔥', fireball.x + fireball.width / 2 + ox, fireball.y + wobble + 12 + oy);
      });
      ctx.fillText('🔥', fireball.x + fireball.width / 2, fireball.y + wobble + 12);
    });

    // Draw falling hazards
    levelData.fallingHazards.forEach(hazard => {
      if (!hazard.isActive) return;
      // Scaled down 30%: 32 -> 22
      ctx.font = '22px Arial';
      ctx.textAlign = 'center';
      
      // Add visibility glow
      ctx.beginPath();
      ctx.arc(hazard.x + hazard.width / 2, hazard.y + 18, 16, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 50, 100, 0.4)';
      ctx.fill();
      
      // White outline
      const outlineOffsets = [[-1.5,0], [1.5,0], [0,-1.5], [0,1.5]];
      ctx.fillStyle = '#FFFFFF';
      outlineOffsets.forEach(([ox, oy]) => {
        ctx.fillText('💔', hazard.x + hazard.width / 2 + ox, hazard.y + 22 + oy);
      });
      ctx.fillText('💔', hazard.x + hazard.width / 2, hazard.y + 22);
    });

    // Draw collectibles
    levelData.collectibles.forEach(collectible => {
      if (collectible.collected) return;
      
      const bobY = Math.sin(time / 300 + collectible.animationOffset * Math.PI) * 5;
      const emoji = COLLECTIBLE_EMOJIS[collectible.type] || '🌹';
      
      ctx.save();
      
       // Handle expiring burst items (fade out)
       if (collectible.isExpiring && (collectible.isBurst || collectible.type === 'shield')) {
         const progress = collectible.expiryProgress || 0;
         
         // Burst explosion effect - particles fly outward rapidly
         const burstRadius = progress * 56; // Scaled 30%
         const particleCount = 12;
         
         for (let i = 0; i < particleCount; i++) {
           const angle = (i * Math.PI * 2 / particleCount) + (time / 200);
           const particleX = collectible.x + Math.cos(angle) * burstRadius;
           const particleY = collectible.y + bobY + Math.sin(angle) * burstRadius;
           const particleAlpha = Math.max(0, 1 - progress * 1.2);
           const particleSize = Math.max(6, 11 - progress * 8); // Scaled 30%
           
           ctx.font = `${particleSize}px Arial`;
           ctx.globalAlpha = particleAlpha;
           ctx.fillText('✨', particleX, particleY);
         }
         
         // Inner ring of particles
         for (let i = 0; i < 6; i++) {
           const angle = (i * Math.PI * 2 / 6) - (time / 150);
           const innerRadius = progress * 28; // Scaled 30%
           const particleX = collectible.x + Math.cos(angle) * innerRadius;
           const particleY = collectible.y + bobY + Math.sin(angle) * innerRadius;
           
           ctx.font = '8px Arial'; // Scaled 30%
           ctx.globalAlpha = Math.max(0, 1 - progress);
           ctx.fillText('💫', particleX, particleY);
         }
         
         // Scale down the main item as it bursts
         const scale = Math.max(0.3, 1 - progress * 0.7);
         ctx.globalAlpha = Math.max(0, 1 - progress * 1.5);
         ctx.translate(collectible.x, collectible.y + bobY);
         ctx.scale(scale, scale);
         ctx.translate(-collectible.x, -(collectible.y + bobY));
       }

      // Special rendering for burst collectibles (larger, with sparkles)
      if (collectible.isBurst) {
         // Outer glow for visibility while moving
         const glowPulse = Math.sin(time / 150) * 0.2 + 0.8;
         ctx.beginPath();
         ctx.arc(collectible.x, collectible.y + bobY - 5, 22 * glowPulse, 0, Math.PI * 2); // Scaled 30%
         const glowGradient = ctx.createRadialGradient(
           collectible.x, collectible.y + bobY - 5, 5,
           collectible.x, collectible.y + bobY - 5, 22 * glowPulse
         );
         glowGradient.addColorStop(0, 'rgba(255, 220, 100, 0.6)');
         glowGradient.addColorStop(0.5, 'rgba(255, 180, 50, 0.3)');
         glowGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
         ctx.fillStyle = glowGradient;
         ctx.fill();
         
         // Sparkle effect (orbiting)
         if (!collectible.isExpiring) {
           const sparkleAngle = time / 100;
           for (let i = 0; i < 4; i++) {
             const angle = sparkleAngle + (i * Math.PI / 2);
             const sparkleX = collectible.x + Math.cos(angle) * 20; // Scaled 30%
             const sparkleY = collectible.y + bobY + Math.sin(angle) * 20;
             ctx.font = '10px Arial'; // Scaled 30%
             ctx.fillText('✨', sparkleX, sparkleY);
           }
        }
        ctx.font = '34px Arial'; // Scaled 30% (was 48)
      } else if (collectible.type === 'shield') {
        // Pulsing glow for shield power-up
        const pulse = Math.sin(time / 150) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(collectible.x, collectible.y + bobY - 5, 20 * pulse, 0, Math.PI * 2); // Scaled 30%
        ctx.fillStyle = 'rgba(255, 100, 150, 0.4)';
        ctx.fill();
        ctx.font = '31px Arial'; // Scaled 30% (was 44)
      } else {
        ctx.font = collectible.type === 'cookie' ? '29px Arial' : '27px Arial'; // Scaled 30%
      }
      
      ctx.textAlign = 'center';
      
      // White outline - draw emoji 8 times around the center
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.miterLimit = 2;
      const outlineOffsets = [[-1.5,0], [1.5,0], [0,-1.5], [0,1.5], [-1,-1], [1,-1], [-1,1], [1,1]];
      outlineOffsets.forEach(([ox, oy]) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(emoji, collectible.x + ox, collectible.y + bobY + oy);
      });
      
      // Main emoji on top
      ctx.fillText(emoji, collectible.x, collectible.y + bobY);
      
      ctx.restore();
    });

    // Draw enemies
    levelData.enemies.forEach(enemy => {
      if (enemy.isDefeated) return;
      
      const wobble = Math.sin(time / 200) * 3;
      const enemyX = enemy.x + enemy.width / 2;
      
      ctx.save();
      ctx.textAlign = 'center';
      
      // White outline offsets
      const outlineOffsets = [[-2,0], [2,0], [0,-2], [0,2]];
      
      // Enhanced danger glow for all enemies
      ctx.beginPath();
      ctx.arc(enemyX, enemy.y + 15, 28, 0, Math.PI * 2);
      const dangerGlow = ctx.createRadialGradient(enemyX, enemy.y + 15, 5, enemyX, enemy.y + 15, 28);
      dangerGlow.addColorStop(0, 'rgba(180, 0, 50, 0.4)');
      dangerGlow.addColorStop(1, 'rgba(100, 0, 30, 0)');
      ctx.fillStyle = dangerGlow;
      ctx.fill();
      
      if (enemy.type === 'heartBug') {
        // Scaled 30%: 52->36, 38->27
        // Dark outline for more dangerous look
        ctx.font = '36px Arial';
        ctx.fillStyle = '#330011';
        outlineOffsets.forEach(([ox, oy]) => {
          ctx.fillText('💗', enemyX + ox, enemy.y - 5 + wobble + oy);
        });
        ctx.font = '27px Arial';
        outlineOffsets.forEach(([ox, oy]) => {
          ctx.fillText('🐛', enemyX + ox, enemy.y + 22 + wobble + oy);
        });
        
        // Main emojis
        ctx.font = '36px Arial';
        ctx.fillText('💗', enemyX, enemy.y - 5 + wobble);
        ctx.font = '27px Arial';
        ctx.fillText('🐛', enemyX, enemy.y + 22 + wobble);
        
        // Evil eyes indicator
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.fillText('👀', enemyX, enemy.y + 8 + wobble);
        
        if (enemy.canShoot) {
          ctx.font = '14px Arial';
          ctx.fillText('🔥', enemyX + 14, enemy.y - 8);
        }
      } else if (enemy.type === 'brokenHeartSlime') {
        // Scaled 30%: 52->36
        // Dark outline for danger
        ctx.font = '36px Arial';
        ctx.fillStyle = '#330011';
        outlineOffsets.forEach(([ox, oy]) => {
          ctx.fillText('💔', enemyX + ox, enemy.y + 15 + wobble + oy);
        });
        
        // Main emoji
        ctx.font = '36px Arial';
        ctx.fillText('💔', enemyX, enemy.y + 15 + wobble);
        
        // Angry expression
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#880000';
        ctx.fillText('😠', enemyX, enemy.y + 28 + wobble);
        
        if (enemy.canShoot) {
          ctx.font = '14px Arial';
          ctx.fillText('🔥', enemyX + 14, enemy.y - 5);
        }
      } else if (enemy.type === 'jealousCloud') {
        // Scaled 30%: 48->34, 42->29
        // Dark outline
        ctx.fillStyle = '#222244';
        ctx.font = '34px Arial';
        outlineOffsets.forEach(([ox, oy]) => {
          ctx.fillText('😤', enemyX + ox, enemy.y + 20 + wobble + oy);
        });
        ctx.font = '29px Arial';
        outlineOffsets.forEach(([ox, oy]) => {
          ctx.fillText('☁️', enemyX + ox, enemy.y + 45 + wobble + oy);
        });
        
        // Main emojis
        ctx.font = '34px Arial';
        ctx.fillText('😤', enemyX, enemy.y + 20 + wobble);
        ctx.font = '29px Arial';
        ctx.fillText('☁️', enemyX, enemy.y + 45 + wobble);
      }
      
      ctx.restore();
    });

    // Draw squished enemies
    for (const sq of squishParticlesRef.current) {
      const p = sq.elapsed / sq.duration; // 0→1
      const scaleX = 1 + p * 0.8;        // widen
      const scaleY = Math.max(0, 1 - p * 1.2); // flatten
      const alpha = Math.max(0, 1 - p);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(sq.x, sq.y);
      ctx.scale(scaleX, scaleY);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const emoji = sq.type === 'heartBug' ? '💗' : sq.type === 'brokenHeartSlime' ? '💔' : '😤';
      ctx.font = '30px Arial';
      ctx.fillText(emoji, 0, 0);
      ctx.restore();
    }

    if (!levelData.checkpoint.activated) {
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🚩', levelData.checkpoint.x + 30, levelData.checkpoint.y + 20);
    } else {
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('✅', levelData.checkpoint.x + 30, levelData.checkpoint.y + 20);
    }

    // Draw END flag - simple Mario-style flag
    const flagReached = levelData.flag.reached;
    const flagIsPlanting = levelData.flag.isPlanting;
    const plantProgress = levelData.flag.plantProgress || 0;
    const flagPlanted = levelData.flag.plantedFlag;
    const flagWave = Math.sin(time / 200) * 3;
    const flagX = levelData.flag.x;
    const flagY = levelData.flag.y;
    const flagShake = levelData.flag.shakeTimer && levelData.flag.shakeTimer > 0 
      ? Math.sin(levelData.flag.shakeTimer * 0.5) * 5 
      : 0;
    
    ctx.save();
    ctx.translate(flagShake, 0);
    
   // Get ground level from end platform (elevated brick platform at end of level)
   const endPlatform = levelData.platforms.find(p => 
     p.x >= 5700 && p.x <= 5800 && p.type === 'ground' && p.height === 60
   );
   const groundY = endPlatform?.y ?? 460; // End platform is at GROUND_Y - 60 = 460
   
   // Define finish zone position first (used by stairs)
   const finishZoneX = flagX - 30;
   
   // Draw stairs leading up to end platform
   const stairCount = 4;
   const stairWidth = 35;
   const stairHeight = 15;
   // Stairs should be positioned just before the end platform (which starts at x=5750)
   const endPlatformX = endPlatform?.x ?? 5750;
   const stairsStartX = endPlatformX - stairCount * stairWidth;
   const baseGroundY = 520; // Regular ground level
   
   for (let i = 0; i < stairCount; i++) {
     const stepX = stairsStartX + i * stairWidth;
     const stepY = baseGroundY - (i + 1) * stairHeight;
     const stepHeight = (i + 1) * stairHeight;
     
     // Brick pattern for each step
     const brickHeight = 15;
     const brickWidth = 17;
     
     for (let by = 0; by < stepHeight; by += brickHeight) {
       const rowOffset = (Math.floor(by / brickHeight) % 2) * (brickWidth / 2);
       for (let bx = 0; bx < stairWidth; bx += brickWidth) {
         const actualBx = bx + rowOffset;
         if (actualBx < stairWidth) {
           const drawWidth = Math.min(brickWidth - 2, stairWidth - actualBx - 2);
           if (drawWidth > 0) {
             // Brick base
              ctx.fillStyle = '#8B4513';
              ctx.fillRect(
                stepX + actualBx, 
                stepY + by, 
                drawWidth, 
                brickHeight - 2
              );
              
              // Brick highlight (top edge)
              ctx.fillStyle = '#A0522D';
              ctx.fillRect(
                stepX + actualBx, 
                stepY + by, 
                drawWidth, 
                3
              );
              
              // Brick shadow (bottom edge)
              ctx.fillStyle = '#5D3A1A';
              ctx.fillRect(
                stepX + actualBx, 
                stepY + by + brickHeight - 4, 
                drawWidth, 
                2
              );
           }
         }
       }
     }
     
     // Step top surface (lighter brown)
      ctx.fillStyle = '#CD853F';
      ctx.fillRect(stepX, stepY - 3, stairWidth, 3);
      
      // Step edge highlight
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1;
      ctx.strokeRect(stepX, stepY, stairWidth, stepHeight);
   }
   
    // === FINISH ZONE — Glowing Goal Area ===
     const finishZoneWidth = 160;
    const fzX = finishZoneX; // Already in world coords; ctx.translate(-cameraX) handles offset
    const shimmer = Math.sin(time / 300) * 0.3 + 0.7; // 0.4–1.0 pulse

    // 1) Outer golden aura glow — soft radial attached to platform center
    const auraGrad = ctx.createRadialGradient(
      fzX + finishZoneWidth / 2, groundY - 12, 8,
      fzX + finishZoneWidth / 2, groundY - 12, finishZoneWidth * 0.8
    );
    auraGrad.addColorStop(0, `rgba(255, 215, 0, ${0.30 * shimmer})`);
    auraGrad.addColorStop(0.4, `rgba(255, 182, 193, ${0.15 * shimmer})`);
    auraGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(fzX - 40, groundY - 100, finishZoneWidth + 80, 110);

    // Soft ground glow beneath platform
    const groundGlow = ctx.createLinearGradient(fzX, groundY, fzX, groundY + 22);
    groundGlow.addColorStop(0, `rgba(255, 215, 0, ${0.35 * shimmer})`);
    groundGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = groundGlow;
    ctx.fillRect(fzX - 10, groundY, finishZoneWidth + 20, 22);

    // Checkered finish floor with golden tint
    const squareSize = 15;
    for (let i = 0; i < finishZoneWidth / squareSize; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.fillStyle = (i + j) % 2 === 0
          ? `rgba(255, 248, 220, ${0.9 + shimmer * 0.1})`
          : '#FFB6C1';
        ctx.fillRect(fzX + i * squareSize, groundY - 25 + j * squareSize, squareSize, squareSize);
      }
    }

    // 4) Slow shimmering light sweep across surface
    const sweepX = ((time / 12) % (finishZoneWidth + 60)) - 30; // slow sweep
    const sweepGrad = ctx.createLinearGradient(
      fzX + sweepX - 20, 0, fzX + sweepX + 20, 0
    );
    sweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sweepGrad.addColorStop(0.5, `rgba(255, 255, 230, ${0.35 * shimmer})`);
    sweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.save();
    ctx.beginPath();
    ctx.rect(fzX, groundY - 25, finishZoneWidth, 25);
    ctx.clip();
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(fzX + sweepX - 20, groundY - 25, 40, 25);
    ctx.restore();

    // Golden glowing border
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.6 + shimmer * 0.4})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 8 * shimmer;
    ctx.strokeRect(fzX, groundY - 25, finishZoneWidth, 25);
    ctx.shadowBlur = 0;

    // Inner gold edge highlight
    ctx.strokeStyle = `rgba(255, 255, 200, ${0.3 * shimmer})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(fzX + 2, groundY - 23, finishZoneWidth - 4, 21);

    // 3) Sparkle particles emitted from platform edges
    for (let s = 0; s < 8; s++) {
      const sparklePhase = time / 500 + s * 0.8;
      const edgeSide = s % 2 === 0; // alternate left/right edge
      const sx = edgeSide
        ? fzX + Math.sin(sparklePhase * 1.3) * 12          // left edge
        : fzX + finishZoneWidth + Math.sin(sparklePhase * 1.3) * -12; // right edge
      const sy = groundY - 25 - Math.abs(Math.sin(sparklePhase)) * 35 - 5;
      const sparkleAlpha = (Math.sin(sparklePhase * 2) * 0.5 + 0.5) * 0.85;
      const sparkleSize = 1.5 + Math.sin(sparklePhase * 3) * 1.5;

      ctx.beginPath();
      ctx.arc(sx, sy, sparkleSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 223, 100, ${sparkleAlpha})`;
      ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cross sparkle shape for larger ones
      if (sparkleSize > 2.2) {
        ctx.strokeStyle = `rgba(255, 240, 180, ${sparkleAlpha * 0.7})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sx - sparkleSize * 1.5, sy);
        ctx.lineTo(sx + sparkleSize * 1.5, sy);
        ctx.moveTo(sx, sy - sparkleSize * 1.5);
        ctx.lineTo(sx, sy + sparkleSize * 1.5);
        ctx.stroke();
      }
    }

    // 2) 4 floating hearts positioned above the platform
    for (let h = 0; h < 4; h++) {
      const heartPhase = time / 800 + h * 1.6;
      const hx = fzX + 20 + (h * 38) % (finishZoneWidth - 20);
      const hy = groundY - 32 - Math.sin(heartPhase) * 16 - h * 4;
      const heartAlpha = (Math.sin(heartPhase) * 0.3 + 0.55);
      const heartScale = 0.6 + Math.sin(heartPhase * 1.5) * 0.15;

      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(heartScale, heartScale);
      ctx.globalAlpha = heartAlpha;
      ctx.fillStyle = '#FF69B4';
      ctx.shadowColor = 'rgba(255, 105, 180, 0.4)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(-4, -2, -7, 1, -7, 4);
      ctx.bezierCurveTo(-7, 7, 0, 11, 0, 13);
      ctx.bezierCurveTo(0, 11, 7, 7, 7, 4);
      ctx.bezierCurveTo(7, 1, 4, -2, 0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }

    // 5) Decorative heart banner attached to the left side of the platform
    const bannerX = fzX + 6;
    const bannerY = groundY - 55;
    // Pole
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(bannerX, bannerY, 3, 32);
    // Banner ribbon
    ctx.fillStyle = `rgba(255, 105, 180, ${0.8 + shimmer * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(bannerX + 3, bannerY + 2);
    ctx.lineTo(bannerX + 24, bannerY + 2);
    ctx.lineTo(bannerX + 20, bannerY + 10);
    ctx.lineTo(bannerX + 24, bannerY + 18);
    ctx.lineTo(bannerX + 3, bannerY + 18);
    ctx.closePath();
    ctx.fill();
    // Heart on banner
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText('♥', bannerX + 14, bannerY + 14);

    // "FINISH" text with glow
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
    ctx.shadowBlur = 10 * shimmer;
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 3;
    ctx.strokeText('✦ FINISH ✦', fzX + finishZoneWidth / 2, groundY - 33);
    ctx.fillText('✦ FINISH ✦', fzX + finishZoneWidth / 2, groundY - 33);
    ctx.shadowBlur = 0;

    // Flag stand / pedestal — golden with glow
    ctx.shadowColor = 'rgba(255, 215, 0, 0.4)';
    ctx.shadowBlur = 6;
    const pedGrad = ctx.createLinearGradient(flagX - 2, groundY - 12, flagX - 2, groundY);
    pedGrad.addColorStop(0, '#FFD700');
    pedGrad.addColorStop(0.5, '#DAA520');
    pedGrad.addColorStop(1, '#B8860B');
    ctx.fillStyle = pedGrad;
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(flagX - 2, groundY - 12, 42, 12, 3);
    ctx.stroke();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pedestal shine strip
    ctx.fillStyle = `rgba(255, 255, 230, ${0.4 + shimmer * 0.3})`;
    ctx.fillRect(flagX, groundY - 12, 38, 3);

    // Decorative hearts on pedestal
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💕', flagX + 19, groundY - 1);

    // Flag pole holder — warm brown with subtle glow
    ctx.fillStyle = '#5D4037';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(flagX + 15, groundY - 65, 8, 53, 3);
    ctx.stroke();
    ctx.fill();

    // Pole cap — golden ornament with glow
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = 8 * shimmer;
    ctx.beginPath();
    ctx.arc(flagX + 19, groundY - 67, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#CC9900';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;
   
   // Draw planted flag if completed
   if (flagPlanted || flagIsPlanting) {
     const plantedFlagY = flagIsPlanting 
       ? groundY - 60 - (plantProgress / 100) * 50  // Animate from base up
       : groundY - 110;  // Final position
     
     // Planted flag pole (golden)
     ctx.fillStyle = '#FFD700';
     ctx.strokeStyle = '#CC9900';
     ctx.lineWidth = 2;
     ctx.beginPath();
     ctx.roundRect(flagX + 16, plantedFlagY, 6, 50, 2);
     ctx.stroke();
     ctx.fill();
     
     // Golden ball cap
     ctx.beginPath();
     ctx.arc(flagX + 19, plantedFlagY - 3, 5, 0, Math.PI * 2);
     ctx.fillStyle = '#FFD700';
     ctx.fill();
     ctx.strokeStyle = '#CC9900';
     ctx.lineWidth = 1.5;
     ctx.stroke();
     
     // Green victory flag cloth
     const victoryWave = Math.sin(time / 150) * 4;
     ctx.fillStyle = '#00CC00';
     ctx.strokeStyle = '#FFFFFF';
     ctx.lineWidth = 2;
     ctx.beginPath();
      ctx.moveTo(flagX + 22, plantedFlagY + 2);
      ctx.quadraticCurveTo(flagX + 48 + victoryWave, plantedFlagY + 4, flagX + 45 + victoryWave, plantedFlagY + 15);
      ctx.quadraticCurveTo(flagX + 42 + victoryWave, plantedFlagY + 26, flagX + 22, plantedFlagY + 28);
     ctx.closePath();
     ctx.fill();
     ctx.stroke();
     
     // White heart on victory flag
     ctx.save();
     ctx.translate(flagX + 32 + victoryWave * 0.4, plantedFlagY + 15);
     ctx.fillStyle = '#FFFFFF';
     ctx.beginPath();
     ctx.moveTo(0, 2);
     ctx.bezierCurveTo(-3, -2, -5, 0, -5, 2.5);
     ctx.bezierCurveTo(-5, 5, 0, 8, 0, 9);
     ctx.bezierCurveTo(0, 8, 5, 5, 5, 2.5);
     ctx.bezierCurveTo(5, 0, 3, -2, 0, 2);
     ctx.closePath();
     ctx.fill();
     ctx.restore();
     
     // Celebration sparkles during planting
     if (flagIsPlanting) {
       const sparkleCount = 6;
       for (let i = 0; i < sparkleCount; i++) {
         const sparkleAngle = (time / 200) + (i * Math.PI * 2 / sparkleCount);
         const sparkleRadius = 30 + (plantProgress / 100) * 20;
         const sparkleX = flagX + 20 + Math.cos(sparkleAngle) * sparkleRadius;
         const sparkleY = plantedFlagY + 20 + Math.sin(sparkleAngle) * sparkleRadius * 0.6;
         
         ctx.font = '14px Arial';
         ctx.textAlign = 'center';
         ctx.fillText('✨', sparkleX, sparkleY);
       }
     }
     
     // "VICTORY!" text when planted
     if (flagPlanted) {
       ctx.font = 'bold 16px Arial';
       ctx.textAlign = 'center';
       ctx.fillStyle = '#FFD700';
       ctx.strokeStyle = '#000000';
       ctx.lineWidth = 3;
        ctx.strokeText('VICTORY!', flagX + 20, plantedFlagY - 15);
        ctx.fillText('VICTORY!', flagX + 20, plantedFlagY - 15);
     }
   } else {
     // Show "PLANT FLAG HERE" or "NEED FLAG" hint
     ctx.font = 'bold 11px Arial';
     ctx.textAlign = 'center';
     if (hasMidFlag) {
       ctx.fillStyle = '#00FF00';
       ctx.strokeStyle = '#000000';
       ctx.lineWidth = 2;
        ctx.strokeText('PLANT FLAG!', flagX + 20, groundY - 70);
        ctx.fillText('PLANT FLAG!', flagX + 20, groundY - 70);
      } else {
        ctx.fillStyle = '#FF6666';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText('NEED FLAG!', flagX + 20, groundY - 70);
        ctx.fillText('NEED FLAG!', flagX + 20, groundY - 70);
     }
   }
    
    ctx.restore();

    // Draw MID-LEVEL flag with elaborate visuals
    const midFlag = levelData.midFlag;
    if (!midFlag.collected) {
      const midFlagWave = Math.sin(time / 150) * 2.5;
      const midFlagX = midFlag.x;
      const midFlagY = midFlag.y;
      
     // Subtle floating bob animation
     const bobOffset = Math.sin(time / 200) * 3;
     const adjustedY = midFlagY + bobOffset;
     
     // Clean outer glow - soft pink ring
     const glowPulse = 0.5 + Math.sin(time / 400) * 0.2;
     ctx.beginPath();
     ctx.arc(midFlagX + 12, adjustedY + 18, 22, 0, Math.PI * 2);
     ctx.fillStyle = `rgba(255, 105, 180, ${glowPulse * 0.35})`;
     ctx.fill();
     
     // Golden pole with rounded cap
     ctx.fillStyle = '#FFD700';
     ctx.strokeStyle = '#CC9900';
     ctx.lineWidth = 2;
     ctx.beginPath();
     ctx.roundRect(midFlagX - 2, adjustedY, 5, 42, 2);
     ctx.fill();
     ctx.stroke();
     
     // Pole cap - golden ball
     ctx.beginPath();
     ctx.arc(midFlagX + 0.5, adjustedY - 2, 4, 0, Math.PI * 2);
     ctx.fillStyle = '#FFD700';
     ctx.fill();
     ctx.strokeStyle = '#CC9900';
     ctx.lineWidth = 1.5;
     ctx.stroke();
     
     // Flag cloth - clean heart-shaped pennant (magenta)
     const clothGradient = ctx.createLinearGradient(midFlagX + 3, adjustedY + 4, midFlagX + 28, adjustedY + 20);
     clothGradient.addColorStop(0, '#FF1493');
     clothGradient.addColorStop(1, '#C71585');
     
     ctx.fillStyle = clothGradient;
     ctx.strokeStyle = '#FFFFFF';
     ctx.lineWidth = 2;
     ctx.beginPath();
     ctx.moveTo(midFlagX + 3, adjustedY + 4);
     ctx.quadraticCurveTo(midFlagX + 30 + midFlagWave, adjustedY + 6, midFlagX + 28 + midFlagWave, adjustedY + 16);
     ctx.quadraticCurveTo(midFlagX + 26 + midFlagWave, adjustedY + 26, midFlagX + 3, adjustedY + 28);
     ctx.closePath();
     ctx.fill();
     ctx.stroke();
     
     // Dark outline for visibility
     ctx.strokeStyle = '#8B008B';
     ctx.lineWidth = 1;
     ctx.stroke();
     
     // Cute heart emblem centered on flag
     ctx.save();
     ctx.translate(midFlagX + 14 + midFlagWave * 0.4, adjustedY + 16);
     
     // Draw clean heart shape
     ctx.fillStyle = '#FFFFFF';
     ctx.beginPath();
     ctx.moveTo(0, 2);
     ctx.bezierCurveTo(-3, -2, -6, 0, -6, 3);
     ctx.bezierCurveTo(-6, 6, 0, 9, 0, 11);
     ctx.bezierCurveTo(0, 9, 6, 6, 6, 3);
     ctx.bezierCurveTo(6, 0, 3, -2, 0, 2);
     ctx.closePath();
     ctx.fill();
     
     // Heart outline
     ctx.strokeStyle = '#FF69B4';
     ctx.lineWidth = 1;
     ctx.stroke();
     ctx.restore();
     
     // Small ribbon at pole attachment
     ctx.fillStyle = '#FFD700';
     ctx.beginPath();
     ctx.moveTo(midFlagX + 2, adjustedY + 5);
     ctx.lineTo(midFlagX + 7, adjustedY + 10);
     ctx.lineTo(midFlagX + 2, adjustedY + 15);
     ctx.closePath();
     ctx.fill();
    }

    // Draw player
    const blinkVisible = !player.isInvincible || Math.floor(time / 100) % 2 === 0;
    if (blinkVisible) {
      ctx.save();
      
      // Crouch/bounce animation during flag planting
      if (isPlantingFlag) {
        const flagPlantProg = levelData.flag.plantProgress || 0;
        // Crouch down in first 40%, bounce up in 40-70%, settle in 70-100%
        let squashY = 0;
        let stretchX = 1;
        let stretchY = 1;
        if (flagPlantProg < 40) {
          // Crouch: squash vertically, widen slightly
          const t = flagPlantProg / 40;
          squashY = t * 8; // Push down by up to 8px
          stretchY = 1 - t * 0.15; // Squash to 85%
          stretchX = 1 + t * 0.08; // Widen to 108%
        } else if (flagPlantProg < 70) {
          // Spring up: stretch vertically
          const t = (flagPlantProg - 40) / 30;
          squashY = 8 * (1 - t) - t * 6; // Rise above original
          stretchY = 0.85 + t * 0.25; // Stretch to 110%
          stretchX = 1.08 - t * 0.12; // Narrow to 96%
        } else {
          // Settle back to normal
          const t = (flagPlantProg - 70) / 30;
          squashY = -6 * (1 - t);
          stretchY = 1.1 - t * 0.1;
          stretchX = 0.96 + t * 0.04;
        }
        
        const cx = player.x + PLAYER_WIDTH / 2;
        const cy = player.y + PLAYER_HEIGHT; // Scale from feet
        ctx.translate(cx, cy + squashY);
        ctx.scale(stretchX, stretchY);
        ctx.translate(-cx, -cy);
      }
      
      // Draw shield aura if player has shield
      if (hasShield) {
        const shieldPulse = Math.sin(time / 200) * 0.15 + 0.85;
        const shieldRadius = 40 * shieldPulse;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, 10,
          player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, shieldRadius
        );
        gradient.addColorStop(0, 'rgba(255, 100, 150, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 50, 100, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 100, 0)');
        
        ctx.beginPath();
        ctx.arc(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, shieldRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Heart icons orbiting
        const orbitAngle = time / 300;
        for (let i = 0; i < 3; i++) {
          const angle = orbitAngle + (i * Math.PI * 2 / 3);
          const orbitX = player.x + PLAYER_WIDTH / 2 + Math.cos(angle) * 35;
          const orbitY = player.y + PLAYER_HEIGHT / 2 + Math.sin(angle) * 35;
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('💖', orbitX, orbitY);
        }
      }
      
      // Draw dust particles (behind player, in world space)
      for (const dp of dustParticlesRef.current) {
        const progress = dp.life / dp.maxLife;
        const alpha = Math.max(0, 0.35 * (1 - progress));
        ctx.fillStyle = `rgba(235, 225, 210, ${alpha})`;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, dp.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT + 3, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      if (!player.facingRight) {
        ctx.translate(player.x + PLAYER_WIDTH, 0);
        ctx.scale(-1, 1);
        ctx.translate(-player.x, 0);
      }
      
      // Higher contrast player - red outfit
      const bodyGradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + PLAYER_HEIGHT);
      bodyGradient.addColorStop(0, '#FF2222');
      bodyGradient.addColorStop(1, '#CC0000');
      ctx.fillStyle = bodyGradient;
      
      // Body outline for better visibility
      ctx.strokeStyle = '#880000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(player.x + 5, player.y + 15, PLAYER_WIDTH - 10, PLAYER_HEIGHT - 20, 10);
      ctx.stroke();
      ctx.fill();
      
      // Face with higher contrast
      ctx.fillStyle = '#FFDBAC';
      ctx.strokeStyle = '#CC9966';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_WIDTH / 2, player.y + 12, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
      
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_WIDTH / 2 - 4, player.y + 10, 3, 0, Math.PI * 2);
      ctx.arc(player.x + PLAYER_WIDTH / 2 + 4, player.y + 10, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_WIDTH / 2, player.y + 14, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
      
      // Heart emblem on body
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('❤️', player.x + PLAYER_WIDTH / 2, player.y + 35);
      
      // Draw carried flag if player has collected it (hide during/after planting)
      if (hasMidFlag && !isPlantingFlag && !levelData.flag.plantedFlag) {
        ctx.save();
        // Small flag on player's back
        const flagPoleX = player.facingRight ? player.x - 5 : player.x + PLAYER_WIDTH + 5;
        const smallFlagWave = Math.sin(time / 150) * 3;
        
        // Small pole
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(flagPoleX - 2, player.y - 25, 6, 55, 2);
        ctx.stroke();
        ctx.fill();
        
        // Small green flag (captured state)
        ctx.fillStyle = '#00CC00';
        ctx.strokeStyle = '#006600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (player.facingRight) {
          ctx.moveTo(flagPoleX + 4, player.y - 22);
          ctx.lineTo(flagPoleX + 30 + smallFlagWave, player.y - 12);
          ctx.lineTo(flagPoleX + 4, player.y - 2);
        } else {
          ctx.moveTo(flagPoleX - 2, player.y - 22);
          ctx.lineTo(flagPoleX - 28 - smallFlagWave, player.y - 12);
          ctx.lineTo(flagPoleX - 2, player.y - 2);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        
        // Small heart
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        if (player.facingRight) {
          ctx.fillText('💚', flagPoleX + 15 + smallFlagWave * 0.5, player.y - 9);
        } else {
          ctx.fillText('💚', flagPoleX - 13 - smallFlagWave * 0.5, player.y - 9);
        }
        ctx.restore();
      }
      
      ctx.restore();
    }

    ctx.restore();
  }, [levelData, player, cameraX]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gameLoop = (time: number) => {
      if (!isPaused) {
        updatePlayer();

        // Landing dust puff
        if (player.isGrounded && !wasGroundedRef.current) {
          const dustArr = dustParticlesRef.current;
          const cx = player.x + PLAYER_WIDTH / 2;
          const footY = player.y + PLAYER_HEIGHT - 2;
          for (let i = 0; i < 6; i++) {
            dustArr.push({
              x: cx + (Math.random() - 0.5) * 20,
              y: footY + Math.random() * 3,
              vx: (Math.random() - 0.5) * 1.2,
              vy: -(0.4 + Math.random() * 0.6),
              life: 0,
              maxLife: 250 + Math.random() * 200,
              size: 3.5 + Math.random() * 3.5,
            });
          }
        }
        wasGroundedRef.current = player.isGrounded;

        // Spawn dust particles when running on ground
        const absVX = Math.abs(player.velocityX);
        if (player.isGrounded && absVX > 1 && !isPlantingFlag) {
          const now = time;
          const interval = absVX > 6 ? 120 : 180;
          if (now - lastDustSpawnRef.current > interval) {
            lastDustSpawnRef.current = now;
            const dustArr = dustParticlesRef.current;
            if (dustArr.length < 20) {
              const spawnX = player.facingRight
                ? player.x + 5 + Math.random() * 8
                : player.x + PLAYER_WIDTH - 13 + Math.random() * 8;
              dustArr.push({
                x: spawnX,
                y: player.y + PLAYER_HEIGHT - 2 + Math.random() * 4,
                vx: (player.facingRight ? -1 : 1) * (0.3 + Math.random() * 0.5),
                vy: -(0.3 + Math.random() * 0.4),
                life: 0,
                maxLife: 300 + Math.random() * 200,
                size: 3 + Math.random() * 3,
              });
            }
          }
        }

        // Update dust particles
        const dt = 16; // approx frame time
        dustParticlesRef.current = dustParticlesRef.current.filter(p => {
          p.life += dt;
          p.x += p.vx;
          p.y += p.vy;
          p.size += 0.03;
          return p.life < p.maxLife;
        });

        // Update squish animations
        squishParticlesRef.current = squishParticlesRef.current.filter(s => {
          s.elapsed += 16;
          return s.elapsed < s.duration;
        });
      }
      draw(ctx, time);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw, updatePlayer, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.3);
  ctx.bezierCurveTo(x - size, y + size * 0.6, x, y + size, x, y + size);
  ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.6, x + size, y + size * 0.3);
  ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
  ctx.fill();
}

// Helper: Draw stars in the sky
function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number, offset: number, levelId: number) {
  // Star density and brightness varies slightly by level
  const starConfigs: Record<number, { count: number; maxAlpha: number }> = {
    1: { count: 40, maxAlpha: 0.6 },   // Rose Garden - moderate stars
    2: { count: 35, maxAlpha: 0.5 },   // Candyland - softer
    3: { count: 45, maxAlpha: 0.65 },  // Toyland - more stars
    4: { count: 40, maxAlpha: 0.55 },  // Letter Lane - moderate
    5: { count: 50, maxAlpha: 0.7 },   // Pearl Beach - bright stars
    6: { count: 55, maxAlpha: 0.75 },  // Ring Mountain - mountain stars
    7: { count: 60, maxAlpha: 0.8 },   // Love Castle - magical sky
  };
  
  const config = starConfigs[levelId] || { count: 40, maxAlpha: 0.6 };
  
  // Use seeded random for consistent star positions per level
  const seed = levelId * 12345;
  const seededRandom = (i: number) => {
    const x = Math.sin(seed + i * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  // Draw stars with very slow parallax
  for (let i = 0; i < config.count; i++) {
    const baseX = seededRandom(i) * (width + 500);
    const starX = ((baseX - offset) % (width + 200)) - 100;
    const starY = seededRandom(i + 100) * height * 0.5; // Only in upper half of sky
    const starSize = 1 + seededRandom(i + 200) * 2;
    const twinkle = 0.5 + Math.sin(Date.now() / 1000 + i * 0.5) * 0.5; // Twinkle effect
    const alpha = config.maxAlpha * (0.4 + seededRandom(i + 300) * 0.6) * twinkle;
    
    // Star glow
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(starX, starY, starSize * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Star core
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add a few larger, brighter accent stars
  for (let i = 0; i < 8; i++) {
    const baseX = seededRandom(i + 500) * (width + 400);
    const starX = ((baseX - offset * 0.8) % (width + 300)) - 100;
    const starY = 20 + seededRandom(i + 600) * height * 0.35;
    const twinkle = 0.6 + Math.sin(Date.now() / 800 + i * 1.2) * 0.4;
    
    // Draw 4-point star shape
    ctx.fillStyle = `rgba(255, 255, 240, ${config.maxAlpha * 0.8 * twinkle})`;
    ctx.beginPath();
    const size = 3 + seededRandom(i + 700) * 2;
    // Vertical spike
    ctx.moveTo(starX, starY - size * 2);
    ctx.lineTo(starX + size * 0.3, starY);
    ctx.lineTo(starX, starY + size * 2);
    ctx.lineTo(starX - size * 0.3, starY);
    ctx.closePath();
    ctx.fill();
    // Horizontal spike
    ctx.beginPath();
    ctx.moveTo(starX - size * 2, starY);
    ctx.lineTo(starX, starY + size * 0.3);
    ctx.lineTo(starX + size * 2, starY);
    ctx.lineTo(starX, starY - size * 0.3);
    ctx.closePath();
    ctx.fill();
  }
}

// Helper: Draw flying birds or butterflies
function drawFlyingCreatures(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, levelId: number) {
  // Determine creature type based on level
  const isButterfly = levelId === 1 || levelId === 2 || levelId === 7; // Rose Garden, Candyland, Love Castle get butterflies
  
  // Creature colors by level
  const butterflyColors: Record<number, string[]> = {
    1: ['rgba(255, 150, 180, 0.6)', 'rgba(255, 180, 200, 0.6)'], // Pink butterflies
    2: ['rgba(255, 200, 100, 0.6)', 'rgba(255, 180, 150, 0.6)'], // Orange/yellow
    7: ['rgba(255, 100, 150, 0.6)', 'rgba(200, 100, 200, 0.6)'], // Pink/purple
  };
  
  const birdColor = 'rgba(60, 60, 80, 0.4)';
  
  // Just 1-2 creatures flying slowly
  const creatureCount = 2;
  
  for (let i = 0; i < creatureCount; i++) {
    // Each creature has its own flight pattern
    const seed = levelId * 1000 + i * 123;
    const speedMultiplier = 0.08 + (i * 0.02); // Very slow: 0.08 - 0.1
    const baseX = ((time * speedMultiplier + seed * 100) % (width + 600)) - 200;
    const baseY = 50 + (i * 80); // Spread them out vertically
    
    // Very gentle wave motion
    const waveY = Math.sin(time / 1500 + i * 2) * 10;
    const waveX = Math.sin(time / 2000 + i * 1.5) * 5;
    
    const x = baseX + waveX;
    const y = baseY + waveY;
    
    if (isButterfly) {
      // Draw butterfly
      const colors = butterflyColors[levelId] || butterflyColors[1];
      const color = colors[i % colors.length];
      const wingFlap = Math.sin(time / 150 + i * 3) * 0.5 + 0.5; // Slower flap cycle
      const size = 10 + (i * 2);
      
      ctx.fillStyle = color;
      
      // Left wing
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, wingFlap * 0.6 + 0.4);
      ctx.beginPath();
      ctx.ellipse(-size * 0.6, 0, size, size * 0.7, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Right wing
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, wingFlap * 0.6 + 0.4);
      ctx.beginPath();
      ctx.ellipse(size * 0.6, 0, size, size * 0.7, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Body
      ctx.fillStyle = 'rgba(80, 60, 60, 0.5)';
      ctx.beginPath();
      ctx.ellipse(x, y, 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw bird (simple V shape)
      const wingAngle = Math.sin(time / 200 + i * 2) * 0.3; // Slower, gentler wing flap
      const size = 12 + (i * 3);
      
      ctx.strokeStyle = birdColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      // Left wing
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x - size * 0.5, y - size * wingAngle,
        x - size, y - size * 0.3 + wingAngle * size * 0.5
      );
      ctx.stroke();
      
      // Right wing
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + size * 0.5, y - size * wingAngle,
        x + size, y - size * 0.3 + wingAngle * size * 0.5
      );
      ctx.stroke();
    }
  }
}

// Helper: Draw sun or moon based on level theme
function drawCelestialBody(ctx: CanvasRenderingContext2D, width: number, height: number, offset: number, levelId: number) {
  // Determine if sun or moon based on level atmosphere
  const isMoon = levelId === 5 || levelId === 6 || levelId === 7; // Pearl Beach, Ring Mountain, Love Castle get moon
  
  // Position with very slow parallax
  const baseX = width * 0.75;
  const x = baseX - offset * 0.5;
  const y = 80 + (levelId % 3) * 20;
  const size = 45;
  
  if (isMoon) {
    // Draw moon
    // Outer glow
    const moonGlow = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 2);
    moonGlow.addColorStop(0, 'rgba(255, 255, 240, 0.15)');
    moonGlow.addColorStop(0.5, 'rgba(255, 255, 240, 0.05)');
    moonGlow.addColorStop(1, 'rgba(255, 255, 240, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon body
    const moonGradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
    moonGradient.addColorStop(0, 'rgba(255, 255, 250, 0.95)');
    moonGradient.addColorStop(0.7, 'rgba(230, 230, 220, 0.9)');
    moonGradient.addColorStop(1, 'rgba(200, 200, 190, 0.85)');
    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Subtle craters
    ctx.fillStyle = 'rgba(180, 180, 170, 0.3)';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.2, y + size * 0.3, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Draw sun
    // Outer glow
    const sunGlow = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 3);
    sunGlow.addColorStop(0, 'rgba(255, 230, 150, 0.25)');
    sunGlow.addColorStop(0.4, 'rgba(255, 220, 100, 0.1)');
    sunGlow.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun rays (subtle)
    ctx.strokeStyle = 'rgba(255, 220, 100, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const innerRadius = size * 1.2;
      const outerRadius = size * 1.8;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * innerRadius, y + Math.sin(angle) * innerRadius);
      ctx.lineTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
      ctx.stroke();
    }
    
    // Sun body
    const sunGradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
    sunGradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
    sunGradient.addColorStop(0.5, 'rgba(255, 230, 120, 0.85)');
    sunGradient.addColorStop(1, 'rgba(255, 200, 80, 0.8)');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Helper: Draw distant hills (very subtle, low contrast)
function drawDistantHills(ctx: CanvasRenderingContext2D, width: number, height: number, offset: number, levelId: number) {
  // Color based on level theme (subtle variations)
  const hillColors: Record<number, string> = {
    1: 'rgba(200, 180, 200, 0.3)', // Rose Garden - soft lavender
    2: 'rgba(210, 190, 170, 0.3)', // Candyland - warm beige
    3: 'rgba(180, 200, 220, 0.3)', // Toyland - soft blue
    4: 'rgba(190, 200, 180, 0.3)', // Letter Lane - sage green
    5: 'rgba(200, 190, 210, 0.3)', // Pearl Beach - soft purple
    6: 'rgba(220, 200, 180, 0.3)', // Ring Mountain - warm gold
    7: 'rgba(210, 180, 190, 0.3)', // Love Castle - romantic pink
  };
  
  ctx.fillStyle = hillColors[levelId] || 'rgba(200, 200, 200, 0.3)';
  
  // Draw multiple distant hill silhouettes
  ctx.beginPath();
  ctx.moveTo(0, height);
  
  for (let x = 0; x <= width + 200; x += 10) {
    const hillY = height * 0.55 + 
      Math.sin((x + offset) * 0.003) * 40 + 
      Math.sin((x + offset) * 0.007) * 25 +
      Math.sin((x + offset) * 0.002) * 60;
    ctx.lineTo(x, hillY);
  }
  
  ctx.lineTo(width + 200, height);
  ctx.closePath();
  ctx.fill();
}

// Helper: Draw mid-ground hills (slightly more visible)
function drawMidHills(ctx: CanvasRenderingContext2D, width: number, height: number, offset: number, levelId: number) {
  const hillColors: Record<number, string> = {
    1: 'rgba(150, 180, 150, 0.25)', // Rose Garden - soft green
    2: 'rgba(180, 160, 140, 0.25)', // Candyland - brown tint
    3: 'rgba(160, 180, 170, 0.25)', // Toyland - muted teal
    4: 'rgba(170, 180, 160, 0.25)', // Letter Lane - green
    5: 'rgba(160, 170, 190, 0.25)', // Pearl Beach - blue-gray
    6: 'rgba(180, 170, 150, 0.25)', // Ring Mountain - earth tone
    7: 'rgba(180, 160, 170, 0.25)', // Love Castle - mauve
  };
  
  ctx.fillStyle = hillColors[levelId] || 'rgba(170, 180, 160, 0.25)';
  
  ctx.beginPath();
  ctx.moveTo(0, height);
  
  for (let x = 0; x <= width + 200; x += 8) {
    const hillY = height * 0.65 + 
      Math.sin((x + offset * 1.2) * 0.005) * 35 + 
      Math.sin((x + offset * 1.2) * 0.012) * 20;
    ctx.lineTo(x, hillY);
  }
  
  ctx.lineTo(width + 200, height);
  ctx.closePath();
  ctx.fill();
}

// Helper: Draw background meadows (rolling green fields)
function drawBackgroundVegetation(ctx: CanvasRenderingContext2D, width: number, height: number, offset: number, levelId: number) {
  // Meadow colors - soft greens that blend with the sky
  const meadowColors: Record<number, { back: string; mid: string; front: string }> = {
    1: { back: 'rgba(140, 180, 120, 0.25)', mid: 'rgba(120, 170, 100, 0.3)', front: 'rgba(100, 160, 90, 0.35)' },
    2: { back: 'rgba(150, 175, 110, 0.25)', mid: 'rgba(130, 165, 95, 0.3)', front: 'rgba(115, 155, 85, 0.35)' },
    3: { back: 'rgba(130, 185, 130, 0.25)', mid: 'rgba(110, 175, 115, 0.3)', front: 'rgba(95, 165, 105, 0.35)' },
    4: { back: 'rgba(135, 175, 115, 0.25)', mid: 'rgba(115, 165, 100, 0.3)', front: 'rgba(100, 155, 90, 0.35)' },
    5: { back: 'rgba(130, 170, 130, 0.25)', mid: 'rgba(110, 160, 115, 0.3)', front: 'rgba(95, 150, 100, 0.35)' },
    6: { back: 'rgba(145, 170, 105, 0.25)', mid: 'rgba(125, 160, 90, 0.3)', front: 'rgba(110, 150, 80, 0.35)' },
    7: { back: 'rgba(140, 175, 120, 0.25)', mid: 'rgba(120, 165, 105, 0.3)', front: 'rgba(105, 155, 95, 0.35)' },
  };
  
  const colors = meadowColors[levelId] || meadowColors[1];
  
  // Back meadow layer (most distant, lightest)
  ctx.fillStyle = colors.back;
  ctx.beginPath();
  ctx.moveTo(-50, height);
  
  for (let x = -50; x <= width + 50; x += 4) {
    const adjustedX = x + offset * 0.15;
    // Gentle rolling hills
    const y = height * 0.62 + Math.sin(adjustedX * 0.004) * 25 + Math.sin(adjustedX * 0.01) * 12;
    ctx.lineTo(x, y);
  }
  
  ctx.lineTo(width + 50, height);
  ctx.closePath();
  ctx.fill();
  
  // Middle meadow layer
  ctx.fillStyle = colors.mid;
  ctx.beginPath();
  ctx.moveTo(-50, height);
  
  for (let x = -50; x <= width + 50; x += 4) {
    const adjustedX = x + offset * 0.25 + 150;
    const y = height * 0.68 + Math.sin(adjustedX * 0.005) * 20 + Math.sin(adjustedX * 0.012 + 1) * 10;
    ctx.lineTo(x, y);
  }
  
  ctx.lineTo(width + 50, height);
  ctx.closePath();
  ctx.fill();
  
  // Front meadow layer (closest, darkest green)
  ctx.fillStyle = colors.front;
  ctx.beginPath();
  ctx.moveTo(-50, height);
  
  for (let x = -50; x <= width + 50; x += 4) {
    const adjustedX = x + offset * 0.35 + 300;
    const y = height * 0.74 + Math.sin(adjustedX * 0.006) * 15 + Math.sin(adjustedX * 0.015 + 2) * 8;
    ctx.lineTo(x, y);
  }
  
  ctx.lineTo(width + 50, height);
  ctx.closePath();
  ctx.fill();
  
  // Flower colors based on level theme
  const flowerColors: Record<number, string[]> = {
    1: ['rgba(255, 200, 220, 0.6)', 'rgba(255, 255, 200, 0.6)', 'rgba(255, 180, 180, 0.5)'], // Pink, yellow, rose
    2: ['rgba(255, 220, 150, 0.6)', 'rgba(255, 180, 200, 0.5)', 'rgba(255, 255, 180, 0.6)'], // Orange, pink, cream
    3: ['rgba(200, 220, 255, 0.5)', 'rgba(255, 255, 200, 0.6)', 'rgba(220, 200, 255, 0.5)'], // Blue, yellow, lavender
    4: ['rgba(255, 255, 200, 0.6)', 'rgba(255, 200, 200, 0.5)', 'rgba(200, 255, 220, 0.5)'], // Yellow, pink, mint
    5: ['rgba(255, 255, 220, 0.6)', 'rgba(220, 240, 255, 0.5)', 'rgba(255, 220, 240, 0.5)'], // Cream, light blue, blush
    6: ['rgba(255, 230, 180, 0.6)', 'rgba(255, 200, 180, 0.5)', 'rgba(255, 255, 200, 0.6)'], // Peach, coral, yellow
    7: ['rgba(255, 180, 200, 0.6)', 'rgba(255, 150, 180, 0.6)', 'rgba(255, 220, 230, 0.5)'], // Pink, magenta, blush
  };
  
  const flowers = flowerColors[levelId] || flowerColors[1];
  
  // Seeded random for consistent flower positions
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  // Draw flowers on middle meadow
  for (let i = 0; i < 3; i++) {
    const seed = levelId * 100 + i;
    const baseX = seededRandom(seed) * (width + 200) - 50;
    const flowerX = ((baseX - offset * 0.25) % (width + 200)) - 50;
    const adjustedX = flowerX + offset * 0.25 + 150;
    const meadowY = height * 0.68 + Math.sin(adjustedX * 0.005) * 20 + Math.sin(adjustedX * 0.012 + 1) * 10;
    const flowerY = meadowY - 3 - seededRandom(seed + 50) * 8;
    const flowerSize = 3 + seededRandom(seed + 100) * 2;
    const colorIndex = Math.floor(seededRandom(seed + 150) * flowers.length);
    
    // Draw simple daisy flower
    ctx.fillStyle = flowers[colorIndex];
    // Petals (4-5 small circles around center)
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2;
      const petalX = flowerX + Math.cos(angle) * flowerSize * 0.6;
      const petalY = flowerY + Math.sin(angle) * flowerSize * 0.6;
      ctx.beginPath();
      ctx.arc(petalX, petalY, flowerSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center
    ctx.fillStyle = 'rgba(255, 220, 100, 0.7)';
    ctx.beginPath();
    ctx.arc(flowerX, flowerY, flowerSize * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw flowers on front meadow (slightly larger, more visible)
  for (let i = 0; i < 2; i++) {
    const seed = levelId * 200 + i + 500;
    const baseX = seededRandom(seed) * (width + 250) - 50;
    const flowerX = ((baseX - offset * 0.35) % (width + 250)) - 50;
    const adjustedX = flowerX + offset * 0.35 + 300;
    const meadowY = height * 0.74 + Math.sin(adjustedX * 0.006) * 15 + Math.sin(adjustedX * 0.015 + 2) * 8;
    const flowerY = meadowY - 4 - seededRandom(seed + 50) * 10;
    const flowerSize = 4 + seededRandom(seed + 100) * 2;
    const colorIndex = Math.floor(seededRandom(seed + 150) * flowers.length);
    
    // Draw simple daisy flower
    ctx.fillStyle = flowers[colorIndex];
    // Petals
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2 + 0.3;
      const petalX = flowerX + Math.cos(angle) * flowerSize * 0.6;
      const petalY = flowerY + Math.sin(angle) * flowerSize * 0.6;
      ctx.beginPath();
      ctx.arc(petalX, petalY, flowerSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center
    ctx.fillStyle = 'rgba(255, 230, 120, 0.8)';
    ctx.beginPath();
    ctx.arc(flowerX, flowerY, flowerSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Helper: Draw improved grass on ground platforms
function drawGrass(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  // Base grass layer
  const grassGradient = ctx.createLinearGradient(x, y - 12, x, y);
  grassGradient.addColorStop(0, '#7CCD7C');
  grassGradient.addColorStop(0.5, '#5CB85C');
  grassGradient.addColorStop(1, '#4CAF50');
  ctx.fillStyle = grassGradient;
  ctx.fillRect(x, y - 8, width, 8);
  
  // Grass blades
  ctx.fillStyle = '#90EE90';
  for (let i = 0; i < width; i += 8) {
    const bladeHeight = 6 + Math.sin(i * 0.5) * 3 + Math.random() * 2;
    const bladeWidth = 2 + Math.random();
    ctx.fillRect(x + i, y - 8 - bladeHeight, bladeWidth, bladeHeight);
  }
  
  // Darker grass accents
  ctx.fillStyle = '#228B22';
  for (let i = 5; i < width; i += 15) {
    const bladeHeight = 4 + Math.sin(i * 0.3) * 2;
    ctx.fillRect(x + i, y - 8 - bladeHeight, 2, bladeHeight);
  }
  
  // Subtle highlight on top edge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(x, y - 8, width, 2);
}
