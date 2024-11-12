<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import FullCalenderComponent from '@/components/FullCalenderComponent.vue';
import ReportComponent from '@/components/ReportComponent.vue';
import GoBackComponent from '@/components/GoBackComponent.vue';
import { useReportDataStore } from '@/Stores/reportDataStore';

const router = useRouter();
const route = useRoute();

const reportData = useReportDataStore();

const test = ref([]);
const maxDate = ref('');
const minDate = ref('');

const isCalendarVisible = ref(true);

const toggleVisibility = () => {
  isCalendarVisible.value = !isCalendarVisible.value;
};

const currentChart = ref('water'); //預設月曆
const currentFullcalendar = ref('health'); //預設數據圖
const selectedMonth = ref(''); // 選擇年月初始為空

// 設定為資料中的最新月份
const setDefaultMonth = () => {
  test.value = reportData.Data.map((item) => item.hrecordDate);
  maxDate.value = test.value.slice(-1)[0].slice(0, 7);
  minDate.value = test.value.slice(0)[0].slice(0, 7);

  console.log('test', minDate.value);

  // 模擬的最新月份，可以根據實際數據設置
  selectedMonth.value = maxDate.value;
};

const validateMonth = () => {
  // 比較輸入值與最小日期
  if (selectedMonth.value === '') {
    selectedMonth.value = minDate.value; // 如果小於最小值，自動調整為最小值
  }
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
  const image = event.target.querySelector('.button-icon'); // 找到圖片
  const text = event.target.querySelector('.button-text'); // 找到文字

  event.target.style.transform = 'translateX(50px)';
  event.target.style.transition = 'transform 0.3s ease';

  image.style.opacity = '0';

  text.style.display = 'inline';
  text.style.transform = 'translateX(50px)';
  text.style.transition = 'transform 0.3s ease';
};

// 恢復原位效果
const moveBack = (event) => {
  const image = event.target.querySelector('.button-icon'); // 找到圖片
  const text = event.target.querySelector('.button-text'); // 找到文字

  event.target.style.transform = 'translateX(0px)';
  event.target.style.transition = 'transform 0.3s ease';

  image.style.opacity = '1';
  image.style.transform = 'translateX(0px)';
  image.style.transition = 'transform 0.3s ease';

  text.style.display = 'none';
  text.style.transform = 'translateX(0px)';
  text.style.transition = 'transform 0.3s ease';
};

// 監聽 selectedMonth 的變更
watch(selectedMonth, (newMonth) => {
  console.log('選擇的月份已更新:', newMonth);
});
</script>

<template>
  <div id="formborder">
    <!-- 左側內容區域 -->
    <div class="reportGoback2">
      <RouterLink
        :to="{
          name: $route.name.startsWith('in-') ? 'in-report' : 'out-report'
        }"
      >
        <GoBackComponent></GoBackComponent>
      </RouterLink>
    </div>

    <div class="search" v-show="!isCalendarVisible">
      <label for="monthPicker" class="month-picker-label">搜尋月份：</label>
      <input
        type="month"
        v-model="selectedMonth"
        :min="minDate"
        @input="validateMonth"
      />
    </div>

    <div class="row" id="component">
      <FullCalenderComponent
        :currentFullcalendar="currentFullcalendar"
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
        <img src="/images/fruit.png" alt="Water Icon" class="button-icon" />
        <span class="button-text">飲食習慣</span>
      </button>
      <button
        class="btn btn-primary sport"
        @click="selectFullcalenderAndToggle('exercise')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        <img src="/images/dumbbell.png" alt="Water Icon" class="button-icon" />
        <span class="button-text">運動習慣</span>
      </button>
      <button
        class="btn btn-primary clean"
        @click="selectFullcalenderAndToggle('cleaning')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        <img src="/images/sb.png" alt="Water Icon" class="button-icon" />
        <span class="button-text">環境整理</span>
      </button>
      <button
        class="btn btn-primary water"
        @click="selectChartAndToggle('water')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        <img src="/images/water.png" alt="Water Icon" class="button-icon" />
        <span class="button-text">飲水量</span>
      </button>
      <button
        class="btn btn-primary steps"
        @click="selectChartAndToggle('steps')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        <img src="/images/steps.png" alt="Water Icon" class="button-icon" />
        <span class="button-text">步數</span>
      </button>
      <button
        class="btn btn-primary sleep"
        @click="selectChartAndToggle('sleep')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        <img src="/images/bed.png" alt="Water Icon" class="button-icon" />
        <span class="button-text">睡眠時間</span>
      </button>
      <button
        class="btn btn-primary mood"
        @click="selectChartAndToggle('mood')"
        @mouseover="moveRight($event)"
        @mouseleave="moveBack($event)"
      >
        <img src="/images/heart.png" alt="Water Icon" class="button-icon" />
        <span class="button-text">心情</span>
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
/* 禁止亂按 :) --start*/
input[type='month']::-webkit-clear-button,
input[type='month']::-webkit-calendar-picker-indicator {
  display: none;
}
/* 禁止亂按 :) --end*/

/* 更改 input[type="month"] 背景顏色 */
input[type='month'] {
  width: 100px;
  height: 30px;
  border-radius: 4px; /* 可選 - 圓角 */
}

#formborder {
  display: flex;
  justify-content: flex-end;
  /* border: 1px solid rgb(63, 12, 70); */
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
  background-image: url('/images/border.png');
}

#button {
  position: absolute;
  top: 20px;
  right: -50px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: -2;
}
/* 每個按鈕不同亮色系顏色 */
.habit {
  background-color: #ffadad; /* 粉色 */
  color: #333;
}

.habit:active {
  background-color: #ff8585; /* 點擊時的背景色 */
}

.sport {
  background-color: #fffacd;
  color: #333;
}

.sport:active {
  background-color: #ffe799; /* 點擊時的背景色 */
}

.clean {
  background-color: #ffff99;
  color: #333;
}

.clean:active {
  background-color: #ffeb66; /* 點擊時的背景色 */
}

.water {
  background-color: #bde0fe; /* 淺藍色 */
  color: #333;
}

.water:active {
  background-color: #a1c9f1; /* 點擊時的背景色 */
}

.steps {
  background-color: #caffbf; /* 淺綠色 */
  color: #333;
}

.steps:active {
  background-color: #b8e8a3; /* 點擊時的背景色 */
}

.sleep {
  background-color: #ffd6a5; /* 淺橘色 */
  color: #333;
}

.sleep:active {
  background-color: #ffb77d; /* 點擊時的背景色 */
}

.mood {
  background-color: #ffc6ff; /* 淺紫色 */
  color: #333;
}
.mood:active {
  background-color: #ffb3ff; /* 點擊時的背景色 */
}

.btn-primary {
  transition: transform 0.1s ease; /* 平滑過渡 */
  padding: 10px 20px; /* 設定按鈕的內邊距 */
  border: none; /* 移除按鈕的邊框 */
  border-radius: 5px; /* 圓角按鈕 */
  font-weight: bold;
  display: flex; /* 使用 flex 排版 */
  align-items: center;
  justify-content: right;
  width: 250px;
  height: 50px;
}

.search {
  position: absolute; /* 或 absolute/fixed，取決於需求 */
  top: 35px;
  left: 35px;
  z-index: 10; /* 設置所需的 z-index 層級 */
}
.button-text {
  margin-right: 60px;
  display: none;
}
.button-icon {
  /* margin-left: 60px; */
  margin-left: 20px; /* 將圖片自動對齊到右側 */
}
</style>
