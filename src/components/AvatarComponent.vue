<script setup>
import { ref, onMounted } from 'vue';
import { Playerinformation } from '@/Stores/PlayerCharacter';
import { storeToRefs } from 'pinia';
import Sprite from '@/Stores/Sprite New';

// 從 Pinia store 中引入玩家資訊
const playerStore = Playerinformation();
const { Head, Upper } = storeToRefs(playerStore);

// 相關變數宣告
const canvasRef = ref(null);
let ctx = null;
const sprite = ref(null);
const isActive = ref(false);
// 用於追蹤當前選擇的按鈕
const activeButton = ref('');

// 圖片對應表：根據編號對應到圖片檔案
const imagePaths = {
  1053: 'src/assets/Avatar images/PG_Hairstyle_01_48x48_1.png',
  1054: 'src/assets/Avatar images/PG_Hairstyle_01_48x48_2.png',
  1055: 'src/assets/Avatar images/PG_Hairstyle_01_48x48_3.png',
  1056: 'src/assets/Avatar images/PG_Accessory_01_Ladybug_48x48_1.png',
  1057: 'src/assets/Avatar images/PG_Accessory_01_Ladybug_48x48_2.png',
  1058: 'src/assets/Avatar images/PG_Accessory_01_Ladybug_48x48_3.png',
  1062: 'src/assets/Avatar images/PG_Accessory_05_Dino_Snapback_48x48_1.png',
  1063: 'src/assets/Avatar images/PG_Accessory_05_Dino_Snapback_48x48_2.png',
  1064: 'src/assets/Avatar images/PG_Accessory_05_Dino_Snapback_48x48_3.png'
};

// 載入圖片
const spriteImage = new Image();
spriteImage.src = '/src/assets/Avatar images/Avatar.png'; // 確保圖片路徑正確

const spriteImage3 = new Image();
if (imagePaths[Upper.value]) {
  spriteImage3.src = imagePaths[Upper.value];
} else {
  console.error(`未找到對應的圖片，編號: ${Upper.value}`);
}

const spriteImage2 = new Image();
if (imagePaths[Head.value]) {
  spriteImage2.src = imagePaths[Head.value];
} else {
  console.error(`未找到對應的圖片，編號: ${Head.value}`);
}

// 初始化圖片和 Sprite
const AvatarImage = () => {
  spriteImage.onload = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    // 獲取 Canvas 2D 上下文
    ctx = canvas.getContext('2d');

    // 初始化 Sprite
    sprite.value = new Sprite({
      position: { x: -15, y: -14 },
      image: spriteImage,
      image2: spriteImage2,
      image3: spriteImage3,

      frames: { max: 10 }
    });

    // 預先繪製第一幀
    sprite.value.draw(ctx);
  };
};

// 動畫函式
const animate = () => {
  const canvas = canvasRef.value;

  const drawFrame = () => {
    if (sprite.value.frames.val === sprite.value.frames.max - 1) {
      sprite.value.frames.val = 0;
      sprite.value.draw(ctx);
      return; // 播放完畢後停止
    }

    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製當前幀
    sprite.value.draw(ctx);

    requestAnimationFrame(drawFrame);
  };

  drawFrame();
};

// 按下按鈕播放動畫
const startAnimation = () => {
  AvatarImage();
  animate();
};
onMounted(() => {
  AvatarImage();
});
</script>

<template>
  <div>
    <canvas
      ref="canvasRef"
      width="60"
      height="60"
      @click="startAnimation"
    ></canvas>
  </div>
</template>

<style scoped>
canvas {
  margin-right: 10px;
}
</style>
