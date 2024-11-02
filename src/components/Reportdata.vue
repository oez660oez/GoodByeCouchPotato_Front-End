<template>
  <div id="formborder">
    <!-- Calendar 顯示區塊 -->
    <div class="container" id="calendar-title" v-if="!isObjectOneVisible">
      <ShadowCalendar />
    </div>

    <!-- Chart 顯示區塊 -->
    <div class="chart-container" v-if="isObjectOneVisible">
      <div ref="chartRef" style="width: 100%; height: 100%"></div>
    </div>

    <!-- 控制按鈕 -->
    <div class="d-flex gap-2">
      <button class="btn btn-primary" @click="currentChart = 'water'">
        顯示飲水量
      </button>
      <button class="btn btn-primary" @click="currentChart = 'steps'">
        顯示步數
      </button>
      <button class="btn btn-primary" @click="currentChart = 'sleep'">
        顯示睡眠時長
      </button>
      <button class="btn btn-primary" @click="currentChart = 'mood'">
        顯示心情
      </button>
      <button @click="toggleVisibility">Switch</button>
      <button id="back" class="bi bi-x-circle" @click="goBack"></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import * as echarts from 'echarts';
import ShadowCalendar from '@/views/ShadowCalendar.vue';
import { useReportDataStore } from '@/Stores/reportDataStore';

const getreportData = useReportDataStore();

const router = useRouter();
const route = useRoute();

const goBack = () => {
  if (route.matched.length > 1) {
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    router.go(-1);
  }
};

const dailyhealthData = ref([]);
const waterData = ref([]);
const stepsData = ref([]);
const sleepData = ref([]);
const moodData = ref([]);
const labels = ref([]);

const chartRef = ref(null);
let chartInstance = null;

const isObjectOneVisible = ref(true);

const toggleVisibility = () => {
  isObjectOneVisible.value = !isObjectOneVisible.value;
};

const currentChart = ref('water');

const chartOptions = ref({
  title: { text: '' },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [
    {
      name: '',
      type: 'bar',
      data: []
    }
  ]
});

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

const initializeChart = async () => {
  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
  }
  if (!chartInstance) return;

  if (currentChart.value === 'water') {
    chartOptions.value = {
      title: { text: '飲水量' },
      xAxis: { type: 'category', data: labels.value },
      yAxis: {
        type: 'value',
        title: { text: 'Water Intake (ml)' },
        min: '0',
        max: '6000',
        axisLabel: {
          formatter: '{value} ml'
        }
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
  } else if (currentChart.value === 'steps') {
    chartOptions.value = {
      title: { text: '步數' },
      xAxis: { type: 'category', data: labels.value },
      yAxis: {
        type: 'value',
        title: { text: '步數' },
        min: '0',
        max: '10000',
        axisLabel: {
          formatter: '{value}步'
        }
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
  } else if (currentChart.value === 'sleep') {
    chartOptions.value = {
      title: { text: '入睡時間' },
      xAxis: { type: 'category', data: labels.value },
      yAxis: {
        type: 'value',
        title: { text: '入睡時間' },
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
  } else if (currentChart.value === 'mood') {
    chartOptions.value = {
      title: { text: '心情' },
      xAxis: { type: 'category', data: labels.value },
      yAxis: {
        type: 'value',
        title: { text: '心情' },
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
          itemStyle: { color: 'blue' }
        }
      ]
    };
  }

  chartInstance.setOption(chartOptions.value);
};

onMounted(() => {
  getData();
  initializeChart();
});

watch(isObjectOneVisible, (newVal) => {
  if (newVal === true) {
    initializeChart();
  }
});

watch(currentChart, () => {
  if (chartInstance) {
    initializeChart();
  }
});

watch(
  () => getreportData.Data,
  () => {
    getData();
    initializeChart();
  }
);
</script>

<style scoped>
#formborder {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgb(33, 70, 12);
  background-color: rgb(251, 251, 251);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
}

#back {
  height: 30px;
  border: none;
  background-color: white;
  margin-top: 10px;
}

.chart-container,
.container {
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
