<script setup>
import { ref, onMounted } from "vue";
import { useMainStore } from "@/Stores/btnActiveCtrl";
import { useReportDataStore } from "@/Stores/reportDataStore";

const resetReport = useReportDataStore();
const btnActive = useMainStore();

const canvasRef = ref(null);
const canvasWidth = 32;
const canvasHeight = 42;
const context = ref(null);
const CutImage = ref([]);
const frameIndex = ref(0); // 目前的索引位置
const emit = defineEmits(["goback"]);

const LoadImage = (src) => {
  const img = new Image(); //創建一個新的圖片物件
  img.src = src; //設定圖片來源
  return new Promise((resolve, reject) => {
    //設定回傳的狀況
    img.onload = () => resolve(img); //加載成功則傳圖片
    img.onerror = reject; //加載失敗則拒絕
  });
};

onMounted(async () => {
  const canvas = document.querySelector("#goback");
  if (!canvas) throw new Error("Canvas not found");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.value = canvas.getContext("2d");
  const chachaURL = "http://localhost:5173/src/assets/Xbutton.png";

  const ChachaImage = await LoadImage(chachaURL);
  for (let i = 0; i < 6; i++) {
    const sprite = {
      draw(ctx) {
        ctx.drawImage(ChachaImage, i * 32, 0, 32, 42, 0, 0, 32, 42);
      },
    };
    CutImage.value.push(sprite);
  }
  const ctx = context.value;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  CutImage.value[0].draw(ctx, 0, 0); //畫第一幀
});

const buttonstart = () => {
  const ctx = context.value;
  if (CutImage.value.length > 0) {
    {
      for (let i = 0; i < 3; i++) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        CutImage.value[i].draw(ctx, 0, 0);
        frameIndex.value = (i + 1) % CutImage.value.length;
      }
    }
  }
};
const buttonup = () => {
  const ctx = context.value;
  if (CutImage.value.length > 0) {
    {
      for (let i = 3; i < 6; i++) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        CutImage.value[i].draw(ctx, 0, 0);
        frameIndex.value = (i + 1) % CutImage.value.length;
      }
    }
  }
};

const buttonend = () => {
  buttonup();
  emit("goback");
  btnActive.resetActiveButton(); //清除按鈕active狀態
  resetReport.resetReportData(); //清除報表資料
};

//避免長按之後沒放開，移開滑鼠會一直卡再下去的畫面
const buttonNoend = () => {
  buttonup();
};
</script>

<template>
  <canvas
    id="goback"
    class="canvascss"
    ref="canvasRef"
    :height="canvasHeight"
    :width="canvasWidth"
    @mousedown="buttonstart"
    @mouseup="buttonend"
    @mouseleave="buttonNoend"
  ></canvas>
  <!-- <img :src="chachaURL" /> -->
</template>

<style lang="css" scoped>
canvas {
  position: absolute;
}
</style>
