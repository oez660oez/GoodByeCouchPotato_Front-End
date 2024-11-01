import { defineStore } from "pinia";
import { ref } from "vue";

export const Merchandiselist = defineStore("Merchandise", () => {
  const Getpcode = ref("");
  const Choose = ref([]);
  const Choosemerchandise = ref(false);
  const Myhead = ref([]);
  const Mybody = ref([]);
  const Myaccessory = ref([]);
  const First = ref(true); //紀錄是否是原始裝

  const Getmerchandise = (data) => {
    Choose.value = data;
  };

  const setPcode = (pcode) => {
    Getpcode.value = pcode;
    Choosemerchandise.value = true;
  };

  const Getplaterclothes = (myhead, mybody, myaccessory) => {
    Myhead.value = myhead;
    Mybody.value = mybody;
    Myaccessory.value = myaccessory;
  };

  return {
    Getpcode,
    Choose,
    Choosemerchandise,
    Mybody,
    Myaccessory,
    Myhead,
    First,
    Getmerchandise,
    setPcode,
    Getplaterclothes,
  };
});
