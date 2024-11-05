<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import FullCalenderComponent from './FullCalenderComponent.vue';
import ReportComponent from './ReportComponent.vue';

const router = useRouter();
const route = useRoute();

const isCalendarVisible = ref(true);

const toggleVisibility = () => {
  isCalendarVisible.value = !isCalendarVisible.value;
};

const currentChart = ref('water'); //預設月曆
const currentFullcalendar = ref('health'); //預設數據圖
const selectedMonth = ref(''); // 選擇年月初始為空

// 設定為資料中的最新月份
const setDefaultMonth = () => {
  // 模擬的最新月份，可以根據實際數據設置
  const latestDate = '2024-10';
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

  text.style.display = 'none';
  text.style.transform = 'translateX(0px)';
  text.style.transition = 'transform 0.3s ease';
};
// 監聽 selectedMonth 的變更
watch(selectedMonth, (newMonth) => {
  console.log('選擇的月份已更新:', newMonth);
  // 可在此處添加更新圖表或日曆的邏輯
});
</script>

<template>
  <div id="formborder">
    <!-- 左側內容區域 -->
    <div class="search" v-show="!isCalendarVisible">
      <label for="monthPicker" class="month-picker-label">搜尋月份：</label>
      <input type="month" v-model="selectedMonth" value="selectedMonth.value" />
    </div>

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

#formborder {
  display: flex;
  justify-content: flex-end;
  border: 1px solid rgb(63, 12, 70);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
  background-image: url('@/components/image/form.png');
}

#button {
  position: absolute;
  top: 10px;
  right: -50px;
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

.sport {
  background-color: #fffacd; /* 粉色 */
  color: #333;
}

.clean {
  background-color: #ffff99; /* 粉色 */
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
  display: flex; /* 使用 flex 排版 */
  align-items: center;
  justify-content: right;
  width: 180px;
  height: 50px;
}

.search {
  position: absolute; /* 或 absolute/fixed，取決於需求 */
  top: 25px;
  left: 25px;
  z-index: 10; /* 設置所需的 z-index 層級 */
}
.button-text {
  margin-right: 55px;
  display: none;
}
.button-icon {
  /* margin-left: 60px; */
  margin-left: auto; /* 將圖片自動對齊到右側 */
}
</style>
