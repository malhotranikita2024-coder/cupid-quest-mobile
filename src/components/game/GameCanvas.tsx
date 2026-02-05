import React, { useRef, useEffect, useCallback } from 'react';
import { PlayerState, TouchControls, LevelData, HitBlock, Pipe, FallingHazard, Fireball } from '@/types/game';
import { COLLECTIBLE_EMOJIS } from '@/data/levels';

interface GameCanvasProps {
  levelData: LevelData;
  player: PlayerState;
  controls: TouchControls;
  onPlayerUpdate: (player: PlayerState) => void;
  onCollectItem: (index: number) => void;
  onCollectCookie: (index: number) => void;
  onEnemyDefeated: (index: number) => void;
  onPlayerHit: () => void;
  onCheckpointReached: () => void;
  onFlagReached: () => void;
  onBlockHit: (index: number) => void;
  onJump: () => void;
  isPaused: boolean;
  cameraX: number;
  onCameraUpdate: (x: number) => void;
  onFireballHit?: () => void;
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
  onEnemyDefeated,
  onPlayerHit,
  onCheckpointReached,
  onFlagReached,
  onBlockHit,
  onJump,
  isPaused,
  cameraX,
  onCameraUpdate,
  onFireballHit,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const wasJumpingRef = useRef(false);

  const updatePlayer = useCallback(() => {
    if (isPaused) return;

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

    // Fall into pit detection
    if (newPlayer.y > 700) {
      onPlayerHit();
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
      if (
        newPlayer.x + PLAYER_WIDTH > fx &&
        newPlayer.x < fx + 60 &&
        newPlayer.y + PLAYER_HEIGHT > fy
      ) {
        onFlagReached();
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
  }, [player, controls, levelData, isPaused, onPlayerUpdate, onCollectItem, onCollectCookie, onEnemyDefeated, onPlayerHit, onCheckpointReached, onFlagReached, onBlockHit, onJump, onCameraUpdate, onFireballHit]);

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
        // Larger enemy - 90-120% of player height (50px)
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🌵', pipe.x + pipe.width / 2, pipe.y - 20);
      }

      // Fire pipe
      if (pipe.hasFire && pipe.fireActive) {
        // Draw fire shooting up
        const fireHeight = 80;
        for (let i = 0; i < fireHeight; i += 15) {
          const fireAlpha = 1 - (i / fireHeight) * 0.5;
          const wobble = Math.sin(time / 50 + i * 0.2) * 5;
          ctx.fillStyle = `rgba(255, ${100 + i}, 0, ${fireAlpha})`;
          ctx.beginPath();
          ctx.arc(pipe.x + pipe.width / 2 + wobble, pipe.y - i, 15 - i * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        // Fire emoji at top
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔥', pipe.x + pipe.width / 2, pipe.y - 50);
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
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔥', fireball.x + fireball.width / 2, fireball.y + wobble + 15);
    });

    // Draw falling hazards
    levelData.fallingHazards.forEach(hazard => {
      if (!hazard.isActive) return;
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💔', hazard.x + hazard.width / 2, hazard.y + 30);
    });

    // Draw collectibles
    levelData.collectibles.forEach(collectible => {
      if (collectible.collected) return;
      
      const bobY = Math.sin(time / 300 + collectible.animationOffset * Math.PI) * 5;
      const emoji = COLLECTIBLE_EMOJIS[collectible.type] || '🌹';
      
      if (collectible.type === 'cookie') {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowColor = '#FF69B4';
        ctx.shadowBlur = 10;
      }
      
      ctx.font = collectible.type === 'cookie' ? '36px Arial' : '28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, collectible.x, collectible.y + bobY);
      ctx.shadowBlur = 0;
    });

    // Draw enemies
    levelData.enemies.forEach(enemy => {
      if (enemy.isDefeated) return;
      
      const wobble = Math.sin(time / 200) * 3;
      // Larger, more readable enemies with higher contrast
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      
      if (enemy.type === 'heartBug') {
        ctx.fillText('💗', enemy.x + enemy.width / 2, enemy.y - 5 + wobble);
        ctx.font = '28px Arial';
        ctx.fillText('🐛', enemy.x + enemy.width / 2, enemy.y + 22 + wobble);
        // Show fireball indicator for shooting enemies
        if (enemy.canShoot) {
          ctx.font = '16px Arial';
          ctx.fillText('🔥', enemy.x + enemy.width / 2 + 15, enemy.y - 10);
        }
      } else if (enemy.type === 'brokenHeartSlime') {
        ctx.fillText('💔', enemy.x + enemy.width / 2, enemy.y + 15 + wobble);
        if (enemy.canShoot) {
          ctx.font = '16px Arial';
          ctx.fillText('🔥', enemy.x + enemy.width / 2 + 15, enemy.y - 10);
        }
      } else if (enemy.type === 'jealousCloud') {
        ctx.fillText('😤', enemy.x + enemy.width / 2, enemy.y + 20 + wobble);
        ctx.font = '32px Arial';
        ctx.fillText('☁️', enemy.x + enemy.width / 2, enemy.y + 45 + wobble);
      }
    });

    // Draw checkpoint
    if (!levelData.checkpoint.activated) {
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🚩', levelData.checkpoint.x + 30, levelData.checkpoint.y + 20);
    } else {
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('✅', levelData.checkpoint.x + 30, levelData.checkpoint.y + 20);
    }

    // Draw flag
    const flagReached = levelData.flag.reached;
    const flagWave = Math.sin(time / 200) * 5;
    
    // Flag pole
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(levelData.flag.x + 25, levelData.flag.y, 10, 120);
    
    // Flag (red before touch, green after)
    ctx.fillStyle = flagReached ? '#4CAF50' : '#FF4444';
    ctx.beginPath();
    ctx.moveTo(levelData.flag.x + 35, levelData.flag.y + 10);
    ctx.lineTo(levelData.flag.x + 80 + flagWave, levelData.flag.y + 30);
    ctx.lineTo(levelData.flag.x + 35, levelData.flag.y + 50);
    ctx.closePath();
    ctx.fill();
    
    // Heart on flag
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(flagReached ? '💚' : '❤️', levelData.flag.x + 55 + flagWave, levelData.flag.y + 35);

    // Draw player
    const blinkVisible = !player.isInvincible || Math.floor(time / 100) % 2 === 0;
    if (blinkVisible) {
      ctx.save();
      
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

// Helper: Draw background vegetation (bushes and trees behind gameplay)
function drawBackgroundVegetation(ctx: CanvasRenderingContext2D, width: number, height: number, offset: number, levelId: number) {
  // Tree/bush colors based on level
  const treeColors: Record<number, { trunk: string; leaves: string }> = {
    1: { trunk: 'rgba(101, 67, 33, 0.3)', leaves: 'rgba(60, 120, 60, 0.35)' },
    2: { trunk: 'rgba(110, 70, 40, 0.3)', leaves: 'rgba(70, 110, 50, 0.35)' },
    3: { trunk: 'rgba(90, 60, 40, 0.3)', leaves: 'rgba(50, 130, 80, 0.35)' },
    4: { trunk: 'rgba(100, 65, 35, 0.3)', leaves: 'rgba(55, 115, 55, 0.35)' },
    5: { trunk: 'rgba(95, 60, 45, 0.3)', leaves: 'rgba(60, 100, 70, 0.35)' },
    6: { trunk: 'rgba(105, 70, 35, 0.3)', leaves: 'rgba(65, 105, 50, 0.35)' },
    7: { trunk: 'rgba(100, 60, 50, 0.3)', leaves: 'rgba(70, 120, 60, 0.35)' },
  };
  
  const colors = treeColors[levelId] || treeColors[1];
  const groundY = height * 0.82; // Where vegetation sits
  
  // Draw bushes at regular intervals
  for (let i = 0; i < 15; i++) {
    const bushX = ((i * 350 - offset * 0.6) % (width + 400)) - 100;
    const bushSize = 35 + (i % 3) * 15;
    
    // Draw bush (cluster of circles)
    ctx.fillStyle = colors.leaves;
    ctx.beginPath();
    ctx.arc(bushX, groundY, bushSize, 0, Math.PI * 2);
    ctx.arc(bushX - bushSize * 0.6, groundY + 5, bushSize * 0.7, 0, Math.PI * 2);
    ctx.arc(bushX + bushSize * 0.6, groundY + 5, bushSize * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw distant trees (taller, further back)
  for (let i = 0; i < 8; i++) {
    const treeX = ((i * 550 + 200 - offset * 0.4) % (width + 600)) - 100;
    const treeHeight = 80 + (i % 3) * 30;
    const trunkWidth = 12 + (i % 2) * 4;
    
    // Trunk
    ctx.fillStyle = colors.trunk;
    ctx.fillRect(treeX - trunkWidth / 2, groundY - treeHeight * 0.4, trunkWidth, treeHeight * 0.5);
    
    // Foliage (triangular for conifers, rounded for deciduous)
    ctx.fillStyle = colors.leaves;
    if (i % 2 === 0) {
      // Rounded tree top
      ctx.beginPath();
      ctx.arc(treeX, groundY - treeHeight * 0.5, treeHeight * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(treeX - 15, groundY - treeHeight * 0.35, treeHeight * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(treeX + 15, groundY - treeHeight * 0.35, treeHeight * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Triangular pine tree
      ctx.beginPath();
      ctx.moveTo(treeX, groundY - treeHeight);
      ctx.lineTo(treeX - treeHeight * 0.35, groundY - treeHeight * 0.3);
      ctx.lineTo(treeX + treeHeight * 0.35, groundY - treeHeight * 0.3);
      ctx.closePath();
      ctx.fill();
    }
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
