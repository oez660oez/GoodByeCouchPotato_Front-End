<script setup>
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "font-awesome/css/font-awesome.css";
// import { Playerinformation } from "@/Stores/PlayerCharacter";
// const PiniaPlayer = Playerinformation();
// import { watch } from "vue";

// const audio = new Audio("@/assets/Music/Waltz_for_flute.mp3");

// const openMusic = () => {
//   audio.loop = true;
//   audio.play();
// };
// const closeMusic = () => {
//   audio.pause();
// };
// // console.log(PiniaPlayer.music);

// watch(
//   () => PiniaPlayer.music,
//   (ismusic) => {
//     if (ismusic) {
//       openMusic();
//     } else {
//       closeMusic();
//     }
//   },
//   { immediate: true }
// );
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
