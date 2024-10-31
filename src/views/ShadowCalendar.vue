<template>
  <div ref="shadowRootContainer"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { createApp, h } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useReportDataStore } from '@/Stores/reportDataStore';

const getreportData = useReportDataStore();

// 設定需要顯示圖片的日期陣列和圖片 URL
const dailyhealthData = ref([]);
const specialDates = ref([]);
const vegetables = ref([]);
const snacks = ref([]);

const imageUrl1 = '/images/Good.png'; // 第一張圖片 URL
const imageUrl2 = '/images/Bad.png'; // 第二張圖片 URL

const getData = () => {
  console.log('data', getreportData.Data);
  dailyhealthData.value = getreportData.Data;
  specialDates.value = dailyhealthData.value.map((item) => item.hrecordDate);
  console.log('特定日期:', specialDates.value);
  vegetables.value = dailyhealthData.value.map((item) => item.vegetables);
  console.log(vegetables.value);
  snacks.value = dailyhealthData.value.map((item) => item.snacks);
  console.log(snacks.value);
};

// FullCalendar 配置
const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  buttonText: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day'
  },
  events: specialDates.value.map((date) => ({
    start: date,
    display: 'background'
  })) // eventContent: function (info) {
  //   if (
  //     info.event.display === 'background' &&
  //     info.event.extendedProps.imageUrl
  //   ) {
  //     // 插入同一張圖片
  //     return {
  //       html: `<div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
  //                 <img src="${info.event.extendedProps.imageUrl}" alt="Event Image" style="max-width: 100%; max-height: 100%; " />
  //              </div>`
  //     };
  //   }
  //   return { html: `<span>${info.event.title}</span>` };
  // },
  // datesSet() {
  //   // 選取每個日期格
  //   const dayCells = document.querySelectorAll('.fc-daygrid-day');

  //   dayCells.forEach((dayCell) => {
  //     const date = dayCell.getAttribute('data-date'); // 取得日期
  //     const position = dayCell.getBoundingClientRect(); // 取得位置和尺寸

  //     console.log(`Date: ${date}, Position:`, position); // 輸出每個日期的位置
  //   });
  // }
};
const shadowRootContainer = ref(null);

onMounted(() => {
  getData();
  // 創建 Shadow DOM
  const shadowRoot = shadowRootContainer.value.attachShadow({ mode: 'open' });

  // 創建一個 FullCalendar 的容器
  const calendarContainer = document.createElement('div');
  shadowRoot.appendChild(calendarContainer);

  // 使用 createApp 動態加載 FullCalendar 到 Shadow DOM
  const app = createApp({
    render() {
      return h(FullCalendar, {
        options: calendarOptions
      });
    }
  });

  app.mount(calendarContainer);

  // 使用 MutationObserver 監聽日期格的變動
  const observer = new MutationObserver(() => {
    const dayCells = shadowRoot.querySelectorAll('.fc-daygrid-day');
    dayCells.forEach((dayCell) => {
      const date = dayCell.getAttribute('data-date');
      if (specialDates.value.includes(date)) {
        // 插入第一張圖片
        if (!dayCell.querySelector('img.img1')) {
          const img1 = document.createElement('img');
          img1.src = imageUrl1;
          img1.alt = 'Event Image 1';
          img1.className = 'img1';
          img1.style.width = '40%';
          img1.style.height = '40%';
          img1.style.position = 'absolute';
          img1.style.top = '10%';
          img1.style.left = '10%';
          dayCell.appendChild(img1);
        }

        // 插入第二張圖片
        if (!dayCell.querySelector('img.img2')) {
          const img2 = document.createElement('img');
          img2.src = imageUrl2;
          img2.alt = 'Event Image 2';
          img2.className = 'img2';
          img2.style.width = '40%';
          img2.style.height = '40%';
          img2.style.position = 'absolute';
          img2.style.top = '50%';
          img2.style.left = '50%';
          dayCell.appendChild(img2);
        }
      }
    });
  });

  // 開始觀察日曆容器中的變動
  observer.observe(calendarContainer, { childList: true, subtree: true });
});

// 監聽 getreportData.Data 的變化
watch(
  () => getreportData.Data,
  () => {
    getData(); // 當 getreportData.Data 改變時執行 getData
  }
);
</script>

<style scoped>
/* 自定義樣式僅應用於 Shadow DOM 中的日曆 */
</style>
