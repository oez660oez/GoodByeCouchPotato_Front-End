<script setup>
import { useRouter, useRoute } from "vue-router";
import GoBackComponent from "@/components/GoBackComponent.vue";
import MusicComponent from "@/components/MusicComponent.vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";

const router = useRouter();
const route = useRoute();
const PiniaPlayer = Playerinformation();
const logout = () => {
  PiniaPlayer.logout();
  PiniaPlayer.logoutBody();
  router.push("/");
};

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
    <h3>系統</h3>
    <div class="musiccontroller">
      <MusicComponent></MusicComponent>
    </div>
    <div class="inside">
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

      <div>
        <button class="sysbtnlogout" @click="logout">登出</button>
      </div>
    </div>

    <div class="Systemgoback">
      <GoBackComponent @goback="goBack"></GoBackComponent>
    </div>
  </div>
  <div>
    <router-view></router-view>
  </div>
</template>

<style lang="css" scoped>
#formborder {
  /* display: flex;
    justify-content: flex-end; */
  /* border: 1px solid rgb(12, 61, 70);
  background-color: rgb(245, 235, 225); */
  width: 510px;
  height: 590px;
  position: fixed;
  top: 50px;
  left: 350px;
  background-image: url("@/assets/system.png");
  background-size: cover;
}
/* .sysbtnchange {
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

.sysbtnlogout {
  position: absolute;
  size: 16px;
  color: rgb(153, 42, 42);
  background-color: white;
  border: 1px solid rgb(12, 61, 70);
  top: 80%;
  left: 47%;
} */

#backbtn {
  position: absolute;
  border: none;
  top: 0px;
  right: 5px;
  z-index: 1;
}

.inside {
  /* border: 2px solid red; */
  top: 320px;
  height: 150px;
  width: 440px;
  left: 50px;
  position: absolute;
}
.inside button {
  width: 420px;
  height: 60px;
  margin-top: 20px;
  color: rgba(82, 50, 50, 0.847);
  background-color: transparent;
  /* background-color: rgb(255, 255, 255); */
  border-radius: 10px;
  border: none;
  /* box-shadow: 5px 5px 5px 1px rgb(81, 52, 1); */
  background-image: url("@/assets/systembutton.png");
  background-size: cover;
}
h3 {
  position: absolute;
  top: 50px;
  left: 46%;
}

.musiccontroller {
  position: absolute;
  top: 150px;
  left: 60px;
}
</style>
