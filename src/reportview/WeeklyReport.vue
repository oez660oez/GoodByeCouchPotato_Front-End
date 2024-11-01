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
  height: 'auto',
contentHeight: 'auto',
aspectRatio: 1.5,
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
</style>