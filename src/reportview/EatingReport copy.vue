<!-- <script setup>
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

const events = ref([])
const fullCalendar = ref(null)

// 處理日期範圍變化
async function handleDatesSet(dateInfo) {
  const startDate = formatDate(dateInfo.start)
  const endDate = formatDate(dateInfo.end)
  await geteat(startDate, endDate)
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URLgeteat = `${Base_URL}/Report/eating`;

const geteat = async (startDate, endDate) => {
  try {
    const userAccountString = sessionStorage.getItem("UserAccount");
    const userAccount = JSON.parse(userAccountString);
    
    const requestData = {
      CId: userAccount.characterID,
      StartDate: startDate,
      EndDate: endDate
    }
    
    console.log('Sending request with data:', requestData)
    
    const response = await fetch(API_URLgeteat, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Received data:', result)
      
      // 修改資料轉換邏輯
      const formattedEvents = result.map(item => ({
        title: '', // 保持空標題
        start: item.hrecordDate, // 確保這裡的屬性名稱與後端回傳的一致
        extendedProps: {
          bad: parseInt(item.bad) || 0,
          good: parseInt(item.good) || 0
        },
        allDay: true // 設置為全天事件
      }))
      

      // 更新事件
      events.value = formattedEvents
      
      // 強制更新日曆顯示
      if (fullCalendar.value) {
        const calendarApi = fullCalendar.value.getApi()
        calendarApi.removeAllEvents()
        calendarApi.addEventSource(formattedEvents)
      }
    }
  } catch (error) {
    console.error('API call failed:', error)
  }
}
const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
  events: events.value,
  datesSet: handleDatesSet,
  eventDisplay: 'block', // 添加這行來確保事件顯示
  eventContent: (arg) => {
    return {
      html: `
        <div class="event-container">
          ${arg.event.extendedProps.bad > 0 ? 
            '<i class="fa-solid fa-martini-glass" style="color: #B197FC;"></i>'.repeat(arg.event.extendedProps.bad) : ''}
          ${arg.event.extendedProps.good > 0 ? 
            '<i class="fas fa-thumbs-up text-green-500"></i>'.repeat(arg.event.extendedProps.good) : ''}
        </div>
      `
    }
  }
}
onMounted(() => {
  const currentDate = new Date()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  geteat(formatDate(firstDay), formatDate(lastDay))
})
</script>

<template>
  <div class="calendar-container">
    <FullCalendar 
      :ref="fullCalendar"
      :options="calendarOptions"
    />
  </div>
</template>

<style lang="css" scoped>
.weight-report {
  padding-left: 20px;
  padding-right: 20px;
}

.date-selector {
  margin-bottom: 20px;
}

.title {
  color: rgb(8, 37, 42);
}

.input-group {
  min-width: 100px;
}

.input-group-text {
  background-color: rgb(8, 37, 42);
  color: white;
  border: 1px solid rgb(8, 37, 42);
}

.form-control {
  border: 1px solid rgb(0, 0, 0);
}

.form-control:focus {
  border-color: rgb(8, 37, 42);
  box-shadow: 0 0 0 0.2rem rgba(12, 61, 70, 0.25);
}

.chart-container {
  width: 100%;
  height: 400px;
  margin-top: 30px;
}
</style> -->


<script setup>
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'


const events = ref([])
const fullCalendar = ref(null)

// 處理日期範圍變化
async function handleDatesSet(dateInfo) {
  const startDate = formatDate(dateInfo.start)
  const endDate = formatDate(dateInfo.end)
  await geteat(startDate, endDate)
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URLgeteat = `${Base_URL}/Report/eating`;

const geteat = async (startDate, endDate) => {
  try {
    const userAccountString = sessionStorage.getItem("UserAccount");
    const userAccount = JSON.parse(userAccountString);
    
    const requestData = {
      CId: userAccount.characterID,
      StartDate: startDate,
      EndDate: endDate
    }
    
    console.log('Sending request:', requestData); // 添加日誌

    const response = await fetch(API_URLgeteat, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('API response:', result); // 添加日誌
      
      // 將API回傳的數據轉換為日曆事件格式
      const formattedEvents = result.map(item => {
        // 確保日期格式正確
        const eventDate = item.hrecordDate.split('T')[0]; // 處理可能的 ISO 格式
        console.log('Processing date:', eventDate, 'good:', item.good, 'bad:', item.bad); // 添加日誌
        
        return {
        start: eventDate,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: '#000000',
        allDay: true,
        display: 'block',
        extendedProps: {
            imagePath: getEventImage(item.good, item.bad),
             good: item.good,
            bad: item.bad
          }
  };
      });
      
      console.log('Formatted events:', formattedEvents); // 添加日誌
      
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
    console.error('API call failed:', error);
  }
}

// 根據 good 和 bad 值決定顯示的文字
// function getEventTitle(good, bad) {
//   let title = '';
//   if (good > 0) title += 'GOOD ';
//   if (bad > 0) title += 'BAD';
//   return title.trim();
// }
function getEventImage(good, bad) {
  if (good > 0 && bad > 0) return '/images/Good.png, /images/Bad.png';  // 如果都有就返回兩個圖片的路徑
  if (good > 0) return '/images/Good.png';
  if (bad > 0) return '/images/Bad.png';
  return '';
}

// const calendarOptions = {
//   plugins: [dayGridPlugin],
//   initialView: 'dayGridMonth',
//   headerToolbar: {
//     left: 'prev,next today',
//     center: 'title',
//     right: ''
//   },
//   events: events.value,
//   datesSet: handleDatesSet,
//   eventDisplay: 'block',
//   displayEventTime: false,
//   height: 'auto',
// contentHeight: 450,
// aspectRatio: 1.35,
// fixedWeekCount: false, // 添加這行來防止顯示下個月的日期
//   showNonCurrentDates: false, // 可選：完全隱藏非當前月份的日期
//   eventContent: (arg) => {
//     const imagePath = arg.event.extendedProps.imagePath;
//     if (!imagePath) return null;
    
//     return {
//       html: `<div class="event-content">
//         <img src="${imagePath}" alt="Event Status" style="width: 20px; height: 20px;"/>
//       </div>`
//     }
//   }
// }

const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
  events: events.value,
  datesSet: handleDatesSet,
  eventDisplay: 'block',
  displayEventTime: false,
  height: 'auto',
  contentHeight: 450,
  aspectRatio: 1.35,
  fixedWeekCount: false,
  showNonCurrentDates: false,
  eventContent: (arg) => {
    const { good, bad } = arg.event.extendedProps;
    let html = '<div class="event-content">';
    
    // 如果同時有 good 和 bad
    if (good > 0 && bad > 0) {
      html += `
        <img src="/images/Good.png" alt="Good" style="width: 20px; height: 20px; display: inline-block; margin-right: 5px;"/>
        <img src="/images/Bad.png" alt="Bad" style="width: 20px; height: 20px; display: inline-block;"/>
      `;
    }
    // 只有 good
    else if (good > 0) {
      html += `<img src="/images/Good.png" alt="Good" style="width: 20px; height: 20px;"/>`;
    }
    // 只有 bad
    else if (bad > 0) {
      html += `<img src="/images/Bad.png" alt="Bad" style="width: 20px; height: 20px;"/>`;
    }
    
    html += '</div>';
    
    return { html };
  }
}

onMounted(() => {
  // 獲取當前月份的第一天和最後一天
  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  console.log('Initial date range:', formatDate(firstDay), 'to', formatDate(lastDay)); // 添加日誌
  geteat(formatDate(firstDay), formatDate(lastDay));
})
</script>

<template>
  <div class="calendar-container">
    <FullCalendar 
      ref="fullCalendar"
      :options="calendarOptions"
    />
  </div>
</template>

<style scoped>
.calendar-container {
  width: 100%;
  height: 100%;
  max-width: 780px; /* 912px - 右側按鈕空間(100px) - 左右padding(32px) */
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
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
  min-height: 45px !important;
  padding: 2px !important;
}

:deep(.fc-day-header) {
  padding: 2px !important;
}

:deep(.event-container) {
  padding: 1px;
  font-size: 0.9em;
  display: flex;
  justify-content: center;
  gap: 2px;
}

:deep(.fc-daygrid-event) {
  margin: 1px 0 !important;
  padding: 1px !important;
}

:deep(.fc-event-title) {
  padding: 0 !important;
}

:deep(.fc-view-harness) {
  height: auto !important;
}

/* 設定整體日曆背景色 */
:deep(.fc-theme-standard) {
  background-color: #abd1c5; 
}

/* 設定日期數字的顏色 */
:deep(.fc-daygrid-day-number) {
  color: #212f3c; /* 深色文字 */
}

/* 設定星期幾的顏色 */
:deep(.fc-col-header-cell) {
  background-color: #96274a; /* 稍深的米色 */
}
:deep(a.fc-col-header-cell-cushion) {
  color: #de747d !important; /* 強制應用顏色 */
  text-decoration: none; /* 移除下劃線，保持文字整潔 */
}

/* 設定今天的樣式 */
:deep(.fc-day-today) {
  background-color: #f0d9b5 !important; /* 特殊的今天顏色 */
}

.event-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px;
}

.event-content img {
  display: inline-block;
  vertical-align: middle;
}

</style>