<script setup>
//GameView.vue
import { ref, onMounted, onUnmounted, watch } from 'vue';
import GameCanvas from '@/components/game/GameCanvas.vue';
import { useGameStore } from '@/Stores/gameStore';

const userAccountJson = sessionStorage.getItem("UserAccount");
const userAccount = JSON.parse(userAccountJson);
const gameCanvasRef = ref(null);
const gameStore = useGameStore();
const isInitialized = ref(false);
const playerAccount = userAccount.playerAccount;
// 遊戲循環
let animationFrameId = null;

async function initializeGame() {
  console.log('Initializing game...');


  if (!gameCanvasRef.value?.$el) {
    console.error('Canvas reference not found');
    return;
  }

  try {
    // 取得 canvas 實例
    const canvas = gameCanvasRef.value.getCanvas();
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // 設置canvas尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize inventory positions
    gameStore.initializePositions(canvas);

    // Initialize inventory with proper error handling
    try {
      await gameStore.initializeInventory(playerAccount);
      console.log('Inventory initialized successfully');
    } catch (error) {
      console.error('Failed to initialize inventory:', error);
      throw error; // 重新拋出錯誤以便上層處理
    }

    isInitialized.value = true;
    console.log('Game initialized successfully');

    // 添加事件監聽器
    setupEventListeners(canvas);

    // 開始遊戲循環
    startGameLoop(canvas);
  } catch (error) {
    console.error('Game initialization failed:', error);
    throw error;
  }
}

function startGameLoop(canvas) {
  const context = canvas.getContext('2d');
  if (!context) return;

  function loop() {
    // Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 執行 GameCanvas 的遊戲循環
    gameCanvasRef.value.executeGameLoop();

    // Draw inventory if open
    if (gameStore.inventoryOpen) {
      const player = gameCanvasRef.value.getPlayer();
      if (player) {
        gameStore.renderInventory(context, player);
      }
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  loop();
}

function setupEventListeners(canvas) {
  if (!canvas) {
    console.error('Canvas is undefined in setupEventListeners');
    return;
  }
  //監聽事件
  window.addEventListener('keydown', handleKeyPress);
  canvas.addEventListener('dblclick', handleCanvasClick);
  window.addEventListener('resize', () => handleResize(canvas));
  // 新增拖曳相關的事件監聽
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  // 防止拖曳時選中文字
  canvas.addEventListener('dragstart', (e) => e.preventDefault());
  console.log('Event listeners setup completed');
}

function cleanupEventListeners(canvas) {
  window.removeEventListener('keydown', handleKeyPress);
  canvas?.removeEventListener('dblclick', handleCanvasClick);
  window.removeEventListener('resize', handleResize);
  canvas?.removeEventListener('mousedown', handleMouseDown);
  canvas?.removeEventListener('mousemove', handleMouseMove);
  canvas?.removeEventListener('mouseup', handleMouseUp);
  canvas?.removeEventListener('dragstart', (e) => e.preventDefault());
}

// 新增滑鼠事件處理函數
const handleMouseDown = (e) => {
  if (!gameStore.inventoryOpen) return;

  const canvas = gameCanvasRef.value?.getCanvas();
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 檢查是否點擊到物品欄的物品
  gameStore.itemSlots.forEach((slot, index) => {
    if (
      x >= slot.x &&
      x <= slot.x + gameStore.slotConfig.size &&
      y >= slot.y &&
      y <= slot.y + gameStore.slotConfig.size &&
      gameStore.inventoryItems[index]
    ) {
      const mouseEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
        target: canvas
      };
      gameStore.startDrag(mouseEvent, gameStore.inventoryItems[index], index, 'inventory');
    }
  });

  // 檢查是否點擊到裝備欄的物品
  gameStore.equipmentSlotsPosition.forEach((slot, index) => {
    if (
      x >= slot.x &&
      x <= slot.x + gameStore.slotConfig.size &&
      y >= slot.y &&
      y <= slot.y + gameStore.slotConfig.size &&
      gameStore.equipmentSlots[index]
    ) {
      const mouseEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
        target: canvas
      };
      gameStore.startDrag(mouseEvent, gameStore.equipmentSlots[index], index, 'equipment');
    }
  });
};


const handleMouseMove = (e) => {
  if (!gameStore.inventoryOpen || !gameStore.dragState.isDragging) return;

  const canvas = gameCanvasRef.value?.getCanvas();
  if (!canvas) return;

  const mouseEvent = {
    clientX: e.clientX,
    clientY: e.clientY,
    target: canvas
  };

  gameStore.updateDrag(mouseEvent);
};

const handleMouseUp = (e) => {
  if (!gameStore.inventoryOpen) return;

  const canvas = gameCanvasRef.value?.getCanvas();
  if (!canvas) return;

  const mouseEvent = {
    clientX: e.clientX,
    clientY: e.clientY,
    target: canvas
  };

  gameStore.endDrag(mouseEvent);
};

// 處理視窗大小改變
function handleResize(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gameStore.initializePositions(canvas);
}

// 鍵盤事件處理
const handleKeyPress = async (e) => {
  console.log('Key pressed:', e.key);
  if (e.key.toLowerCase() === 'i') {
    console.log('I key pressed - Attempting to toggle inventory');
    try {
      const canvas = gameCanvasRef.value?.getCanvas();
      if (!canvas) {
        console.error('Canvas not found when trying to toggle inventory');
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        console.error('Failed to get canvas context');
        return;
      }

      const player = gameCanvasRef.value?.getPlayer();
      if (!player) {
        console.error('Player not found when trying to toggle inventory');
        return;
      }

      console.log('Current inventory state:', gameStore.inventoryOpen);
      await gameStore.toggleInventory();
      console.log('New inventory state after toggle:', gameStore.inventoryOpen);

      // Force a render of the inventory
      gameStore.renderInventory(context, player);
    } catch (error) {
      console.error('Error in handleKeyPress:', error);
    }
  }
};

// 滑鼠點擊事件處理
const handleCanvasClick = (e) => {
  if (!gameStore.inventoryOpen) return;

  const canvas = gameCanvasRef.value.getCanvas();
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  gameStore.handleInventoryClick(x, y);
};

watch(() => gameCanvasRef.value, async (newVal) => {
  if (newVal && !isInitialized.value) {
    await initializeGame();
  }
}, { immediate: true });

onMounted(async () => {
  console.log('Component mounted');
  window.addEventListener('keydown', handleKeyPress);
  await initializeGame();
});

onUnmounted(() => {
  console.log('Component unmounting...');
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('keydown', handleKeyPress);
  const canvas = gameCanvasRef.value?.getCanvas();
  cleanupEventListeners(canvas);
});
</script>

<template>
 <div class="game-view">
    <GameCanvas
      ref="gameCanvasRef"
    />
  </div>
  </template>

<style lang="css" scoped>
.game-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
}
</style>