<template>
  <div ref="shadowRootContainer"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { createApp, h } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

// 設定需要顯示圖片的日期陣列和圖片 URL
const specialDates = ['2024-10-10', '2024-10-15', '2024-10-20'];
const imageUrl = '/images/Good.png'; // 單一圖片 URL

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
  events: specialDates.map((date) => ({
    start: date,
    display: 'background', // 設置為背景事件
    extendedProps: {
      imageUrl: imageUrl
    }
  })),
  eventContent: function (info) {
    if (
      info.event.display === 'background' &&
      info.event.extendedProps.imageUrl
    ) {
      // 插入同一張圖片
      return {
        html: `<div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                  <img src="${info.event.extendedProps.imageUrl}" alt="Event Image" style="max-width: 100%; max-height: 100%; " />
               </div>`
      };
    }
    return { html: `<span>${info.event.title}</span>` };
  },
  datesSet() {
    // 選取每個日期格
    const dayCells = document.querySelectorAll('.fc-daygrid-day');

    dayCells.forEach((dayCell) => {
      const date = dayCell.getAttribute('data-date'); // 取得日期
      const position = dayCell.getBoundingClientRect(); // 取得位置和尺寸

      console.log(`Date: ${date}, Position:`, position); // 輸出每個日期的位置
    });
  }
};
const shadowRootContainer = ref(null);

onMounted(() => {
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
});
</script>

<style scoped>
/* 自定義樣式僅應用於 Shadow DOM 中的日曆 */
</style>
