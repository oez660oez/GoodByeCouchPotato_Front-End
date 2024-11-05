<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { SpriteMap } from "@/core/Map";
import { useGameLoop } from "@/composables/useGameLoop";
import { Sprite } from "@/core/Player"; //裁切圖片並製作成動畫

const backgroundImage_URL =
  "http://localhost:5173/src/components/image/index.png";

const playerImage_URL =
  "http://localhost:5173/src/assets/images/person_Modify.png";

//設定畫布
const canvasRef = ref(null);
const canvasWidth = 1515;
const canvasHeight = 800;
const context = ref(null);
const { startGameLoop, stopGameLoop } = useGameLoop();
const movables = ref([]); //用來儲存要隨著玩家移動而改變的物件
const Currentoffset = {
  //設定地圖定位
  x: 0,
  y: 0,
};
let NoGo = ref(false); //用來判定是否一直撞牆，如果一直撞牆就不能走

//設定圖片的碰撞區域，xy以左上角的為準，長寬決定碰撞區域大小
const collisionAreas = [
  //這裡的xy是偏移量而不是絕對定位，因為是用玩家行走的數據去測量的
  {
    offsetx: canvasWidth / 2 - 288 / 8 - 650,
    offsety: canvasHeight / 2 - 80 / 2 + 200,
    width: 200,
    height: 80,
  }, //第一個椅子
  {
    offsetx: canvasWidth / 2 - 288 / 8 - 375,
    offsety: canvasHeight / 2 - 80 / 2 + 165,
    width: 235,
    height: 115,
  }, //第一組
  {
    offsetx: canvasWidth / 2 - 288 / 8 - 85,
    offsety: canvasHeight / 2 - 80 / 2 + 165,
    width: 240,
    height: 115,
  }, //第二組
  {
    offsetx: canvasWidth / 2 - 288 / 8 - -198,
    offsety: canvasHeight / 2 - 80 / 2 + 165,
    width: 240,
    height: 115,
  }, //第三組
  {
    offsetx: canvasWidth / 2 - 288 / 8 - -489,
    offsety: canvasHeight / 2 - 80 / 2 + 165,
    width: 240,
    height: 115,
  }, //第四組
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
  const playerPosition = {
    x: player.value.position.x,
    y: player.value.position.y,
    width: player.value.width,
    height: player.value.height,
  };

  for (const area of collisionAreas) {
    const adjustedArea = {
      x: area.offsetx + Currentoffset.x, // 將地圖偏移應用於碰撞區域
      y: area.offsety + Currentoffset.y,
      width: area.width,
      height: area.height,
    };

    if (
      playerPosition.x < adjustedArea.x + adjustedArea.width &&
      playerPosition.x + playerPosition.width > adjustedArea.x &&
      playerPosition.y < adjustedArea.y + adjustedArea.height &&
      playerPosition.y + playerPosition.height > adjustedArea.y
    ) {
      console.log("碰撞發生");
      return false; // 發生碰撞
    }
  }
  NoGo.value = false;
  return true; // 沒有碰撞
};

//角色移動
function handleMove(direction) {
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
    } else {
      console.log("移動被阻止");
      // if (NoGo.value) {
      // } else {
      //   NoGo.value = true;
      //   let rollback = { x: 0, y: 0 };
      //   switch (direction) {
      //     case "up":
      //       rollback.y = -3;
      //       break;
      //     case "left":
      //       rollback.x = -3;
      //       break;
      //     case "down":
      //       rollback.y = 3;
      //       break;
      //     case "right":
      //       rollback.x = 3;
      //       break;
      //   }
      // moveObjects(rollback); //這個是管理所有的碰撞區域一起變化，但是我這裡只放了地圖的，所以椅子的碰撞要再另外做
      // for (const area of collisionAreas) {
      //   area.offsetx = area.offsetx + rollback.x; // 將地圖偏移應用於碰撞區域
      //   area.offsety = area.offsety + rollback.y;
      // }
      // }
      //玩家始終在中間，座標也沒有改變，實際移動的是地圖
    }
  }
}

//遊戲循環
const GameLoop = async () => {
  const ctx = context.value;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#3a3a50"; // 畫布顏色填滿
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  //繪製地圖
  background.value.draw(ctx);
  //繪製人物
  player.value.draw(ctx);

  for (const area of collisionAreas) {
    const adjustedArea = {
      x: area.offsetx + Currentoffset.x,
      y: area.offsety + Currentoffset.y,
      width: area.width,
      height: area.height,
    };
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // 半透明紅色
    ctx.fillRect(
      adjustedArea.x,
      adjustedArea.y,
      adjustedArea.width,
      adjustedArea.height
    );
  }
  ctx.fillStyle = "rgba(0, 0, 255, 0.5)"; // 藍色半透明
  ctx.fillRect(
    player.value.position.x,
    player.value.position.y,
    player.value.width,
    player.value.height
  );
};

//=============方法end=================
onMounted(async () => {
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.value = canvas.getContext("2d");
    const backgroundImg = await loadImage(backgroundImage_URL);
    const playerImg = await loadImage(playerImage_URL);

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

    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "w" || "W":
          handleMove("up");
          break;
        case "s" || "S":
          handleMove("down");
          break;
        case "a" || "A":
          handleMove("left");
          break;
        case "d" || "D":
          handleMove("right");
          break;
      }
    });
    movables.value = [background.value].filter(Boolean);

    console.log("圖片是否已加載:", background.value.image.complete);
    console.log("圖片是否已加載:", player.value.image.complete);
    startGameLoop(GameLoop);
  } else {
    alert("no");
  }
});

//結束遊戲循環
onUnmounted(() => {
  stopGameLoop();
});

//令其他組件可以使用內部的物件
defineExpose({
  getCanvas: () => canvasRef.value,
  getPlayer: () => player.value,
  executeGameLoop: () => gameLoop(),
  handleMove, //直接暴露 handleMove 函數，這樣外部組件可以通過 handleMove(direction) 調用來控制玩家的移動。
});
</script>

<template>
  <RouterLink class="nav-link" :to="{ name: 'roommap' }">
    <i class="fa-regular fa-map"></i>
  </RouterLink>
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
  z-index: 10;
  position: relative;
  background-color: white;
}
.game-view {
  width: 99%;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: #3a3a50; */
  z-index: 1;
  position: relative;
}
</style>
