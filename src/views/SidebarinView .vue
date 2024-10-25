<script setup>
const links = document.querySelectorAll('.nav-link');

import { onMounted } from 'vue';
import { Playerinformation } from '@/Stores/PlayerCharacter';
import { storeToRefs } from 'pinia'
const playerStore = Playerinformation()
const { 
  characterCoins,//持有金幣
  characterName,//角色名稱
  characterLevel,//角色等級
  characterExperience , // 角色經驗值
  characterEnvironment ,// 角色環境值

  characterGetEnvironment,  // 角色前一日結算取得的環境值
  characterGetExperience, // 角色前一日結算取得的經驗值
  characterGetCoins , // 角色前一日結算取得的金幣 
} = storeToRefs(playerStore)



onMounted(() => {
  const links = document.querySelectorAll('.nav-link');

  links.forEach(link => {
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

  <button id="funbtn" class="btn btn-primary" type="button" data-bs-toggle="collapse"
    data-bs-target="#collapseWidthExample" aria-expanded="true" aria-controls="collapseWidthExample">
    <i class="bi bi-layout-text-sidebar"></i>
  </button>


  <div id="container">
    <div id="functionbox">
      <div class="collapse collapse-horizontal show" id="collapseWidthExample">
        <div class="card card-body" style="width: 300px;">
          <nav class="nav flex-column">
            <div id="player">
              <p>角色名稱: {{ characterName }}</p>
              <p>等級: {{ characterLevel }} &nbsp;&nbsp; 金幣: {{ characterCoins }}</p>
               <p>當前經驗值: {{ characterExperience }}</p>
               <p>當前環境值: {{ characterEnvironment }}</p>
               <p>昨日取得環境值: {{ characterGetEnvironment }}</p>
               <p>昨日取得經驗值: {{ characterGetExperience }}</p>
               <p>昨日取得金幣: {{ characterGetCoins }}</p>
            </div>
            <div>
            <ul class="nav flex-column nav-pills">
              <li class="nav-item">
                <RouterLink class="nav-link" :to="{ name: 'in-daily' }">健康紀錄</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" :to="{ name: 'in-task' }">任務</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" :to="{ name: 'in-shop' }">商店</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" :to="{ name: 'in-dress' }">裝扮</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" :to="{ name: 'in-decoration' }">室內裝潢</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" :to="{ name: 'in-nowreport' }">生活紀錄報表</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" :to="{ name: 'in-report' }">過往住客</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" :to="{ name: 'in-system' }">系統</RouterLink>
              </li>
            </ul>
          </div>
          </nav>
        </div>
      </div>
    </div>


    <router-view></router-view>
  </div>





</template>

<style lang="css" scoped>
@import url('https://fonts.googleapis.com/css2?family=Balsamiq+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
@import url(https://fonts.googleapis.com/earlyaccess/cwtexyen.css);

#funbtn {
  height: 35px;
  margin-top: 10px;
  margin-left: 10px;
  background-color: black;
  border: none;
}

#functionbox {
  margin-left: 10px;
  min-height: 120px;
}

.nav-link {
  border: 1px double black;
  color: black;
  margin-bottom: 5px;
}

.nav-link.active {
  color: rgb(255, 255, 255);
  background-color: rgb(0, 0, 0);
}

#player {
  height: 200px;
}

#player p {
  margin: 2px; /* 移除所有方向的 margin */
  font-family: "cwTeXYen","Balsamiq Sans", sans-serif;
  
}
</style>