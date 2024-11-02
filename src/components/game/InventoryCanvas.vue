<script setup>
//InventoryCanvas.vue
import { ref, onMounted, onUnmounted } from "vue";
import { useGameStore } from "@/Stores/gameStore";
import { useGameEvents } from "@/composables/useGameEvents";
import { Sprite } from "@/core/Player";
import PersonModifyImage from "@/assets/images/person_Modify.png";

const props = defineProps({
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
});

const canvasRef = ref(null);
const context = ref(null);
const player = ref(null);
const gameStore = useGameStore();
let animationFrameId = null;
let lastFrameTime = 0;
const FRAME_INTERVAL = 100;

// 新增：計算背包位置的函數
const calculateInventoryPosition = (canvas, backgroundImage) => {
  if (!canvas || !backgroundImage) return { x: 0, y: 0 };

  // 計算縮放比例
  const scaleX = canvas.width / backgroundImage.width;
  const scaleY = canvas.height / backgroundImage.height;
  const scale = Math.min(scaleX, scaleY);
  // 計算縮放後的尺寸
  const scaledWidth = backgroundImage.width * scale;
  const scaledHeight = backgroundImage.height * scale;

  // 計算置中位置
  const x = (canvas.width - scaledWidth) / 2;
  const y = (canvas.height - scaledHeight) / 2;

  return { x, y, scale };
};

// 修改初始化位置的方法
const initializePositions = () => {
  const canvas = canvasRef.value;
  if (!canvas || !gameStore.inventoryBackground) return;

  const { x, y, scale } = calculateInventoryPosition(
    canvas,
    gameStore.inventoryBackground
  );

  // 更新所有位置計算
  const slotSize = gameStore.slotConfig.size * scale;
  const padding = gameStore.slotConfig.padding * scale;

  // 更新物品欄位置
  gameStore.itemSlots = [];
  for (let row = 0; row < gameStore.slotConfig.rows; row++) {
    for (let col = 0; col < gameStore.slotConfig.cols; col++) {
      gameStore.itemSlots.push({
        x: x + 437 * scale + col * (slotSize + padding),
        y: y + 150 * scale + row * (slotSize + padding),
      });
    }
  }

  // 更新裝備欄位置
  gameStore.equipmentSlotsPosition = [];
  for (let i = 0; i < 3; i++) {
    gameStore.equipmentSlotsPosition.push({
      x: x + 285 * scale,
      y: y + 147 * scale + i * (slotSize + padding),
    });
  }

  // 更新預覽框位置
  gameStore.previewBox = {
    x: x + 75 * scale,
    y: y + 150 * scale,
    width: 160 * scale,
    height: 270 * scale,
  };

  gameStore.paginationButtons.prev = {
    x: x + 500,
    y: y + 435,
    width: 30,
    height: 30,
  };
  gameStore.paginationButtons.next = {
    x: x + 620,
    y: y + 435,
    width: 30,
    height: 30,
  };
  // 更新背包位置
  gameStore.inventoryPosition = { x, y };
};

const handleMove = (direction) => {
  if (!player.value) return;

  player.value.moving = true;
  switch (direction) {
    case "up":
      player.value.direction = 1;
      break;
    case "left":
      player.value.direction = 2;
      break;
    case "down":
      player.value.direction = 3;
      break;
    case "right":
      player.value.direction = 0;
      break;
  }
  // 強制觸發重新渲染
  render();
};

// 修改 executeGameLoop 方法
const executeGameLoop = (timestamp) => {
  if (!context.value || !player.value) return;

  // 計算時間差
  if (!lastFrameTime) lastFrameTime = timestamp;
  const elapsed = timestamp - lastFrameTime;

  // 同步遊戲世界玩家的狀態
  if (window.gameWorldPlayer) {
    player.value.moving = window.gameWorldPlayer.moving;
    player.value.direction = window.gameWorldPlayer.direction;

    // 同步動畫幀
    if (player.value.moving && elapsed >= FRAME_INTERVAL) {
      player.value.frames.val = window.gameWorldPlayer.frames.val;
      lastFrameTime = timestamp;
      render();
    }
  }

  // 持續執行動畫循環
  animationFrameId = requestAnimationFrame(executeGameLoop);
};

async function loadPlayerSprite() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      player.value = new Sprite({
        position: { x: 50, y: 250 }, // 這些座標不會影響預覽框中的渲染
        image: img,
        frames: { max: 6 },
        animationSpeed: 20,
      });
      player.value.direction = 3;
      player.value.moving = true;
      resolve();
    };
    img.onerror = reject;
    img.src = PersonModifyImage;
  });
}

// 修改 render 函數，移除主畫布的角色渲染
const render = () => {
  if (!context.value || !player.value || !canvasRef.value) return;

  const ctx = context.value;
  const canvas = canvasRef.value;

  if (!canvas.width || !canvas.height) {
    canvas.width = props.width;
    canvas.height = props.height;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameStore.inventoryBackground) {
    const { scale } = calculateInventoryPosition(
      canvas,
      gameStore.inventoryBackground
    );
    ctx.save();
    ctx.scale(scale, scale);
    gameStore.renderInventory(ctx, player.value);
    ctx.restore();
  }
};

// 事件處理部分保持不變...
const eventHandlers = {
  mousedown: (e) => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      gameStore.isClickInButton(x, y, gameStore.paginationButtons.prev) ||
      gameStore.isClickInButton(x, y, gameStore.paginationButtons.next)
    ) {
      gameStore.handleInventoryClick(x, y);
      return;
    }
    const currentItems = gameStore.currentPageItems;
    gameStore.itemSlots.forEach((slot, index) => {
      if (isWithinSlot(x, y, slot)) {
        const currentPageItem = currentItems[index];
      if (currentPageItem) {
        gameStore.startDrag(
          createMouseEvent(e, canvas),
          currentPageItem,
          index,
          "inventory"
          );
        }
      }
    });

    gameStore.equipmentSlotsPosition.forEach((slot, index) => {
      if (isWithinSlot(x, y, slot) && gameStore.equipmentSlots[index]) {
        gameStore.startDrag(
          createMouseEvent(e, canvas),
          gameStore.equipmentSlots[index],
          index,
          "equipment"
        );
      }
    });
  },
  mousemove: (e) => {
    if (!gameStore.dragState.isDragging) return;
    const canvas = canvasRef.value;
    if (canvas) {
      gameStore.updateDrag(createMouseEvent(e, canvas));
    }
  },
  mouseup: (e) => {
    const canvas = canvasRef.value;
    if (canvas) {
      gameStore.endDrag(createMouseEvent(e, canvas));
    }
  },
};

const isWithinSlot = (x, y, slot) => {
  return (
    x >= slot.x &&
    x <= slot.x + gameStore.slotConfig.size &&
    y >= slot.y &&
    y <= slot.y + gameStore.slotConfig.size
  );
};

const createMouseEvent = (e, canvas) => ({
  clientX: e.clientX,
  clientY: e.clientY,
  target: canvas,
});

// 遊戲事件相關設置保持不變...
const gameEventsRef = ref({
  getCanvas: () => canvasRef.value,
  getPlayer: () => player.value,
  handleMove,
  executeGameLoop,
});

const {
  setupEventListeners: setupGameEvents,
  cleanupEventListeners: cleanupGameEvents,
} = useGameEvents(gameEventsRef, gameStore);

function setupEventListeners() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  Object.entries(eventHandlers).forEach(([event, handler]) => {
    canvas.addEventListener(event, handler);
  });
}

function cleanupEventListeners() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  Object.entries(eventHandlers).forEach(([event, handler]) => {
    canvas.removeEventListener(event, handler);
  });
}

onMounted(async () => {
  try {
    const canvas = canvasRef.value;
    if (!canvas) throw new Error("Canvas not found");

    canvas.width = props.width;
    canvas.height = props.height;
    context.value = canvas.getContext("2d");

    await loadPlayerSprite();
    gameStore.inventoryOpen = true;

    // 等待背包背景圖片加載完成
    await new Promise((resolve) => {
      if (gameStore.inventoryBackground) {
        resolve();
      } else {
        const checkBackground = setInterval(() => {
          if (gameStore.inventoryBackground) {
            clearInterval(checkBackground);
            resolve();
          }
        }, 100);
      }
    });

    initializePositions();
    setupEventListeners();
    setupGameEvents();

    // 開始動畫循環
    lastFrameTime = 0; // 重置最後幀時間
    animationFrameId = requestAnimationFrame(executeGameLoop);

    render();
  } catch (error) {
    console.error("Failed to initialize inventory canvas:", error);
  }
});

onUnmounted(() => {
  cleanupEventListeners();
  cleanupGameEvents();
  gameStore.inventoryOpen = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.inventoryPlayer = null;
});

defineExpose({
  getCanvas: () => canvasRef.value,
  getPlayer: () => player.value,
  handleMove,
  executeGameLoop,
});
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
