import { defineStore } from "pinia";
import { ref } from "vue";

export const Merchandiselist = defineStore("Merchandise", () => {
  const Getpcode = ref("");
  const Choose = ref([]);
  const Choosemerchandise = ref(false);

  const Getmerchandise = (data) => {
    Choose.value = data;
  };

  const setPcode = (pcode) => {
    Getpcode.value = pcode;
    Choosemerchandise.value = true;
  };

  return {
    Getpcode,
    Choose,
    Choosemerchandise,
    Getmerchandise,
    setPcode,
  };
});
