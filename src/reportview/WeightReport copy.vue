<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const startMonth = ref('');
const endMonth = ref('');
const today = new Date();

//------呼叫API-----------------------------
const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URLgetweight = `${Base_URL}/Report/weight`;
const userAccountString = sessionStorage.getItem("UserAccount");
const userAccount = JSON.parse(userAccountString);

const data = ref({
  CId: userAccount.characterID,
  StartDate: startMonth.value,
  EndDate: endMonth.value
});

const getWeight = async (data) => {
  console.log('Sending data:', data.value);
  var response = await fetch(API_URLgetweight, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data.value),
  });
  if (response.ok) {
    const result = await response.json();
    console.log(result);
    const formattedData = formatWeightRecords(result);
    console.log(formattedData);
    updateChart(formattedData);
  }
};

//格式化月份
// const formatMonth = (date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   return `${year}-${month}`;
// };

// 獲取月份最後一天的輔助函數
const getLastDayOfMonth = (year, month) => {
  // 月份是 0-based，所以我們用下個月的第 0 天來取得當月最後一天
  return new Date(year, month, 0).getDate();
};

// 修改後的 formatMonth 函數
const formatMonth = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const lastDay = getLastDayOfMonth(year, parseInt(month));
  return `${year}-${month}-${lastDay}`;
};


const formatWeightRecords = (weightRecords) => {
  console.log('收到體重記錄:', weightRecords); // 加入除錯用訊息

  const start = new Date(startMonth.value + '-01');
  const end = new Date(endMonth.value + '-01');
  const monthRange = [];

  // 建立月份範圍
  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    monthRange.push(new Date(d));
  }

  // 先將所有體重記錄轉換成月份對應的格式
  const monthlyRecords = {};
  weightRecords.forEach(record => {
    const date = new Date(record.hrecordDate);
    const monthKey = formatMonth(date);
    monthlyRecords[monthKey] = record.weight;
  });

  console.log('月份對應體重:', monthlyRecords); // 除錯用

  // 填補缺失的月份
  let lastWeight = null; // 記錄上一個有效的體重值

  return monthRange.map((date, index) => {
    const monthString = formatMonth(date);
    console.log(`處理月份 ${monthString}`); // 除錯用
    
    let weightValue = null;

    // 如果當月有記錄，使用當月記錄
    if (monthlyRecords[monthString]) {
      weightValue = monthlyRecords[monthString];
      lastWeight = weightValue; // 更新最後的有效體重
      console.log(`找到當月體重: ${weightValue}`);
    } 
    // 如果當月沒有記錄但有上個月的體重，使用上個月的體重
    else if (lastWeight !== null) {
      weightValue = lastWeight;
      console.log(`使用上個月體重: ${weightValue}`);
    }
    
    return {
      month: monthString,
      weight: weightValue
    };
  });
};

//------日期----------------------------------
// 計算絕對最小日期和最大日期
const absoluteMinMonth = computed(() => '2024-01');
const maxEndMonth = computed(() => formatMonth(today));

//初始化日期
onMounted(() => {
  // 設置初始日期範圍為最近12個月
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);
 
  const minDate = new Date('2024-01-01');
  if (startDate < minDate) {
    startDate.setTime(minDate.getTime());
  }
  
  startMonth.value = formatMonth(startDate).slice(0, 7); // 只保留 YYYY-MM
  endMonth.value = formatMonth(endDate).slice(0, 7);     // 只保留 YYYY-MM
  
  // 使用月底日期
  const startLastDay = getLastDayOfMonth(startDate.getFullYear(), startDate.getMonth() + 1);
  const endLastDay = getLastDayOfMonth(endDate.getFullYear(), endDate.getMonth() + 1);
  
  data.value.StartDate = `${startMonth.value}-${startLastDay}`;
  data.value.EndDate = `${endMonth.value}-${endLastDay}`;

  getWeight(data);
  initChart();
});

// const handleStartMonthChange = (event) => {
//   const selectedStart = new Date(event.target.value + '-01');
//   const currentEnd = new Date(endMonth.value + '-01');

//   // 確保不超過12個月
//   if ((currentEnd - selectedStart) / (1000 * 60 * 60 * 24 * 30) > 12) {
//     const maxEnd = new Date(selectedStart);
//     maxEnd.setMonth(maxEnd.getMonth() + 11);
//     endMonth.value = formatMonth(maxEnd);
//   }
//   data.value.StartDate = event.target.value + '-01';
//   getWeight(data);
 
// };

// const handleEndMonthChange = (event) => {
//   const selectedEnd = new Date(event.target.value + '-01');
//   const currentStart = new Date(startMonth.value + '-01');

//   if (selectedEnd < currentStart) {
//     startMonth.value = event.target.value;
//     return;
//   }

//   if ((selectedEnd - currentStart) / (1000 * 60 * 60 * 24 * 30) > 12) {
//     const minStart = new Date(selectedEnd);
//     minStart.setMonth(minStart.getMonth() - 11);
//     startMonth.value = formatMonth(minStart);
//   }
//   data.value.EndDate = event.target.value + '-01';
//   getWeight(data);
// };

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
  if (!myChart || !startMonth.value || !endMonth.value || !formattedData) return;

  const option = {
    title: {
      text: '體重變化統計',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        if (!params[0].value && params[0].value !== 0) return `${params[0].name} 無記錄`;
        return `${params[0].name} 體重: ${params[0].value}kg`;
      }
    },
    xAxis: {
      type: 'category',
      data: formattedData.map(item => item.month),
      axisLabel: {
        rotate: 45,
        interval: 0,
        margin: 15
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '體重(kg)',
      scale: true
    },
    series: [{
      data: formattedData.map(item => item.weight),
      type: 'line',
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
      symbolSize: 8,
      connectNulls: true
    }],
    grid: {
      left: '3%',
      right: '3%',
      bottom: '15%',
      containLabel: true
    },
  };

  // myChart.showLoading();
  // setTimeout(() => {
  //   myChart.hideLoading();
    myChart.setOption(option);
  // }, 300);
};

// 監聽器
// watch([startMonth, endMonth], ([newStart, newEnd]) => {
//   if (newStart && newEnd) {
//     data.value.StartDate = newStart + '-01';
//     data.value.EndDate = newEnd + '-01';
//     getWeight(data);
//   }
// });

const handleStartMonthChange = (event) => {
  const selectedStart = new Date(event.target.value + '-01');
  const currentEnd = new Date(endMonth.value + '-01');

  // 確保不超過12個月
  if ((currentEnd - selectedStart) / (1000 * 60 * 60 * 24 * 30) > 12) {
    const maxEnd = new Date(selectedStart);
    maxEnd.setMonth(maxEnd.getMonth() + 11);
    endMonth.value = formatMonth(maxEnd).slice(0, 7);
  }
  
  const lastDay = getLastDayOfMonth(selectedStart.getFullYear(), selectedStart.getMonth() + 1);
  data.value.StartDate = `${event.target.value}-${lastDay}`;
  getWeight(data);
};

// 修改 handleEndMonthChange
const handleEndMonthChange = (event) => {
  const selectedEnd = new Date(event.target.value + '-01');
  const currentStart = new Date(startMonth.value + '-01');

  if (selectedEnd < currentStart) {
    startMonth.value = event.target.value;
    return;
  }

  if ((selectedEnd - currentStart) / (1000 * 60 * 60 * 24 * 30) > 12) {
    const minStart = new Date(selectedEnd);
    minStart.setMonth(minStart.getMonth() - 11);
    startMonth.value = formatMonth(minStart).slice(0, 7);
  }
  
  const lastDay = getLastDayOfMonth(selectedEnd.getFullYear(), selectedEnd.getMonth() + 1);
  data.value.EndDate = `${event.target.value}-${lastDay}`;
  getWeight(data);
};

// 修改 watch
watch([startMonth, endMonth], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    const startLastDay = getLastDayOfMonth(
      parseInt(newStart.split('-')[0]), 
      parseInt(newStart.split('-')[1])
    );
    const endLastDay = getLastDayOfMonth(
      parseInt(newEnd.split('-')[0]), 
      parseInt(newEnd.split('-')[1])
    );
    
    data.value.StartDate = `${newStart}-${startLastDay}`;
    data.value.EndDate = `${newEnd}-${endLastDay}`;
    getWeight(data);
  }
});
</script>

<template>
  <div class="weight-report">
    <div class="date-selector">
      <h6 class="title">
        <i class="fa-regular fa-calendar"></i> 選擇月份範圍(最多12個月)
      </h6>
      <div class="input-group">
        <input 
          type="month" 
          v-model="startMonth" 
          :max="endMonth"
          :min="absoluteMinMonth"
          @change="handleStartMonthChange"
          name="startMonth" 
          id="startMonth" 
          class="form-control" 
          @keydown.prevent
        />
        <span class="input-group-text">到</span>
        <input 
          type="month" 
          v-model="endMonth" 
          :min="startMonth"
          :max="maxEndMonth"
          @change="handleEndMonthChange"
          name="endMonth" 
          id="endMonth" 
          class="form-control" 
          @keydown.prevent
        />
      </div>
    </div>
    <div ref="chartRef" class="chart-container"></div>
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