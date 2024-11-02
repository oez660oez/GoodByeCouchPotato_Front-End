<template>
  <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { useReportDataStore } from '@/Stores/reportDataStore';

const props = defineProps({
  currentChart: String
});

const getreportData = useReportDataStore();

const chartRef = ref(null);
let chartInstance = null;

const dailyhealthData = ref([]);
const waterData = ref([]);
const stepsData = ref([]);
const sleepData = ref([]);
const moodData = ref([]);
const labels = ref([]);

// 初始化圖表數據
const getData = async () => {
  dailyhealthData.value = getreportData.Data;
  waterData.value = dailyhealthData.value.map((record) => record.water);
  stepsData.value = dailyhealthData.value.map((record) => record.steps);
  sleepData.value = dailyhealthData.value.map((record) =>
    convertTimeToHourDecimal(record.sleep)
  );
  moodData.value = dailyhealthData.value.map(
    (record) => moodToValue[record.mood]
  );
  labels.value = dailyhealthData.value.map((record) => record.hrecordDate);
};

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

  let chartOptions = {};

  if (props.currentChart === 'water') {
    chartOptions = {
      title: { text: '飲水量' },
      xAxis: { type: 'category', data: labels.value },
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
  } else if (props.currentChart === 'steps') {
    chartOptions = {
      title: { text: '步數' },
      xAxis: { type: 'category', data: labels.value },
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
      xAxis: { type: 'category', data: labels.value },
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
      xAxis: { type: 'category', data: labels.value },
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
        { type: 'line', data: moodData.value, itemStyle: { color: 'blue' } }
      ]
    };
  }

  chartInstance.setOption(chartOptions);
};

onMounted(() => {
  getData();
  initializeChart();
});

watch(
  () => props.currentChart,
  () => {
    initializeChart();
  }
);

watch(
  () => getreportData.Data,
  () => {
    getData();
    initializeChart();
  }
);
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 90%;
}
</style>
