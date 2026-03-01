import { LevelData, Platform, Collectible, Enemy, HitBlock, Pipe, FallingHazard, Fireball } from '@/types/game';

const GROUND_Y = 520;
const LEVEL_WIDTH = 6000; // Extended level width for 4-5 min gameplay

// Helper to create stair platforms leading up to the end platform
// These are real collision platforms matching the visual stairs in GameCanvas
function createStairPlatforms(): Platform[] {
  const endPlatformX = 5750;
  const stairCount = 4;
  const stairWidth = 35;
  const stairHeight = 15;
  const stairsStartX = endPlatformX - stairCount * stairWidth;
  
  return Array.from({ length: stairCount }, (_, i) => ({
    x: stairsStartX + i * stairWidth,
    y: GROUND_Y - (i + 1) * stairHeight,
    width: stairWidth,
    height: (i + 1) * stairHeight,
    type: 'ground' as const,
  }));
}

// Helper to create ground segments with gaps
function createGroundSegments(segments: { start: number; width: number }[]): Platform[] {
  return segments.map(seg => ({
    x: seg.start,
    y: GROUND_Y,
    width: seg.width,
    height: 80,
    type: 'ground' as const,
  }));
}

// Helper to create floating platforms
function createFloatingPlatform(x: number, y: number, width: number = 120): Platform {
  return { x, y, width, height: 30, type: 'floating' as const };
}

// Helper to create question/brick blocks
function createQuestionBlock(x: number, y: number, contents: 'collectible' | 'cookie' | 'none' = 'collectible'): HitBlock {
  return { x, y, width: 40, height: 40, type: 'question', isHit: false, contents, bounceTimer: 0 };
}

function createBrickBlock(x: number, y: number): HitBlock {
  return { x, y, width: 40, height: 40, type: 'brick', isHit: false, contents: 'none', bounceTimer: 0 };
}

// Helper to create a row of blocks with question block in the middle
function createBlockRow(x: number, y: number, pattern: ('brick' | 'question')[] = ['brick', 'question', 'brick'], contents: 'collectible' | 'cookie' | 'none' = 'collectible'): HitBlock[] {
  return pattern.map((type, i) => {
    if (type === 'question') {
      return createQuestionBlock(x + i * 40, y, contents);
    }
    return createBrickBlock(x + i * 40, y);
  });
}

// Helper to create pipe with enemy
function createPipe(x: number, hasEnemy: boolean = true, hasFire: boolean = false): Pipe {
  return { x, y: GROUND_Y - 80, width: 60, height: 80, hasEnemy: hasEnemy && !hasFire, hasFire, fireTimer: 0, fireActive: false, enemyTimer: 0, enemyVisible: false, enemyDirection: 'up' };
}

// Helper to create fire pipe
function createFirePipe(x: number): Pipe {
  return createPipe(x, false, true);
}

// Helper to create falling hazard
function createFallingHazard(x: number, y: number, triggerX: number): FallingHazard {
  return { x, y, width: 40, height: 40, triggerX, isFalling: false, velocityY: 0, isActive: true };
}

function createLevel1(): LevelData {
  // Level 1: Rose Garden - Tutorial feel, wide platforms, few enemies
  const platforms: Platform[] = [
    ...createGroundSegments([
      { start: 0, width: 800 },
      { start: 900, width: 600 },
      { start: 1600, width: 500 },
      { start: 2200, width: 700 },
      { start: 3000, width: 600 },
      { start: 3700, width: 500 },
      { start: 4300, width: 700 },
      { start: 5100, width: 800 },
    ]),
    // End platform - wide brick platform for flag planting
    { x: 5750, y: GROUND_Y - 60, width: 200, height: 60, type: 'ground' as const },
    ...createStairPlatforms(),
    // Floating platforms - generous spacing, no crowding
    // Only 2 height tiers: y=380 (low) and y=280 (high) - 100px apart for clear jumps
    createFloatingPlatform(400, 380, 120),    // Low tier
    createFloatingPlatform(700, 280, 100),    // High tier - well separated
    createFloatingPlatform(1100, 380, 140),   // Low tier
    createFloatingPlatform(1400, 280, 110),   // High tier
    createFloatingPlatform(1800, 380, 130),   // Low tier
    createFloatingPlatform(2100, 280, 100),   // High tier
    createFloatingPlatform(2550, 380, 130),   // Low tier
    createFloatingPlatform(2900, 280, 110),   // High tier
    createFloatingPlatform(3250, 380, 120),   // Low tier
    createFloatingPlatform(3550, 250, 100),   // Extra high for cookie
    createFloatingPlatform(3950, 380, 120),   // Low tier
    createFloatingPlatform(4350, 280, 100),   // High tier
    createFloatingPlatform(4700, 380, 130),   // Low tier
    createFloatingPlatform(5050, 280, 100),   // High tier
    createFloatingPlatform(5350, 380, 130),   // Low tier
    createFloatingPlatform(5700, 280, 100),   // High tier - final
  ];

  const collectibles: Collectible[] = [];
  // Ground level roses
  for (let i = 0; i < 40; i++) {
    const x = 150 + i * 140;
    if (x < LEVEL_WIDTH - 200) {
      collectibles.push({
        x,
        y: i % 3 === 0 ? 280 : GROUND_Y - 60,
        type: 'rose',
        collected: false,
        animationOffset: i * 0.15,
      });
    }
  }
  // Fortune cookie - hidden on high platform
  collectibles.push({ x: 3580, y: 190, type: 'cookie', collected: false, animationOffset: 0 });

  const enemies: Enemy[] = [
    { x: 1800, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 1600, patrolEnd: 2000 },
    { x: 1100, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 1.5, isDefeated: false, direction: -1, patrolStart: 950, patrolEnd: 1400 },
    { x: 2400, y: GROUND_Y - 40, width: 50, height: 40, type: 'brokenHeartSlime', velocityX: 1, isDefeated: false, direction: 1, patrolStart: 2250, patrolEnd: 2800 },
    { x: 3200, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 2, isDefeated: false, direction: -1, patrolStart: 3050, patrolEnd: 3500 },
    { x: 4500, y: GROUND_Y - 40, width: 50, height: 40, type: 'heartBug', velocityX: 1.8, isDefeated: false, direction: 1, patrolStart: 4350, patrolEnd: 4900 },
    { x: 5300, y: GROUND_Y - 40, width: 50, height: 40, type: 'brokenHeartSlime', velocityX: 1.2, isDefeated: false, direction: -1, patrolStart: 5150, patrolEnd: 5700 },
  ];
  // Scale all Level 1 enemies down 30% (hitbox width: 50->35, height: 40->28)
  enemies.forEach(e => { e.width = 35; e.height = 28; });

  const hitBlocks: HitBlock[] = [
    // Golden blocks at y=420 (100px above ground at y=520) - easy to hit from below
    // Positioned away from floating platforms for clear access
    ...createBlockRow(1000, 420, ['brick', 'question', 'brick']),
    ...createBlockRow(950, 420, ['brick', 'question', 'brick']),
    ...createBlockRow(1650, 420, ['brick', 'question', 'brick']),
    ...createBlockRow(2350, 420, ['brick', 'question', 'brick']),
    ...createBlockRow(3100, 420, ['brick', 'question', 'brick']),
    ...createBlockRow(4150, 420, ['brick', 'question', 'brick']),
    ...createBlockRow(5200, 420, ['brick', 'question', 'brick']),
  ];

  const pipes: Pipe[] = [
    createPipe(1500, false), // No enemy - intro pipe
    createPipe(2900, false),
    createPipe(4200, false),
  ];

  const fallingHazards: FallingHazard[] = []; // No falling hazards in level 1

  return {
    id: 1,
    name: 'Rose Garden',
    collectibleType: 'rose',
    collectibleEmoji: '🌹',
    theme: 'Rose gardens, heart flowers, pink skies',
    platforms,
    collectibles,
    enemies,
    hitBlocks,
    pipes,
    fallingHazards,
    fireballs: [],
    checkpoint: { x: 2800, y: GROUND_Y - 80, activated: false },
    // End flag on end platform
    flag: { x: 5850, y: GROUND_Y - 60 - 80, reached: false },
    // Mid-level flag - on high platform past checkpoint, requires climbing
    midFlag: { x: 4380, y: 230, collected: false },
    backgroundColor: '#FFE4EC',
    groundColor: '#8B4557',
    levelWidth: LEVEL_WIDTH,
  };
}

function createLevel2(): LevelData {
  // Level 2: Candyland - More collectibles, more blocks, enemies appear more often
  const platforms: Platform[] = [
    ...createGroundSegments([
      { start: 0, width: 700 },
      { start: 800, width: 500 },
      { start: 1400, width: 600 },
      { start: 2100, width: 500 },
      { start: 2700, width: 700 },
      { start: 3500, width: 500 },
      { start: 4100, width: 600 },
      { start: 4800, width: 600 },
      { start: 5500, width: 400 },
    ]),
    // End platform - wide brick platform for flag planting
    { x: 5750, y: GROUND_Y - 60, width: 200, height: 60, type: 'ground' as const },
    ...createStairPlatforms(),
    createFloatingPlatform(350, 420, 130),
    createFloatingPlatform(550, 350, 100),
    createFloatingPlatform(900, 400, 150),
    createFloatingPlatform(1200, 320, 120),
    createFloatingPlatform(1500, 400, 140),
    createFloatingPlatform(1800, 340, 110),
    createFloatingPlatform(2200, 380, 160),
    createFloatingPlatform(2500, 300, 130),
    createFloatingPlatform(2900, 360, 150),
    createFloatingPlatform(3200, 280, 120),
    createFloatingPlatform(3600, 400, 140),
    createFloatingPlatform(3900, 320, 130),
    createFloatingPlatform(4300, 380, 160),
    createFloatingPlatform(4600, 300, 120),
    createFloatingPlatform(5000, 360, 140),
    createFloatingPlatform(5300, 400, 130),
    createFloatingPlatform(5600, 340, 150),
  ];

  const collectibles: Collectible[] = [];
  for (let i = 0; i < 45; i++) {
    const x = 120 + i * 125;
    if (x < LEVEL_WIDTH - 200) {
      collectibles.push({
        x,
        y: i % 2 === 0 ? GROUND_Y - 60 : 280 + (i % 3) * 30,
        type: 'chocolate',
        collected: false,
        animationOffset: i * 0.12,
      });
    }
  }
  collectibles.push({ x: 3250, y: 220, type: 'cookie', collected: false, animationOffset: 0 });

  const enemies: Enemy[] = [
    // Ground enemies (singles)
    { x: 400, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: 1, patrolStart: 200, patrolEnd: 600 },
    { x: 900, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.3, isDefeated: false, direction: -1, patrolStart: 820, patrolEnd: 1180 },
    { x: 1500, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.8, isDefeated: false, direction: 1, patrolStart: 1420, patrolEnd: 1900 },
    { x: 2300, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: -1, patrolStart: 2150, patrolEnd: 2550 },
    // Enemy bunch (2 together) guarding cookie area
    { x: 2900, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.5, isDefeated: false, direction: 1, patrolStart: 2850, patrolEnd: 3050, isGrouped: true },
    { x: 2950, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.5, isDefeated: false, direction: 1, patrolStart: 2850, patrolEnd: 3050, isGrouped: true },
    { x: 3700, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: -1, patrolStart: 3550, patrolEnd: 3950 },
    // Platform enemy guarding mid-flag area
    { x: 4350, y: 280 - 28, width: 35, height: 28, type: 'heartBug', velocityX: 1.5, isDefeated: false, direction: 1, patrolStart: 4350, patrolEnd: 4450 },
    { x: 4400, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.8, isDefeated: false, direction: 1, patrolStart: 4150, patrolEnd: 4650 },
    { x: 5100, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.4, isDefeated: false, direction: -1, patrolStart: 4850, patrolEnd: 5350 },
  ];

  const hitBlocks: HitBlock[] = [
    ...createBlockRow(360, 380, ['brick', 'question', 'brick', 'question', 'brick']),
    ...createBlockRow(960, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(1560, 360, ['brick', 'question', 'brick']),
    ...createBlockRow(2260, 340, ['brick', 'brick', 'question', 'brick', 'brick']),
    ...createBlockRow(2960, 360, ['brick', 'question', 'brick']),
    ...createBlockRow(3760, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(4460, 360, ['brick', 'question', 'brick']),
    ...createBlockRow(5160, 340, ['brick', 'question', 'brick']),
  ];

  const pipes: Pipe[] = [
    createPipe(1300, true),
    createPipe(2600, true),
    createPipe(4000, false),
    createPipe(5400, true),
  ];

  const fallingHazards: FallingHazard[] = []; // No falling hazards in level 2

  return {
    id: 2,
    name: 'Candyland',
    collectibleType: 'chocolate',
    collectibleEmoji: '🍫',
    theme: 'Chocolate blocks and sweet treats',
    platforms,
    collectibles,
    enemies,
    hitBlocks,
    pipes,
    fallingHazards,
    fireballs: [],
    checkpoint: { x: 2500, y: GROUND_Y - 80, activated: false },
    // End flag on end platform
    flag: { x: 5850, y: GROUND_Y - 60 - 80, reached: false },
    // Mid-level flag - on elevated platform past midpoint
    midFlag: { x: 4620, y: 250, collected: false },
    backgroundColor: '#FFF0E6',
    groundColor: '#8B5A2B',
    levelWidth: LEVEL_WIDTH,
  };
}

function createLevel3(): LevelData {
  // Level 3: Toyland - Introduce pipe enemies regularly, vertical routes
  const platforms: Platform[] = [
    ...createGroundSegments([
      { start: 0, width: 600 },
      { start: 750, width: 450 },
      { start: 1350, width: 550 },
      { start: 2000, width: 500 },
      { start: 2600, width: 600 },
      { start: 3300, width: 450 },
      { start: 3850, width: 550 },
      { start: 4500, width: 600 },
      { start: 5200, width: 700 },
    ]),
    // End platform - wide brick platform for flag planting
    { x: 5750, y: GROUND_Y - 60, width: 200, height: 60, type: 'ground' as const },
    ...createStairPlatforms(),
    // Vertical section - stacked platforms
    createFloatingPlatform(300, 420, 120),
    createFloatingPlatform(350, 340, 100),
    createFloatingPlatform(300, 260, 120),
    createFloatingPlatform(350, 180, 100),
    // Regular floating
    createFloatingPlatform(800, 400, 140),
    createFloatingPlatform(1100, 320, 130),
    createFloatingPlatform(1450, 380, 150),
    // Another vertical section
    createFloatingPlatform(1700, 420, 110),
    createFloatingPlatform(1750, 340, 100),
    createFloatingPlatform(1700, 260, 110),
    // Continue
    createFloatingPlatform(2100, 380, 140),
    createFloatingPlatform(2400, 300, 130),
    createFloatingPlatform(2750, 360, 150),
    createFloatingPlatform(3050, 280, 120),
    createFloatingPlatform(3400, 400, 140),
    createFloatingPlatform(3700, 320, 130),
    createFloatingPlatform(4000, 380, 150),
    createFloatingPlatform(4300, 300, 120),
    createFloatingPlatform(4700, 360, 140),
    createFloatingPlatform(5000, 280, 130),
    createFloatingPlatform(5300, 400, 150),
    createFloatingPlatform(5600, 340, 130),
  ];

  const collectibles: Collectible[] = [];
  for (let i = 0; i < 50; i++) {
    const x = 100 + i * 115;
    if (x < LEVEL_WIDTH - 200) {
      collectibles.push({
        x,
        y: i % 3 === 0 ? 200 + (i % 4) * 50 : GROUND_Y - 60,
        type: 'teddy',
        collected: false,
        animationOffset: i * 0.1,
      });
    }
  }
  collectibles.push({ x: 380, y: 120, type: 'cookie', collected: false, animationOffset: 0 });

  const enemies: Enemy[] = [
    // Single enemies - some can shoot fireballs (2-3 out of ~10)
    // Scaled 30%: width 50->35, height 40->28
    { x: 350, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 150, patrolEnd: 550, canShoot: true },
    { x: 850, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.4, isDefeated: false, direction: -1, patrolStart: 780, patrolEnd: 1150 },
    { x: 1450, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.8, isDefeated: false, direction: 1, patrolStart: 1380, patrolEnd: 1850 },
    { x: 2200, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.1, isDefeated: false, direction: -1, patrolStart: 2050, patrolEnd: 2450, canShoot: true },
    // Platform enemy guarding cookie area (on stacked platform)
    { x: 360, y: 180 - 28, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.2, isDefeated: false, direction: 1, patrolStart: 350, patrolEnd: 450, canShoot: true },
    { x: 2800, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.5, isDefeated: false, direction: 1, patrolStart: 2650, patrolEnd: 3100 },
    { x: 3500, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: -1, patrolStart: 3350, patrolEnd: 3700 },
    // Platform enemy guarding mid-flag area
    { x: 4300, y: 300 - 28, width: 35, height: 28, type: 'heartBug', velocityX: 1.3, isDefeated: false, direction: -1, patrolStart: 4300, patrolEnd: 4420, canShoot: true },
    { x: 4000, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.9, isDefeated: false, direction: 1, patrolStart: 3900, patrolEnd: 4350, canShoot: true },
    { x: 4700, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.6, isDefeated: false, direction: -1, patrolStart: 4550, patrolEnd: 5050 },
    { x: 5400, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 5250, patrolEnd: 5800 },
  ];

  const hitBlocks: HitBlock[] = [
    ...createBlockRow(410, 360, ['brick', 'question', 'brick']),
    ...createBlockRow(910, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(1510, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(2210, 360, ['brick', 'brick', 'question', 'brick', 'brick']),
    ...createBlockRow(2910, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(3510, 360, ['brick', 'question', 'brick']),
    ...createBlockRow(4110, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(4810, 360, ['brick', 'question', 'brick']),
    ...createBlockRow(5410, 340, ['brick', 'question', 'brick']),
  ];

  const pipes: Pipe[] = [
    createPipe(700, true),
    createPipe(1300, true),
    createPipe(1950, true),
    createFirePipe(2550), // Fire pipe guarding fortune cookie area
    createPipe(3250, true),
    createPipe(4450, true),
    createPipe(5100, true),
  ];

  const fallingHazards: FallingHazard[] = []; // No falling hazards in level 3

  return {
    id: 3,
    name: 'Toyland',
    collectibleType: 'teddy',
    collectibleEmoji: '🧸',
    theme: 'Plush clouds and soft toys',
    platforms,
    collectibles,
    enemies,
    hitBlocks,
    pipes,
    fallingHazards,
    fireballs: [],
    checkpoint: { x: 2400, y: GROUND_Y - 80, activated: false },
    // End flag on end platform
    flag: { x: 5850, y: GROUND_Y - 60 - 80, reached: false },
    // Mid-level flag - on elevated platform past fire pipe
    midFlag: { x: 4320, y: 250, collected: false },
    backgroundColor: '#E8F4FF',
    groundColor: '#9B7653',
    levelWidth: LEVEL_WIDTH,
  };
}

function createLevel4(): LevelData {
  // Level 4: Letter Lane - Introduce falling hazards at low frequency
  const platforms: Platform[] = [
    ...createGroundSegments([
      { start: 0, width: 550 },
      { start: 700, width: 400 },
      { start: 1200, width: 500 },
      { start: 1800, width: 450 },
      { start: 2350, width: 550 },
      { start: 3000, width: 400 },
      { start: 3500, width: 500 },
      { start: 4100, width: 550 },
      { start: 4750, width: 500 },
      { start: 5350, width: 550 },
    ]),
    // End platform - wide brick platform for flag planting
    { x: 5750, y: GROUND_Y - 60, width: 200, height: 60, type: 'ground' as const },
    ...createStairPlatforms(),
    createFloatingPlatform(280, 400, 130),
    createFloatingPlatform(500, 320, 110),
    createFloatingPlatform(800, 380, 140),
    createFloatingPlatform(1050, 300, 120),
    createFloatingPlatform(1350, 360, 150),
    createFloatingPlatform(1600, 280, 110),
    createFloatingPlatform(1900, 400, 140),
    createFloatingPlatform(2150, 320, 130),
    createFloatingPlatform(2500, 380, 150),
    createFloatingPlatform(2800, 300, 120),
    createFloatingPlatform(3100, 360, 140),
    createFloatingPlatform(3350, 280, 110),
    createFloatingPlatform(3650, 400, 150),
    createFloatingPlatform(3900, 320, 130),
    createFloatingPlatform(4250, 380, 140),
    createFloatingPlatform(4550, 300, 120),
    createFloatingPlatform(4900, 360, 150),
    createFloatingPlatform(5150, 280, 110),
    createFloatingPlatform(5500, 400, 140),
  ];

  const collectibles: Collectible[] = [];
  for (let i = 0; i < 52; i++) {
    const x = 90 + i * 110;
    if (x < LEVEL_WIDTH - 200) {
      collectibles.push({
        x,
        y: i % 4 === 0 ? 220 + (i % 3) * 40 : GROUND_Y - 60,
        type: 'letter',
        collected: false,
        animationOffset: i * 0.09,
      });
    }
  }
  collectibles.push({ x: 1650, y: 220, type: 'cookie', collected: false, animationOffset: 0 });

  const enemies: Enemy[] = [
    // Single enemies with more fireball shooters
    // Scaled 30%: width 50->35, height 40->28
    { x: 300, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: 1, patrolStart: 100, patrolEnd: 500, canShoot: true },
    { x: 800, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.5, isDefeated: false, direction: -1, patrolStart: 720, patrolEnd: 1050 },
    { x: 1350, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 1230, patrolEnd: 1650, canShoot: true },
    // Platform enemy guarding cookie area
    { x: 1610, y: 280 - 28, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.2, isDefeated: false, direction: 1, patrolStart: 1600, patrolEnd: 1710, canShoot: true },
    { x: 1950, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.9, isDefeated: false, direction: -1, patrolStart: 1830, patrolEnd: 2200 },
    // Enemy group (no shooting for groups)
    { x: 2500, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.6, isDefeated: false, direction: 1, patrolStart: 2450, patrolEnd: 2650, isGrouped: true },
    { x: 2550, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.6, isDefeated: false, direction: 1, patrolStart: 2450, patrolEnd: 2650, isGrouped: true },
    { x: 3150, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.1, isDefeated: false, direction: -1, patrolStart: 3030, patrolEnd: 3350, canShoot: true },
    { x: 3650, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 3530, patrolEnd: 3950 },
    // Platform enemy guarding mid-flag
    { x: 4560, y: 300 - 28, width: 35, height: 28, type: 'heartBug', velocityX: 1.3, isDefeated: false, direction: -1, patrolStart: 4550, patrolEnd: 4670, canShoot: true },
    { x: 4250, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.7, isDefeated: false, direction: -1, patrolStart: 4130, patrolEnd: 4600, canShoot: true },
    { x: 4900, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 4780, patrolEnd: 5200 },
    { x: 5500, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.9, isDefeated: false, direction: -1, patrolStart: 5380, patrolEnd: 5800, canShoot: true },
  ];

  const hitBlocks: HitBlock[] = [
    ...createBlockRow(310, 360, ['brick', 'question', 'brick']),
    ...createBlockRow(860, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(1410, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(1960, 360, ['brick', 'brick', 'question', 'brick', 'brick']),
    ...createBlockRow(2560, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(3160, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(3710, 360, ['brick', 'question', 'brick']),
    ...createBlockRow(4310, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(4960, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(5560, 360, ['brick', 'question', 'brick']),
  ];

  const pipes: Pipe[] = [
    createPipe(650, true),
    createFirePipe(1150), // Fire pipe
    createPipe(1750, true),
    createPipe(2300, true),
    createFirePipe(2950), // Fire pipe guarding cookie
    createPipe(3450, true),
    createPipe(4050, true),
    createPipe(4700, true),
    createPipe(5300, true),
  ];

  const fallingHazards: FallingHazard[] = [
    createFallingHazard(1000, 100, 950),
    createFallingHazard(2200, 100, 2150),
    createFallingHazard(3800, 100, 3750),
    createFallingHazard(5200, 100, 5150),
  ];

  return {
    id: 4,
    name: 'Letter Lane',
    collectibleType: 'letter',
    collectibleEmoji: '💌',
    theme: 'Floating envelopes and messages',
    platforms,
    collectibles,
    enemies,
    hitBlocks,
    pipes,
    fallingHazards,
    fireballs: [],
    checkpoint: { x: 2700, y: GROUND_Y - 80, activated: false },
    // End flag on end platform
    flag: { x: 5850, y: GROUND_Y - 60 - 80, reached: false },
    // Mid-level flag - past falling hazard area
    midFlag: { x: 4570, y: 250, collected: false },
    backgroundColor: '#FFF5F5',
    groundColor: '#C9A0DC',
    levelWidth: LEVEL_WIDTH,
  };
}

function createLevel5(): LevelData {
  // Level 5: Pearl Ocean - Narrower jumps, moving platforms, more enemies
  const platforms: Platform[] = [
    ...createGroundSegments([
      { start: 0, width: 500 },
      { start: 650, width: 350 },
      { start: 1150, width: 400 },
      { start: 1700, width: 350 },
      { start: 2200, width: 450 },
      { start: 2800, width: 350 },
      { start: 3300, width: 400 },
      { start: 3850, width: 450 },
      { start: 4450, width: 400 },
      { start: 5000, width: 350 },
      { start: 5500, width: 400 },
    ]),
    // End platform - wide brick platform for flag planting
    { x: 5750, y: GROUND_Y - 60, width: 200, height: 60, type: 'ground' as const },
    ...createStairPlatforms(),
    // Moving platforms (marked as type moving)
    { x: 550, y: 400, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 2, moveRange: 150, originalX: 550, originalY: 400 },
    { x: 1100, y: 350, width: 100, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 1.5, moveRange: 100, originalX: 1100, originalY: 350 },
    createFloatingPlatform(250, 380, 120),
    createFloatingPlatform(800, 320, 100),
    createFloatingPlatform(1300, 380, 130),
    createFloatingPlatform(1550, 280, 100),
    { x: 1900, y: 400, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 2, moveRange: 120, originalX: 1900, originalY: 400 },
    createFloatingPlatform(2350, 340, 120),
    createFloatingPlatform(2600, 280, 100),
    { x: 2950, y: 380, width: 100, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 1.5, moveRange: 80, originalX: 2950, originalY: 380 },
    createFloatingPlatform(3450, 320, 120),
    createFloatingPlatform(3700, 280, 100),
    { x: 4000, y: 400, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 2.5, moveRange: 140, originalX: 4000, originalY: 400 },
    createFloatingPlatform(4600, 340, 110),
    createFloatingPlatform(4900, 280, 100),
    { x: 5200, y: 380, width: 100, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 2, moveRange: 100, originalX: 5200, originalY: 380 },
    createFloatingPlatform(5650, 320, 130),
  ];

  const collectibles: Collectible[] = [];
  for (let i = 0; i < 55; i++) {
    const x = 80 + i * 105;
    if (x < LEVEL_WIDTH - 200) {
      collectibles.push({
        x,
        y: i % 3 === 0 ? 200 + (i % 4) * 45 : GROUND_Y - 60,
        type: 'pearl',
        collected: false,
        animationOffset: i * 0.08,
      });
    }
  }
  collectibles.push({ x: 2650, y: 220, type: 'cookie', collected: false, animationOffset: 0 });

  const enemies: Enemy[] = [
    // Scaled 30%: width 50->35, height 40->28
    { x: 280, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.3, isDefeated: false, direction: 1, patrolStart: 100, patrolEnd: 450, canShoot: true },
    { x: 750, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.6, isDefeated: false, direction: -1, patrolStart: 680, patrolEnd: 950 },
    { x: 1250, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.1, isDefeated: false, direction: 1, patrolStart: 1180, patrolEnd: 1500, canShoot: true },
    { x: 1800, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: -1, patrolStart: 1730, patrolEnd: 2000 },
    // Platform enemy guarding cookie area
    { x: 2610, y: 280 - 28, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.3, isDefeated: false, direction: 1, patrolStart: 2600, patrolEnd: 2700, canShoot: true },
    { x: 2350, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.7, isDefeated: false, direction: 1, patrolStart: 2300, patrolEnd: 2500, isGrouped: true },
    { x: 2400, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.7, isDefeated: false, direction: 1, patrolStart: 2300, patrolEnd: 2500, isGrouped: true },
    { x: 2950, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: -1, patrolStart: 2830, patrolEnd: 3100, canShoot: true },
    { x: 3450, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 3330, patrolEnd: 3650, canShoot: true },
    { x: 4000, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.8, isDefeated: false, direction: -1, patrolStart: 3880, patrolEnd: 4250 },
    // Platform enemy guarding mid-flag
    { x: 4610, y: 340 - 28, width: 35, height: 28, type: 'heartBug', velocityX: 1.4, isDefeated: false, direction: -1, patrolStart: 4600, patrolEnd: 4710, canShoot: true },
    { x: 4550, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.1, isDefeated: false, direction: 1, patrolStart: 4480, patrolEnd: 4800, canShoot: true },
    { x: 5150, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.6, isDefeated: false, direction: -1, patrolStart: 5030, patrolEnd: 5300 },
    { x: 5650, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 5530, patrolEnd: 5850, canShoot: true },
  ];

  const hitBlocks: HitBlock[] = [
    ...createBlockRow(280, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(810, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(1310, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(1810, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(2360, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(2960, 320, ['brick', 'brick', 'question', 'brick', 'brick']),
    ...createBlockRow(3510, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(4060, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(4660, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(5210, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(5660, 340, ['brick', 'question', 'brick']),
  ];

  const pipes: Pipe[] = [
    createPipe(600, true),
    createFirePipe(1100),
    createPipe(1650, true),
    createFirePipe(2150),
    createPipe(2750, true),
    createPipe(3250, true),
    createFirePipe(3800),
    createPipe(4400, true),
    createPipe(4950, true),
    createPipe(5450, true),
  ];

  const fallingHazards: FallingHazard[] = [
    createFallingHazard(900, 100, 850),
    createFallingHazard(1500, 100, 1450),
    createFallingHazard(2500, 100, 2450),
    createFallingHazard(3600, 100, 3550),
    createFallingHazard(4800, 100, 4750),
    createFallingHazard(5600, 100, 5550),
  ];

  return {
    id: 5,
    name: 'Pearl Ocean',
    collectibleType: 'pearl',
    collectibleEmoji: '💎',
    theme: 'Shell platforms and underwater beauty',
    platforms,
    collectibles,
    enemies,
    hitBlocks,
    pipes,
    fallingHazards,
    fireballs: [],
    checkpoint: { x: 2600, y: GROUND_Y - 80, activated: false },
    // End flag on end platform
    flag: { x: 5850, y: GROUND_Y - 60 - 80, reached: false },
    // Mid-level flag - on elevated platform near moving platform
    midFlag: { x: 4620, y: 230, collected: false },
    backgroundColor: '#E0F7FA',
    groundColor: '#00ACC1',
    levelWidth: LEVEL_WIDTH,
  };
}

function createLevel6(): LevelData {
  // Level 6: Golden Palace - Combine hazards, pipes, moving platforms, still fair
  const platforms: Platform[] = [
    ...createGroundSegments([
      { start: 0, width: 450 },
      { start: 600, width: 300 },
      { start: 1050, width: 350 },
      { start: 1550, width: 300 },
      { start: 2000, width: 400 },
      { start: 2550, width: 300 },
      { start: 3000, width: 350 },
      { start: 3500, width: 400 },
      { start: 4050, width: 350 },
      { start: 4550, width: 300 },
      { start: 5000, width: 400 },
      { start: 5550, width: 350 },
    ]),
    // End platform - wide brick platform for flag planting
    { x: 5750, y: GROUND_Y - 60, width: 200, height: 60, type: 'ground' as const },
    ...createStairPlatforms(),
    { x: 500, y: 380, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 2.5, moveRange: 120, originalX: 500, originalY: 380 },
    createFloatingPlatform(750, 320, 110),
    { x: 1000, y: 400, width: 100, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 2, moveRange: 100, originalX: 1000, originalY: 400 },
    createFloatingPlatform(1300, 340, 100),
    { x: 1700, y: 360, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 3, moveRange: 150, originalX: 1700, originalY: 360 },
    createFloatingPlatform(2150, 300, 120),
    createFloatingPlatform(2400, 380, 100),
    { x: 2700, y: 340, width: 100, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 2.5, moveRange: 120, originalX: 2700, originalY: 340 },
    createFloatingPlatform(3150, 380, 110),
    { x: 3400, y: 320, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 2, moveRange: 100, originalX: 3400, originalY: 320 },
    createFloatingPlatform(3750, 360, 120),
    createFloatingPlatform(4200, 300, 100),
    { x: 4450, y: 400, width: 100, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 2, moveRange: 90, originalX: 4450, originalY: 400 },
    createFloatingPlatform(4750, 340, 110),
    { x: 5100, y: 360, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 2.5, moveRange: 130, originalX: 5100, originalY: 360 },
    createFloatingPlatform(5450, 300, 120),
    createFloatingPlatform(5750, 380, 100),
  ];

  const collectibles: Collectible[] = [];
  for (let i = 0; i < 58; i++) {
    const x = 70 + i * 100;
    if (x < LEVEL_WIDTH - 200) {
      collectibles.push({
        x,
        y: i % 3 === 0 ? 180 + (i % 4) * 50 : GROUND_Y - 60,
        type: 'ring',
        collected: false,
        animationOffset: i * 0.07,
      });
    }
  }
  collectibles.push({ x: 2200, y: 240, type: 'cookie', collected: false, animationOffset: 0 });

  const enemies: Enemy[] = [
    // Scaled 30%: width 50->35, height 40->28
    { x: 250, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.4, isDefeated: false, direction: 1, patrolStart: 100, patrolEnd: 400, canShoot: true },
    { x: 700, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.7, isDefeated: false, direction: -1, patrolStart: 630, patrolEnd: 850 },
    { x: 1150, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: 1, patrolStart: 1100, patrolEnd: 1300, isGrouped: true },
    { x: 1200, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: 1, patrolStart: 1100, patrolEnd: 1300, isGrouped: true },
    { x: 1650, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.1, isDefeated: false, direction: -1, patrolStart: 1580, patrolEnd: 1800, canShoot: true },
    // Platform enemy guarding cookie area
    { x: 2160, y: 300 - 28, width: 35, height: 28, type: 'heartBug', velocityX: 1.3, isDefeated: false, direction: 1, patrolStart: 2150, patrolEnd: 2270, canShoot: true },
    { x: 2150, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.8, isDefeated: false, direction: 1, patrolStart: 2030, patrolEnd: 2350, canShoot: true },
    { x: 2700, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.3, isDefeated: false, direction: -1, patrolStart: 2580, patrolEnd: 2850, canShoot: true },
    { x: 3150, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.1, isDefeated: false, direction: 1, patrolStart: 3030, patrolEnd: 3300 },
    { x: 3650, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.9, isDefeated: false, direction: -1, patrolStart: 3600, patrolEnd: 3800, isGrouped: true },
    { x: 3700, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 1.9, isDefeated: false, direction: -1, patrolStart: 3600, patrolEnd: 3800, isGrouped: true },
    { x: 3750, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.9, isDefeated: false, direction: -1, patrolStart: 3600, patrolEnd: 3800, isGrouped: true },
    { x: 4200, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: 1, patrolStart: 4080, patrolEnd: 4350, canShoot: true },
    // Platform enemy guarding mid-flag
    { x: 4760, y: 340 - 28, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.4, isDefeated: false, direction: -1, patrolStart: 4750, patrolEnd: 4860, canShoot: true },
    { x: 4700, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: -1, patrolStart: 4580, patrolEnd: 4800, canShoot: true },
    { x: 5150, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.8, isDefeated: false, direction: 1, patrolStart: 5030, patrolEnd: 5350 },
    { x: 5700, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.1, isDefeated: false, direction: -1, patrolStart: 5580, patrolEnd: 5850, canShoot: true },
  ];

  const hitBlocks: HitBlock[] = [
    ...createBlockRow(260, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(760, 300, ['brick', 'question', 'brick']),
    ...createBlockRow(1210, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(1710, 340, ['brick', 'brick', 'question', 'brick', 'brick']),
    ...createBlockRow(2210, 300, ['brick', 'question', 'brick']),
    ...createBlockRow(2760, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(3210, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(3760, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(4260, 340, ['brick', 'question', 'brick']),
    ...createBlockRow(4810, 300, ['brick', 'question', 'brick']),
    ...createBlockRow(5260, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(5760, 340, ['brick', 'question', 'brick']),
  ];

  const pipes: Pipe[] = [
    createFirePipe(550),
    createPipe(1000, true),
    createFirePipe(1500),
    createPipe(1950, true),
    createPipe(2500, true),
    createFirePipe(2950),
    createPipe(3450, true),
    createFirePipe(4000),
    createPipe(4500, true),
    createPipe(4950, true),
    createPipe(5500, true),
  ];

  const fallingHazards: FallingHazard[] = [
    createFallingHazard(850, 100, 800),
    createFallingHazard(1350, 100, 1300),
    createFallingHazard(1900, 100, 1850),
    createFallingHazard(2600, 100, 2550),
    createFallingHazard(3350, 100, 3300),
    createFallingHazard(4050, 100, 4000),
    createFallingHazard(4750, 100, 4700),
    createFallingHazard(5350, 100, 5300),
  ];

  return {
    id: 6,
    name: 'Golden Palace',
    collectibleType: 'ring',
    collectibleEmoji: '💍',
    theme: 'Jewelry and golden treasures',
    platforms,
    collectibles,
    enemies,
    hitBlocks,
    pipes,
    fallingHazards,
    fireballs: [],
    checkpoint: { x: 2800, y: GROUND_Y - 80, activated: false },
    // End flag on end platform
    flag: { x: 5850, y: GROUND_Y - 60 - 80, reached: false },
    // Mid-level flag - past multiple hazards
    midFlag: { x: 4770, y: 290, collected: false },
    backgroundColor: '#FFF8E1',
    groundColor: '#FFB300',
    levelWidth: LEVEL_WIDTH,
  };
}

function createLevel7(): LevelData {
  // Level 7: Cupid Sky - Final challenge, best of all mechanics, tighter timing
  const platforms: Platform[] = [
    ...createGroundSegments([
      { start: 0, width: 400 },
      { start: 550, width: 280 },
      { start: 980, width: 320 },
      { start: 1450, width: 280 },
      { start: 1880, width: 350 },
      { start: 2380, width: 280 },
      { start: 2810, width: 320 },
      { start: 3280, width: 350 },
      { start: 3780, width: 280 },
      { start: 4210, width: 320 },
      { start: 4680, width: 280 },
      { start: 5110, width: 350 },
      { start: 5610, width: 300 },
    ]),
    // End platform - wide brick platform for flag planting
    { x: 5750, y: GROUND_Y - 60, width: 200, height: 60, type: 'ground' as const },
    ...createStairPlatforms(),
    { x: 450, y: 380, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 3, moveRange: 100, originalX: 450, originalY: 380 },
    createFloatingPlatform(700, 320, 90),
    { x: 900, y: 400, width: 90, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 2.5, moveRange: 120, originalX: 900, originalY: 400 },
    createFloatingPlatform(1200, 340, 100),
    { x: 1550, y: 360, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 3.5, moveRange: 130, originalX: 1550, originalY: 360 },
    createFloatingPlatform(1750, 280, 90),
    createFloatingPlatform(2050, 340, 100),
    { x: 2300, y: 380, width: 90, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 3, moveRange: 100, originalX: 2300, originalY: 380 },
    createFloatingPlatform(2550, 300, 100),
    { x: 2900, y: 360, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 2.5, moveRange: 120, originalX: 2900, originalY: 360 },
    createFloatingPlatform(3100, 280, 90),
    createFloatingPlatform(3400, 340, 100),
    { x: 3700, y: 400, width: 90, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 3, moveRange: 110, originalX: 3700, originalY: 400 },
    createFloatingPlatform(3950, 320, 100),
    { x: 4150, y: 360, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 3, moveRange: 140, originalX: 4150, originalY: 360 },
    createFloatingPlatform(4450, 280, 90),
    createFloatingPlatform(4750, 340, 100),
    { x: 5000, y: 380, width: 90, height: 30, type: 'moving', moveDirection: 'vertical', moveSpeed: 2.5, moveRange: 100, originalX: 5000, originalY: 380 },
    createFloatingPlatform(5250, 300, 100),
    { x: 5500, y: 360, width: 100, height: 30, type: 'moving', moveDirection: 'horizontal', moveSpeed: 3, moveRange: 100, originalX: 5500, originalY: 360 },
    createFloatingPlatform(5750, 320, 110),
  ];

  const collectibles: Collectible[] = [];
  for (let i = 0; i < 60; i++) {
    const x = 60 + i * 95;
    if (x < LEVEL_WIDTH - 200) {
      collectibles.push({
        x,
        y: i % 3 === 0 ? 160 + (i % 5) * 45 : GROUND_Y - 60,
        type: 'arrow',
        collected: false,
        animationOffset: i * 0.065,
      });
    }
  }
  collectibles.push({ x: 3150, y: 220, type: 'cookie', collected: false, animationOffset: 0 });

  const enemies: Enemy[] = [
    // Level 7 - Final challenge, best of all mechanics
    // Scaled 30%: width 50->35, height 40->28
    { x: 220, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.5, isDefeated: false, direction: 1, patrolStart: 100, patrolEnd: 350, canShoot: true },
    { x: 650, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.8, isDefeated: false, direction: -1, patrolStart: 580, patrolEnd: 780 },
    // Enemy group
    { x: 1080, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.3, isDefeated: false, direction: 1, patrolStart: 1030, patrolEnd: 1200, isGrouped: true },
    { x: 1130, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.3, isDefeated: false, direction: 1, patrolStart: 1030, patrolEnd: 1200, isGrouped: true },
    { x: 1550, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: -1, patrolStart: 1480, patrolEnd: 1680, canShoot: true },
    { x: 2000, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.9, isDefeated: false, direction: 1, patrolStart: 1910, patrolEnd: 2180, canShoot: true },
    { x: 2500, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.4, isDefeated: false, direction: -1, patrolStart: 2410, patrolEnd: 2610, canShoot: true },
    // Triple enemy group
    { x: 2950, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: 1, patrolStart: 2900, patrolEnd: 3100, isGrouped: true },
    { x: 3000, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 2.2, isDefeated: false, direction: 1, patrolStart: 2900, patrolEnd: 3100, isGrouped: true },
    { x: 3050, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: 1, patrolStart: 2900, patrolEnd: 3100, isGrouped: true },
    // Platform enemy guarding cookie area
    { x: 3110, y: 280 - 28, width: 35, height: 28, type: 'heartBug', velocityX: 1.5, isDefeated: false, direction: 1, patrolStart: 3100, patrolEnd: 3190, canShoot: true },
    { x: 3400, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 2, isDefeated: false, direction: -1, patrolStart: 3310, patrolEnd: 3580, canShoot: true },
    { x: 3900, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.3, isDefeated: false, direction: 1, patrolStart: 3810, patrolEnd: 4010, canShoot: true },
    // Platform enemy guarding mid-flag area
    { x: 4460, y: 280 - 28, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.4, isDefeated: false, direction: -1, patrolStart: 4450, patrolEnd: 4540, canShoot: true },
    { x: 4350, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.1, isDefeated: false, direction: -1, patrolStart: 4240, patrolEnd: 4480, canShoot: true },
    { x: 4800, y: GROUND_Y - 40, width: 35, height: 28, type: 'brokenHeartSlime', velocityX: 1.9, isDefeated: false, direction: 1, patrolStart: 4710, patrolEnd: 4910 },
    { x: 5250, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2.2, isDefeated: false, direction: -1, patrolStart: 5140, patrolEnd: 5410, canShoot: true },
    { x: 5750, y: GROUND_Y - 40, width: 35, height: 28, type: 'heartBug', velocityX: 2, isDefeated: false, direction: 1, patrolStart: 5640, patrolEnd: 5860, canShoot: true },
  ];

  const hitBlocks: HitBlock[] = [
    ...createBlockRow(240, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(710, 300, ['brick', 'question', 'brick']),
    ...createBlockRow(1110, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(1560, 300, ['brick', 'brick', 'question', 'brick', 'brick']),
    ...createBlockRow(2060, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(2560, 300, ['brick', 'question', 'brick']),
    ...createBlockRow(3010, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(3460, 300, ['brick', 'question', 'brick']),
    ...createBlockRow(3910, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(4360, 300, ['brick', 'question', 'brick']),
    ...createBlockRow(4810, 320, ['brick', 'question', 'brick']),
    ...createBlockRow(5260, 300, ['brick', 'question', 'brick']),
    ...createBlockRow(5710, 320, ['brick', 'question', 'brick']),
  ];

  const pipes: Pipe[] = [
    createFirePipe(500), // Fire pipe
    createPipe(930, true),
    createFirePipe(1400), // Fire pipe
    createPipe(1830, true),
    createFirePipe(2330), // Fire pipe
    createPipe(2760, true),
    createFirePipe(3230), // Fire pipe guarding cookie
    createPipe(3730, true),
    createFirePipe(4160), // Fire pipe
    createPipe(4630, true),
    createPipe(5060, true),
    createPipe(5560, true),
  ];

  const fallingHazards: FallingHazard[] = [
    createFallingHazard(650, 100, 600),
    createFallingHazard(1100, 100, 1050),
    createFallingHazard(1650, 100, 1600),
    createFallingHazard(2200, 100, 2150),
    createFallingHazard(2750, 100, 2700),
    createFallingHazard(3350, 100, 3300),
    createFallingHazard(3900, 100, 3850),
    createFallingHazard(4500, 100, 4450),
    createFallingHazard(5100, 100, 5050),
    createFallingHazard(5650, 100, 5600),
  ];

  return {
    id: 7,
    name: 'Cupid Sky',
    collectibleType: 'arrow',
    collectibleEmoji: '🏹',
    theme: 'Clouds and love arrows',
    platforms,
    collectibles,
    enemies,
    hitBlocks,
    pipes,
    fallingHazards,
    fireballs: [],
    checkpoint: { x: 2900, y: GROUND_Y - 80, activated: false },
    // End flag on end platform
    flag: { x: 5850, y: GROUND_Y - 60 - 80, reached: false },
    // Mid-level flag - final challenge, past triple enemy group
    midFlag: { x: 4470, y: 230, collected: false },
    backgroundColor: '#FCE4EC',
    groundColor: '#E91E63',
    levelWidth: LEVEL_WIDTH,
  };
}

// --- Overlap resolution for Level 2+ ---
interface Rect { x: number; y: number; width: number; height: number; }

function rectsOverlap(a: Rect, b: Rect, minGapX = 40, minGapY = 60): boolean {
  // Check if two rects overlap or are too close
  const sameYBand = Math.abs(a.y - b.y) < 20;
  const effectiveGapX = sameYBand ? minGapX : 0;
  const xOverlap = a.x < b.x + b.width + effectiveGapX && a.x + a.width + effectiveGapX > b.x;
  const yOverlap = a.y < b.y + b.height + minGapY && a.y + a.height + minGapY > b.y;
  // True overlap (ignoring gap enforcement) 
  const trueXOverlap = a.x < b.x + b.width && a.x + a.width > b.x;
  const trueYOverlap = a.y < b.y + b.height && a.y + a.height > b.y;
  // Overlaps if truly intersecting OR too close on both axes
  return (trueXOverlap && trueYOverlap) || (xOverlap && yOverlap);
}

function resolveOverlaps(data: LevelData): LevelData {
  // Collect all placed rects: ground platforms are immovable anchors
  const anchors: Rect[] = data.platforms
    .filter(p => p.type === 'ground')
    .map(p => ({ x: p.x, y: p.y, width: p.width, height: p.height }));
  
  // Also treat pipes as anchors (they shouldn't be overlapped)
  data.pipes.forEach(p => anchors.push({ x: p.x, y: p.y, width: p.width, height: p.height }));

  const placed: Rect[] = [...anchors];

  function canPlace(rect: Rect): boolean {
    return !placed.some(p => rectsOverlap(rect, p));
  }

  function tryResolve(rect: Rect): Rect | null {
    if (canPlace(rect)) return rect;
    const xShifts = [60, -60, 120, -120, 180, -180];
    const yShifts = [0, 50, -50, 100, -100];
    for (const dy of yShifts) {
      for (const dx of xShifts) {
        const candidate = { ...rect, x: rect.x + dx, y: rect.y + dy };
        // Keep within level bounds and reasonable Y range
        if (candidate.x < 50 || candidate.x + candidate.width > data.levelWidth - 50) continue;
        if (candidate.y < 150 || candidate.y > 480) continue;
        if (canPlace(candidate)) return candidate;
      }
    }
    return null; // skip this object
  }

  // Process floating/moving platforms (not ground)
  const resolvedPlatforms: Platform[] = [];
  for (const p of data.platforms) {
    if (p.type === 'ground') {
      resolvedPlatforms.push(p);
      continue;
    }
    const resolved = tryResolve({ x: p.x, y: p.y, width: p.width, height: p.height });
    if (resolved) {
      const newP = { ...p, x: resolved.x, y: resolved.y };
      if (p.originalX !== undefined) newP.originalX = resolved.x;
      if (p.originalY !== undefined) newP.originalY = resolved.y;
      resolvedPlatforms.push(newP);
      placed.push(resolved);
    }
    // else: skip this platform (overlap couldn't be resolved)
  }

  // Process hit blocks
  const resolvedBlocks: HitBlock[] = [];
  for (const b of data.hitBlocks) {
    const resolved = tryResolve({ x: b.x, y: b.y, width: b.width, height: b.height });
    if (resolved) {
      resolvedBlocks.push({ ...b, x: resolved.x, y: resolved.y });
      placed.push(resolved);
    }
    // else: skip this block
  }

  return { ...data, platforms: resolvedPlatforms, hitBlocks: resolvedBlocks };
}

export function getLevelData(levelId: number): LevelData {
  let data: LevelData;
  switch (levelId) {
    case 1:
      data = createLevel1();
      break;
    case 2:
      data = createLevel2();
      break;
    case 3:
      data = createLevel3();
      break;
    case 4:
      data = createLevel4();
      break;
    case 5:
      data = createLevel5();
      break;
    case 6:
      data = createLevel6();
      break;
    case 7:
      data = createLevel7();
      break;
    default:
      data = createLevel1();
  }
  
  // Resolve overlapping platforms/blocks for Level 2+ (Level 1 is hand-tuned)
  if (levelId >= 2) {
    data = resolveOverlaps(data);
  }
  
  // Apply adaptive reward distribution to golden blocks
  data.hitBlocks = assignBlockRewards(data.hitBlocks);
  return data;
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
  shield: '💖',
};

// Adaptive reward distribution for golden question blocks
// Given N total golden blocks:
// - Shield blocks = max(1, floor(N * 0.25))
// - Empty blocks = max(1, floor(N * 0.25))
// - Burst blocks = N - Shield - Empty
export function assignBlockRewards(hitBlocks: HitBlock[]): HitBlock[] {
  // Get only question blocks (golden blocks)
  const questionBlockIndices: number[] = [];
  hitBlocks.forEach((block, index) => {
    if (block.type === 'question') {
      questionBlockIndices.push(index);
    }
  });
  
  const N = questionBlockIndices.length;
  if (N === 0) return hitBlocks;
  
  // Calculate distribution
  const shieldCount = Math.max(1, Math.floor(N * 0.25));
  const emptyCount = Math.max(1, Math.floor(N * 0.25));
  const burstCount = N - shieldCount - emptyCount;
  
  // Create assignment array and shuffle for variety
  const assignments: ('burst' | 'shield' | 'none')[] = [];
  for (let i = 0; i < burstCount; i++) assignments.push('burst');
  for (let i = 0; i < shieldCount; i++) assignments.push('shield');
  for (let i = 0; i < emptyCount; i++) assignments.push('none');
  
  // Deterministic shuffle based on level (spread rewards across level)
  // Sort by block X position to spread rewards spatially
  const sortedIndices = [...questionBlockIndices].sort((a, b) => hitBlocks[a].x - hitBlocks[b].x);
  
  // Distribute: first burst blocks, then interleave shield and empty
  // Pattern: burst, burst, shield, burst, empty, burst, shield, empty...
  const finalAssignments: ('burst' | 'shield' | 'none')[] = [];
  let burstIdx = 0, shieldIdx = 0, emptyIdx = 0;
  
  for (let i = 0; i < N; i++) {
    // Every 3rd-4th block is special (shield or empty)
    if ((i + 1) % 3 === 0 && shieldIdx < shieldCount) {
      finalAssignments.push('shield');
      shieldIdx++;
    } else if ((i + 1) % 4 === 0 && emptyIdx < emptyCount) {
      finalAssignments.push('none');
      emptyIdx++;
    } else if (burstIdx < burstCount) {
      finalAssignments.push('burst');
      burstIdx++;
    } else if (shieldIdx < shieldCount) {
      finalAssignments.push('shield');
      shieldIdx++;
    } else {
      finalAssignments.push('none');
      emptyIdx++;
    }
  }
  
  // Apply assignments to blocks
  const newBlocks = [...hitBlocks];
  sortedIndices.forEach((blockIndex, i) => {
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], contents: finalAssignments[i] };
  });
  
  return newBlocks;
}
