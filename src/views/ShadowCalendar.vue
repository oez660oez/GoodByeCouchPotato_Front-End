<template>
  <div ref="shadowRootContainer" class="calendar-container"></div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { createApp, h } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useReportDataStore } from "@/Stores/reportDataStore";

const getreportData = useReportDataStore();

const dailyhealthData = ref([]);
const specialDates = ref([]);
const vegetables = ref([]);
const snacks = ref([]);
const datesWithVegetables = ref([]);
const datesWithSnacks = ref([]);

const imageUrl1 = "/images/Good.png";
const imageUrl2 = "/images/Bad.png";

const getData = () => {
  dailyhealthData.value = getreportData.Data;
  specialDates.value = dailyhealthData.value.map((item) => item.hrecordDate);
  vegetables.value = dailyhealthData.value.map((item) => item.vegetables);
  snacks.value = dailyhealthData.value.map((item) => item.snacks);

  datesWithVegetables.value = specialDates.value.filter(
    (date, index) => vegetables.value[index] > 0
  );
  datesWithSnacks.value = specialDates.value.filter(
    (date, index) => snacks.value[index] > 0
  );
};

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin],
  headerToolbar: {
    left: "prev",
    center: "title",
    right: "next",
  },
  contentHeight: "auto", // 自動調整日曆高度
  events: specialDates.value.map((date) => ({
    start: date,
    display: "background",
  })),
};

const shadowRootContainer = ref(null);

onMounted(() => {
  getData();
  const shadowRoot = shadowRootContainer.value.attachShadow({ mode: "open" });

  const calendarContainer = document.createElement("div");
  shadowRoot.appendChild(calendarContainer);

  const app = createApp({
    render() {
      return h(FullCalendar, {
        options: calendarOptions,
      });
    },
  });

  app.mount(calendarContainer);

  const observer = new MutationObserver(() => {
    const dayCells = shadowRoot.querySelectorAll(".fc-daygrid-day");
    dayCells.forEach((dayCell) => {
      const date = dayCell.getAttribute("data-date");
      if (
        datesWithVegetables.value.includes(date) &&
        !dayCell.querySelector("img.img1")
      ) {
        const img1 = document.createElement("img");
        img1.src = imageUrl1;
        img1.alt = "Event Image 1";
        img1.className = "img1";
        dayCell.appendChild(img1);
      }

      if (
        datesWithSnacks.value.includes(date) &&
        !dayCell.querySelector("img.img2")
      ) {
        const img2 = document.createElement("img");
        img2.src = imageUrl2;
        img2.alt = "Event Image 2";
        img2.className = "img2";
        dayCell.appendChild(img2);
      }
    });
  });

  observer.observe(calendarContainer, { childList: true, subtree: true });
});

watch(
  () => getreportData.Data,
  () => {
    getData();
  }
);
</script>

<style scoped>
/* 主日曆容器 */
.calendar-container {
  width: 60%;
  max-width: 900px;
  margin-top: 50px;
  margin-bottom: 20px;
  margin-right: 0;
  overflow: hidden; /* 禁止外層滾動 */
}

/* 調整日期格和標題樣式 */
.fc-toolbar-title {
  font-size: 1em;
  text-align: center;
}

.fc-daygrid-day {
  overflow: hidden; /* 隱藏超出內容 */
  height: 10px; /* 調整高度 */
  width: 50px; /* 調整寬度 */
  white-space: nowrap;
}

.fc .fc-scroller {
  overflow: hidden !important; /* 禁止 FullCalendar 滾動 */
}

/* 圖片樣式調整 */
.img1,
.img2 {
  width: 40%;
  height: 40%;
  position: absolute;
  z-index: 10; /* 確保圖片在其他元素之上 */
}

.img1 {
  top: 10%;
  left: 10%;
}

.img2 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 中心對齊 */
}

.fc-daygrid {
  overflow: hidden;
}

.fc-view-harness {
  overflow: hidden;
}
</style>
