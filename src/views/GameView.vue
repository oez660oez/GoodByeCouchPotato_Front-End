<script setup>
//GameView.vue
import GameCanvas from '@/components/game/GameCanvas.vue';
</script>

<template>
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
}
</style>