<script setup>
import GameView from "./GameView.vue";
import SidebarView from "./SidebarView.vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import { useRouter } from 'vue-router';

const router = useRouter();
const PiniaPlayer = Playerinformation();
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
const goToWeightTask = () => {
  router.push({ name: 'weighttask' });
};
</script>

<template>
  <RouterLink class="nav-link" :to="{ name: 'roommap' }">
    <i class="fa-regular fa-map"></i>
  </RouterLink>

  <div class="sidebarview" v-if="!GameOver || !PiniaPlayer.isnewcharacter">
    <SidebarView></SidebarView>
  </div>
  <div class="weight-button" @click="goToWeightTask">
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
  height: 93vh;
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
  z-index: 10;
  cursor: pointer;
  left: 80px;  /* 調整按鈕位置 */
  top: 32px;    /* 調整按鈕位置 */
  transition: transform 0.2s;
}

.weight-button:hover {
  transform: scale(1.1);
}

.weight-button img {
  width: 35px;  /* 調整按鈕大小 */
  height: auto;
}
</style>
