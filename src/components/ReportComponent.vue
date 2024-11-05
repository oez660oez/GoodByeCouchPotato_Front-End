<template>
  <div id="formborder">
    <div ref="chartRef" id="form" style="width: 100%; height: 100%"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { useReportDataStore } from '@/Stores/reportDataStore';
import { format, eachDayOfInterval } from 'date-fns';

const props = defineProps({
  currentChart: String,
  selectedMonth: String // 接收選擇的月份
});

const getreportData = useReportDataStore();

const chartRef = ref(null);
let chartInstance = null;

const waterData = ref([]);
const stepsData = ref([]);
const sleepData = ref([]);
const moodData = ref([]);
const labels = ref([]);
const allDates = ref([]);

// 生成每兩天的日期
const generateMonthDates = (selectedMonth) => {
  const [year, month] = selectedMonth.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // 該月最後一天
  const allDates = eachDayOfInterval({ start: startDate, end: endDate }).map(
    (date) => format(date, 'yyyy-MM-dd')
  );

  // 選取每隔一天的日期
  return allDates.filter((_, index) => index % 2 === 0);
};
// 篩選並處理當月的資料
const filterDataByMonth = () => {
  const allData = getreportData.Data; // 從 getreportData 取出資料
  allDates.value = generateMonthDates(props.selectedMonth);

  // 根據 selectedMonth 篩選符合該月份的資料
  const filteredData = allData.filter((record) => {
    const recordMonth = record.hrecordDate.slice(0, 7); // 提取 YYYY-MM 格式
    return recordMonth === props.selectedMonth;
  });

  // 建立一個日期到資料的映射
  const dataMap = {};
  filteredData.forEach((record) => {
    dataMap[record.hrecordDate] = record;
  });

  // 將資料按照 allDates 補齊缺失的日期，使用 0 填補缺失數據
  waterData.value = allDates.value.map((date) =>
    dataMap[date] ? dataMap[date].water : 0
  );

  stepsData.value = allDates.value.map((date) =>
    dataMap[date] ? dataMap[date].steps : 0
  );

  sleepData.value = allDates.value.map((date) =>
    dataMap[date] ? convertTimeToHourDecimal(dataMap[date].sleep) : 0
  );

  moodData.value = allDates.value.map((date) =>
    dataMap[date] ? moodToValue[dataMap[date].mood] : 0
  );
  // console.log('4555', moodData.value);
  labels.value = filteredData.map((record) => record.hrecordDate);
};

// 將時間轉換為小時的十進制格式
const convertTimeToHourDecimal = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + minutes / 60;
};

const moodToValue = {
  不透露: 0,
  不開心: 1,
  有點不開心: 2,
  普通: 3,
  開心: 4,
  非常開心: 5
};

// 初始化圖表
const initializeChart = () => {
  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
  }
  if (!chartInstance) return;

  let chartOptions = {
    title: { text: '飲水量' },
    xAxis: { type: 'category', data: allDates.value },
    yAxis: {
      type: 'value',
      min: 0,
      max: 6000,
      axisLabel: { formatter: '{value} ml' }
    },
    series: [
      {
        name: 'Water Intake (ml)',
        type: 'bar',
        data: waterData.value,
        itemStyle: { color: 'rgba(75, 192, 192, 1)' }
      }
    ]
  };

  if (props.currentChart === 'steps') {
    chartOptions = {
      title: { text: '步數' },
      xAxis: { type: 'category', data: allDates.value },
      yAxis: {
        type: 'value',
        min: 0,
        max: 10000,
        axisLabel: { formatter: '{value}步' }
      },
      series: [
        {
          name: '步數',
          type: 'bar',
          data: stepsData.value,
          itemStyle: { color: 'orange' }
        }
      ]
    };
  } else if (props.currentChart === 'sleep') {
    chartOptions = {
      title: { text: '入睡時間' },
      xAxis: { type: 'category', data: allDates.value },
      yAxis: {
        type: 'value',
        min: 0,
        max: 24,
        axisLabel: {
          formatter: (value) => {
            const hours = Math.floor(value);
            const minutes = Math.round((value - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}`;
          }
        }
      },
      series: [
        {
          name: 'Sleep Start Time',
          type: 'line',
          data: sleepData.value,
          itemStyle: { color: 'purple' }
        }
      ]
    };
  } else if (props.currentChart === 'mood') {
    chartOptions = {
      title: { text: '心情' },
      xAxis: { type: 'category', data: allDates.value },
      yAxis: {
        type: 'value',
        min: 0,
        max: 5,
        axisLabel: {
          formatter: (value) => {
            const moodLabels = [
              '不透露',
              '不開心',
              '有點不開心',
              '普通',
              '開心',
              '非常開心'
            ];
            return moodLabels[value];
          }
        }
      },
      series: [
        {
          type: 'line',
          data: moodData.value,
          itemStyle: { color: 'blue' },
          connectNulls: true
        }
      ]
    };
  }

  chartInstance.setOption(chartOptions);
};

// 掛載時初始化圖表和數據
onMounted(() => {
  filterDataByMonth();
  initializeChart();
});

// 監聽 currentChart 和 selectedMonth 的變更
watch(
  () => props.currentChart,
  () => {
    initializeChart();
  }
);

watch(
  () => props.selectedMonth,
  (newMonth) => {
    console.log('選擇的月份已更新:', newMonth);
    filterDataByMonth();
    initializeChart();
  }
);
</script>

<style lang="css" scoped>
.chart-container {
  width: 100%;
  height: 80%;
}

#formborder {
  display: flex;
  justify-content: flex-end;
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
  background-image: url('@/components/image/form.png');
}

#form {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
