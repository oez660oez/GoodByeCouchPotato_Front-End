<script setup>
//GameCanvas
import { ref, onMounted, onUnmounted } from 'vue';
import OutsideMapImage from '@/assets/images/OutsideMap.png';
import OutsideForegroundImage from '@/assets/images/OutsideForeground.png';
import PersonModifyImage from '@/assets/images/person_Modify.png';
import { collisions } from '@/assets/data/collisions';
import { Sprite } from '@/core/Player';
import { SpriteMap, Boundary } from '@/core/Map';
import { useGameLoop } from '@/composables/useGameLoop';
import { useKeyboard } from '@/composables/useKeyboard';
import { useCollision } from '@/composables/useCollision';

const canvasRef = ref(null);
const canvasWidth = 1920;
const canvasHeight = 1080;
const context = ref(null);
const { startGameLoop, stopGameLoop } = useGameLoop();
const isDevMode = ref(process.env.NODE_ENV === 'development');

// Debug state
const debugState = ref({
  contextCreated: false,
  imagesLoaded: {
    map: false,
    foreground: false,
    player: false
  },
  gameObjectsInitialized: {
    background: false,
    foreground: false,
    player: false,
    boundaries: false
  },
  gameLoopStarted: false,
  currentPositions: {
    background: null,
    player: null,
    foreground: null
  }
});

// Game objects
const player = ref(null);
const background = ref(null);
const foreground = ref(null);
const boundaries = ref([]);
const movables = ref([]);
const assetsLoaded = ref(false);

const { keys, lastKey } = useKeyboard();
const { rectangularCollision } = useCollision();

const offset = {
  x: -1584,
  y: -1024,
};

async function loadImage(src, imageType) {
  try {
    console.log(`Starting to load image: ${src}`);
    const img = new Image();
    const loadPromise = new Promise((resolve, reject) => {
      img.onload = () => {
        console.log(`Successfully loaded image: ${src}`);
        debugState.value.imagesLoaded[imageType] = true;
        resolve(img);
      };
      img.onerror = (e) => {
        console.error(`Failed to load image: ${src}`, e);
        reject(e);
      };
    });
    // 使用導入的圖片URL
    img.src = src;
    return await loadPromise;
  } catch (error) {
    console.error(`Failed to load image: ${src}`, error);
    throw error;
  }
}

function createBoundaries() {
  console.log('Creating boundaries...');
  boundaries.value = [];
  const collisionsMap = [];
  for (let i = 0; i < collisions.length; i += 282) {
    collisionsMap.push(collisions.slice(i, 282 + i));
  }

  collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
      if (symbol === 23073) {
        boundaries.value.push(
          new Boundary({
            position: {
              x: j * Boundary.width + offset.x,
              y: i * Boundary.height + offset.y,
            },
          })
        );
      }
    });
  });
  debugState.value.gameObjectsInitialized.boundaries = true;
  console.log(`Created ${boundaries.value.length} boundaries`);
}

function handleMove(direction) {
  if (!player.value || !assetsLoaded.value) return;

  player.value.moving = true;
  const directionMap = {
    up: { direction: 1, offset: { x: 0, y: 3 } },
    left: { direction: 2, offset: { x: 3, y: 0 } },
    down: { direction: 3, offset: { x: 0, y: -3 } },
    right: { direction: 0, offset: { x: -3, y: 0 } }
  };

  const { direction: dir, offset: moveOffset } = directionMap[direction];
  player.value.setDirection(dir);

  if (checkCollisions(moveOffset)) {
    moveObjects(moveOffset);
  }
}

function checkCollisions(offset) {
  if (!player.value) return false;

  for (const boundary of boundaries.value) {
    if (rectangularCollision({
      rectangle1: player.value,
      rectangle2: {
        ...boundary,
        position: {
          x: boundary.position.x + offset.x,
          y: boundary.position.y + offset.y,
        },
      },
    })) {
      return false;
    }
  }
  return true;
}

function moveObjects(offset) {
    movables.value.forEach((movable) => {
        if (movable && movable.position && movable !== player.value) { // 確保不移動玩家
            movable.position.x += offset.x;
            movable.position.y += offset.y;
        }
    });
}

function handlePlayerMovement() {
  if (!player.value || !assetsLoaded.value) return;

  player.value.moving = false;

  if (keys.value.w.pressed && lastKey.value === 'w') {
    handleMove('up');
  } else if (keys.value.a.pressed && lastKey.value === 'a') {
    handleMove('left');
  } else if (keys.value.s.pressed && lastKey.value === 's') {
    handleMove('down');
  } else if (keys.value.d.pressed && lastKey.value === 'd') {
    handleMove('right');
  }
}

function gameLoop() {
  if (!context.value || !player.value || !assetsLoaded.value) return;

  const ctx = context.value;

  // Clear canvas and log canvas dimensions
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background with position logging
    if (background.value) {
    try {
      background.value.draw(ctx);
      debugState.value.currentPositions.background = { ...background.value.position };
      console.log('Drew background successfully');
    } catch (error) {
      console.error('Error drawing background:', error);
    }
  }

  // Draw boundaries
  if (boundaries.value.length > 0) {
    try {
      boundaries.value.forEach(boundary => {
        boundary.draw(ctx);
      });
      console.log(`Drew ${boundaries.value.length} boundaries successfully`);
    } catch (error) {
      console.error('Error drawing boundaries:', error);
    }
  }

  // Draw player
  if (player.value) {
    try {
      player.value.draw(ctx);
      debugState.value.currentPositions.player = { ...player.value.position };
      console.log('Drew player successfully');
    } catch (error) {
      console.error('Error drawing player:', error);
    }
  }

  // Draw foreground
  if (foreground.value) {
    try {
      foreground.value.draw(ctx);
      debugState.value.currentPositions.foreground = { ...foreground.value.position };
      console.log('Drew foreground successfully');
    } catch (error) {
      console.error('Error drawing foreground:', error);
    }
  }

  handlePlayerMovement();
}

onMounted(async () => {
  try {
    console.log('Component mounted, initializing...');
    const canvas = canvasRef.value;
    if (!canvas) throw new Error('Canvas not found');

    // 確保 canvas 尺寸正確設置
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    context.value = canvas.getContext('2d');
    if (!context.value) throw new Error('Could not get canvas context');
    debugState.value.contextCreated = true;

    // Load images with debug logging
    const [mapImage, foregroundImage, playerImage] = await Promise.all([
      loadImage(OutsideMapImage, 'map'),
      loadImage(OutsideForegroundImage, 'foreground'),
      loadImage(PersonModifyImage, 'player'),
    ]);

    // 等待圖片完全載入後再初始化遊戲物件
    await Promise.all([
      new Promise(resolve => {
        mapImage.onload = resolve;
        if (mapImage.complete) resolve();
      }),
      new Promise(resolve => {
        foregroundImage.onload = resolve;
        if (foregroundImage.complete) resolve();
      }),
      new Promise(resolve => {
        playerImage.onload = resolve;
        if (playerImage.complete) resolve();
      })
    ]);

    console.log('All images loaded, initializing game objects...');

    // 初始化遊戲物件
    background.value = new SpriteMap({
      position: { x: offset.x, y: offset.y },
      image: mapImage,
    });
    debugState.value.gameObjectsInitialized.background = true;

    foreground.value = new SpriteMap({
      position: { x: offset.x, y: offset.y },
      image: foregroundImage,
    });
    debugState.value.gameObjectsInitialized.foreground = true;

    player.value = new Sprite({
    position: {
      x: canvasWidth / 2 - 288 / 4 / 2,
      y: canvasHeight / 2 - 80 / 2,
    },
    image: playerImage,
    frames: { max: 6 }
});
    debugState.value.gameObjectsInitialized.player = true;
    console.log('Player initialized');

    // Create boundaries
    createBoundaries();

    // Set movable objects with debug logging
    movables.value = [
      background.value,
      ...boundaries.value,
      foreground.value
    ].filter(Boolean);
    console.log(`Initialized ${movables.value.length} movable objects`);

    // Mark assets as loaded
    assetsLoaded.value = true;
    console.log('All assets loaded successfully');

    // Start game loop with debug logging
    startGameLoop(gameLoop);
    debugState.value.gameLoopStarted = true;
    console.log('Game loop started');

    // Log final debug state
    console.log('Final debug state:', debugState.value);
  } catch (error) {
    console.error('Failed to initialize game:', error);
    assetsLoaded.value = false;
  }
});

onUnmounted(() => {
  stopGameLoop();
  assetsLoaded.value = false;
  console.log('Component unmounted, game loop stopped');
});
</script>

<template>
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      class="game-canvas"
    ></canvas>
    <!-- <div v-if="isDevMode" class="debug-overlay">
      <h3>Debug Info:</h3>
      <pre>{{ debugState }}</pre>
    </div> -->
  </template>

  <style lang="css" scoped>
.game-canvas {
  image-rendering: pixelated;
  width: 100%;
  height: 100vh;
  object-fit: contain;
  background-color: black;
  }
  .game-canvas {
  image-rendering: pixelated;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.debug-overlay {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  max-width: 300px;
  max-height: 80vh;
  overflow: auto;
  z-index: 1000;
}
  </style>