<script setup>
import { useRouter, useRoute } from "vue-router";
import GoBackComponent from "@/components/GoBackComponent.vue";

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
    <div class="goback">
      <GoBackComponent @goback="goBack"></GoBackComponent>
    </div>
  </div>
</template>

<style lang="css" scoped>
#formborder {
  display: flex;
  justify-content: flex-end;
  border: 1px solid rgb(33, 70, 12);
  background-color: rgb(225, 245, 230);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
}
</style>
