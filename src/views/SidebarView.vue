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

    <span class="level-display">
      <img
        v-if="characterLevel >= 1 && characterLevel <= 4"
        src="/images/navBar/Bronze Lv.png"
        alt="Bronze"
        title="等級"
      />
      <img
        v-else-if="characterLevel >= 5 && characterLevel <= 11"
        src="/images/navBar/Sliver Lv.png"
        alt="Silver"
        title="等級"
      />
      <img
        v-else-if="characterLevel >= 12 && characterLevel <= 24"
        src="/images/navBar/Gold Lv.png"
        alt="Gold"
        title="等級"
      />
      <img
        v-else-if="characterLevel >= 25"
        src="/images/navBar/Diamond.png"
        alt="Diamond"
        title="等級"
      />
      <span>{{ characterLevel }}</span>
    </span>

    <span class="getGift">
      <img
        src="/images/navBar/getENV.png"
        alt="getENV"
        title="昨日取得環境值"
      />
      <span>
        {{ characterGetEnvironment }}
      </span>
      <img
        src="/images/navBar/getEXP.png"
        alt="getEXP"
        title="昨日取得經驗值"
      />
      <span>
        {{ characterGetExperience }}
      </span>
      <img
        src="/images/navBar/getCoins.png"
        alt="getEXP"
        title="昨日取得金幣"
      />
      <span>
        {{ characterGetCoins }}
      </span>
    </span>

    <!-- <p>角色名稱: {{ characterName }}</p> -->
    <!-- <p>等級: {{ characterLevel }} &nbsp;&nbsp; 金幣: {{ characterCoins }}</p> -->
    <!-- <p>當前經驗值: {{ characterExperience }}</p> -->
    <!-- <p>當前環境值: {{ characterEnvironment }}</p> -->
    <!-- <p>昨日取得環境值: {{ characterGetEnvironment }}</p>
    <p>昨日取得經驗值: {{ characterGetExperience }}</p>
    <p>昨日取得金幣: {{ characterGetCoins }}</p> -->
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
      :style="{ width: Math.min(characterEnvironment + 20.52, 100) + '%' }"
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
        <button type="button" class="btn btn-image-1">
          <span class="button-text">健康紀錄</span>
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-task' }">
        <button type="button" class="btn btn-image-2">
          <span class="button-text">任務</span>
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-shop' }">
        <button type="button" class="btn btn-image-3">
          <span class="button-text">商店</span>
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-dress' }">
        <button type="button" class="btn btn-image-4">
          <span class="button-text">裝扮</span>
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-nowreport' }">
        <button type="button" class="btn btn-image-5">
          <span class="button-text">生活紀錄報表</span>
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-report' }">
        <button type="button" class="btn btn-image-6">
          <span class="button-text">過往住客</span>
        </button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-system' }">
        <button type="button" class="btn btn-image-7">
          <span class="button-text">系統</span>
        </button>
      </RouterLink>
    </div>
  </div>

  <router-view></router-view>
</template>

<style lang="css" scoped>
/* .player-info {
  margin-bottom: 20px;
} */

.nav-link {
  margin-left: 10px;
  width: 170px;
}

.btn {
  width: 170px;
  height: 48px;
  padding-left: 40px;
  font-size: 15px;
  display: flex;
  align-items: center;
}

.button-text {
  text-align: left;
  margin-top: 7px;
  margin-left: 10px;
  flex: 1;
}

.btn-image-1 {
  background-image: url('/images/navBar/formBtn.png');
}
.btn-image-2 {
  background-image: url('/images/navBar/missoinBtn.png');
}
.btn-image-3 {
  background-image: url('/images/navBar/storeBtn.png');
}
.btn-image-4 {
  background-image: url('/images/navBar/bagBtn.png');
}
.btn-image-5 {
  background-image: url('/images/navBar/peopleBtn.png');
}
.btn-image-6 {
  background-image: url('/images/navBar/reportBtn.png');
}
.btn-image-7 {
  background-image: url('/images/navBar/settingBtn.png');
}
.btn-image-8 {
  background-image: url('/images/navBar/navbarBtn.png');
  background-size: 100% 100%;
  background-color: transparent;
  border: none;
  width: 48px;
  height: 48px;
}

/* .collapse {
  gap: 2px;
  padding: 10px 0;
  background-image: url('/images/navbar background.png');
  width: 200px;
} */

.d-flex.flex-column {
  gap: 2px;
  width: 200px;
  padding: 10px 0 10px 0;
  background-image: url('/images/navbar background.png');
}

.progress {
  width: 228px;
  height: 24px;
}

.custom-progress {
  background-image: url('/images/navBar/Battery.png');
  background-size: cover;
  background-color: transparent;
  border-radius: unset;
}

.experience-bar {
  background-image: url('/images/navBar/Battery EXP light.png');
  background-size: cover;
  background-color: transparent;
  transition: width 0.9s ease;
}

.environment-bar {
  background-image: url('/images/navBar/Battery ENV light.png');
  background-size: cover;
  background-color: transparent;
  transition: width 0.9s ease;
}

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
