<script setup>
import { ref, onMounted } from 'vue';
import { Playerinformation } from '@/Stores/PlayerCharacter';
import { storeToRefs } from 'pinia';
import Sprite from '@/Stores/Sprite New';

// 從 Pinia store 中引入玩家資訊
const playerStore = Playerinformation();
const {
  characterCoins,
  characterName,
  characterLevel,
  characterExperience,
  characterEnvironment,
  characterGetEnvironment,
  characterGetExperience,
  characterGetCoins
} = storeToRefs(playerStore);

// 相關變數宣告
const canvasRef = ref(null);
let ctx = null;
const sprite = ref(null);
const isActive = ref(false);
// 用於追蹤當前選擇的按鈕
const activeButton = ref('');

// 載入圖片
const spriteImage = new Image();
spriteImage.src = '/src/assets/Avatar images/Avatar.png'; // 確保圖片路徑正確

// 切換按鈕 active 狀態
const toggleActive = () => {
  isActive.value = !isActive.value;
};
// 切換按鈕 `active` 狀態的函式
const toggleNavActive = (buttonName) => {
  activeButton.value = buttonName;
};

// 初始化圖片和 Sprite
const loadingImage = () => {
  spriteImage.onload = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    // 獲取 Canvas 2D 上下文
    ctx = canvas.getContext('2d');

    // 初始化 Sprite
    sprite.value = new Sprite({
      position: { x: -22, y: -22 },
      image: spriteImage,
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
  loadingImage();
  animate();
};

// onMounted 生命週期
onMounted(() => {
  loadingImage();
  const links = document.querySelectorAll('.nav-link');
  links.forEach((link) => {
    link.addEventListener('click', function () {
      document.querySelector('.nav-link.active')?.classList.remove('active');
      if (!this.classList.contains('disabled')) {
        this.classList.add('active');
      }
    });
  });
});
</script>

<template>
  <div class="Player">
    <div id="Avatar">
      <!-- 玩家資訊顯示區 -->
      <div class="player-info">
        <!-- 頭像&名子 --------------start -->
        <div class="playerName">
          <canvas
            ref="canvasRef"
            width="48"
            height="48"
            @click="startAnimation"
          ></canvas>
          <div>
            <span class="name">{{ characterName }}</span>
          </div>
        </div>
        <!-- 頭像&名子--------end -->
        <!-- 等級&金幣---------------start -->
        <div class="Lv_Cion">
          <div class="level-display">
            <img
              v-if="characterLevel >= 1 && characterLevel <= 4"
              src="/navBar/Bronze Lv.png"
              alt="Bronze"
              title="等級"
            />
            <img
              v-else-if="characterLevel >= 5 && characterLevel <= 11"
              src="/navBar/Sliver Lv.png"
              alt="Silver"
              title="等級"
            />
            <img
              v-else-if="characterLevel >= 12 && characterLevel <= 24"
              src="/navBar/Gold Lv.png"
              alt="Gold"
              title="等級"
            />
            <img
              v-else-if="characterLevel >= 25"
              src="/navBar/Diamond.png"
              alt="Diamond"
              title="等級"
            />
            <span>Lv.{{ characterLevel }}</span>
          </div>

          <div class="coins-dispaly">
            <img src="/navBar/Coins.png" alt="Coins" title="金幣" />
            <span>:{{ characterCoins }}</span>
          </div>
        </div>
        <!-- 等級&金幣--------end -->
        <!-- 昨日取得獎勵---------------start -->
        <div class="getGift">
          <div>
            <img src="/navBar/getENV.png" alt="getENV" title="昨日取得環境值" />
            <span> :{{ characterGetEnvironment }} </span>
          </div>
          <div>
            <img src="/navBar/getEXP.png" alt="getEXP" title="昨日取得經驗值" />
            <span> :{{ characterGetExperience }} </span>
          </div>
          <div>
            <img src="/navBar/getCoins.png" alt="getEXP" title="昨日取得金幣" />
            <span> :{{ characterGetCoins }} </span>
          </div>
          <!-- 控制顯示/隱藏按鈕群組的按鈕 -->
          <button
            :class="{ active: isActive }"
            @click="toggleActive"
            class="btn-primary btn-image-8"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseExample"
            aria-expanded="true"
            aria-controls="collapseExample"
          ></button>
        </div>
        <!-- 昨日取得獎勵-----end -->
      </div>
    </div>
    <div class="ExpEnv">
      <!-- 第一個進度條 - 環境值  -->
      <!-- <span>環境值</span> -->
      <div class="progress custom-progress">
        <div
          class="progress-bar custom-progress-bar environment-bar"
          role="progressbar"
          :style="{ width: Math.min(characterEnvironment, 100) + '%' }"
          :aria-valuenow="Math.min(characterEnvironment, 100)"
          aria-valuemin="0"
          aria-valuemax="100"
          :title="'當前環境值: ' + characterEnvironment"
        ></div>
      </div>
      <!-- 第二個進度條 - 經驗值-->
      <!-- <span>經驗值</span> -->
      <div class="progress custom-progress">
        <div
          class="progress-bar custom-progress-bar experience-bar"
          role="progressbar"
          :style="{ width: Math.min(characterExperience, 100) + '%' }"
          :aria-valuenow="Math.min(characterExperience, 100)"
          aria-valuemin="0"
          aria-valuemax="100"
          :title="'當前經驗值: ' + characterExperience"
        ></div>
      </div>
    </div>
  </div>

  <!-- 垂直展開的按鈕群組 -->
  <div class="collapse collapse-horizontal show" id="collapseExample">
    <div class="d-flex flex-column my-1">
      <RouterLink class="nav-link" :to="{ name: 'out-daily' }">
        <button
          type="button"
          class="btn btn-image-1"
          :class="{ active: activeButton === 'out-daily' }"
          @click="toggleNavActive('out-daily')"
        >
          健康紀錄
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-task' }">
        <button
          type="button"
          class="btn btn-image-2"
          :class="{ active: activeButton === 'out-task' }"
          @click="toggleNavActive('out-task')"
        >
          任務
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-shop' }">
        <button
          type="button"
          class="btn btn-image-3"
          :class="{ active: activeButton === 'out-shop' }"
          @click="toggleNavActive('out-shop')"
        >
          商店
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-dress' }">
        <button
          type="button"
          class="btn btn-image-4"
          :class="{ active: activeButton === 'out-dress' }"
          @click="toggleNavActive('out-dress')"
        >
          裝扮
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-nowreport' }">
        <button
          type="button"
          class="btn btn-image-5"
          :class="{ active: activeButton === 'out-nowreport' }"
          @click="toggleNavActive('out-nowreport')"
        >
          生活紀錄報表
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-report' }">
        <button
          type="button"
          class="btn btn-image-6"
          :class="{ active: activeButton === 'out-report' }"
          @click="toggleNavActive('out-report')"
        >
          過往住客
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-system' }">
        <button
          type="button"
          class="btn btn-image-7"
          :class="{ active: activeButton === 'out-system' }"
          @click="toggleNavActive('out-system')"
        >
          系統
        </button>
      </RouterLink>
    </div>
  </div>
  <RouterLink class="nav-link header" :to="{ name: 'roommap' }">
    123
    <img src="/images/Bad.png" alt="" />
  </RouterLink>

  <router-view></router-view>
</template>

<style scoped>
@import '/public/navBar/navProgress.css';
@import '@/assets/btnBorder.css';
@import '/public/navBar/navBtn.css';

.Player {
  display: flex;
  justify-content: center;
}

/* Avatar 區域 */
#Avatar {
  background-image: url('/navBar/Avatar information.png');
  width: 286px;
  height: 170px;
  margin-top: 10px;
  margin-left: 10px;
  padding-top: 10px;
}

/* 玩家資訊區域 */
.player-info {
  margin-top: 10px;
  margin-left: 25px;
}

.playerName {
  display: flex;
  align-items: center;
  justify-content: start;
}

.name {
  font-size: 20px;
}

.Lv_Cion {
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 8px;
  margin-left: 10px;
  margin-top: 2px;
}

.level-display img {
  margin-right: 5px;
}

/* 禮物獎勵區 */
.getGift {
  display: flex;
  align-items: center;
  justify-content: start;
  margin-left: 10px;
  gap: 3px;
}

/* 進度條區域 */
.ExpEnv {
  margin-top: 10px;
}

/* Canvas 相關樣式 */
canvas {
  margin-right: 10px;
  /* z-index: 10; */
  /* border: 1px solid #000; */
}
</style>
