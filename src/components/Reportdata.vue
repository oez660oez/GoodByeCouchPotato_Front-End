<template>
  <div class="row" id="formborder">
    <div class="row" id="component">
      <FullCalenderComponent v-if="isCalendarVisible" />
      <ReportComponent :currentChart="currentChart" v-else />
      <div class="row" id="button">
        <button class="btn btn-primary" @click="toggleVisibility(true)">
          正負向習慣
        </button>
        <button class="btn btn-primary" @click="selectChartAndToggle('water')">
          飲水量
        </button>
        <button class="btn btn-primary" @click="selectChartAndToggle('steps')">
          步數
        </button>
        <button class="btn btn-primary" @click="selectChartAndToggle('sleep')">
          睡眠時間
        </button>
        <button class="btn btn-primary" @click="selectChartAndToggle('mood')">
          心情
        </button>
      </div>
    </div>

    <!-- 控制按鈕區域，按鈕將垂直排列 -->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import FullCalenderComponent from './FullCalenderComponent.vue';
import ReportComponent from './ReportComponent.vue';

const router = useRouter();
const route = useRoute();

const isCalendarVisible = ref(false);

// 切換顯示的函數
const toggleVisibility = (bool) => {
  if (bool === true) {
    isCalendarVisible.value = false;
  }
  isCalendarVisible.value = !isCalendarVisible.value;
};

const currentChart = ref('water');

// 選擇圖表並切換回日曆
const selectChartAndToggle = (chartType) => {
  currentChart.value = chartType;
  if (isCalendarVisible.value === true) {
    toggleVisibility();
  }
};

const goBack = () => {
  if (route.matched.length > 1) {
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    router.go(-1);
  }
};
</script>

<style lang="css" scoped>
#formborder {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgb(33, 70, 12);
  background-color: rgb(251, 251, 251);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
}
#component {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgb(33, 70, 12);
  background-color: rgb(251, 251, 251);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
}

#button {
  width: 200px;
}
</style>
