<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Playerinformation } from '@/Stores/PlayerCharacter';

// 使用 Vue 路由
const router = useRouter();
const route = useRoute();

// 返回功能
const goBack = () => {
  if (route.matched.length > 1) {
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    router.go(-1);
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
  border: 1px solid rgb(63, 12, 70);
  background-color: rgb(225, 230, 245);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
  /* background-image: url("@/components/image/form.png"); */
}

#back {
  height: 30px;
  border: none;
  justify-content: flex-end;
  margin-right: 5px;
  background-color: white;
}
</style>
