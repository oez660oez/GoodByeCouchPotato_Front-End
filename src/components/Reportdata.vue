<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const goBack = () => {
  if (route.matched.length > 1) {
    // 如果當前路由有父路由，返回到父路由
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    // 否則，使用瀏覽器的後退功能
    router.go(-1);
  }
};

// API 基本 URL
const BASE_URL = import.meta.env.VITE_API_BASEURL;
const DAILYHEALTHRECORDS_API_URL = `${BASE_URL}/dailyhealthrecords`;

const DAILYHEALTHRECORDS_data = ref([]);

//取得點擊角色的id
const getID = route.query.data;

onMounted(() => {
  fetchDailyHealthRecords();
});

//取得每日健康data
const fetchDailyHealthRecords = async () => {
  try {
    const response = await fetch(`${DAILYHEALTHRECORDS_API_URL}/${getID}`, {
      method: 'GET'
    });
    // alert(response);
    if (response.ok) {
      const data = await response.json();
      DAILYHEALTHRECORDS_data.value = data;
      console.log(DAILYHEALTHRECORDS_data.value);
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    isExistingRecord.value = false;
  }
};
</script>

<template>
  <div id="formborder">
    <h2>{{ getID }}</h2>
    <button id="back" class="bi bi-x-circle" @click="goBack"></button>
  </div>
</template>

<style lang="css" scoped>
#formborder {
  display: flex;
  justify-content: flex-end;
  border: 1px solid rgb(33, 70, 12);
  background-color: rgb(4, 164, 245);
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
</style>
