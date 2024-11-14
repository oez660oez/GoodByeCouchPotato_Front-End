<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Collisions from '@/gameRoomMap/collisions';
import Sprite from '@/gameRoomMap/playerSprite';
import SpriteMap from '@/gameRoomMap/mapSprite';
import { Boundary } from '@/gameRoomMap/mapSprite';
import { Playerinformation } from '@/Stores/PlayerCharacter';
import { rectangularCollision } from '@/gameRoomMap/collision';
import { itemApi } from '@/api/itemApi';
import { storeToRefs } from 'pinia';
import SidebarComponent from '@/components/SidebarComponent.vue';

const playerStore = Playerinformation();
const { playerAccount, Head, Upper, Lower } = storeToRefs(playerStore);

const canvasRef = ref(null);
const canvasWidth = 2350;
const canvasHeight = 1080;
let ctx = null;

const srpiteMap = ref(null);
const srpitePlayer = ref(null);
const moving = ref(false);

const collisionsMap = [];
for (let i = 0; i < Collisions.length; i += 282) {
  collisionsMap.push(Collisions.slice(i, 282 + i));
}

const Boundaries = [];
const offset = { x: -1584, y: -1024 };

const keys = ref({ w: false, a: false, s: false, d: false });
let animationFrameId = null;

// 載入圖片函數
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`無法載入圖片: ${src}`));
  });
};

const checkCollisionWithBoundaries = (player, boundaries, offsetX, offsetY) => {
  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i];
    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...boundary,
          position: {
            x: boundary.position.x + offsetX,
            y: boundary.position.y + offsetY
          }
        }
      })
    ) {
      moving.value = false;
      break;
    }
  }
  if (moving.value)
    movables.value.forEach((movable) => {
      movable.position.y += 3;
    });
};

// 初始化鍵盤事件
const handleKeyDown = (e) => {
  if (e.key in keys.value) keys.value[e.key] = true;
};

const handleKeyUp = (e) => {
  if (e.key in keys.value) keys.value[e.key] = false;
};

const movables = ref([srpiteMap.value, ...Boundaries]);

// 動畫函數
// 動畫函數
const animate = () => {
  if (!ctx || !srpiteMap.value || !srpitePlayer.value) return;
  const canvas = canvasRef.value;
  if (!canvas) throw new Error('Canvas 未正確取得');
  ctx = canvas.getContext('2d');

  // requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  srpiteMap.value.draw(ctx);
  Boundaries.forEach((boundary) => boundary.draw(ctx));
  srpitePlayer.value.draw(ctx);

  srpitePlayer.value.moving = false;

  if (keys.value.w) {
    srpitePlayer.value.moving = true;
    srpitePlayer.value.setDirection(1);
    checkCollisionWithBoundaries(srpitePlayer.value, Boundaries, 0, 3);
  } else if (keys.value.a) {
    srpitePlayer.value.moving = true;
    srpitePlayer.value.setDirection(2);
    checkCollisionWithBoundaries(srpitePlayer.value, Boundaries, 3, 0);
  } else if (keys.value.s) {
    srpitePlayer.value.moving = true;
    srpitePlayer.value.setDirection(3);
    checkCollisionWithBoundaries(srpitePlayer.value, Boundaries, 0, -3);
  } else if (keys.value.d) {
    srpitePlayer.value.moving = true;
    srpitePlayer.value.setDirection(0);
    checkCollisionWithBoundaries(srpitePlayer.value, Boundaries, -3, 0);
  }

  animationFrameId = requestAnimationFrame(animate);
};
onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext('2d');

  collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
      if (symbol === 87102) {
        Boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width + offset.x,
              y: i * Boundary.height + offset.y
            }
          })
        );
      }
    });
  });
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const getItem = await itemApi.getCharacterEquipment(playerAccount.value);
  const mapImage = await loadImage('/src/assets/images/roomMap.png');
  const playImage = await loadImage('/src/assets/images/person_Modify.png');

  const headImagePath = getItem?.accessory?.imageName;
  const upperImagePath = getItem?.hairstyle?.imageName;
  const lowerImagePath = getItem?.outfit?.imageName;

  const headImage = headImagePath
    ? await loadImage(headImagePath)
    : await loadImage('/src/assets/images/none.png');
  const upperImage = upperImagePath
    ? await loadImage(upperImagePath)
    : await loadImage('/src/assets/images/none.png');
  const lowerImage = lowerImagePath
    ? await loadImage(lowerImagePath)
    : await loadImage('/src/assets/images/none.png');

  srpiteMap.value = new SpriteMap({
    position: { x: offset.x, y: offset.y },
    image: mapImage
  });
  srpitePlayer.value = new Sprite({
    position: { x: 710, y: 400 },
    image: playImage,
    image2: upperImage,
    image3: headImage,
    image4: lowerImage,
    frames: { max: 6 }
  });

  animate();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <div class="sideBar">
    <SidebarComponent />
  </div>
  <div>
    <H1>未開放</H1>

    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
canvas {
  border: 1px solid black;
}
.sideBar {
  position: absolute;
}
H1 {
  position: absolute;
  top: 20%;
  left: 20%;
  font-size: 300px;
  color: white;
}
</style>
