//useGameLoop.js
import { ref } from 'vue';

export function useGameLoop() {
  const animationFrameId = ref(null);

  const startGameLoop = (callback) => {
    const loop = () => {
      animationFrameId.value = requestAnimationFrame(loop);
      callback();
    };
    loop();
  };

  const stopGameLoop = () => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
  };

  return {
    startGameLoop,
    stopGameLoop
  };
}