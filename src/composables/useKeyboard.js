//useKeyboard.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useKeyboard() {
  const keys = ref({
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
  });

  const lastKey = ref('');

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'w':
        keys.value.w.pressed = true;
        lastKey.value = 'w';
        break;
      case 'a':
        keys.value.a.pressed = true;
        lastKey.value = 'a';
        break;
      case 's':
        keys.value.s.pressed = true;
        lastKey.value = 's';
        break;
      case 'd':
        keys.value.d.pressed = true;
        lastKey.value = 'd';
        break;
    }
  };

  const handleKeyUp = (e) => {
    switch (e.key) {
      case 'w':
        keys.value.w.pressed = false;
        break;
      case 'a':
        keys.value.a.pressed = false;
        break;
      case 's':
        keys.value.s.pressed = false;
        break;
      case 'd':
        keys.value.d.pressed = false;
        break;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });

  return {
    keys,
    lastKey
  };
}