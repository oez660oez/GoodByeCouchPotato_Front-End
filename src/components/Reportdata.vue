<template>
  <div id="formborder">
    <!-- 左側內容區域 -->
    <div class="row" id="component">
      <FullCalenderComponent
        :currentFullcalendar="currentFullcalendar"
        :selectedMonth="selectedMonth"
        v-if="isCalendarVisible"
      />
      <ReportComponent
        :currentChart="currentChart"
        :selectedMonth="selectedMonth"
        v-else
      />
    </div>
    <!-- 右側按鈕區域 -->
    <div class="row" id="button">
      <button
        class="btn btn-primary habit"
        @click="selectFullcalenderAndToggle('health')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        正負向習慣
      </button>
      <button
        class="btn btn-primary habit"
        @click="selectFullcalenderAndToggle('exercise')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        運動習慣
      </button>
      <button
        class="btn btn-primary habit"
        @click="selectFullcalenderAndToggle('cleaning')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        環境整理
      </button>
      <button
        class="btn btn-primary water"
        @click="selectChartAndToggle('water')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        飲水量
      </button>
      <button
        class="btn btn-primary steps"
        @click="selectChartAndToggle('steps')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        步數
      </button>
      <button
        class="btn btn-primary sleep"
        @click="selectChartAndToggle('sleep')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        睡眠時間
      </button>
      <button
        class="btn btn-primary mood"
        @click="selectChartAndToggle('mood')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        心情
      </button>
    </div>
  </div>
  <div>
    <label for="monthPicker" class="month-picker-label">搜尋月份：</label>
    <input type="month" v-model="selectedMonth" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { format } from "date-fns"; // 確保 date-fns 安裝成功
import { useRouter, useRoute } from "vue-router";
import FullCalenderComponent from "./FullCalenderComponent.vue";
import ReportComponent from "./ReportComponent.vue";

const router = useRouter();
const route = useRoute();

const isCalendarVisible = ref(true);

const toggleVisibility = () => {
  isCalendarVisible.value = !isCalendarVisible.value;
};

const currentChart = ref("water");
const currentFullcalendar = ref("health");
const selectedMonth = ref(""); // 初始為空

// 設定為資料中的最新月份
const setDefaultMonth = () => {
  // 模擬的最新月份，可以根據實際數據設置
  const latestDate = "2024-10";
  selectedMonth.value = latestDate;
};

// 初始化並設定預設月份
onMounted(() => {
  setDefaultMonth();
});

const selectChartAndToggle = (chartType) => {
  currentChart.value = chartType;
  if (isCalendarVisible.value === true) {
    toggleVisibility();
  }
};

const selectFullcalenderAndToggle = (fullcalendarType) => {
  currentFullcalendar.value = fullcalendarType;
  if (isCalendarVisible.value === false) {
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

// 右移效果
const moveRight = (event) => {
  event.target.style.transform = "translateX(50px)";
  event.target.style.transition = "transform 0.3s ease";
};

// 恢復原位效果
const moveBack = (event) => {
  event.target.style.transform = "translateX(0px)";
};

// 監聽 selectedMonth 的變更
watch(selectedMonth, (newMonth) => {
  console.log("選擇的月份已更新:", newMonth);
  // 可在此處添加更新圖表或日曆的邏輯
});
</script>

<style lang="css" scoped>
#formborder {
  display: flex;
  justify-content: flex-end;
  border: 1px solid rgb(63, 12, 70);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
  background-image: url("@/components/image/form.png");
}

#button {
  position: absolute;
  top: 0;
  right: -30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: -2;
}

/* 每個按鈕不同亮色系顏色 */
.habit {
  background-color: #ffadad; /* 粉色 */
  color: #333;
}

.water {
  background-color: #bde0fe; /* 淺藍色 */
  color: #333;
}

.steps {
  background-color: #caffbf; /* 淺綠色 */
  color: #333;
}

.sleep {
  background-color: #ffd6a5; /* 淺橘色 */
  color: #333;
}

.mood {
  background-color: #ffc6ff; /* 淺紫色 */
  color: #333;
}

.btn-primary {
  transition: transform 0.3s ease; /* 平滑過渡 */
  padding: 10px 20px; /* 設定按鈕的內邊距 */
  border: none; /* 移除按鈕的邊框 */
  border-radius: 5px; /* 圓角按鈕 */
  font-weight: bold;
}
</style>
