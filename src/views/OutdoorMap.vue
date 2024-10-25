<script setup>
import SidebarView from "./SidebarView.vue";
import GameCanvas from "@/components/game/GameCanvas.vue";
</script>

<template>
  <RouterLink class="nav-link" :to="{ name: 'roommap' }">
    <i class="fa-regular fa-map"></i>
  </RouterLink>

  <div class="sidebarview">
    <SidebarView></SidebarView>
  </div>
  <div class="game-view">
    <GameCanvas />
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
  z-index: 1;
  position: relative;
}
.sidebarview {
  z-index: 10;
  position: absolute;
}
</style>
