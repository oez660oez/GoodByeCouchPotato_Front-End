<script setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, shallowRef } from "vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import SleepReport from "@/reportview/SleepReport.vue";
import StepsReport from "@/reportview/StepsReport.vue";
import MoodReport from "@/reportview/MoodReport.vue";
import GoBackComponent from "@/components/GoBackComponent.vue";
import WaterReport from "@/reportview/WaterReport.vue";
import WeightReport from "@/reportview/WeightReport.vue";
import EatingReport from "@/reportview/EatingReport.vue";
import SportReport from "@/reportview/SportReport.vue";
import CleaningReport from "@/reportview/CleaningReport.vue";

const router = useRouter();
const route = useRoute();
const playerStore = Playerinformation();

// 使用 shallowRef 來存儲當前要顯示的組件
const currentView = shallowRef(null);
const activeButton = ref(null);

// 組件映射
const viewComponents = {
  shoes: StepsReport,
  drink: WaterReport,
  weight: WeightReport,
  bed: SleepReport,
  smile: MoodReport,
  food: EatingReport,
  sport: SportReport,
  clean: CleaningReport
};

// 設置活動按鈕並切換視圖
const setActiveButton = (buttonId) => {
  activeButton.value = buttonId;
  currentView.value = viewComponents[buttonId];
};

// // 定義按鈕名稱映射
// const buttonNameMap = {
//   shoes: '步數',
//   drink: '飲水量',
//   weight: '體重',
//   bed: '睡眠',
//   smile: '心情'
// };

const getButtonName = (buttonId) => {
  return buttonNameMap[buttonId];
};

const goBack = () => {
  if (route.matched.length > 1) {
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    router.go(-1);
  }
};

onMounted(() => {
  setActiveButton("shoes");
});
</script>

<template>
  <div id="formborder">
    <!-- 動態組件區域 -->
    <div class="view-area">
      <!-- 顯示當前按鈕名稱 -->
      <!-- <div v-if="activeButton" class="status-text">
      <h5>{{ getButtonName(activeButton) }}</h5> -->
      <!-- </div> -->
      <component :is="currentView" v-if="currentView" />
    </div>
    
    <!-- 選項按鈕 -->
    <div class="button-container">
      <button
        class="icon-button"
        :class="{ active: activeButton === 'shoes' }"
        @click="setActiveButton('shoes')"
      >
        <i class="fa-solid fa-shoe-prints fa-rotate-270"></i>
      </button>
      <button
        class="icon-button"
        :class="{ active: activeButton === 'drink' }"
        @click="setActiveButton('drink')"
      >
        <i class="fa-solid fa-whiskey-glass"></i>
      </button>
      <button
        class="icon-button"
        :class="{ active: activeButton === 'weight' }"
        @click="setActiveButton('weight')"
      >
        <i class="fa-solid fa-weight-scale"></i>
      </button>
      <button
        class="icon-button"
        :class="{ active: activeButton === 'bed' }"
        @click="setActiveButton('bed')"
      >
        <i class="fa-solid fa-bed"></i>
      </button>
      <button
        class="icon-button"
        :class="{ active: activeButton === 'smile' }"
        @click="setActiveButton('smile')"
      >
        <i class="fa-regular fa-face-smile"></i>
      </button>
      <button
        class="icon-button"
        :class="{ active: activeButton === 'food' }"
        @click="setActiveButton('food')"
      >
        <i class="fa-solid fa-utensils"></i>
      </button>
      <button
        class="icon-button"
        :class="{ active: activeButton === 'sport' }"
        @click="setActiveButton('sport')"
      >
        <i class="fa-solid fa-bicycle"></i>
      </button>
      <button
        class="icon-button"
        :class="{ active: activeButton === 'clean' }"
        @click="setActiveButton('clean')"
      >
      <i class="fa-solid fa-hand-sparkles"></i>
      </button>
    </div>
    <div class="goback">
      <GoBackComponent @goback="goBack"></GoBackComponent>
    </div>
  </div>
    
</template>

<style lang="css" scoped>
#formborder {
  /* border: 1px solid rgb(12, 61, 70); */
  /* background-color: rgb(227, 224, 222); */
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
  background-image: url("@/assets/border.png");
  background-size: cover;
}

.button-container {
  position: absolute;
  right: 31px;
  top: 55%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  /* gap: 5px; */
}

.icon-button {
  background: white;
  border: 1px solid black;
  cursor: pointer;
  padding: 10px;
  font-size: 28px;
  /* transition: all 0.3s ease; */
  line-height: 30px; /* 加上這一行以確保圖標垂直居中 */
}

.icon-button.active {
  background-color: rgb(12, 61, 70);
  color: white;
}

.icon-button:hover {
  transform: scale(1);
  color: rgb(240, 246, 247);
  background-color: rgba(20, 77, 87, 0.668);
}

#back {
  position: absolute;
  border: none;
  top: 0px;
  right: 5px;
  z-index: 1;
}

.card-body {
  background: transparent;
  border: none;
}

.form-control.datepicker {
  background-color: #fff; /* 设置背景色为白色 */
  border: 1px solid #ccc; /* 设置边框颜色（如果需要的话） */
  border-radius: 0.25rem; /* 可选：调整边框圆角 */
}

.view-area {
  padding: 10px;
  margin-top: 70px;
  margin-left: 35px;
  margin-right: 80px; /* 為右側按鈕預留空間 */
  /* height: calc(100% - 30px); 減去標題的高度 */
  overflow-y: auto; /* 內容過多時可以滾動 */
  /* border: 1px solid black; */
}
</style>
