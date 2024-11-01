<script setup>
//GameCanvas.vue
//遊戲核心邏輯和渲染
import { ref, onMounted, onUnmounted } from "vue";
import OutsideMapImage from "@/assets/images/OutsideMap.png";
import OutsideForegroundImage from "@/assets/images/OutsideForeground.png";
import PersonModifyImage from "@/assets/images/person_Modify.png";
import { collisions } from "@/assets/data/collisions";
import { Sprite } from "@/core/Player";
import { SpriteMap, Boundary } from "@/core/Map";
import { useGameLoop } from "@/composables/useGameLoop";
import { useCollision } from "@/composables/useCollision";
import { useGameStore } from "@/Stores/gameStore";

// Canvas setup
const canvasRef = ref(null);
const canvasWidth = 2350;
const canvasHeight = 1080;
const context = ref(null);
const { startGameLoop, stopGameLoop } = useGameLoop();
const gameStore = useGameStore();
const { rectangularCollision } = useCollision();

// Game state
const player = ref(null);
const background = ref(null);
const foreground = ref(null);
const boundaries = ref([]);
const movables = ref([]);
const assetsLoaded = ref(false);

const offset = {
  x: -1584,
  y: -1024,
};

// Movement handling
function checkCollisions(offset) {
  if (!player.value) return false;

  for (const boundary of boundaries.value) {
    if (
      rectangularCollision({
        rectangle1: player.value,
        rectangle2: {
          ...boundary,
          position: {
            x: boundary.position.x + offset.x,
            y: boundary.position.y + offset.y,
          },
        },
      })
    ) {
      return false;
    }
  }
  return true;
}

function moveObjects(offset) {
  movables.value.forEach((movable) => {
    if (movable && movable.position && movable !== player.value) {
      movable.position.x += offset.x;
      movable.position.y += offset.y;
    }
  });
}

// Movement function that will be exposed
function handleMove(direction) {
  if (!player.value || !assetsLoaded.value) return;

  player.value.moving = true;
  const directionMap = {
    up: { direction: 1, offset: { x: 0, y: 3 } },
    left: { direction: 2, offset: { x: 3, y: 0 } },
    down: { direction: 3, offset: { x: 0, y: -3 } },
    right: { direction: 0, offset: { x: -3, y: 0 } },
  };

  const { direction: dir, offset: moveOffset } = directionMap[direction];
  player.value.setDirection(dir);

  if (checkCollisions(moveOffset)) {
    moveObjects(moveOffset);
  }
}

// Asset loading
async function loadImage(src) {
  try {
    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  } catch (error) {
    console.error(`Failed to load image: ${src}`, error);
    throw error;
  }
}

// Boundary creation
function createBoundaries() {
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
}

// Game loop
function gameLoop() {
  if (!context.value || !player.value || !assetsLoaded.value) return;

  const ctx = context.value;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 設置全局玩家引用以供同步
  window.gameWorldPlayer = player.value;

  // Draw background
  background.value?.draw(ctx);

  // Draw boundaries
  boundaries.value.forEach((boundary) => boundary.draw(ctx));

  // Draw player and equipped items
  if (player.value) {
    player.value.draw(ctx);

    // Draw equipped items
    const equipmentOrder = ["outfit", "hairstyle", "accessory"];
    equipmentOrder.forEach((type) => {
      const sprite = gameStore.equippedItems[type];
      if (sprite && sprite.loaded) {
        sprite.draw(
          ctx,
          player.value.position.x,
          player.value.position.y,
          player.value.width,
          player.value.height,
          player.value
        );
      }
    });
  }

  // Draw foreground
  foreground.value?.draw(ctx);
}

// Lifecycle hooks
onMounted(async () => {
  try {
    const canvas = canvasRef.value;
    if (!canvas) throw new Error("Canvas not found");

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.value = canvas.getContext("2d");

    // Load all assets
    const [mapImage, foregroundImage, playerImage] = await Promise.all([
      loadImage(OutsideMapImage),
      loadImage(OutsideForegroundImage),
      loadImage(PersonModifyImage),
    ]);

    // Initialize game objects
    background.value = new SpriteMap({
      position: { x: offset.x, y: offset.y },
      image: mapImage,
    });

    foreground.value = new SpriteMap({
      position: { x: offset.x, y: offset.y },
      image: foregroundImage,
    });

    player.value = new Sprite({
      position: {
        x: 700,
        y: 400,
      },
      image: playerImage,
      frames: { max: 6 },
    });

    createBoundaries();

    movables.value = [
      background.value,
      ...boundaries.value,
      foreground.value,
    ].filter(Boolean);

    assetsLoaded.value = true;
    startGameLoop(gameLoop);
  } catch (error) {
    console.error("Failed to initialize game:", error);
    assetsLoaded.value = false;
  }
});

onUnmounted(() => {
  stopGameLoop();
  assetsLoaded.value = false;
  // 清理全局玩家引用
  window.gameWorldPlayer = null;
});

// Expose necessary methods to parent component
defineExpose({
  getCanvas: () => canvasRef.value,
  getPlayer: () => player.value,
  executeGameLoop: () => gameLoop(),
  handleMove, // 直接暴露 handleMove 函數
});
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
