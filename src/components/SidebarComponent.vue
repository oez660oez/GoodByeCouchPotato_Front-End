<script setup>
import { ref, onMounted } from 'vue';
import { Playerinformation } from '@/Stores/PlayerCharacter';
import { storeToRefs } from 'pinia';
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

// 控制按鈕群組顯示/隱藏的狀態
const isCollapsed = ref(false);

// 初始化導航按鈕
onMounted(() => {
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
  <!-- 玩家資訊顯示區 -->
  <div id="player" class="player-info">
    <p>角色名稱: {{ characterName }}</p>
    <img src="/navBar/Coins.png" alt="Coins" title="金幣" />{{ characterCoins }}
    <span class="level-display">
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
      <span>{{ characterLevel }}</span>
    </span>

    <span class="getGift">
      <img src="/navBar/getENV.png" alt="getENV" title="昨日取得環境值" />
      <span>
        {{ characterGetEnvironment }}
      </span>
      <img src="/navBar/getEXP.png" alt="getEXP" title="昨日取得經驗值" />
      <span>
        {{ characterGetExperience }}
      </span>
      <img src="/navBar/getCoins.png" alt="getEXP" title="昨日取得金幣" />
      <span>
        {{ characterGetCoins }}
      </span>
    </span>
  </div>

  <!-- 第一個進度條 - 經驗值 -->
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

  <!-- 第二個進度條 - 環境值 -->
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

  <!-- 控制顯示/隱藏按鈕群組的按鈕 -->
  <button
    class="btn-image-8"
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#collapseExample"
    aria-expanded="true"
    aria-controls="collapseExample"
  ></button>

  <!-- 垂直展開的按鈕群組 -->
  <div class="collapse show" id="collapseExample">
    <div class="d-flex flex-column mt-3">
      <RouterLink class="nav-link" :to="{ name: 'out-daily' }">
        <button type="button" class="btn btn-image-1 btnSide">
          <!-- <span class="button-text">健康紀錄</span> -->
          健康紀錄
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-task' }">
        <button type="button" class="btn btn-image-2 btnSide">
          <!-- <span class="button-text">任務</span> -->
          任務
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-shop' }">
        <button type="button" class="btn btn-image-3 btnSide">
          <!-- <span class="button-text">商店</span> -->
          商店
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-dress' }">
        <button type="button" class="btn btn-image-4 btnSide">
          <!-- <span class="button-text">裝扮</span> -->
          裝扮
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-nowreport' }">
        <button type="button" class="btn btn-image-5 btnSide">
          <!-- <span class="button-text">生活紀錄報表</span> -->
          生活紀錄報表
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-report' }">
        <button type="button" class="btn btn-image-6 btnSide">
          <!-- <span class="button-text">過往住客</span> -->
          過往住客
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-system' }">
        <button type="button" class="btn btn-image-7 btnSide">
          <!-- <span class="button-text">系統</span> -->
          系統
        </button>
      </RouterLink>
    </div>
  </div>
  <RouterLink class="nav-link header" :to="{ name: 'roommap' }">
    <img src="/images/Bad.png" alt="" />
  </RouterLink>

  <router-view></router-view>
</template>

<style scoped>
@import '/public/navBar/navBtn.css';
@import '/public/navBar/navProgress.css';
@import 'src/assets/btnBorder.css';

.level-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-display img {
  margin-right: 10px;
}

.getGift {
  display: flex;
  align-items: center;
  gap: 8px;
}

.getGift img {
  margin-right: 10px;
}
</style>
