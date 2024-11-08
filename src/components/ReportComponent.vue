<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { useReportDataStore } from '@/Stores/reportDataStore';
import { format, eachDayOfInterval } from 'date-fns';

const props = defineProps({
  currentChart: String,
  selectedMonth: String
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
  const endDate = new Date(year, month, 0);
  const allDates = eachDayOfInterval({ start: startDate, end: endDate }).map(
    (date) => format(date, 'yyyy-MM-dd')
  );
  return allDates.filter((_, index) => index % 2 === 0);
};

// 篩選並處理當月的資料
const filterDataByMonth = () => {
  const allData = getreportData.Data;
  allDates.value = generateMonthDates(props.selectedMonth);

  const filteredData = allData.filter((record) => {
    const recordMonth = record.hrecordDate.slice(0, 7);
    return recordMonth === props.selectedMonth;
  });

  const dataMap = {};
  filteredData.forEach((record) => {
    dataMap[record.hrecordDate] = record;
  });

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
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const dataPoint = params[0];
        if (!dataPoint) return '無數據';
        return `${dataPoint.name} ${chartOptions.title.text}: ${dataPoint.value} ml`;
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'black',
          width: 1,
          type: 'dashed'
        }
      }
    },
    xAxis: {
      type: 'category',
      data: allDates.value,
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
      min: 0,
      max: 6000,
      axisLabel: { formatter: '{value} ml' }
    },
    series: [
      {
        name: 'Water Intake (ml)',
        type: 'bar',
        data: waterData.value,
        itemStyle: { color: '#82b1ff' }
      }
    ],
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      containLabel: true
    }
  };

  if (props.currentChart === 'steps') {
    chartOptions.title.text = '步數';
    chartOptions.yAxis.max = 10000;
    chartOptions.yAxis.axisLabel.formatter = '{value} 步';

    chartOptions.series[0].data = stepsData.value;
    chartOptions.series[0].itemStyle.color = '#ffae42';
    chartOptions.tooltip.formatter = function (params) {
      const dataPoint = params[0];
      return `${dataPoint.name} ${chartOptions.title.text}: ${dataPoint.value} 步`;
    };
  } else if (props.currentChart === 'sleep') {
    chartOptions.title.text = '入睡時間';
    chartOptions.yAxis = {
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
    };
    chartOptions.series = [
      {
        type: 'line',
        data: sleepData.value,
        itemStyle: { color: '#4a6572' }
      }
    ];
    chartOptions.tooltip.formatter = function (params) {
      const dataPoint = params[0];
      const hours = Math.floor(dataPoint.value);
      const minutes = Math.round((dataPoint.value - hours) * 60);
      return `${dataPoint.name} ${chartOptions.title.text}: ${hours
        .toString()
        .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
  } else if (props.currentChart === 'mood') {
    chartOptions.title.text = '心情';
    chartOptions.yAxis = {
      type: 'value',
      min: 0,
      max: 5,
      axisLabel: {
        formatter: (value) =>
          ['不透露', '不開心', '有點不開心', '普通', '開心', '非常開心'][
            value
          ] || '不透露'
      }
    };
    chartOptions.series = [
      {
        type: 'line',
        data: moodData.value,
        itemStyle: { color: '#a682ff' },
        connectNulls: true
      }
    ];
    chartOptions.tooltip.formatter = function (params) {
      const dataPoint = params[0];
      return `${dataPoint.name} ${chartOptions.title.text}: ${
        ['不透露', '不開心', '有點不開心', '普通', '開心', '非常開心'][
          dataPoint.value
        ] || '不透露'
      }`;
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

<template>
  <div id="formborder">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<style lang="css" scoped>
.chart-container {
  display: flex;
  justify-content: space-between;
  width: 95%;
  height: 489px;
  margin-top: auto;
  margin-bottom: 20px;
}

#formborder {
  display: flex;
  justify-content: flex-end;
  width: 912px;
  height: 489px;
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
