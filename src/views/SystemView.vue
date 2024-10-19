<script setup>
import { useRouter, useRoute } from "vue-router";

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
</script>

<template>
  <div id="formborder">
    <div>
      <RouterLink
        :to="{
          name: $route.name.startsWith('in-')
            ? 'in-changepassword'
            : 'out-changepassword',
          params: { ...$route.params },
        }"
      >
        <button class="sysbtnchange">更改密碼</button></RouterLink
      >
    </div>

    <RouterLink
      :to="{
        name: $route.name.startsWith('in-')
          ? 'in-systemfeedback'
          : 'out-systemfeedback',
        params: { ...$route.params },
      }"
    >
      <button class="sysbtnfeed">聯絡我們</button></RouterLink
    >

    <button id="backbtn" class="bi bi-x-circle" @click="goBack"></button>
  </div>
  <div>
    <router-view></router-view>
  </div>
</template>

<style lang="css" scoped>
#formborder {
  /* display: flex;
    justify-content: flex-end; */
  border: 1px solid rgb(12, 61, 70);
  background-color: rgb(245, 235, 225);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
}
.sysbtnchange {
  position: absolute;
  size: 16px;
  color: rgb(153, 42, 42);
  background-color: white;
  border: 1px solid rgb(12, 61, 70);
  top: 60%;
  left: 45%;
}

.sysbtnfeed {
  position: absolute;
  size: 16px;
  color: rgb(153, 42, 42);
  background-color: white;
  border: 1px solid rgb(12, 61, 70);
  top: 70%;
  left: 45%;
}

#backbtn {
  position: absolute;
  border: none;
  top: 0px;
  right: 5px;
  z-index: 1;
}
</style>
