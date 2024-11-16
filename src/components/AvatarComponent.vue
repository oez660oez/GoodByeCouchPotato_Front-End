<script setup>
import { ref, onMounted, watch } from "vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import { storeToRefs } from "pinia";
import Sprite from "@/Stores/Sprite New";

// 從 Pinia store 中引入玩家資訊
const playerStore = Playerinformation();
// const getBody = playerStore.updateCharacterBody();
const { Head, Upper } = storeToRefs(playerStore);

const canvasRef = ref(null);
let ctx = null;
const sprite = ref(null);

const randomSlice = ref(0);
// 定義圖片路徑
const imagePaths = {
  0: "src/assets/Avatar images/none.png",
  1053: "src/assets/Avatar images/PG_Hairstyle_01_48x48_1.png",
  1054: "src/assets/Avatar images/PG_Hairstyle_01_48x48_2.png",
  1055: "src/assets/Avatar images/PG_Hairstyle_01_48x48_3.png",
  1056: "src/assets/Avatar images/PG_Accessory_01_Ladybug_48x48_1.png",
  1057: "src/assets/Avatar images/PG_Accessory_01_Ladybug_48x48_2.png",
  1058: "src/assets/Avatar images/PG_Accessory_01_Ladybug_48x48_3.png",
  1062: "src/assets/Avatar images/PG_Accessory_05_Dino_Snapback_48x48_1.png",
  1063: "src/assets/Avatar images/PG_Accessory_05_Dino_Snapback_48x48_2.png",
  1064: "src/assets/Avatar images/PG_Accessory_05_Dino_Snapback_48x48_3.png",
};

watch(
  [Head, Upper],
  async () => {
    console.log("監聽到 Head 或 Upper 變更");
    // 增加 100ms 延遲，確保所有內容初始化完成
    setTimeout(async () => {
      await compositeAndCropImages();
    }, 200);
  },
  { immediate: true }
);

// 非同步載入圖片的函數
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`無法載入圖片: ${src}`));
  });
};

// 合成和裁切圖片
const compositeAndCropImages = async () => {
  try {
    // 檢查 Pinia 的值是否已經設置
    if (Head.value == null || Upper.value == null) {
      console.error("Head 或 Upper 尚未初始化");
      return;
    }
    const canvas = canvasRef.value;
    if (!canvas) throw new Error("Canvas 未正確取得");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context 無法取得");

    const spriteImage = await loadImage("/src/assets/Avatar images/Avatar.png");
    const headImagePath = imagePaths[Head.value];
    const upperImagePath = imagePaths[Upper.value];

    const headImage = headImagePath
      ? await loadImage(headImagePath)
      : await loadImage(imagePaths[0]);
    const upperImage = upperImagePath
      ? await loadImage(upperImagePath)
      : await loadImage(imagePaths[0]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    RandomValue();

    sprite.value = new Sprite({
      position: { x: -15, y: -8 },
      image: spriteImage,
      image2: upperImage,
      image3: headImage,
      frames: { max: 10 },
      slice: randomSlice.value,
    });

    sprite.value.draw(ctx);
  } catch (error) {
    console.error("初始化 Sprite 時發生錯誤:", error.message);
  }
};

// 監聽 Pinia store 中 Head 和 Upper 的變化
// watch(
//   [Head, Upper],
//   async () => {
//     console.log('監聽到 Head 或 Upper 變更');
//     await compositeAndCropImages();
//   },
//   { immediate: true }
// );

// 動畫函式
const animate = () => {
  const drawFrame = () => {
    if (sprite.value.frames.val === sprite.value.frames.max - 1) {
      sprite.value.frames.val = 0;
      sprite.value.draw(ctx);
      return; // 播放完畢後停止
    }

    const canvas = canvasRef.value;
    if (!canvas || !sprite.value) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sprite.value.draw(ctx);
    requestAnimationFrame(drawFrame);
  };
  drawFrame();
};

const startAnimation = () => {
  compositeAndCropImages();
  animate();
};

const RandomValue = () => {
  randomSlice.value = Math.floor(Math.random() * 3);
};

// 在元件掛載時執行
onMounted(() => {
  console.log("元件掛載完成，執行初始繪製");
  compositeAndCropImages();
});
</script>

<template>
  <div>
    <canvas
      ref="canvasRef"
      width="65"
      height="70"
      @click="startAnimation"
    ></canvas>
  </div>
</template>

<style scoped>
/* canvas {
  border: 1px solid #000;
} */
</style>
