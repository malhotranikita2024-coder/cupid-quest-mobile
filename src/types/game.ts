export type GameScreen = 
  | 'menu' 
  | 'howToPlay' 
  | 'settings' 
  | 'game' 
  | 'levelComplete' 
  | 'gameOver' 
  | 'story' 
  | 'finalEnding'
  | 'badges'
  | 'leaderboard';

export interface GameState {
  screen: GameScreen;
  playerName: string;
  currentLevel: number;
  lives: number;
  score: number;
  collectibles: number;
  fortuneCookieCollected: boolean;
  completedLevels: number[];
  musicEnabled: boolean;
  sfxEnabled: boolean;
  isPaused: boolean;
  timeRemaining: number;
  hasFinishedGame: boolean;
  hasShield: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isRunning: boolean;
  facingRight: boolean;
  isGrounded: boolean;
  isInvincible: boolean;
  invincibleTimer: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'floating' | 'moving' | 'falling';
  moveDirection?: 'horizontal' | 'vertical';
  moveSpeed?: number;
  moveRange?: number;
  originalX?: number;
  originalY?: number;
}

export interface HitBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'question' | 'brick';
  isHit: boolean;
  contents?: 'collectible' | 'cookie' | 'none' | 'shield' | 'burst';
  bounceTimer: number;
}

export interface Pipe {
  x: number;
  y: number;
  width: number;
  height: number;
  hasEnemy: boolean;
  hasFire?: boolean;
  fireActive?: boolean;
  fireTimer?: number;
  enemyTimer: number;
  enemyVisible: boolean;
  enemyDirection: 'up' | 'down';
}

export interface FallingHazard {
  x: number;
  y: number;
  width: number;
  height: number;
  triggerX: number;
  isFalling: boolean;
  velocityY: number;
  isActive: boolean;
}

export interface Collectible {
  x: number;
  y: number;
  type: 'rose' | 'chocolate' | 'teddy' | 'letter' | 'pearl' | 'ring' | 'arrow' | 'cookie' | 'shield';
  collected: boolean;
  animationOffset: number;
  fromBlock?: boolean;
  velocityX?: number;
  velocityY?: number;
  isBurst?: boolean;
  sparkleTimer?: number;
   spawnTime?: number;
   isExpiring?: boolean;
   expiryProgress?: number;
   isGrounded?: boolean;
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'heartBug' | 'brokenHeartSlime' | 'jealousCloud';
  velocityX: number;
  isDefeated: boolean;
  direction: 1 | -1;
  patrolStart: number;
  patrolEnd: number;
  canShoot?: boolean;
  shootTimer?: number;
  isGrouped?: boolean;
}

export interface Fireball {
  x: number;
  y: number;
  velocityX: number;
  width: number;
  height: number;
  isActive: boolean;
}

export interface Checkpoint {
  x: number;
  y: number;
  activated: boolean;
}

export interface LevelFlag {
  x: number;
  y: number;
  reached: boolean;
  // Shake animation when player reaches without mid-flag
  shakeTimer?: number;
  // Flag planting animation
  isPlanting?: boolean;
  plantProgress?: number;
  plantedFlag?: boolean;
}

export interface MidLevelFlag {
  x: number;
  y: number;
  collected: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  collectibleType: string;
  collectibleEmoji: string;
  theme: string;
  platforms: Platform[];
  collectibles: Collectible[];
  enemies: Enemy[];
  hitBlocks: HitBlock[];
  pipes: Pipe[];
  fallingHazards: FallingHazard[];
  fireballs: Fireball[];
  checkpoint: Checkpoint;
  flag: LevelFlag;
  midFlag: MidLevelFlag;
  backgroundColor: string;
  groundColor: string;
  levelWidth: number;
}

export interface TouchControls {
  left: boolean;
  right: boolean;
  jump: boolean;
  run: boolean;
}

export const LEVEL_STORIES: Record<number, { before?: string; after: string }> = {
  1: {
    after: "Great start, {name}! 🌹 These roses will make the surprise bloom with love."
  },
  2: {
    after: "Sweet choice, {name}! 🍫 Love tastes better with chocolate."
  },
  3: {
    after: "A cozy touch! 🧸 This teddy will keep the Valentine warmth alive."
  },
  4: {
    after: "Words matter, {name} 💌 A letter can carry a heart across any distance."
  },
  5: {
    after: "Elegant and rare! 💎 Pearls make the surprise feel truly special."
  },
  6: {
    after: "Almost there, {name} 💍 A ring means promise, trust, and forever vibes."
  },
  7: {
    before: "Final step, hero 🏹 Collect Cupid's arrows and complete the ultimate Valentine surprise!",
    after: ""
  }
};

export const LEVEL_INFO: { emoji: string; name: string; theme: string }[] = [
  { emoji: '🌹', name: 'Rose Garden', theme: 'Rose gardens, heart flowers, pink skies' },
  { emoji: '🍫', name: 'Candyland', theme: 'Chocolate blocks and sweet treats' },
  { emoji: '🧸', name: 'Toyland', theme: 'Plush clouds and soft toys' },
  { emoji: '💌', name: 'Letter Lane', theme: 'Floating envelopes and messages' },
  { emoji: '💎', name: 'Pearl Ocean', theme: 'Shell platforms and underwater beauty' },
  { emoji: '💍', name: 'Golden Palace', theme: 'Jewelry and golden treasures' },
  { emoji: '🏹', name: 'Cupid Sky', theme: 'Clouds and love arrows' },
];
