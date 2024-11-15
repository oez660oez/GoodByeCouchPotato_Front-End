<script setup>
import { onMounted, ref, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useReportDataStore } from '@/Stores/reportDataStore';

const props = defineProps({
  currentFullcalendar: String
});

const getreportData = useReportDataStore();
const dailyhealthData = ref([]);
const specialDates = ref([]);
const vegetables = ref([]);
const snacks = ref([]);
const exercise = ref([]);
const cleaning = ref([]);

const datesWithVegetables = ref([]);
const datesWithSnacks = ref([]);
const datesWithExercise = ref([]);
const datesWithCleaning = ref([]);

const lastMonth = ref();
const calendarContainer = ref(null);

const imageUrl1 = '/images/Good.png';
const imageUrl2 = '/images/Bad.png';
const imageUrl3 = '/images/V.png';

// 獲取資料
const getData = () => {
  dailyhealthData.value = getreportData.Data || [];

  if (dailyhealthData.value.length === 0) return;

  specialDates.value = dailyhealthData.value.map((item) => item.hrecordDate);
  vegetables.value = dailyhealthData.value.map((item) => item.vegetables);
  snacks.value = dailyhealthData.value.map((item) => item.snacks);
  exercise.value = dailyhealthData.value.map((item) => item.exercise);
  cleaning.value = dailyhealthData.value.map((item) => item.cleaning);

  datesWithVegetables.value = specialDates.value.filter(
    (date, index) => vegetables.value[index] > 0
  );
  datesWithSnacks.value = specialDates.value.filter(
    (date, index) => snacks.value[index] > 0
  );
  datesWithExercise.value = specialDates.value.filter(
    (date, index) => exercise.value[index] === true
  );
  datesWithCleaning.value = specialDates.value.filter(
    (date, index) => cleaning.value[index] === true
  );

  lastMonth.value = specialDates.value.slice(-1)[0];
};

// 清除指定日曆格子中的所有圖片
const clearImagesFromDayCell = (dayCell) => {
  const images = dayCell.querySelectorAll('img');
  images.forEach((img) => img.remove());
};

// 添加圖片到日期格子
const addImageToDayCell = (dayCell, imageUrl, className, altText) => {
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = altText;
  img.className = className;
  img.style.position = 'absolute';
  img.style.pointerEvents = 'none';
  img.style.zIndex = '10';

  const existingImages = dayCell.querySelectorAll('img');
  switch (existingImages.length) {
    case 0:
      img.style.bottom = '4px';
      img.style.left = '4px';
      break;
    case 1:
      img.style.bottom = '4px';
      img.style.left = '36px';
      break;
    case 2:
      img.style.bottom = '24px';
      img.style.right = '4px';
      break;
    case 3:
      img.style.bottom = '24px';
      img.style.left = '4px';
      break;
  }

  dayCell.style.position = 'relative';
  dayCell.appendChild(img);
};

// 根據條件在日曆上添加圖片
const handleCalendarImages = () => {
  const dayCells = document.querySelectorAll('.fc-daygrid-day');
  dayCells.forEach((dayCell) => {
    clearImagesFromDayCell(dayCell);
    const date = dayCell.getAttribute('data-date');

    if (props.currentFullcalendar === 'health') {
      if (datesWithVegetables.value.includes(date)) {
        addImageToDayCell(dayCell, imageUrl1, 'img1', 'Vegetables');
      }
      if (datesWithSnacks.value.includes(date)) {
        addImageToDayCell(dayCell, imageUrl2, 'img2', 'Snacks');
      }
    } else if (
      props.currentFullcalendar === 'exercise' &&
      datesWithExercise.value.includes(date)
    ) {
      addImageToDayCell(dayCell, imageUrl3, 'img3', 'Exercise');
    } else if (
      props.currentFullcalendar === 'cleaning' &&
      datesWithCleaning.value.includes(date)
    ) {
      addImageToDayCell(dayCell, imageUrl3, 'img4', 'Cleaning');
    }
  });
};

// 初始化日曆
const goDate = () => {
  if (calendarContainer.value && lastMonth.value) {
    calendarContainer.value.getApi().gotoDate(lastMonth.value);
  }
};

const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev',
    center: 'title',
    right: 'next'
  },
  events: specialDates.value.map((date) => ({
    start: date,
    display: 'background'
  })),
  datesSet() {
    handleCalendarImages();
  }
};

// 初始化
onMounted(() => {
  getData();
  if (dailyhealthData.value.length > 0) {
    handleCalendarImages();
    goDate();
  }
});

// 監聽資料變化
watch(
  () => getreportData.Data,
  () => {
    getData();
    if (dailyhealthData.value.length > 0) {
      handleCalendarImages();
      goDate();
    }
  }
);
</script>

<template>
  <div id="formborder">
    <template v-if="dailyhealthData.length > 0">
      <div id="form" class="calendar-container">
        <FullCalendar ref="calendarContainer" :options="calendarOptions" />
      </div>
    </template>
    <template v-else>
      <h2>目前無資料</h2>
    </template>
  </div>
</template>

<style scoped>
.calendar-container {
  max-width: 780px;
  max-height: 600px;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
  margin-top: 50px;
}

h2 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff4d4d;
  text-align: center;
  font-size: 50px;
  margin: 0;
  z-index: 10; /* 確保顯示在最上層 */
}

:deep(.fc) {
  height: 100%;
  width: 100%;
  font-size: 1em;
  background-color: transparent;
  margin-top: auto; /* 將 #component 推到底部 */
}

:deep(.fc-header-toolbar) {
  margin-bottom: 0.5em !important;
  padding: 0.3em;
}

:deep(.fc-toolbar-title) {
  font-size: 1.2em !important;
}

:deep(.fc-button) {
  padding: 0.2em 0.4em !important;
  font-size: 0.9em !important;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 60px !important;
  padding: 2px !important;
  display: flex !important;
  flex-direction: column !important;
}

:deep(.fc-day-header) {
  padding: 2px !important;
}

:deep(.fc-daygrid-day-events) {
  margin: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
  position: relative !important;
}

:deep(.fc-h-event) {
  background-color: transparent !important;
  border: none !important;
}

:deep(.fc-daygrid-event-harness) {
  margin: 0 !important;
  width: 100% !important;
}

:deep(.fc-daygrid-event) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
}

:deep(.fc-event-title) {
  padding: 0 !important;
}

:deep(.fc-view-harness) {
  height: auto !important;
}

:deep(.fc-button) {
  background-color: #6c757d; /* 設定按鈕背景顏色為藍色 */
  color: #f8f9fa; /* 設定按鈕文字顏色為白色 */
  border: none; /* 去除邊框 */
}

.fc-button:hover {
  background-color: #5f7c83; /* 設定按鈕懸停時的背景顏色 */
}

/* 設定整體日曆背景色 */
/* :deep(.fc-theme-standard) {
  background-color: #abd1c5;
} */

/* 設定日期數字的顏色 */
:deep(.fc-daygrid-day-number) {
  text-decoration: none; /* 移除底線 */
  color: #212f3c;
}

/* 設定星期幾的顏色 */
:deep(.fc-col-header-cell) {
  background-color: #3f4750;
}

:deep(a.fc-col-header-cell-cushion) {
  color: #dbe3df !important;
  text-decoration: none;
}

/* 設定今天的樣式 */
:deep(.fc-day-today) {
  background-color: #d8c3a5 !important;
}

.event-content {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 2px;
  width: 100% !important;
  gap: 5px;
  margin-top: 5px;
}

.event-content img {
  width: 20px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
}

/* 設定日曆內容的高度 */
:deep(.fc-view) {
  height: auto !important;
}

:deep(.fc-daygrid-body) {
  height: auto !important;
}

:deep(.fc-scrollgrid-sync-table) {
  height: auto !important;
}
</style>
