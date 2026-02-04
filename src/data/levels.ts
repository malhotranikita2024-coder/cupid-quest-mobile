import { LevelData, Platform, Collectible, Enemy, Checkpoint, LevelFlag } from '@/types/game';

const GROUND_Y = 520;
const PLAYER_START_X = 100;

function createLevel1(): LevelData {
  const platforms: Platform[] = [
    // Main ground
    { x: 0, y: GROUND_Y, width: 600, height: 80, type: 'ground' },
    { x: 700, y: GROUND_Y, width: 400, height: 80, type: 'ground' },
    { x: 1200, y: GROUND_Y, width: 500, height: 80, type: 'ground' },
    { x: 1800, y: GROUND_Y, width: 400, height: 80, type: 'ground' },
    { x: 2300, y: GROUND_Y, width: 600, height: 80, type: 'ground' },
    
    // Floating platforms
    { x: 300, y: 400, width: 150, height: 30, type: 'floating' },
    { x: 500, y: 320, width: 120, height: 30, type: 'floating' },
    { x: 800, y: 380, width: 180, height: 30, type: 'floating' },
    { x: 1050, y: 300, width: 100, height: 30, type: 'floating' },
    { x: 1300, y: 400, width: 150, height: 30, type: 'floating' },
    { x: 1550, y: 350, width: 120, height: 30, type: 'floating' },
    { x: 1900, y: 420, width: 160, height: 30, type: 'floating' },
    { x: 2100, y: 340, width: 140, height: 30, type: 'floating' },
    { x: 2400, y: 380, width: 130, height: 30, type: 'floating' },
  ];

  const collectibles: Collectible[] = [
    // Ground level roses
    { x: 200, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 0 },
    { x: 300, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 0.5 },
    { x: 400, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 1 },
    { x: 750, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 1.5 },
    { x: 900, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 2 },
    
    // Platform roses
    { x: 350, y: 340, type: 'rose', collected: false, animationOffset: 0.3 },
    { x: 550, y: 260, type: 'rose', collected: false, animationOffset: 0.8 },
    { x: 870, y: 320, type: 'rose', collected: false, animationOffset: 1.3 },
    { x: 1080, y: 240, type: 'rose', collected: false, animationOffset: 1.8 },
    { x: 1350, y: 340, type: 'rose', collected: false, animationOffset: 2.3 },
    
    // More ground roses
    { x: 1250, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 0.2 },
    { x: 1400, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 0.7 },
    { x: 1550, y: 290, type: 'rose', collected: false, animationOffset: 1.2 },
    { x: 1950, y: 360, type: 'rose', collected: false, animationOffset: 1.7 },
    { x: 2150, y: 280, type: 'rose', collected: false, animationOffset: 2.2 },
    
    // End area roses
    { x: 2400, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 0.4 },
    { x: 2500, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 0.9 },
    { x: 2600, y: GROUND_Y - 60, type: 'rose', collected: false, animationOffset: 1.4 },
    { x: 2450, y: 320, type: 'rose', collected: false, animationOffset: 1.9 },
    
    // Fortune cookie (hidden on high platform)
    { x: 1080, y: 230, type: 'cookie', collected: false, animationOffset: 0 },
  ];

  const enemies: Enemy[] = [
    { x: 250, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 150, patrolEnd: 500 },
    { x: 800, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 1.5, isDefeated: false, direction: -1, patrolStart: 720, patrolEnd: 1050 },
    { x: 1350, y: GROUND_Y - 40, width: 50, height: 40, type: 'brokenHeartSlime', velocityX: 1, isDefeated: false, direction: 1, patrolStart: 1250, patrolEnd: 1600 },
    { x: 1900, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 2, isDefeated: false, direction: -1, patrolStart: 1820, patrolEnd: 2150 },
    { x: 2450, y: GROUND_Y - 40, width: 50, height: 40, type: 'brokenHeartSlime', velocityX: 1.2, isDefeated: false, direction: 1, patrolStart: 2350, patrolEnd: 2700 },
  ];

  const checkpoint: Checkpoint = { x: 1400, y: GROUND_Y - 80, activated: false };
  
  const flag: LevelFlag = { x: 2750, y: GROUND_Y - 120, reached: false };

  return {
    id: 1,
    name: 'Rose Garden',
    collectibleType: 'rose',
    collectibleEmoji: '🌹',
    theme: 'Rose gardens, heart flowers, pink skies',
    platforms,
    collectibles,
    enemies,
    checkpoint,
    flag,
    backgroundColor: '#FFE4EC',
    groundColor: '#8B4557',
  };
}

function createLevel2(): LevelData {
  const platforms: Platform[] = [
    { x: 0, y: GROUND_Y, width: 500, height: 80, type: 'ground' },
    { x: 600, y: GROUND_Y, width: 300, height: 80, type: 'ground' },
    { x: 1000, y: GROUND_Y, width: 400, height: 80, type: 'ground' },
    { x: 1500, y: GROUND_Y, width: 350, height: 80, type: 'ground' },
    { x: 1950, y: GROUND_Y, width: 500, height: 80, type: 'ground' },
    
    { x: 250, y: 420, width: 130, height: 30, type: 'floating' },
    { x: 450, y: 350, width: 100, height: 30, type: 'floating' },
    { x: 700, y: 400, width: 150, height: 30, type: 'floating' },
    { x: 950, y: 320, width: 120, height: 30, type: 'floating' },
    { x: 1150, y: 400, width: 140, height: 30, type: 'floating' },
    { x: 1350, y: 340, width: 110, height: 30, type: 'floating' },
    { x: 1600, y: 380, width: 160, height: 30, type: 'floating' },
    { x: 1850, y: 300, width: 130, height: 30, type: 'floating' },
    { x: 2100, y: 360, width: 150, height: 30, type: 'floating' },
  ];

  const collectibles: Collectible[] = [];
  for (let i = 0; i < 20; i++) {
    collectibles.push({
      x: 150 + i * 120,
      y: i % 2 === 0 ? GROUND_Y - 60 : 280 + (i % 3) * 40,
      type: 'chocolate',
      collected: false,
      animationOffset: i * 0.2,
    });
  }
  collectibles.push({ x: 1880, y: 240, type: 'cookie', collected: false, animationOffset: 0 });

  const enemies: Enemy[] = [
    { x: 300, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: 1, patrolStart: 100, patrolEnd: 450 },
    { x: 750, y: GROUND_Y - 40, width: 50, height: 40, type: 'brokenHeartSlime', velocityX: 1.3, isDefeated: false, direction: -1, patrolStart: 620, patrolEnd: 880 },
    { x: 1100, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 1.8, isDefeated: false, direction: 1, patrolStart: 1020, patrolEnd: 1350 },
    { x: 1600, y: GROUND_Y - 40, width: 50, height: 40, type: 'brokenHeartSlime', velocityX: 1.5, isDefeated: false, direction: -1, patrolStart: 1520, patrolEnd: 1800 },
    { x: 2100, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 1970, patrolEnd: 2350 },
  ];

  return {
    id: 2,
    name: 'Candyland',
    collectibleType: 'chocolate',
    collectibleEmoji: '🍫',
    theme: 'Chocolate blocks and sweet treats',
    platforms,
    collectibles,
    enemies,
    checkpoint: { x: 1200, y: GROUND_Y - 80, activated: false },
    flag: { x: 2300, y: GROUND_Y - 120, reached: false },
    backgroundColor: '#FFF0E6',
    groundColor: '#8B5A2B',
  };
}

// Create simple placeholder levels for 3-7
function createSimpleLevel(id: number, name: string, emoji: string, collectibleType: string, bgColor: string, groundColor: string): LevelData {
  const platforms: Platform[] = [
    { x: 0, y: GROUND_Y, width: 800, height: 80, type: 'ground' },
    { x: 900, y: GROUND_Y, width: 600, height: 80, type: 'ground' },
    { x: 1600, y: GROUND_Y, width: 700, height: 80, type: 'ground' },
    
    { x: 300, y: 400, width: 150, height: 30, type: 'floating' },
    { x: 600, y: 340, width: 120, height: 30, type: 'floating' },
    { x: 1000, y: 380, width: 180, height: 30, type: 'floating' },
    { x: 1300, y: 300, width: 140, height: 30, type: 'floating' },
    { x: 1700, y: 360, width: 160, height: 30, type: 'floating' },
    { x: 2000, y: 320, width: 130, height: 30, type: 'floating' },
  ];

  const collectibles: Collectible[] = [];
  for (let i = 0; i < 15; i++) {
    collectibles.push({
      x: 150 + i * 140,
      y: i % 2 === 0 ? GROUND_Y - 60 : 260 + (i % 3) * 40,
      type: collectibleType as any,
      collected: false,
      animationOffset: i * 0.25,
    });
  }
  collectibles.push({ x: 1330, y: 240, type: 'cookie', collected: false, animationOffset: 0 });

  const enemies: Enemy[] = [
    { x: 400, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 100, patrolEnd: 700 },
    { x: 1000, y: GROUND_Y - 40, width: 50, height: 40, type: 'brokenHeartSlime', velocityX: 1.5, isDefeated: false, direction: -1, patrolStart: 920, patrolEnd: 1400 },
    { x: 1800, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 1.8, isDefeated: false, direction: 1, patrolStart: 1620, patrolEnd: 2200 },
  ];

  return {
    id,
    name,
    collectibleType,
    collectibleEmoji: emoji,
    theme: name,
    platforms,
    collectibles,
    enemies,
    checkpoint: { x: 1100, y: GROUND_Y - 80, activated: false },
    flag: { x: 2150, y: GROUND_Y - 120, reached: false },
    backgroundColor: bgColor,
    groundColor,
  };
}

export function getLevelData(levelId: number): LevelData {
  switch (levelId) {
    case 1:
      return createLevel1();
    case 2:
      return createLevel2();
    case 3:
      return createSimpleLevel(3, 'Toyland', '🧸', 'teddy', '#E8F4FF', '#9B7653');
    case 4:
      return createSimpleLevel(4, 'Letter Lane', '💌', 'letter', '#FFF5F5', '#C9A0DC');
    case 5:
      return createSimpleLevel(5, 'Pearl Ocean', '💎', 'pearl', '#E0F7FA', '#00ACC1');
    case 6:
      return createSimpleLevel(6, 'Golden Palace', '💍', 'ring', '#FFF8E1', '#FFB300');
    case 7:
      return createSimpleLevel(7, 'Cupid Sky', '🏹', 'arrow', '#FCE4EC', '#E91E63');
    default:
      return createLevel1();
  }
}

export const COLLECTIBLE_EMOJIS: Record<string, string> = {
  rose: '🌹',
  chocolate: '🍫',
  teddy: '🧸',
  letter: '💌',
  pearl: '💎',
  ring: '💍',
  arrow: '🏹',
  cookie: '🍪',
};
