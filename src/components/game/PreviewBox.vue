<script setup>
//PreviewBox.vue
import { computed } from 'vue';
import { useGameStore } from '@/Stores/gameStore';

const props = defineProps({
  player: {
    type: Object,
    required: true,
  },
  previewConfig: {
    type: Object,
    required: true,
    default: () => ({
      x: 0,
      y: 0,
      width: 185,
      height: 300,
    }),
  },
});

const store = useGameStore();
const equippedItems = computed(() => store.equippedItems);

const drawPreview = (ctx) => {
  // Draw preview box border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    props.previewConfig.x,
    props.previewConfig.y,
    props.previewConfig.width,
    props.previewConfig.height
  );

  // Draw character preview
  if (props.player && props.player.image) {
    const scaleFactor = 0.8;
    const start = (props.player.image.width / 4) * props.player.direction;

    ctx.drawImage(
      props.player.image,
      start + props.player.frames.val * props.player.width,
      0,
      props.player.width,
      props.player.height,
      props.previewConfig.x + 10,
      props.previewConfig.y + 35,
      props.previewConfig.width * scaleFactor,
      props.previewConfig.height * scaleFactor
    );

    // Draw equipped items
    drawEquippedItems(ctx);
  }
};

const drawEquippedItems = (ctx) => {
  const equipmentOrder = ["outfit", "hairstyle", "accessory"];
  const scaleFactor = 0.8;

  equipmentOrder.forEach((type) => {
    const sprite = equippedItems.value[type];
    if (sprite && sprite.loaded) {
      try {
        const start = (sprite.image.width / 4) * props.player.direction;
        const frameWidth = sprite.width;
        const frameHeight = sprite.height;
        const scale = Math.min(
          props.previewConfig.width / frameWidth,
          props.previewConfig.height / frameHeight
        ) * scaleFactor;

        const centerX = props.previewConfig.x + 10;
        const centerY = props.previewConfig.y + 35;

        ctx.drawImage(
          sprite.image,
          start + props.player.frames.val * frameWidth,
          0,
          frameWidth,
          frameHeight,
          centerX,
          centerY,
          frameWidth * scale,
          frameHeight * scale
        );
      } catch (error) {
        console.error(`Error drawing preview for ${type}:`, error);
      }
    }
  });
};

defineExpose({
  drawPreview,
});
</script>