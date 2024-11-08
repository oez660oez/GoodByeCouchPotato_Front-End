<script setup>
import { onMounted } from 'vue';
import { Playerinformation } from '@/Stores/PlayerCharacter';
import { storeToRefs } from 'pinia';

// 將玩家資訊從 Pinia 的 store 中引入
const playerStore = Playerinformation();
const {
  characterCoins, //持有金幣
  characterName, //角色名稱
  characterLevel, //角色等級
  characterExperience, // 角色經驗值
  characterEnvironment, // 角色環境值
  characterGetEnvironment, // 角色前一日結算取得的環境值
  characterGetExperience, // 角色前一日結算取得的經驗值
  characterGetCoins // 角色前一日結算取得的金幣
} = storeToRefs(playerStore);

// 設置導航連結的點擊效果
onMounted(() => {
  const links = document.querySelectorAll('.nav-link');
  links.forEach((link) => {
    link.addEventListener('click', function () {
      // 移除當前的 active 狀態
      document.querySelector('.nav-link.active')?.classList.remove('active');
      // 為點擊的連結加上 active 類別
      if (!this.classList.contains('disabled')) {
        this.classList.add('active');
      }
    });
  });
});
</script>

<template>
  <!-- 控制顯示/隱藏按鈕群組的按鈕 -->
  <button
    class="btn btn-image-8"
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#collapseWidthExample"
    aria-expanded="false"
    aria-controls="collapseWidthExample"
  ></button>

  <!-- 折疊的按鈕群組 -->
  <div class="collapse collapse-horizontal" id="collapseWidthExample">
    <div class="d-flex flex-column mt-3">
      <RouterLink class="nav-link" :to="{ name: 'out-daily' }">
        <button type="button" class="btn mb-2 btn-image-1"></button>
        健康紀錄
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-task' }">
        <button type="button" class="btn mb-2 btn-image-2"></button>
      </RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'out-shop' }">
        <button type="button" class="btn mb-2 btn-image-3"></button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-dress' }">
        <button type="button" class="btn mb-2 btn-image-4"></button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-nowreport' }">
        <button type="button" class="btn mb-2 btn-image-5"></button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-report' }">
        <button type="button" class="btn mb-2 btn-image-6"></button>
      </RouterLink>

      <RouterLink class="nav-link" :to="{ name: 'out-system' }">
        <button type="button" class="btn mb-2 btn-image-7"></button>
      </RouterLink>
    </div>
  </div>

  <!-- 玩家資訊顯示區 -->
  <!-- <div id="player">
    <p>角色名稱: {{ characterName }}</p>
    <p>等級: {{ characterLevel }} &nbsp;&nbsp; 金幣: {{ characterCoins }}</p>
    <p>當前經驗值: {{ characterExperience }}</p>
    <p>當前環境值: {{ characterEnvironment }}</p>
    <p>昨日取得環境值: {{ characterGetEnvironment }}</p>
    <p>昨日取得經驗值: {{ characterGetExperience }}</p>
    <p>昨日取得金幣: {{ characterGetCoins }}</p>
  </div> -->

  <router-view></router-view>
</template>

<style lang="css" scoped>
/* @import url('https://fonts.googleapis.com/css2?family=Balsamiq+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
@import url('https://fonts.googleapis.com/earlyaccess/cwtexyen.css'); */

/* 設置按鈕尺寸 */
.nav-link {
  width: 200px;
  font-size: 25px;
}

.btn {
  width: 48px;
  height: 48px;
}

/* 自訂背景圖片的按鈕樣式 */
.btn-image-1 {
  background-image: url('/images/navBar/formBtn.png');
  background-size: contain;
  background-position: center;
  color: white;
}

.btn-image-2 {
  background-image: url('/images/navBar/missoinBtn.png');
  background-size: contain;
  background-position: center;
  color: white;
}

.btn-image-3 {
  background-image: url('/images/navBar/storeBtn.png');
  background-size: contain;
  background-position: center;
  color: white;
}

.btn-image-4 {
  background-image: url('/images/navBar/bagBtn.png');
  background-size: contain;
  background-position: center;
  color: white;
}

.btn-image-5 {
  background-image: url('/images/navBar/peopleBtn.png');
  background-size: contain;
  background-position: center;
  color: white;
}

.btn-image-6 {
  background-image: url('/images/navBar/reportBtn.png');
  background-size: contain;
  background-position: center;
  color: white;
}

.btn-image-7 {
  background-image: url('/images/navBar/settingBtn.png');
  background-size: contain;
  background-position: center;
  color: white;
}

.btn-image-8 {
  background-image: url('/images/navBar/navbarBtn.png');
  /* background-size: contain; */
  color: white;
  margin-bottom: 5px;
}

/* 角色資訊區域的樣式 */
/* #player {
  height: 200px;
}

#player p {
  margin: 2px;
  font-family: 'cwTeXYen', 'Balsamiq Sans', sans-serif;
} */

/* 自訂 nav-link 的樣式 */
/* .nav-link {
  border: 1px double black;
  color: black;
  margin-bottom: 5px;
} */

.collapse-horizontal {
  height: auto; /* color: rgb(255, 255, 255); */
  background-image: url('/images/navbar background.png');
  background-size: cover;
  background-position: center;
  /* background-color: rgba(0, 0, 0, 0.7); */
  /* border-top-right-radius: 8px; */
}

/* 初始設置折疊區塊高度 */
.collapse {
  height: 0;
  overflow: hidden;
}

.collapse.show {
  height: auto; /* 展開後恢復高度 */
}
</style>
