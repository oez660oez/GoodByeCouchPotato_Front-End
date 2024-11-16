<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { SpriteMap } from "@/core/Map";
import { useGameLoop } from "@/composables/useGameLoop";
import { Sprite } from "@/core/Player"; //裁切圖片並製作成動畫
import StoryComponent from "@/components/StoryComponent.vue";
import { useRouter } from "vue-router";
import { Playerinformation } from "@/Stores/PlayerCharacter";
const PiniaPlayer = Playerinformation();
const router = useRouter();
const transition = ref(true); //是否開啟遮罩

//New-Start(因index圖片名稱改變更換)
const backgroundImage_URL =
  "http://localhost:5173/src/components/image/index_origin.png";
//New-End

const playerImage_URL =
  "http://localhost:5173/src/assets/images/person_Modify.png";

const typename = "Startstory"; //用來識別對話框使用哪一段對話

//設定畫布
const canvasRef = ref(null);
const canvasWidth = 1550;
const canvasHeight = 900;
const context = ref(null);
const { startGameLoop, stopGameLoop } = useGameLoop();
const movables = ref([]); //用來儲存要隨著玩家移動而改變的物件
const Currentoffset = {
  //設定地圖定位
  x: 0,
  y: 0,
};

//New-Start
let lastFrameTime = 0;
const FRAME_INTERVAL = 100;
const keyState = {
  w: false,
  s: false,
  a: false,
  d: false,
};
//New-End

//設定圖片的碰撞區域，xy以左上角的為準，長寬決定碰撞區域大小
const collisionAreas = [
  //這裡的xy是偏移量而不是絕對定位，因為是用玩家行走的數據去測量的
  {
    offsetx: canvasWidth / 2 - 288 / 8 - 670,
    offsety: canvasHeight / 2 - 80 / 2 + 150,
    width: 200,
    height: 65,
  }, //第一個椅子
  {
    offsetx: canvasWidth / 2 - 288 / 8 - 390,
    offsety: canvasHeight / 2 - 80 / 2 + 120,
    width: 225,
    height: 90,
  }, //第一組
  {
    offsetx: canvasWidth / 2 - 288 / 8 - 95,
    offsety: canvasHeight / 2 - 80 / 2 + 120,
    width: 225,
    height: 90,
  }, //第二組
  {
    offsetx: canvasWidth / 2 - 288 / 8 - -190,
    offsety: canvasHeight / 2 - 80 / 2 + 120,
    width: 225,
    height: 90,
  }, //第三組
  {
    offsetx: canvasWidth / 2 - 288 / 8 - -475,
    offsety: canvasHeight / 2 - 80 / 2 + 120,
    width: 235,
    height: 90,
  }, //第四組
];

//設定進入遊戲的碰撞位置
const GoInGame = [
  {
    offsetx: canvasWidth / 2 - 288 / 8 - 5,
    offsety: canvasHeight / 2 - 80 / 2 + 275,
    width: 48,
    height: 48,
  },
];

//設定地圖圖片的大小
const mapWidth = 1600; // 地圖圖片的寬度
const mapHeight = 1040; // 地圖圖片的高度
const background = ref(""); //用來放置加載後的圖片
const player = ref(""); //用來放置加載後圖片

//===========方法=================

//設定圖片載入
const loadImage = async (src) => {
  try {
    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  } catch (error) {
    console.error(`Failed to load image: ${src}`, error);
    throw error;
  }
};
//移動邏輯，當我確定移動了多少的時候，可移動的物件全部一起移動這個量
function moveObjects(offset) {
  movables.value.forEach((movable) => {
    //對所有可移動的物件做相同事情
    if (movable && movable.position) {
      movable.position.x += offset.x; //對橫向(左右)做相同移動
      movable.position.y += offset.y; //對直向(上下)做相同移動
    }
  });
}

//確認是否發生碰撞
//因為我的起在左上角，越往右邊越大，所以會是大於起頭的時候會碰撞
//xy軸是越右邊越下面數值越大
//moveOffset是目前移動了的xy偏移變量
const checkCollisions = (moveOffset) => {
  const nextMapOffset = {
    //預估地圖下一步，因為我們實際上移動的是地圖，currentoffser保存的是目前的偏移量而不是地圖的實際定位
    x: Currentoffset.x + moveOffset.x,
    y: Currentoffset.y + moveOffset.y,
  };
  //這個只是取出角色目前的位置及大小的資料，沒有改任何東西
  const NextplayerPosition = {
    x: player.value.position.x,
    y: player.value.position.y,
    width: player.value.width,
    height: player.value.height,
  };

  for (const area of collisionAreas) {
    const adjustedArea = {
      x: area.offsetx + nextMapOffset.x, // 將地圖偏移應用於碰撞區域
      y: area.offsety + nextMapOffset.y, //碰撞的物品也得跟著移動，加上包含目前偏移以及正在偏移，才會移動到相對於我的角色的位置
      width: area.width,
      height: area.height,
    };

    if (
      NextplayerPosition.x < adjustedArea.x + adjustedArea.width &&
      NextplayerPosition.x + NextplayerPosition.width > adjustedArea.x &&
      NextplayerPosition.y < adjustedArea.y + adjustedArea.height &&
      NextplayerPosition.y + NextplayerPosition.height > adjustedArea.y
    ) {
      console.log("碰撞發生");
      return false; // 發生碰撞
    }
  }
  return true; // 沒有碰撞
};

//判斷是否進入切換頁面的空間
const InGame = async (moveOffset) => {
  //這個只是取出角色目前的位置及大小的資料，沒有改任何東西
  const nextMapOffset = {
    //預估地圖下一步，因為我們實際上移動的是地圖，currentoffser保存的是目前的偏移量而不是地圖的實際定位
    x: Currentoffset.x + moveOffset.x,
    y: Currentoffset.y + moveOffset.y,
  };
  const NextplayerPosition = {
    x: player.value.position.x,
    y: player.value.position.y,
    width: player.value.width,
    height: player.value.height,
  };

  const ingame = {
    x: GoInGame[0].offsetx + nextMapOffset.x,
    y: GoInGame[0].offsety + nextMapOffset.y, // 修正此行
    width: GoInGame[0].width,
    height: GoInGame[0].height,
  };
  if (
    NextplayerPosition.x < ingame.x + ingame.width &&
    NextplayerPosition.x + NextplayerPosition.width > ingame.x &&
    NextplayerPosition.y < ingame.y + ingame.height &&
    NextplayerPosition.y + NextplayerPosition.height > ingame.y
  ) {
    console.log("進入遊戲");
    transition.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000)); //等候一秒才跳轉
    await router.push("/outdoor");
  } else {
    return true; // 沒有碰撞
  }
};

//角色移動
const handleMove = (direction) => {
  //New-Start(把移動被阻止移到前面)
  if (!player.value) return;
  //New-End

  player.value.moving = true;
  const directionMap = {
    up: { direction: 1, offset: { x: 0, y: 3 } }, //如果按上就往上位移3px的距離
    left: { direction: 2, offset: { x: 3, y: 0 } },
    down: { direction: 3, offset: { x: 0, y: -3 } },
    right: { direction: 0, offset: { x: -3, y: 0 } },
  };
  //directionMap[direction]取出來的內容是物件，這個寫法是分別將欄位內容取出來，並且重新賦予一個名字(dir及moveoffset)
  const { direction: dir, offset: moveOffset } = directionMap[direction];
  player.value.setDirection(dir);

  // 檢查地圖偏移量是否超出圖片範圍
  const newOffsetX = Currentoffset.x + moveOffset.x; //地圖現在位置加上移動的偏移量
  const newOffsetY = Currentoffset.y + moveOffset.y;

  //先檢查是否碰撞到圖片的邊界
  if (
    newOffsetX <= mapWidth / 2 - 170 &&
    newOffsetX >= -mapWidth / 2 + 95 &&
    newOffsetY <= mapHeight / 2 - 310 &&
    newOffsetY >= -mapHeight / 2 + 230
  ) {
    // 更新地圖偏移量並移動地圖
    if (checkCollisions(moveOffset)) {
      // 更新偏移量並移動地圖，由當前地圖偏移值加上位移的值
      Currentoffset.x += moveOffset.x; //如果沒有碰撞才移動，如果有碰撞則不動
      Currentoffset.y += moveOffset.y;
      moveObjects(moveOffset);
      InGame(moveOffset);
    }
    //玩家始終在中間，座標也沒有改變，實際移動的是地圖
  }
};

//New-Start(修改監聽器邏輯)
const checkMovement = () => {
  // 檢查當前按下的按鍵並執行相應移動
  if (keyState.w) handleMove("up");
  if (keyState.s) handleMove("down");
  if (keyState.a) handleMove("left");
  if (keyState.d) handleMove("right");

  // 如果沒有按鍵被按下，停止移動
  if (!keyState.w && !keyState.s && !keyState.a && !keyState.d) {
    player.value.moving = false;
  }
};
const handleKeyDown = (event) => {
  const key = event.key.toLowerCase();
  if (keyState.hasOwnProperty(key)) {
    event.preventDefault();
    keyState[key] = true;
  }
};

const handleKeyUp = (event) => {
  const key = event.key.toLowerCase();
  if (keyState.hasOwnProperty(key)) {
    keyState[key] = false;
  }
};
//New-End

//遊戲循環
const GameLoop = () => {
  //偵測使用者按下的按鍵，控制玩家的移動

  //New-Start
  const timestamp = performance.now();
  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const elapsed = timestamp - lastFrameTime;
  //New-End

  const ctx = context.value;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#3a3a50"; // 畫布顏色填滿
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  //繪製地圖
  background.value.draw(ctx);

  //New-Start
  // 檢查移動
  checkMovement();

  // 更新動畫幀
  if (player.value.moving && elapsed >= FRAME_INTERVAL) {
    player.value.frames.val =
      (player.value.frames.val + 1) % player.value.frames.max;
    lastFrameTime = timestamp;
  }
  //New-End

  // 繪製進入遊戲的踩點
  ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
  ctx.fillRect(
    GoInGame[0].offsetx + Currentoffset.x,
    GoInGame[0].offsety + Currentoffset.y,
    GoInGame[0].width,
    GoInGame[0].height
  );
  //繪製人物
  player.value.draw(ctx);

  //繪製碰撞物視覺
  // ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
  // for (let i = 0; i < collisionAreas.length; i++) {
  //   // 從第0個開始迭代所有碰撞區域
  //   ctx.fillRect(
  //     collisionAreas[i].offsetx + Currentoffset.x,
  //     collisionAreas[i].offsety + Currentoffset.y,
  //     collisionAreas[i].width,
  //     collisionAreas[i].height
  //   );
  // }
};

//=============方法end=================
onMounted(async () => {
  PiniaPlayer.isnewcharacter = true;
  Currentoffset.x = 0;
  Currentoffset.y = 0;
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.value = canvas.getContext("2d");
    const [backgroundImg, playerImg] = await Promise.all([
      loadImage(backgroundImage_URL),
      loadImage(playerImage_URL),
    ]);

    background.value = new SpriteMap({
      position: { x: Currentoffset.x, y: Currentoffset.y },
      image: backgroundImg,
    });

    player.value = new Sprite({
      position: {
        x: canvasWidth / 2 - 288 / 8,
        y: canvasHeight / 2 - 80 / 2,
      },
      image: playerImg,
      frames: { max: 6 },
    });

    movables.value = [background.value].filter(Boolean); // 過濾掉任何無效的值。將要跟隨著玩家移動的資料存入

    //New-Start
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    lastFrameTime = 0;
    //New-End

    console.log("圖片是否已加載:", background.value.image.complete);
    console.log("圖片是否已加載:", player.value.image.complete);
    startGameLoop(GameLoop);
  } else {
    alert("no");
  }
  transition.value = false;
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

//結束遊戲循環
onUnmounted(() => {
  //New-Start
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  //New-End

  stopGameLoop();
});

//令其他組件可以使用內部的物件，不過我沒用到
// defineExpose({
//   getCanvas: () => canvasRef.value,
//   getPlayer: () => player.value,
//   executeGameLoop: () => gameLoop(),
//   handleMove, //直接暴露 handleMove 函數，這樣外部組件可以通過 handleMove(direction) 調用來控制玩家的移動。
// });
</script>

<template>
  <!-- <RouterLink class="nav-link" :to="{ name: 'roommap' }">
    <i class="fa-regular fa-map"></i>
  </RouterLink> -->
  <transition name="fade" v-show="transition" class="blacktransition">
    <div class="black"></div>
  </transition>
  <div class="storyborder">
    <StoryComponent :type="typename"></StoryComponent>
  </div>
  <div class="game-view">
    <canvas
      ref="canvasRef"
      :height="canvasHeight"
      :width="canvasWidth"
    ></canvas>
  </div>
</template>

<style lang="css" scoped>
.nav-link {
  z-index: 2;
  position: relative;
  background-color: rgb(58, 58, 80);
}
.game-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: #3a3a50; */
  z-index: 1;
}

.storyborder {
  z-index: 10;
  position: absolute;
  top: 60%;
  left: 29.5%;
}
</style>
