<script setup>
import { ref, onMounted } from "vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import { storeToRefs } from "pinia";
import AvatarComponent from "./AvatarComponent.vue";
import { useMainStore } from "@/Stores/btnActiveCtrl";

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
  characterGetCoins,
} = storeToRefs(playerStore);

const btnActive = useMainStore();
// 相關變數宣告
const isActive = ref(false);

// 切換按鈕 active 狀態
const toggleActive = () => {
  isActive.value = !isActive.value;
};
// 切換按鈕 `active` 狀態的函式

// onMounted 生命週期
onMounted(() => {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    link.addEventListener("click", function () {
      document.querySelector(".nav-link.active")?.classList.remove("active");
      if (!this.classList.contains("disabled")) {
        this.classList.add("active");
      }
    });
  });
});
</script>

<template>
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

  <div class="Player">
    <div class="Avatar">
      <!-- 玩家資訊顯示區 -->
      <div class="player-info">
        <!-- 頭像&名子 --------------start -->
        <div class="playerName">
          <AvatarComponent></AvatarComponent>
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
          <div class="getENV" title="昨日取得環境值">
            <img src="/navBar/getENV.png" alt="getENV" />
            <span> :{{ characterGetEnvironment }} </span>
          </div>
          <div class="getEXP" title="昨日取得經驗值">
            <img src="/navBar/getEXP.png" alt="getEXP" />
            <span> :{{ characterGetExperience }} </span>
          </div>
          <div class="getCoins" title="昨日取得金幣">
            <img src="/navBar/getCoins.png" alt="getCoins" />
            <span> :{{ characterGetCoins }} </span>
          </div>
        </div>
        <!-- 昨日取得獎勵-----end -->
      </div>
    </div>
    <div class="ExpEnv">
      <!-- 第一個進度條 - 環境值  -->
      <!-- <span>環境值</span> -->
      <div
        class="progress custom-progress"
        :title="'當前環境值: ' + characterEnvironment"
      >
        <div
          class="progress-bar custom-progress-bar environment-bar"
          role="progressbar"
          :style="{ width: Math.min(characterEnvironment, 100) + '%' }"
          :aria-valuenow="Math.min(characterEnvironment, 100)"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <!-- 第二個進度條 - 經驗值-->
      <!-- <span>經驗值</span> -->
      <div
        class="progress custom-progress"
        :title="'當前經驗值: ' + characterExperience"
      >
        <div
          class="progress-bar custom-progress-bar experience-bar"
          role="progressbar"
          :style="{ width: Math.min(characterExperience, 100) + '%' }"
          :aria-valuenow="Math.min(characterExperience, 100)"
          aria-valuemin="0"
          aria-valuemax="100"
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
          :class="{ active: btnActive.activeButton === 'out-daily' }"
          @click="btnActive.setActiveButton('out-daily')"
        >
          健康紀錄
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-task' }">
        <button
          type="button"
          class="btn btn-image-2"
          :class="{ active: btnActive.activeButton === 'out-task' }"
          @click="btnActive.setActiveButton('out-task')"
        >
          任務
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-shop' }">
        <button
          type="button"
          class="btn btn-image-3"
          :class="{ active: btnActive.activeButton === 'out-shop' }"
          @click="btnActive.setActiveButton('out-shop')"
        >
          商店
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-dress' }">
        <button
          type="button"
          class="btn btn-image-4"
          :class="{ active: btnActive.activeButton === 'out-dress' }"
          @click="btnActive.setActiveButton('out-dress')"
        >
          裝扮
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-nowreport' }">
        <button
          type="button"
          class="btn btn-image-5"
          :class="{ active: btnActive.activeButton === 'out-nowreport' }"
          @click="btnActive.setActiveButton('out-nowreport')"
        >
          生活紀錄報表
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-report' }">
        <button
          type="button"
          class="btn btn-image-6"
          :class="{ active: btnActive.activeButton === 'out-report' }"
          @click="btnActive.setActiveButton('out-report')"
        >
          過往住客
        </button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-system' }">
        <button
          type="button"
          class="btn btn-image-7"
          :class="{ active: btnActive.activeButton === 'out-system' }"
          @click="btnActive.setActiveButton('out-system')"
        >
          系統
        </button>
      </RouterLink>
    </div>
  </div>
  <!-- <RouterLink class="nav-link header" :to="{ name: 'roommap' }">
    123
    <img src="/images/Bad.png" alt="" />
  </RouterLink> -->

  <router-view></router-view>
</template>

<style scoped>
@import "/public/navBar/navProgress.css";
@import "@/assets/btnBorder.css";
@import "/public/navBar/navBtn.css";

.Player {
  display: flex;
  justify-content: center;
}

/* Avatar 區域 */
.Avatar {
  background-image: url("/navBar/Avatar information.png");
  width: 286px;
  height: 170px;
  margin-top: 10px;
  margin-left: 10px;
  padding-top: 10px;
}

/* 玩家資訊區域 */
.player-info {
  margin-top: 10px;
  margin-left: 20px;
}

.playerName {
  display: flex;
  align-items: center;
  justify-content: start;
  height: 50px;
}

.name {
  font-size: 20px;
}

.Lv_Cion {
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 8px;
  margin-left: 13px;
}

.level-display img {
  margin-right: 5px;
}

/* 禮物獎勵區 */
.getGift {
  display: flex;
  align-items: center;
  justify-content: start;
  margin-left: 13px;
  gap: 3px;
}

.getCoins div {
  width: 80px;
}

.getEXP div {
  width: 80px;
}

.getENV div {
  width: 40px;
}

/* 進度條區域 */
.ExpEnv {
  margin-top: 18px;
  margin-left: 4px;
}
span {
  color: white;
}
</style>
