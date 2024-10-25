<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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

const playerID = route.query.data;
const playerData = ref([]);

onMounted(() => {
  getPlayData();
});

const getPlayData = async () => {
  try {
    const response = await fetch(`${API_URL}/${playerID}`, {
      method: 'GET'
    });
    if (response.ok) {
      const data = await response.json();
      playerData.value = data;
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};

// 使用 map 函數提取 water 值
// const waterData = playerData.map((record) => record.water);
// console.log(waterData);

const canvasRef = ref(null); // 取得 canvas 元素的參照

const chartData = {
  labels: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ],
  datasets: [
    {
      label: 'Water',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }
  ]
};

const chartOptions = {
  animation: {
    x: {
      easing: 'easeInQuad', // x軸動畫使用 easeInQuad
      duration: 1000 // x軸動畫持續 1 秒
    },
    y: {
      easing: 'easeOutBounce', // y軸動畫使用 easeOutBounce
      duration: 2000 // y軸動畫持續 2 秒
    }
  }
};

onMounted(() => {
  if (canvasRef.value) {
    new Chart(canvasRef.value, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    });
  }
});
</script>

<template>
  <div id="formborder">
    <div class="chart-container">
      <canvas ref="canvasRef"></canvas>
    </div>
    <button id="back" class="bi bi-x-circle" @click="goBack"></button>
  </div>
</template>

<style lang="css" scoped>
#formborder {
  display: flex;
  justify-content: flex-end;
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
  justify-content: flex-end;
  margin-right: 5px;
  background-color: white;
}

.chart-container {
  position: relative;
  width: 90%; /* 設定寬度 */
  height: 80%; /* 設定高度 */
  display: flex;
  justify-content: center; /* 左右置中 */
  align-items: center;
}
</style>
