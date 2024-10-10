<script setup>
const links = document.querySelectorAll('.nav-link');

import { onMounted } from 'vue';
import ShopView from './ShopView.vue';

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
              這邊留給玩家資訊
            </div>
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
                <RouterLink class="nav-link" :to="{ name: 'in-report' }">紀錄表</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" :to="{ name: 'in-system' }">系統</RouterLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>


    <router-view></router-view>
  </div>





</template>

<style lang="css" scoped>
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
  height: 50px;
}
</style>