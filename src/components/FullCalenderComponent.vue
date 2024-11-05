<template>
  <div id="formborder">
    <div ref="shadowRootContainer" id="form"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
import { createApp, h } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useReportDataStore } from '@/Stores/reportDataStore';

const calendarApp = ref(null); // 用於保存日曆應用實例
const shadowRootContainer = ref(null);

const props = defineProps({
  currentFullcalendar: String,
  selectedMonth: String
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

const imageUrl1 = '/images/Good.png';
const imageUrl2 = '/images/Bad.png';
const imageUrl3 = '/images/V.png';

const getData = () => {
  dailyhealthData.value = getreportData.Data;
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
};

// 通用函數：根據條件添加圖片
const addImageToDayCell = (dayCell, date, imageUrl, className, altText) => {
  if (!dayCell.querySelector(`img.${className}`)) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = altText;
    img.className = className;
    dayCell.appendChild(img);
  }
};

// 主函數：處理不同的 fullcalendar 狀態並添加圖片
const handleCalendarImages = (dayCell, date) => {
  if (props.currentFullcalendar === 'health') {
    if (datesWithVegetables.value.includes(date)) {
      addImageToDayCell(dayCell, date, imageUrl1, 'img1', 'Vegetables Image');
    }
    if (datesWithSnacks.value.includes(date)) {
      addImageToDayCell(dayCell, date, imageUrl2, 'img2', 'Snacks Image');
    }
  } else if (props.currentFullcalendar === 'exercise') {
    if (datesWithExercise.value.includes(date)) {
      addImageToDayCell(dayCell, date, imageUrl3, 'img3', 'Exercise Image');
    }
  } else if (props.currentFullcalendar === 'cleaning') {
    if (datesWithCleaning.value.includes(date)) {
      addImageToDayCell(dayCell, date, imageUrl3, 'img4', 'Cleaning Image');
    }
  }
};

// 渲染日曆函數
const renderCalendar = () => {
  if (calendarApp.value) {
    calendarApp.value.unmount(); // 如果日曆實例已存在，先銷毀它
  }

  // 檢查並創建 Shadow DOM（僅在初次渲染時創建）
  let shadowRoot;
  if (!shadowRootContainer.value.shadowRoot) {
    shadowRoot = shadowRootContainer.value.attachShadow({ mode: 'open' });
  } else {
    shadowRoot = shadowRootContainer.value.shadowRoot;
  }

  const calendarContainer = document.createElement('div');
  shadowRoot.appendChild(calendarContainer);

  // 創建並應用樣式
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .fc-daygrid-day {
      width: 10px;
    }
    .fc .fc-scroller {
      overflow: hidden;
    }
    .fc-daygrid {
      overflow: hidden;
    }
  `;
  shadowRoot.appendChild(styleElement);

  // 建立日曆應用實例
  calendarApp.value = createApp({
    render() {
      return h(FullCalendar, { options: calendarOptions });
    }
  });

  calendarApp.value.mount(calendarContainer);

  // 設置 MutationObserver 觀察變化
  const observer = new MutationObserver(() => {
    const dayCells = shadowRoot.querySelectorAll('.fc-daygrid-day');
    dayCells.forEach((dayCell) => {
      const date = dayCell.getAttribute('data-date');
      handleCalendarImages(dayCell, date);
    });
  });

  observer.observe(calendarContainer, { childList: true, subtree: true });
};

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin],
  headerToolbar: {
    left: 'prev',
    center: 'title',
    right: 'next'
  },
  height: 600,
  events: specialDates.value.map((date) => ({
    start: date,
    display: 'background'
  }))
};

// 在組件加載時初始化日曆
onMounted(() => {
  getData();
  renderCalendar(); // 初次渲染日曆
});

// 銷毀日曆應用實例
onBeforeUnmount(() => {
  if (calendarApp.value) {
    calendarApp.value.unmount();
  }
});

// 監聽 currentFullcalendar 的變化，重新渲染日曆
watch(
  () => props.currentFullcalendar,
  () => {
    renderCalendar(); // 重新渲染日曆
  }
);

// 監聽報告資料變化，重新渲染日曆
watch(
  () => getreportData.Data,
  () => {
    getData();
    // renderCalendar();
  }
);
</script>

<style lang="css" scoped>
#formborder {
  display: flex;
  justify-content: flex-end;
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
}
#form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 600px;
}

.calendar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 912px;
  height: 608px;
  overflow: hidden;
}

.img1,
.img2,
.img3,
.img4 {
  width: 40%;
  height: 40%;
  position: relative;
  z-index: 10;
}

.img1 {
  top: 10%;
  left: 10%;
}

.img2 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.img3,
.img4 {
  top: 10%;
  left: 10%;
}
</style>
