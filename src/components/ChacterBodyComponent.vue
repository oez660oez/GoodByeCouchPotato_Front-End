<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from "vue";
import { Sprite } from "@/core/Player"; //裁切圖片並製作成動畫
import { useGameLoop } from "@/composables/useGameLoop";
import { Merchandiselist } from "@/Stores/Merchandiselist";
import { Playerinformation } from "@/Stores/PlayerCharacter";
const PiniaMerchandise = Merchandiselist();
const PiniaPlayer = Playerinformation();
const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL_GetBody = `${Base_URL}/ShopAccessoriesLists/GetNowBody`;
const Image_URL = "https://localhost:7146/images/";

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

// const Myhead = PiniaMerchandise.Myhead.value.pImageAll;
// const Mybody = PiniaMerchandise.Mybody.value.pImageAll;
// const Myaccessory = PiniaMerchandise.Myaccessory.value.pImageAll;

//用來存放玩家包含試穿的服裝
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

//製作動畫循環
const GetImage = async (equippedItems, play) => {
  const IMG = await LoadImage(equippedItems);
  play.value = new Sprite({
    position: {
      x: canvasWidth / 2 - 288 / 4 / 2,
      y: canvasHeight / 2 - 80 / 2,
    },
    image: IMG,
    frames: { max: 6 },
  });
  play.value.setDirection(currentdirection.value);
};

//用來取身上穿著的裝備的資料庫圖片，只有取名稱
const GetImageAllID = ref({
  head: 0,
  body: 0,
  accessory: 0,
});
//存放回傳的圖片名稱並且串上路由
const GetImageAllname = ref({
  GetMybody: "",
  GetMyhead: "",
  GetMyaccessory: "",
});
const GameLoop = async () => {
  const ctx = context.value;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); //清空畫布
  // console.log("Mybody data before accessing:", PiniaMerchandise.Mybody);
  player.value.setDirection(currentdirection.value);

  // //原始的服裝
  if (PiniaMerchandise.First) {
    //抓取已經穿著的衣服，如果在onMounted做，會因為加載未完成而抓不到，在這個方法內就一定能取到了
    //取得目前穿的編號，並且存入pinia，其實可以不存了但做個備用，設定沒值默認值為0
    // const sessionplayer = JSON.parse(
    //   sessionStorage.getItem("UserAccount") || "{}"
    // );

    if (PiniaPlayer.Head) {
      GetImageAllID.value.accessory = PiniaPlayer.Head;
    } else {
      GetImageAllID.value.accessory = "0";
    }
    if (PiniaPlayer.Upper) {
      GetImageAllID.value.head = PiniaPlayer.Upper;
    } else {
      GetImageAllID.value.head = "0";
    }
    if (PiniaPlayer.Lower) {
      GetImageAllID.value.body = PiniaPlayer.Lower;
    } else {
      GetImageAllID.value.body = "0";
    }
    await PiniaMerchandise.Getplaterclothes(GetImageAllID.value);
    //取裝備的圖片名稱
    // console.log(typeof GetImageAllID.value.head);
    // console.log(GetImageAllID.value);
    if (
      GetImageAllID.value.body == 0 &&
      GetImageAllID.value.head == 0 &&
      GetImageAllID.value.accessory == 0
    ) {
      clear();
    } else {
      const GetNewbody = await fetch(API_URL_GetBody, {
        method: "POST",
        body: JSON.stringify(GetImageAllID.value),
        headers: { "Content-Type": "application/json" },
      });
      console.log(GetImageAllID.value);
      if (GetNewbody.ok) {
        const data = await GetNewbody.json();
        console.log(data);
        if (data.body != "") {
          GetImageAllname.value.GetMybody = Image_URL + data.body;
        }
        if (data.head != "") {
          GetImageAllname.value.GetMyhead = Image_URL + data.head;
        }
        if (data.accessory != "") {
          GetImageAllname.value.GetMyaccessory = Image_URL + data.accessory;
        }
        PiniaMerchandise.First = false;
      }
    }
    //================繪製canvas================================
    if (GetImageAllname.value.GetMybody != "") {
      equippedItems.value.body = GetImageAllname.value.GetMybody;
      GetImage(equippedItems.value.body, playerbody);
    }
    if (GetImageAllname.value.GetMyhead != "") {
      equippedItems.value.head = GetImageAllname.value.GetMyhead;
      GetImage(equippedItems.value.head, playerhead);
    }
    if (GetImageAllname.value.GetMyaccessory != "") {
      equippedItems.value.accessory = GetImageAllname.value.GetMyaccessory;
      GetImage(equippedItems.value.accessory, playeraccessory);
    }
    PiniaMerchandise.First = false;
    // console.log(equippedItems.value);
  }
  if (PiniaMerchandise.Choosemerchandise) {
    ChooseMerchandise.value = PiniaMerchandise.Choose;
    PiniaMerchandise.Choosemerchandise = false;

    const first = ChooseMerchandise.value[0]; //取出陣列的內容
    console.log(first.pClass);
    if (first.pClass === "飾品") {
      const accessory = ref(first.pImageAll);
      equippedItems.value.accessory = first.pImageAll;
      accessory.value = first.pImageAll;
      await GetImage(equippedItems.value.accessory, playeraccessory);
      // playeraccessory.value.setDirection(currentdirection.value); //設定裝扮方向，放入旋轉邏輯了所以不需要了
    }
    if (first.pClass === "衣服") {
      const body = first.pImageAll;
      equippedItems.value.body = body;
      await GetImage(equippedItems.value.body, playerbody);
      // console.log(first.pImageAll);
      // console.log(equippedItems.value);
      // playerbody.value.setDirection(currentdirection.value);
    }
    if (first.pClass === "髮型") {
      const head = first.pImageAll;
      equippedItems.value.head = head;
      await GetImage(equippedItems.value.head, playerhead);
      // playerhead.value.setDirection(currentdirection.value);
      // console.log(first.pImageAll);
      // console.log(equippedItems.value);
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
  currentdirection.value = dir;
  // console.log(currentdirection.value);
};

//清空
const clear = () => {
  equippedItems.value.head = "";
  equippedItems.value.body = "";
  equippedItems.value.accessory = "";

  playerhead.value = null;
  playerbody.value = null;
  playeraccessory.value = null;
  PiniaMerchandise.First = false;
  PiniaMerchandise.ChooseMerchandise = true;
  // console.log(equippedItems.value);
  // console.log("yes");
};

//還原
const reset = () => {
  PiniaMerchandise.First = true;
  PiniaMerchandise.ChooseMerchandise = false;
  // console.log(PiniaMerchandise.Myaccessory.value[0]);
  // console.log(PiniaMerchandise.Myhead);
  // console.log(PiniaMerchandise.Mybody);
  // console.log(GetImageAllID.value);
  // console.log(GetImageAllname.value);
  // console.log(equippedItems.value);

  //儲存切割的圖要清空，否則會再畫出來，清空之後會重跑一次原始穿著，就會自己還原了
  playerhead.value = null;
  playerbody.value = null;
  playeraccessory.value = null;
};

//=====================事件end===============================
onMounted(async () => {
  const sessionplayer = JSON.parse(
    sessionStorage.getItem("UserAccount") || "{}"
  );
  console.log(sessionplayer.Head);
  console.log(sessionplayer.Lower);
  console.log(sessionplayer.Upper);

  // console.log(PiniaPlayer.Head);
  // console.log(PiniaPlayer.Upper);
  // console.log(PiniaPlayer.Lower);
  PiniaMerchandise.First = true;
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
    <button @click="reset">還原</button>
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
button {
  background-color: transparent;
  border: none;
  background-image: url("@/assets/Notextbutton.png");
  width: 80px;
}
</style>
