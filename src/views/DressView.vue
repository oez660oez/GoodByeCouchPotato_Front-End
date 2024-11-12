<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGameStore } from "@/Stores/gameStore";
import { useGameEvents } from "@/composables/useGameEvents";
import InventoryCanvas from "@/components/game/InventoryCanvas.vue";
import GoBackComponent from "@/components/GoBackComponent.vue";
import { onBeforeRouteLeave } from "vue-router";

const router = useRouter();
const route = useRoute();
const gameStore = useGameStore();
const inventoryCanvasRef = ref(null);

// Get user account from session storage
const userAccountJson = sessionStorage.getItem("UserAccount");
const userAccount = JSON.parse(userAccountJson);
const playerAccount = userAccount.playerAccount;

// 遊戲事件處理
const gameEventsRef = ref(null);
const { setupEventListeners, cleanupEventListeners } = useGameEvents(
  inventoryCanvasRef,
  gameStore
);

// 初始化背包的函數
const initializeInventory = async () => {
  try {
    await gameStore.initializeInventory(playerAccount);
    gameStore.inventoryOpen = true; // 確保背包是開啟的

    console.log("Inventory initialized successfully");
  } catch (error) {
    console.error("Failed to initialize inventory:", error);
    throw error;
  }
};

onMounted(async () => {
  try {
    await initializeInventory();
    setupEventListeners();
  } catch (error) {
    console.error("Error in onMounted:", error);
  }
});

//這段並沒有真的把資料存入Pinia
// onUnmounted(async () => {
//   try {
//     await gameStore.saveInventoryState();
//     await gameStore.syncEquipmentToPinia();
//     gameStore.inventoryOpen = false;
//     cleanupEventListeners();
//     gameStore.grayImageCache.clear();
//   } catch (error) {
//     console.error("Failed to save inventory state:", error);
//   }
// });
onBeforeRouteLeave(async (to, from, next) => {
  try {
    await gameStore.saveInventoryState();
    await gameStore.syncEquipmentToPinia();
    next(); // 完成同步後繼續路由切換
  } catch (error) {
    console.error("Failed to save inventory state:", error);
    next(false); // 若同步失敗則阻止路由切換
  }
});

const goBack = async () => {
  try {
    await gameStore.saveInventoryState();
    await gameStore.syncEquipmentToPinia();
  } catch (error) {
    console.error("Failed to save inventory state:", error);
  }

  if (route.matched.length > 1) {
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    router.go(-1);
  }
};
</script>

<template>
  <div id="formborder">
    <div class="canvas-container">
      <div class="dress">
        <GoBackComponent @goback="goBack"></GoBackComponent>
      </div>
      <InventoryCanvas ref="inventoryCanvasRef" :width="802" :height="535" />
    </div>
  </div>
</template>

<style lang="css" scoped>
#formborder {
  display: flex;
  flex-direction: column;
  background-color: transparent;
  position: fixed;
  top: 60px;
  left: 332px;
}

.dress {
  border: none;
  position: absolute;
  width: 32px;
  height: 42px;
  top: 90px;
  left: 725px;
  background-color: transparent;
}

.canvas-container {
  display: flex;
  width: 100%;
  height: calc(100% - 30px); /* 減去返回按鈕的高度 */
  position: relative;
  overflow: hidden;
}

.canvas-container :deep(canvas) {
  min-width: 100%;
  min-height: 100%;
}
</style>
