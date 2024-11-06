<script setup>
// GameView.vue
import { ref, onMounted, onUnmounted, watch } from "vue";
import GameCanvas from "@/components/game/GameCanvas.vue";
import { useGameStore } from "@/Stores/gameStore";
import { useGameEvents } from "@/composables/useGameEvents";
import StoryComponent from "@/components/StoryComponent.vue";

const userAccountJson = sessionStorage.getItem("UserAccount");
const userAccount = JSON.parse(userAccountJson);
const gameCanvasRef = ref(null);
const gameStore = useGameStore();
const playerAccount = userAccount.playerAccount;
const NewCharacter = userAccount.isnewcharacter; //判斷是不是新角色要跑劇情
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
  gameStore.account = playerAccount;
  console.log("Component mounted");
  gameStore.initializeEquipmentRender(null, playerAccount);
  await initializeGame();
  console.log(userAccount.characterEnvironment);
  console.log(typename.value);
});

onUnmounted(() => {
  console.log("Component unmounting...");
  cleanupEventListeners();
});

const typename = ref(null); //用來識別對話框使用哪一段對話
const gameover = ref(false); //用來判斷是否遊戲結束了
if (userAccount.characterEnvironment <= 0) {
  gameover.value = true;
  //環境值歸0觸發結束劇情
  typename.value = "EndStory";
} else if (userAccount.isnewcharacter) {
  userAccount.isnewcharacter = false;
  typename.value = "StartInStory";
}
</script>

<template>
  <div class="game-view">
    <div v-if="NewCharacter || gameover" class="storyborder">
      <StoryComponent :type="typename"></StoryComponent>
    </div>
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

.storyborder {
  z-index: 10;
  position: absolute;
  top: 60%;
  left: 29.5%;
}
</style>
