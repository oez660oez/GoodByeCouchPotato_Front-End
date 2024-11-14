<script setup>
import { ref, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";

const events = ref([]);
const fullCalendar = ref(null);

// 處理日期範圍變化
async function handleDatesSet(dateInfo) {
  const startDate = formatDate(dateInfo.start);
  const endDate = formatDate(dateInfo.end);
  await geteat(startDate, endDate);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URLgetweekly = `${Base_URL}/Report/weekly`;

const geteat = async (startDate, endDate) => {
  try {
    const userAccountString = sessionStorage.getItem("UserAccount");
    const userAccount = JSON.parse(userAccountString);

    const requestData = {
      CId: userAccount.characterID,
      StartDate: startDate,
      EndDate: endDate,
    };

    console.log("Sending request:", requestData); // 添加日誌

    const response = await fetch(API_URLgetweekly, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("API response:", result); // 添加日誌

      // 將API回傳的數據轉換為日曆事件格式
      const formattedEvents = result.map((item) => {
        // 確保日期格式正確
        const eventDate = item.hrecordDate.split("T")[0]; // 處理可能的 ISO 格式
        console.log(
          "Processing date:",
          eventDate,
          "sport:",
          item.sport,
          "cleaning:",
          item.cleaning
        ); // 添加日誌

        return {
          start: eventDate,
          backgroundColor: "transparent",
          borderColor: "transparent",
          textColor: "#000000",
          allDay: true,
          display: "block",
          extendedProps: {
            imagePath: getEventImage(item.sport, item.cleaning),
            // sport: item.sport,
            cleaning: item.cleaning,
          },
        };
      });

      console.log("Formatted events:", formattedEvents); // 添加日誌

      // 更新事件
      events.value = formattedEvents;

      // 強制更新日曆顯示
      if (fullCalendar.value) {
        const calendarApi = fullCalendar.value.getApi();
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(formattedEvents);
      }
    }
  } catch (error) {
    console.error("API call failed:", error);
  }
};

function getEventImage(sport, cleaning) {
  // if (sport == true && cleaning == true) return '/images/Good.png, /images/Bad.png';  // 如果都有就返回兩個圖片的路徑
  // if (sport == true) return '/images/Good.png';
  if (cleaning == true) return "/images/V.png";
  return "";
}

const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: "dayGridMonth",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "",
  },
  events: events.value,
  datesSet: handleDatesSet,
  eventDisplay: "block",
  displayEventTime: false,
  height: "auto",
  contentHeight: 450,
  aspectRatio: 1.35,
  fixedWeekCount: false,
  showNonCurrentDates: false,
  eventContent: (arg) => {
    const { sport, cleaning } = arg.event.extendedProps;
    let html = '<div class="event-content-wrapper">'; // 添加一個包裝容器

    // 如果同時有 good 和 bad
    if (sport == true && cleaning == true) {
      html += `
        <div class="event-content">
          <img src="/images/V.png" alt="Good" class="event-icon"/>
          <img src="/images/V.png" alt="Bad" class="event-icon"/>
        </div>
      `;
    }
    // 只有 good
    else if (sport == true) {
      html += `
        <div class="event-content">
          <img src="/images/V.png" alt="V" class="event-icon"/>
        </div>
      `;
    }
    // 只有 bad
    else if (cleaning == true) {
      html += `
        <div class="event-content">
          <img src="/images/V.png" alt="V" class="event-icon"/>
        </div>
      `;
    }

    html += "</div>";

    return { html };
  },
};

onMounted(() => {
  // 獲取當前月份的第一天和最後一天
  const currentDate = new Date();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  console.log(
    "Initial date range:",
    formatDate(firstDay),
    "to",
    formatDate(lastDay)
  ); // 添加日誌
  geteat(formatDate(firstDay), formatDate(lastDay));
});
</script>

<template>
  <div class="calendar-container">
    <h5 class="calendar-title">環境整理</h5>
    <FullCalendar ref="fullCalendar" :options="calendarOptions" />
  </div>
</template>

<style scoped>
.calendar-container {
  width: 100%;
  height: 100%;
  max-width: 720px;
  max-height: 500px;
  margin: 0 auto;
  padding: 0;
  overflow: auto;
}

:deep(.fc) {
  width: 100%;
  height: 100%;
  font-size: 1em;
  background-color: transparent;
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

/* 設定整體日曆背景色 */
:deep(.fc-theme-standard) {
  /* background-color: #cbc3ab;  */
  background-color: #d4ad69;
  border: #ffffff solid 1px;
}

/* 設定日期數字的顏色 */
:deep(.fc-daygrid-day-number) {
  color: #3f2f18;
}

/* 設定星期幾的顏色 */
:deep(.fc-col-header-cell) {
  background-color: #1c2108;
}

:deep(a.fc-col-header-cell-cushion) {
  color: #dbe3df !important;
  text-decoration: none;
}

/* 設定今天的樣式 */
:deep(.fc-day-today) {
  background-color: #f0d9b5 !important;
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
