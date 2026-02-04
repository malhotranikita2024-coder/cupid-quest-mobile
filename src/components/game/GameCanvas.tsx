import React, { useRef, useEffect, useCallback } from 'react';
import { PlayerState, TouchControls, LevelData, HitBlock, Pipe, FallingHazard } from '@/types/game';
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
  }, [player, controls, levelData, isPaused, onPlayerUpdate, onCollectItem, onCollectCookie, onEnemyDefeated, onPlayerHit, onCheckpointReached, onFlagReached, onBlockHit, onJump, onCameraUpdate]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = levelData.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Parallax background
    const bgOffset = cameraX * 0.3;
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 12; i++) {
      const cloudX = (i * 450 - bgOffset) % (width + 300) - 150;
      const cloudY = 50 + (i % 3) * 50;
      drawCloud(ctx, cloudX, cloudY, 80 + (i % 2) * 40);
    }

    // Hearts
    ctx.fillStyle = 'rgba(255, 182, 193, 0.3)';
    for (let i = 0; i < 15; i++) {
      const heartX = (i * 350 - bgOffset * 0.5) % (width + 200) - 100;
      const heartY = 100 + (i % 4) * 70 + Math.sin(time / 1000 + i) * 10;
      drawHeart(ctx, heartX, heartY, 12 + (i % 3) * 5);
    }

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw platforms
    levelData.platforms.forEach(platform => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(platform.x + 5, platform.y + 5, platform.width, platform.height);
      
      const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
      if (platform.type === 'ground') {
        gradient.addColorStop(0, '#7B3F50');
        gradient.addColorStop(0.3, levelData.groundColor);
        gradient.addColorStop(1, '#5C2E3B');
      } else {
        gradient.addColorStop(0, '#FFB6C1');
        gradient.addColorStop(1, '#FF8DA1');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(platform.x, platform.y, platform.width, 4);
      
      if (platform.type === 'ground') {
        ctx.fillStyle = '#90EE90';
        for (let i = 0; i < platform.width; i += 20) {
          const grassHeight = 8 + Math.sin(i) * 3;
          ctx.fillRect(platform.x + i, platform.y - grassHeight, 3, grassHeight);
        }
      }
    });

    // Draw pipes
    levelData.pipes.forEach(pipe => {
      // Pipe body (Valentine pink/magenta)
      const pipeGradient = ctx.createLinearGradient(pipe.x, pipe.y, pipe.x + pipe.width, pipe.y);
      pipeGradient.addColorStop(0, '#FF69B4');
      pipeGradient.addColorStop(0.3, '#FF1493');
      pipeGradient.addColorStop(0.7, '#FF1493');
      pipeGradient.addColorStop(1, '#C71585');
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
      
      // Pipe rim
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(pipe.x - 5, pipe.y, pipe.width + 10, 15);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(pipe.x - 5, pipe.y, pipe.width + 10, 4);

      // Pipe enemy
      if (pipe.hasEnemy && pipe.enemyVisible) {
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🌵', pipe.x + pipe.width / 2, pipe.y - 10);
      }
    });

    // Draw hit blocks
    levelData.hitBlocks.forEach(block => {
      const bounceOffset = block.bounceTimer > 0 ? Math.sin(block.bounceTimer * 0.5) * 5 : 0;
      const blockY = block.y - bounceOffset;
      
      if (block.type === 'question' && !block.isHit) {
        // Question block - Valentine themed
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(block.x, blockY, block.width, block.height);
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(block.x, blockY + block.height - 5, block.width, 5);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(block.x, blockY, block.width, 5);
        
        // Heart instead of ?
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💗', block.x + block.width / 2, blockY + 30);
      } else if (block.type === 'brick') {
        // Brick block
        ctx.fillStyle = '#CD5C5C';
        ctx.fillRect(block.x, blockY, block.width, block.height);
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(block.x, blockY + block.height - 4, block.width, 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(block.x, blockY, block.width, 4);
        // Brick lines
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x + 2, blockY + 2, block.width - 4, block.height - 4);
      } else {
        // Used block
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(block.x, blockY, block.width, block.height);
        ctx.fillStyle = '#6B5344';
        ctx.fillRect(block.x, blockY + block.height - 4, block.width, 4);
      }
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
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      
      if (enemy.type === 'heartBug') {
        ctx.fillText('💗', enemy.x + enemy.width / 2, enemy.y + wobble);
        ctx.font = '24px Arial';
        ctx.fillText('🐛', enemy.x + enemy.width / 2, enemy.y + 25 + wobble);
      } else if (enemy.type === 'brokenHeartSlime') {
        ctx.fillText('💔', enemy.x + enemy.width / 2, enemy.y + 20 + wobble);
      } else if (enemy.type === 'jealousCloud') {
        ctx.fillText('😤', enemy.x + enemy.width / 2, enemy.y + 20 + wobble);
        ctx.fillText('☁️', enemy.x + enemy.width / 2, enemy.y + 40 + wobble);
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
    const flagWave = Math.sin(time / 200) * 5;
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('❤️', levelData.flag.x + 30 + flagWave, levelData.flag.y + 30);
    ctx.font = '36px Arial';
    ctx.fillText('🏁', levelData.flag.x + 30, levelData.flag.y + 70);

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
      
      const bodyGradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + PLAYER_HEIGHT);
      bodyGradient.addColorStop(0, '#FF6B9D');
      bodyGradient.addColorStop(1, '#FF4081');
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.roundRect(player.x + 5, player.y + 15, PLAYER_WIDTH - 10, PLAYER_HEIGHT - 20, 10);
      ctx.fill();
      
      ctx.fillStyle = '#FFE4C4';
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_WIDTH / 2, player.y + 12, 14, 0, Math.PI * 2);
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
