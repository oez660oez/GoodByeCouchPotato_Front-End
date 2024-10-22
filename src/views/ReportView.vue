<script setup>
import { useRouter, useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { Playerinformation } from '@/Stores/PlayerCharacter';

const router = useRouter();
const route = useRoute();

// 使用pinia
const playerStore = Playerinformation();

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
const API_URL = `${BASE_URL}/dailyhealthrecords`;

//取得ID及健康目標
const targetID = playerStore.characterID;

//過往角色集合
const healthRecords = ref([]);

onMounted(() => {
  fetchHealthRecords();
});

const fetchHealthRecords = async () => {
  try {
    const response = await fetch(`${API_URL}/${targetID}`, {
      method: 'GET'
    });
    if (response.ok) {
      const data = await response.json();
      healthRecords.value = data;
      //   console.log('抓取到的資料:', data);
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};
</script>

<template>
  <div id="formborder">
    <button id="back" class="bi bi-x-circle" @click="goBack"></button>
  </div>
</template>

<style lang="css" scoped>
#formborder {
  display: flex;
  justify-content: flex-end;
  border: 1px solid rgb(12, 24, 70);
  background-color: rgb(227, 225, 245);
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
