<script setup>
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "font-awesome/css/font-awesome.css";
import { Playerinformation } from "@/Stores/PlayerCharacter";
const PiniaPlayer = Playerinformation();
import { watch } from "vue";

// const audio = new Audio("src/assets/Music/Waltz_for_flute.mp3");  //寫這行的話，在頁面重整之後就會抓取不到檔案
const audio = new Audio(
  new URL("@/assets/Music/Waltz_for_flute.mp3", import.meta.url)
);
PiniaPlayer.musicvolume = 0.1;
audio.volume = PiniaPlayer.musicvolume;

const openMusic = () => {
  audio.loop = true;
  audio.play();
};
const closeMusic = () => {
  audio.pause();
};
// console.log(PiniaPlayer.music);

watch(
  () => PiniaPlayer.music,
  (ismusic) => {
    if (ismusic) {
      openMusic();
      console.log("open");
    } else {
      closeMusic();
      console.log("close");
    }
  },
  { immediate: true }
);
watch(
  () => PiniaPlayer.musicvolume,
  (changevolume) => {
    audio.volume = changevolume;
  },
  { immediate: true }
);
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
