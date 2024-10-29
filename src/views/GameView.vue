<script setup>
// GameView.vue
import { ref, onMounted, onUnmounted, watch } from "vue";
import GameCanvas from "@/components/game/GameCanvas.vue";
import { useGameStore } from "@/Stores/gameStore";
import { useGameEvents } from "@/composables/useGameEvents";
import { useRouter, useRoute } from "vue-router";

const userAccountJson = sessionStorage.getItem("UserAccount");
const userAccount = JSON.parse(userAccountJson);
const gameCanvasRef = ref(null);
const gameStore = useGameStore();
const playerAccount = userAccount.playerAccount;

// 使用重構後的事件系統
const { isInitialized, setupEventListeners, cleanupEventListeners } =
  useGameEvents(gameCanvasRef, gameStore);

async function initializeGame() {
  console.log("Initializing game...");

  if (!gameCanvasRef.value?.$el) {
    console.error("Canvas reference not found");
    return;
  }

  try {
    const canvas = gameCanvasRef.value.getCanvas();
    if (!canvas) {
      throw new Error("Canvas element not found");
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gameStore.initializePositions(canvas);

    try {
      await gameStore.initializeInventory(playerAccount);
      console.log("Inventory initialized successfully");
    } catch (error) {
      console.error("Failed to initialize inventory:", error);
      throw error;
    }

    isInitialized.value = true;
    console.log("Game initialized successfully");

    // 設置事件監聽器
    setupEventListeners();
  } catch (error) {
    console.error("Game initialization failed:", error);
    throw error;
  }
}

watch(
  () => gameCanvasRef.value,
  async (newVal) => {
    if (newVal && !isInitialized.value) {
      await initializeGame();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  console.log("Component mounted");
  await initializeGame();
});

onUnmounted(() => {
  console.log("Component unmounting...");
  cleanupEventListeners();
});
</script>

<template>
  <div class="game-view">
    <GameCanvas ref="gameCanvasRef" />
  </div>
</template>

<style lang="css" scoped>
.game-view {
  width: 80%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
}
</style>
