// Stores/btnActiveStore.js
// import { defineStore } from 'pinia';

// export const useMainStore = defineStore('btnActive', {
//   state: () => ({
//     activeButton: null
//   }),
//   actions: {
//     // 每次設置新按鈕時，直接重置所有按鈕狀態
//     setActiveButton(buttonName) {
//       this.activeButton = buttonName;
//     },
//     // 完全重置狀態
//     resetActiveButton() {
//       this.activeButton = null;
//     }
//   }
// });

// Stores/btnActiveStore.js
import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useMainStore = defineStore('btnActive', () => {
  // 使用 ref 來定義 reactive 狀態
  const activeButton = ref(null);

  // 設定按鈕為 active
  const setActiveButton = (buttonName) => {
    activeButton.value = buttonName;
  };

  // 重置按鈕狀態
  const resetActiveButton = () => {
    activeButton.value = null;
    console.log('clear!');
  };

  // 返回狀態和方法
  return {
    activeButton,
    setActiveButton,
    resetActiveButton
  };
});
