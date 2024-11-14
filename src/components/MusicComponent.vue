<script setup>
import { ref, onMounted, watch } from "vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
const PiniaPlayer = Playerinformation();
const canvasRef = ref(null);
const canvasWidth = 96;
const canvasHeight = 96;
const context = ref(null);
const CutImage = ref([]);
const frameIndex = ref(0); // 目前的索引位置
const emit = defineEmits(["goback"]);
const volume = ref(Math.round(PiniaPlayer.musicvolume * 100));

const LoadImage = (src) => {
  const img = new Image(); //創建一個新的圖片物件
  img.src = src; //設定圖片來源
  return new Promise((resolve, reject) => {
    //設定回傳的狀況
    img.onload = () => resolve(img); //加載成功則傳圖片
    img.onerror = reject; //加載失敗則拒絕
  });
};
//調整顯示的音量
const musicvolume = () => {
  volume.value = Math.round(PiniaPlayer.musicvolume * 100);
};

onMounted(async () => {
  console.log(volume.value);
  // if (!PiniaPlayer.music) {
  //   PiniaPlayer.musicvolume = 0;
  //   volume.value = PiniaPlayer.musicvolume;
  // } else {
  //   PiniaPlayer.musicvolume = 0.2;
  // }  //剛載入的時候都會被瀏覽器給關閉，要進行過操作才能放，所以在遊戲內重載一定會被關掉

  const canvas = document.querySelector("#Music");
  if (!canvas) throw new Error("Canvas not found");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.value = canvas.getContext("2d");
  const musicbuttonURL = "http://localhost:5173/src/assets/musicControl.png";

  const musicImage = await LoadImage(musicbuttonURL);
  for (let i = 0; i < 6; i++) {
    const sprite = {
      draw(ctx) {
        ctx.drawImage(musicImage, i * 96, 0, 96, 96, 0, 0, 96, 96);
      },
    };
    CutImage.value.push(sprite);
  }
  const ctx = context.value;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  if (PiniaPlayer.music) {
    CutImage.value[0].draw(ctx, 0, 0); //畫第一幀
  } else {
    CutImage.value[5].draw(ctx, 0, 0); //如果是靜音狀態就從最後一個開始顯示
  }
});

//按鈕的開始
const buttonstart = () => {
  const ctx = context.value;
  if (CutImage.value.length > 0) {
    //音樂打開狀態按下去會轉為關閉
    if (PiniaPlayer.music) {
      for (let i = 0; i < 3; i++) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        CutImage.value[i].draw(ctx, 0, 0);
        frameIndex.value = (i + 1) % CutImage.value.length;
      }
    } else {
      //從關閉倒回去，如果原本是關閉狀態
      for (let i = 5; i >= 3; i--) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        CutImage.value[i].draw(ctx, 0, 0);
        frameIndex.value = (i + 1) % CutImage.value.length;
      }
    }
  }
};

//按鈕的結束
const buttonend = () => {
  if (CutImage.value.length > 0) {
    {
      if (PiniaPlayer.music) {
        endopenbutton(); //因為原本是打開，接下來要使用關閉的圖
        PiniaPlayer.music = false;
      } else {
        endclosebutton(); //原本是關閉，現在要打開
        if (PiniaPlayer.musicvolume > 0) {
          musicvolume();
          PiniaPlayer.music = true;
        } else {
          PiniaPlayer.music = true;
          PiniaPlayer.musicvolume = 0.2;
          musicvolume();
        }
      }
    }
  }
};

//關閉音樂的結束
const endclosebutton = () => {
  const ctx = context.value;
  for (let i = 2; i >= 0; i--) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    CutImage.value[i].draw(ctx, 0, 0);
    frameIndex.value = (i + 1) % CutImage.value.length;
  }
};

//打開音樂的結束
const endopenbutton = () => {
  const ctx = context.value;
  for (let i = 3; i < 6; i++) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    CutImage.value[i].draw(ctx, 0, 0);
    frameIndex.value = (i + 1) % CutImage.value.length;
  }
};

const buttonNoend = () => {
  if (CutImage.value.length > 0) {
    {
      if (PiniaPlayer.music) {
        //如果是開啟就繼續開啟
        endclosebutton();
      } else {
        endopenbutton();
      }
    }
  }
};

//音量減少
const down = () => {
  if (PiniaPlayer.musicvolume > 0) {
    PiniaPlayer.musicvolume -= 0.1;
    if (PiniaPlayer.musicvolume >= 0.1) {
      musicvolume();
    } else {
      PiniaPlayer.musicvolume = 0;
      musicvolume();
      PiniaPlayer.music = false;
      endopenbutton(); //如果音量為0就要關上
    }
  }
};

//音量增加
const up = () => {
  if (PiniaPlayer.musicvolume <= 1) {
    PiniaPlayer.musicvolume += 0.1;
    if (PiniaPlayer.musicvolume > 0 && PiniaPlayer.musicvolume < 1) {
      musicvolume();
      PiniaPlayer.music = true;
      endclosebutton();
    } else {
      PiniaPlayer.musicvolume = 1;
      musicvolume();
    }
  }
};
</script>

<template>
  <canvas
    id="Music"
    class="canvascss"
    ref="canvasRef"
    :height="canvasHeight"
    :width="canvasWidth"
    @mousedown="buttonstart"
    @mouseup="buttonend"
    @mouseleave="buttonNoend"
  ></canvas>
  <p>{{ volume }}</p>
  <div class="volume">
    <button class="down" @click="down"></button>
    <button class="up" @click="up"></button>
  </div>
  <img :src="chachaURL" />
</template>

<style lang="css" scoped>
canvas {
  position: absolute;
}

button {
  background: none;
  border: none;
  padding: 0;
  outline: none;
  cursor: pointer;
}

.down,
.up {
  width: 48px;
  height: 48px;
  background-size: cover;
  background-repeat: no-repeat;
}

.down {
  background-image: url("@/assets/musicbuttondown.png");
}

.up {
  background-image: url("@/assets/musicbuttonup.png");
}

.volume {
  /* border: 2px solid red; */
  position: absolute;
  width: 400px;
  height: 40px;
  display: flex;
  left: 60px;
  top: 30px;
  justify-content: space-around;
}

p {
  position: absolute;
  color: rgba(82, 50, 50, 0.847);
  font-size: 40px;
  top: 27px;
  left: 245px;
  /* border: 2px solid red; */
}
</style>
