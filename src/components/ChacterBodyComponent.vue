<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Sprite } from "@/core/Player"; //裁切器(?)
import { useGameLoop } from "@/composables/useGameLoop";
import { Merchandiselist } from "@/Stores/Merchandiselist";
const PiniaMerchandise = Merchandiselist();

const canvasRef = ref(null);
const canvasWidth = 74;
const canvasHeight = 112;
const context = ref(null);
const { startGameLoop, stopGameLoop } = useGameLoop(); //開始遊戲的自定義函數

const player = ref(null); //存放玩家切割的圖片

const ChooseMerchandise = ref(PiniaMerchandise.Choose); //從Pinia取資料出來

//存放試穿的切割圖片
const playerhead = ref(null);
const playerbody = ref(null);
const playeraccessory = ref(null);
const currentdirection = ref(3);
//用來存放玩家試穿的衣服，圖片來源
const equippedItems = ref({
  head: null,
  body: null,
  accessory: null,
});

//角色素體圖
const CharcterImageUrl =
  "http://localhost:5173/src/assets/images/person_Modify.png";
//======================方法start=============================
//加載圖片
const LoadImage = (src) => {
  const img = new Image(); //創建一個新的圖片物件
  img.src = src; //設定圖片來源
  return new Promise((resolve, reject) => {
    //設定回傳的狀況
    img.onload = () => resolve(img); //加載成功則傳圖片
    img.onerror = reject; //加載失敗則拒絕
  });
};

//開始遊戲循環
const GameLoop = async () => {
  const ctx = context.value;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); //清空畫布
  player.value.setDirection(currentdirection);
  if (PiniaMerchandise.Choosemerchandise) {
    //把玩家選擇的商品帶到角色demo這裡，因為這個會一直循環，所以寫在這裡就會一直被觸發
    ChooseMerchandise.value = PiniaMerchandise.Choose;
    PiniaMerchandise.Choosemerchandise = false;
    if (ChooseMerchandise.value != "") {
      const first = ChooseMerchandise.value[0]; //取出陣列的內容
      console.log(first.pClass);

      if (first.pClass == "飾品") {
        equippedItems.value.accessory = first.pImageAll;
        console.log(equippedItems.value.accessory);
        if (equippedItems.value.accessory != null) {
          const playeraccessoryIMG = await LoadImage(
            equippedItems.value.accessory
          );
          playeraccessory.value = new Sprite({
            position: {
              x: canvasWidth / 2 - 288 / 4 / 2,
              y: canvasHeight / 2 - 80 / 2,
            },
            image: playeraccessoryIMG,
            frames: { max: 6 },
          });
          playeraccessory.value.setDirection(currentdirection);
        }
      }

      if (first.pClass == "衣服") {
        equippedItems.value.body = first.pImageAll;
        console.log(equippedItems.value.body);
        if (equippedItems.value.body != null) {
          const playerbodyIMG = await LoadImage(equippedItems.value.body);
          playerbody.value = new Sprite({
            position: {
              x: canvasWidth / 2 - 288 / 4 / 2,
              y: canvasHeight / 2 - 80 / 2,
            },
            image: playerbodyIMG,
            frames: { max: 6 },
          });
          playerbody.value.setDirection(currentdirection);
        }
      }

      if (first.pClass == "髮型") {
        equippedItems.value.head = first.pImageAll;
        console.log(equippedItems.value.head);
        if (equippedItems.value.head != null) {
          const playerheadIMG = await LoadImage(equippedItems.value.head);
          playerhead.value = new Sprite({
            position: {
              x: canvasWidth / 2 - 288 / 4 / 2,
              y: canvasHeight / 2 - 80 / 2,
            },
            image: playerheadIMG,
            frames: { max: 6 },
          });
          playerhead.value.setDirection(currentdirection);
        }
      }
    }
  }

  // 繪製玩家
  if (player.value) {
    player.value.draw(ctx);
  }
  if (playerbody.value) {
    playerbody.value.draw(ctx);
  }

  if (playerhead.value) {
    playerhead.value.draw(ctx);
  }
  if (playeraccessory.value) {
    playeraccessory.value.draw(ctx);
  }
};

//======================方法end=============================

//=====================事件start===============================
//角色旋轉邏輯
const handleRotate = (direction) => {
  if (!player.value) return;

  const directionMap = {
    back: 1, // 背面
    left: 2, // 向左轉
    front: 3, // 正面
    right: 0, // 向右轉
  };
  // console.log(ChooseMerchandise.value);
  const dir = directionMap[direction];
  player.value.setDirection(dir); // 設定角色方向
  if (playeraccessory.value != null) {
    playeraccessory.value.setDirection(dir); //設定飾品方向
  }
  if (playerbody.value != null) {
    playerbody.value.setDirection(dir);
  }
  if (playerhead.value != null) {
    playerhead.value.setDirection(dir);
  }
};

//清空
const clear = () => {
  equippedItems.value.head = "";
  equippedItems.value.body = "";
  equippedItems.value.accessory = "";

  playerhead.value = null;
  playerbody.value = null;
  playeraccessory.value = null;
};

//還原

//=====================事件end===============================

onMounted(async () => {
  const canvas = canvasRef.value;
  if (!canvas) throw new Error("Canvas not found");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.value = canvas.getContext("2d");

  const CharcterImage = await LoadImage(CharcterImageUrl);
  //初始化角色
  player.value = new Sprite({
    position: {
      x: canvasWidth / 2 - 288 / 4 / 2,
      y: canvasHeight / 2 - 80 / 2,
    },
    image: CharcterImage,
    frames: { max: 6 },
  });

  //只有一張圖所以不用使用Promise.all

  startGameLoop(GameLoop);
});

//結束遊戲循環
onUnmounted(() => {
  stopGameLoop();
});
</script>

<template>
  <div class="controller">
    <button @click="handleRotate('left')">看左邊</button>
    <button @click="handleRotate('front')">看正面</button>
    <button @click="handleRotate('right')">看右邊</button>
    <button @click="handleRotate('back')">看背面</button>
  </div>

  <canvas
    class="canvascss"
    ref="canvasRef"
    :height="canvasHeight"
    :width="canvasWidth"
    style="transform: scale(3); transform-origin: top left"
  ></canvas>

  <div class="underbutton">
    <button @click="clear">清空</button>
  </div>
</template>

<style lang="css" scoped>
.canvascss {
  margin-left: 85px;
  margin-top: 50px;
}
.controller {
  height: 48px;
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
}
button {
  border-radius: 10px;
  width: 64px;
  height: 48px;
}

.underbutton {
  height: 48px;
  position: relative;
  top: 280px;
  display: flex;
  margin: 8px;
  justify-content: end;
}

.underbutton button {
  margin-left: 20px;
}
</style>
