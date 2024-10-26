<script setup>
//InventoryUI.vue
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/Stores/gameStore';
import PreviewBox from './PreviewBox.vue';

const props = defineProps({
  canvas: {
    type: HTMLCanvasElement,
    required: true
  },
  player: {
    type: Object,
    required: true
  },
  playerAccount: {
    type: String,
    required: true
  }
});

const store = useGameStore();
const overlayCanvas = ref(null);
const previewBox = ref(null);

onMounted(async () => {
  // 初始化物品欄
  await store.initializeInventory(props.playerAccount);

  // 初始化預覽框
  previewBox.value = new PreviewBox({
    player: props.player,
    previewConfig: store.previewBoxConfig
  });

  // 添加鍵盤事件監聽
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});

const handleKeyPress = (e) => {
  if (e.key.toLowerCase() === 'i') {
    store.toggleInventory();
  }
};

const handleDoubleClick = (e) => {
  if (!store.inventoryOpen) return;

  const rect = overlayCanvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 檢查物品欄點擊
  store.itemSlots.forEach((slot, index) => {
    if (
      x >= slot.x &&
      x <= slot.x + store.slotSize &&
      y >= slot.y &&
      y <= slot.y + store.slotSize &&
      store.inventoryItems[index]
    ) {
      store.handleEquip(store.inventoryItems[index], index);
    }
  });

  // 檢查裝備欄點擊
  store.equipmentSlotsPosition.forEach((slot, index) => {
    if (
      x >= slot.x &&
      x <= slot.x + store.slotSize &&
      y >= slot.y &&
      y <= slot.y + store.slotSize &&
      store.equipmentSlots[index]
    ) {
      store.unequipItem(index);
    }
  });
};

const render = (ctx) => {
  if (!store.inventoryOpen) return;

  // 清除畫布
  ctx.clearRect(0, 0, props.canvas.width, props.canvas.height);

  // 繪製物品欄背景
  if (store.inventoryBackground) {
    ctx.drawImage(
      store.inventoryBackground,
      store.inventoryPosition.x,
      store.inventoryPosition.y
    );
  }

  // 繪製物品槽
  store.itemSlots.forEach((slot, index) => {
    // 繪製槽位
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(slot.x, slot.y, store.slotSize, store.slotSize);

    // 繪製物品
    if (store.inventoryItems[index]) {
      ctx.drawImage(
        store.inventoryItems[index],
        slot.x,
        slot.y,
        store.slotSize,
        store.slotSize
      );
    }
  });

  // 繪製裝備槽
  store.equipmentSlotsPosition.forEach((slot, index) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(slot.x, slot.y, store.slotSize, store.slotSize);

    if (store.equipmentSlots[index]) {
      ctx.drawImage(
        store.equipmentSlots[index],
        slot.x,
        slot.y,
        store.slotSize,
        store.slotSize
      );
    }
  });

  // 繪製預覽框
  if (previewBox.value) {
    previewBox.value.drawPreview(ctx);
  }
};

defineExpose({
  render,
});
</script>

<template>
  <div class="inventory-ui">
    <canvas
      ref="overlayCanvas"
      :width="canvas.width"
      :height="canvas.height"
      class="overlay-canvas"
      @dblclick="handleDoubleClick"
    ></canvas>
  </div>
</template>

<style lang="css" scoped>
.inventory-ui {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
}
</style>