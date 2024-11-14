<script setup>
import { ref, computed, onMounted, watch } from "vue";
import * as echarts from "echarts";

const startMonth = ref("");
const endMonth = ref("");
const today = new Date();
const chartRef = ref(null);
let myChart = null;

// API 設定
const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URLgetweight = `${Base_URL}/Report/weight`;
const userAccountString = sessionStorage.getItem("UserAccount");
const userAccount = JSON.parse(userAccountString);

// 日期資料
const data = ref({
  CId: userAccount.characterID,
  StartDate: "",
  EndDate: "",
});

// 獲取月份最後一天的輔助函數
const getLastDayOfMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// 格式化月份，返回月底日期
const formatMonth = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const lastDay = getLastDayOfMonth(year, parseInt(month));
  return `${year}-${month}-${lastDay}`;
};

// 獲取權重數據
const getWeight = async (data) => {
  console.log("Sending data:", data.value);
  try {
    const response = await fetch(API_URLgetweight, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.value),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("API response:", result);
      const formattedData = formatWeightRecords(result);
      console.log("Formatted data:", formattedData);
      updateChart(formattedData);
    }
  } catch (error) {
    console.error("Error fetching weight data:", error);
  }
};

// 格式化體重記錄
const formatWeightRecords = (weightRecords) => {
  console.log("收到體重記錄:", weightRecords);

  const start = new Date(startMonth.value + "-01");
  const end = new Date(endMonth.value + "-01");
  const monthRange = [];

  // 建立月份範圍
  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    monthRange.push(new Date(d));
  }

  // 將體重記錄轉換成月份對應的格式，保存實際記錄日期
  const monthlyRecords = {};
  weightRecords.forEach((record) => {
    const date = new Date(record.hrecordDate);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    monthlyRecords[monthKey] = {
      weight: record.weight,
      actualDate: record.hrecordDate,
    };
  });

  let lastWeight = null;
  let lastDate = null;

  return monthRange.map((date) => {
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    let weightValue = null;
    let recordDate = null;

    if (monthlyRecords[monthKey]) {
      weightValue = monthlyRecords[monthKey].weight;
      recordDate = monthlyRecords[monthKey].actualDate;
      lastWeight = weightValue;
      lastDate = recordDate;
    } else if (lastWeight !== null) {
      weightValue = lastWeight;
      recordDate = lastDate;
    }

    return {
      month: monthKey,
      weight: weightValue,
      actualDate: recordDate,
    };
  });
};

// 圖表相關
const initChart = () => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value);
    const defaultOption = {
      title: {
        text: "體重變化統計",
        left: "center",
      },
      grid: {
        left: "3%",
        right: "3%",
        bottom: "15%",
        containLabel: true,
      },
    };
    myChart.setOption(defaultOption);
  }
};

const updateChart = (formattedData) => {
  if (!myChart || !formattedData) return;

  const option = {
    title: {
      text: "體重變化",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const dataPoint = formattedData[params[0].dataIndex];
        if (!dataPoint.weight && dataPoint.weight !== 0) {
          return `${params[0].name} 無記錄`;
        }
        const displayDate = dataPoint.actualDate
          ? new Date(dataPoint.actualDate).toLocaleDateString("zh-TW")
          : params[0].name;
        return `${displayDate} 體重: ${dataPoint.weight}kg`;
      },
    },
    xAxis: {
      type: "category",
      data: formattedData.map((item) => item.month),
      axisLabel: {
        rotate: 45,
        interval: 0,
        margin: 15,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
      name: "體重(kg)",
      scale: true,
    },
    series: [
      {
        data: formattedData.map((item) => item.weight),
        type: "line",
        smooth: true,
        lineStyle: {
          width: 3,
          color: "#003D79",
        },
        itemStyle: {
          color: "#003060",
          borderWidth: 0,
        },
        symbol: "circle",
        symbolSize: 8,
        connectNulls: true,
      },
    ],
  };

  myChart.setOption(option, true);
};

// 日期計算和限制
const absoluteMinMonth = computed(() => "2024-01");
const maxEndMonth = computed(() => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
});

// 日期變更處理
const handleStartMonthChange = (event) => {
  const selectedStart = new Date(event.target.value + "-01");
  const currentEnd = new Date(endMonth.value + "-01");

  if ((currentEnd - selectedStart) / (1000 * 60 * 60 * 24 * 30) > 12) {
    const maxEnd = new Date(selectedStart);
    maxEnd.setMonth(maxEnd.getMonth() + 11);
    endMonth.value = `${maxEnd.getFullYear()}-${String(
      maxEnd.getMonth() + 1
    ).padStart(2, "0")}`;
  }

  const lastDay = getLastDayOfMonth(
    selectedStart.getFullYear(),
    selectedStart.getMonth() + 1
  );
  data.value.StartDate = `${event.target.value}-${lastDay}`;
  getWeight(data);
};

const handleEndMonthChange = (event) => {
  const selectedEnd = new Date(event.target.value + "-01");
  const currentStart = new Date(startMonth.value + "-01");

  if (selectedEnd < currentStart) {
    startMonth.value = event.target.value;
    return;
  }

  if ((selectedEnd - currentStart) / (1000 * 60 * 60 * 24 * 30) > 12) {
    const minStart = new Date(selectedEnd);
    minStart.setMonth(minStart.getMonth() - 11);
    startMonth.value = `${minStart.getFullYear()}-${String(
      minStart.getMonth() + 1
    ).padStart(2, "0")}`;
  }

  const lastDay = getLastDayOfMonth(
    selectedEnd.getFullYear(),
    selectedEnd.getMonth() + 1
  );
  data.value.EndDate = `${event.target.value}-${lastDay}`;
  getWeight(data);
};

// 初始化
onMounted(() => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);

  const minDate = new Date("2024-01-01");
  if (startDate < minDate) {
    startDate.setTime(minDate.getTime());
  }

  // 設定年月
  startMonth.value = `${startDate.getFullYear()}-${String(
    startDate.getMonth() + 1
  ).padStart(2, "0")}`;
  endMonth.value = `${endDate.getFullYear()}-${String(
    endDate.getMonth() + 1
  ).padStart(2, "0")}`;

  // 設定完整日期（使用月底）
  const startLastDay = getLastDayOfMonth(
    startDate.getFullYear(),
    startDate.getMonth() + 1
  );
  const endLastDay = getLastDayOfMonth(
    endDate.getFullYear(),
    endDate.getMonth() + 1
  );

  data.value.StartDate = `${startMonth.value}-${startLastDay}`;
  data.value.EndDate = `${endMonth.value}-${endLastDay}`;

  initChart();
  getWeight(data);
});

// 監聽日期變更
watch([startMonth, endMonth], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    const startLastDay = getLastDayOfMonth(
      parseInt(newStart.split("-")[0]),
      parseInt(newStart.split("-")[1])
    );
    const endLastDay = getLastDayOfMonth(
      parseInt(newEnd.split("-")[0]),
      parseInt(newEnd.split("-")[1])
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
