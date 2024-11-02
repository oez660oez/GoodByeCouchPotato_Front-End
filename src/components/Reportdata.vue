<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import * as echarts from "echarts";
import ShadowCalendar from "@/views/ShadowCalendar.vue";
import { useReportDataStore } from "@/Stores/reportDataStore";

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

// API 基本 URL
const BASE_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${BASE_URL}/dailyhealthrecords`;

const playerData = ref([]);
const dailyhealthData = ref([]);
const chartRef = ref(null);

let chartInstance; // 單一圖表實例

// 控制顯示哪個報表和動態傳入參數
const currentChart = ref("water");

// 動態更新的圖表配置
const chartOptions = ref({
  title: { text: "" },
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: [] },
  yAxis: { type: "value" },
  series: [
    {
      name: "",
      type: "bar",
      data: [],
    },
  ],
});

// 將 "HH:mm" 時間格式轉換為小時數
const convertTimeToHourDecimal = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours + minutes / 60; // 轉換為小時數
};

const moodToValue = {
  不透露: 0,
  不開心: 1,
  有點不開心: 2,
  普通: 3,
  開心: 4,
  非常開心: 5,
};

const getData = () => {
  dailyhealthData.value = getreportData.Data;
  console.log("25454545", dailyhealthData.value);
};

const getPlayData = async () => {
  const waterData = dailyhealthData.value.map((record) => record.water);
  const stepsData = dailyhealthData.value.map((record) => record.steps);
  const sleepData = dailyhealthData.value.map((record) =>
    convertTimeToHourDecimal(record.sleep)
  );
  const moodData = dailyhealthData.value.map(
    (record) => moodToValue[record.mood]
  );
  const labels = dailyhealthData.value.map((record) => record.hrecordDate);
  console.log(moodData);

  // 根據當前的圖表類型更新動態配置
  if (currentChart.value === "water") {
    chartOptions.value = {
      title: { text: "飲水量" },
      xAxis: { type: "category", data: labels },
      yAxis: {
        type: "value",
        title: { text: "Water Intake (ml)" },
        min: "0",
        max: "6000",
        axisLabel: {
          formatter: "{value} ml",
        },
      },
      series: [
        {
          name: "Water Intake (ml)",
          type: "bar",
          data: waterData,
          itemStyle: { color: "rgba(75, 192, 192, 1)" },
        },
      ],
    };
  } else if (currentChart.value === "steps") {
    chartOptions.value = {
      title: { text: "步數" },
      xAxis: { type: "category", data: labels },
      yAxis: {
        type: "value",
        title: { text: "步數" },
        min: "0",
        max: "10000",
        axisLabel: {
          formatter: "{value}步",
        },
      },
      series: [
        {
          name: "步數",
          type: "bar",
          data: stepsData,
          itemStyle: { color: "orange" },
        },
      ],
    };
  } else if (currentChart.value === "sleep") {
    chartOptions.value = {
      title: { text: "入睡時間" },
      xAxis: { type: "category", data: labels },
      yAxis: {
        type: "value",
        title: { text: "入睡時間" },
        min: 0,
        max: 24,
        axisLabel: {
          formatter: (value) => {
            const hours = Math.floor(value);
            const minutes = Math.round((value - hours) * 60);
            return `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}`;
          },
        },
      },
      series: [
        {
          name: "Sleep Start Time",
          type: "line",
          data: sleepData,
          itemStyle: { color: "purple" },
        },
      ],
    };
  } else if (currentChart.value === "mood") {
    chartOptions.value = {
      title: { text: "心情" },
      xAxis: { type: "category", data: labels },
      yAxis: {
        type: "value",
        title: { text: "心情" },
        min: 0,
        max: 5,
        axisLabel: {
          formatter: function (value) {
            var moodLabels = [
              "不透露",
              "不開心",
              "有點不開心",
              "普通",
              "開心",
              "非常開心",
            ];
            return moodLabels[value];
          },
        },
      },
      series: [
        {
          title: { text: "心情" },
          min: 0,
          max: 5,
          type: "line",
          data: moodData,
          itemStyle: { color: "blue" },
        },
      ],
    };
  }

  chartInstance.setOption(chartOptions.value); // 更新圖表配置
};

// 初始化圖表
onMounted(() => {
  getData();
  getPlayData(); // 加載數據
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    getPlayData(); // 加載數據
  }
});

// // 監聽 currentChart 的變化
// watch(currentChart, () => {
//   getPlayData(); // 當 currentChart 改變時執行 getPlayData
// });

// // 監聽 getreportData.Data 的變化
// watch(
//   () => getreportData.Data,
//   () => {
//     getData();
//     getPlayData(); // 當 getreportData.Data 改變時執行 getData
//   }
// );

// 控制顯示物件切換的狀態變數
const isObjectOneVisible = ref(true);

const toggleVisibility = () => {
  isObjectOneVisible.value = !isObjectOneVisible.value; // 切換顯示的狀態
};
</script>

<template>
  <div id="formborder">
    <div class="container" id="calendar-title" v-if="!isObjectOneVisible">
      <!-- Calendar position -->
      <ShadowCalendar />
    </div>
    <!-- 使用 FullCalendar Vue 插件 -->
    <div class="chart-container" v-else>
      <div ref="chartRef" style="width: 100%; height: 100%"></div>
    </div>

    <!-- 使用 d-flex 和 gap 來橫向排列按鈕 -->
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
      <button @click="toggleVisibility">switch</button>
      <button id="back" class="bi bi-x-circle" @click="goBack"></button>
    </div>
  </div>
</template>

<style lang="css" scoped>
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

.chart-container {
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
