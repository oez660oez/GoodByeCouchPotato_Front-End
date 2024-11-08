<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
const startDate = ref('');
const endDate = ref('');
const today = new Date();
const todayString = today.toISOString().split('T')[0];
//------呼叫API-----------------------------
const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URLgetstep = `${Base_URL}/Report/step`;
const userAccountString = sessionStorage.getItem("UserAccount");
const userAccount = JSON.parse(userAccountString);

const data=ref({
   CId:  userAccount.characterID,
   StartDate:startDate.value,
   EndDate:endDate.value
})
const getstep = async (data) => {
  console.log(data.value)
  var response = await fetch(API_URLgetstep, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data.value),
  });
  if(response.ok){
    const result = await response.json();
    console.log(result);
    const formattedData = formatStepRecords(result);
    console.log(formattedData)
    updateChart(formattedData);
  }
}

//+8時區
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const formatStepRecords = (stepRecords) => {
  console.log('收到的步數記錄:', stepRecords);
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const dateRange = [];

  // 建立日期範圍
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    dateRange.push(new Date(d));
  }

  // 填補缺失的日期
  return dateRange.map(date => {
    const dateString = formatDate(date);
    const record = stepRecords.find(record => record.hrecordDate.toString() === dateString);
    console.log('處理日期:', dateString, '找到的記錄:', record);
    
    let stepValue = 0;
    if (record && record.step) {
      stepValue = record.step;
      console.log(`日期 ${dateString} 的步數:`, stepValue);
    }
    
    return {
      date: dateString,
      step: stepValue
    };
  });
};

//------呼叫APIend-----------------------------

//------日期----------------------------------
// 計算絕對最小日期，確保在模板中可使用
const absoluteMinDate = computed(() => '2024-01-01');
const absoluteEndMinDate = computed(() => '2024-01-31');
const maxEndDate = computed(() => todayString);


//初始化日期
onMounted(() => {
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startDate.value = formatDate(firstDayOfMonth); // 使用本地格式化日期
  endDate.value = todayString; // 今天的日期
  data.value.StartDate=startDate.value;
  data.value.EndDate=endDate.value;
  getstep(data);
  initChart();
});

//@change="handleStartDateChange"時呼叫
const handleStartDateChange = (event) => {
  const selectedStart = new Date(event.target.value);
  const currentEnd = endDate.value ? new Date(endDate.value) : null;

  if (currentEnd && (currentEnd - selectedStart) / (1000 * 60 * 60 * 24) > 31) {
    const maxEnd = new Date(selectedStart);
    maxEnd.setDate(selectedStart.getDate() + 30);
    
    endDate.value = maxEnd > today ? todayString : maxEnd.toISOString().split('T')[0];
  }
  
};

//@change="handleEndDateChange"時呼叫
const handleEndDateChange = (event) => {
  const selectedEnd = new Date(event.target.value);
  const currentStart = startDate.value ? new Date(startDate.value) : null;

  if (currentStart && selectedEnd < currentStart) {
    startDate.value = event.target.value;
    return;
  }
  
  if (currentStart && (selectedEnd - currentStart) / (1000 * 60 * 60 * 24) > 30) {
    const minStart = new Date(selectedEnd);
    minStart.setDate(selectedEnd.getDate() - 31);
    startDate.value = minStart.toISOString().split('T')[0];
  }
  
};
//------日期end-----------------------------

//------圖表--------------------------------
const chartRef = ref(null);
let myChart = null;

// 初始化圖表
const initChart = () => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value);
    updateChart();
  }
};


// 更新圖表數據
const updateChart = (formattedData) => {
  if (!myChart || !startDate.value || !endDate.value || !formattedData) return;

  const option = {
    title: {
      text: '步數統計',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        if (!params[0].value && params[0].value !== 0) return `${params[0].name} 無記錄`;
    // 這裡直接返回步數數值即可,不需要轉換時間格式
    return `${params[0].name} 步數: ${params[0].value}`;
      }
    },
    xAxis: {
    type: 'category',
    data: formattedData.map(item => item.date),
    axisLabel: {
        rotate: 45,  // 旋轉標籤
        interval: 0,  // 強制顯示所有標籤
        margin: 15   // 增加標籤的邊距
    },
    axisTick: {
        alignWithLabel: true  // 刻度線對齊標籤
    }
    },
    yAxis: {
      type: 'value',
      name: '步數',
      // min: 0,
      // max: 50000,
      // interval: 3000,
    },
    series: [{
      data: formattedData.map(item => item.step),
      type: 'bar',
      smooth: true,
      lineStyle: {
        width: 3,
        color: '#003D79'
      },
      itemStyle: {
        color: '#003060',
        borderWidth: 0,
      },
      symbol: 'circle',
      symbolSize: 8
    }],
    grid: {
        left: '3%',      // 左邊距離
        right: '3%',     // 右邊距離
        bottom: '10%',   // 底部距離（因為X軸標籤旋轉了45度，所以需要留更多空間）
        // top: '15%',      // 頂部距離
        containLabel: true  // 確保刻度標籤在容器內
    },
  };

  // 設置加載動畫
  // myChart.showLoading();
  // setTimeout(() => {
  //   myChart.hideLoading();
    myChart.setOption(option);
  // }, 300);
};

// 修改監聽器
watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    data.value.StartDate = newStart;
    data.value.EndDate = newEnd;
    getstep(data);
  }
});
//------圖表end-----------------------------
</script>

<template>
  <div class="sleep-report">
    <div class="date-selector">
      <h6 class="title">
        <i class="fa-regular fa-calendar"></i> 選擇日期範圍(每次查詢區間最多31天喔~)
      </h6>
      <div class="input-group">
        <input 
          type="date" 
          v-model="startDate" 
          :max="endDate"
          :min="absoluteMinDate"
          @change="handleStartDateChange"
          name="starttime" 
          id="starttime" 
          class="form-control" 
        />
        <span class="input-group-text">到</span>
        <input 
          type="date" 
          v-model="endDate" 
          :min="absoluteEndMinDate"
          :max="maxEndDate"
          @change="handleEndDateChange"
          name="endtime" 
          id="endtime" 
          class="form-control" 
        />
      </div>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<style lang="css" scoped>
.sleep-report {
  padding-left: 20px;
  padding-right: 20px;
}

.date-selector {
  margin-bottom: 20px;
}

.title {
  /* margin-bottom: 10px; */
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