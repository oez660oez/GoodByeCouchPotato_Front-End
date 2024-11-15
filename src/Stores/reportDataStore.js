import { defineStore } from "pinia";
import { ref } from "vue";

export const useReportDataStore = defineStore(
  "reportData",
  () => {
    const Data = ref([]);

    // 設定一個 action 來更新報表數據
    const setReportData = (data) => {
      Data.value = data;
    };

    const resetReportData = () => {
      Data.value = [];
    };
    return { Data, setReportData, resetReportData };
  },
  {
    persist: true, //在這裡啟用pinia持久化
  }
);
