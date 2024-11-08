const audio = new Audio("@/assets/Music/Waltz_for_flute.mp3");

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
    } else {
      closeMusic();
    }
  },
  { immediate: true }
);
