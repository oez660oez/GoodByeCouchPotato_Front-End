<script setup>
import GameView from "./GameView.vue";
import SidebarComponent from "@/components/SidebarComponent.vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";

const router = useRouter();
const PiniaPlayer = Playerinformation();
const transition = ref(true);

//判斷是否要跳結束劇情
let GameOver = false;
if (PiniaPlayer.characterEnvironment <= 0) {
  GameOver = true;
} else {
  GameOver = false;
}
if (PiniaPlayer.isnewcharacter) {
  //為了關閉導覽列，所以要先把兩個if條件都設置為true，然後判斷成false
  //當環境值大於0並且isnewcharacter是false的時候，就會觸發上面的else再次改回false，導覽列就會出現
  GameOver = true;
}

onMounted(() => {
  transition.value = false;
});

const goToWeightTask = () => {
  router.push({ name: "weighttask" });
};
</script>

<template>
  <transition name="fade" v-show="transition" class="blacktransition">
    <div class="black"></div>
  </transition>

  <div class="sidebarview" v-if="!GameOver || !PiniaPlayer.isnewcharacter">
    <SidebarComponent></SidebarComponent>
  </div>
  <div
    class="weight-button"
    @click="goToWeightTask"
    v-if="!GameOver || !PiniaPlayer.isnewcharacter"
  >
    <img src="/images/WeightButton.png" alt="Weight Button" />
  </div>
  <div class="game-view">
    <GameView />
  </div>
</template>

<style lang="css" scoped>
.nav-link {
  z-index: 10;
  position: relative;
  background-color: white;
}
.game-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  z-index: 1;
  position: relative;
}
.sidebarview {
  z-index: 10;
  position: absolute;
}
.weight-button {
  position: absolute;
  z-index: 11;
  cursor: pointer;
  left: 300px; /* 調整按鈕位置 */
  top: 75px; /* 調整按鈕位置 */
  transition: transform 0.2s;
  /* border: 2px solid red;
  width: 500px;
  height: 500px; */
}

.weight-button:hover {
  transform: scale(1.1);
}

.weight-button img {
  width: 35px; /* 調整按鈕大小 */
  height: auto;
}
</style>
