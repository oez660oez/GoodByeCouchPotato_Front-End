<script setup>
import { useRouter, useRoute } from "vue-router";
import BodymerchandiseComponent from "@/components/BodyＭerchandiseComponent.vue";
import { ref } from "vue";
import ChacterBodyComponent from "@/components/ChacterBodyComponent.vue";
import GoBackComponent from "@/components/GoBackComponent.vue";

const router = useRouter();
const route = useRoute();

const tabs = [{ name: "角色配件", component: BodymerchandiseComponent }];
const currentTab = ref(tabs[0].component);
const activeIndex = ref(0);

const setActive = (index) => {
  currentTab.value = tabs[index].component;
  activeIndex.value = index;
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
  <div id="shopformborder">
    <div class="shopgoback">
      <GoBackComponent @goback="goBack"></GoBackComponent>
    </div>
    <div class="outborder col-4">
      <div class="charbody">
        <ChacterBodyComponent
          :AccessoriesListsImageAll="AccessoriesListsImageAll"
        ></ChacterBodyComponent>
      </div>
    </div>
    <div class="outborder col-8">
      <div class="shoplist">
        <div class="merchandise">
          <div class="merchandiseclass">
            <ul class="nav nav-tabs">
              <li
                class="nav-item"
                v-for="(tab, index) in tabs"
                :key="tab.name"
                @click="setActive(index)"
              >
                <a
                  class="nav-link"
                  :class="{ active: activeIndex === index }"
                  aria-current="page"
                  href="#"
                  >{{ tab.name }}</a
                >
              </li>
            </ul>
            <div class="MerchandiseItem">
              <KeepAlive>
                <component :is="currentTab"></component>
              </KeepAlive>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
#shopformborder {
  display: flex;
  /* border: 1px solid rgb(63, 12, 70); */
  /* background-color: rgb(242, 225, 245); */
  width: 1056px;
  height: 624px;
  position: fixed;
  top: 50px;
  left: 320px;
  background-image: url("@/assets/shopbackground.png");
  background-size: cover;
}

.charbody {
  width: 330px;
  height: 576px;
  /* border: 1px solid rgb(34, 49, 51); */
  margin-top: 30px;
  margin-left: 30px;
  /* background-color: rgb(199, 180, 154); */
}

.shoplist {
  width: 655px;
  height: 570px;
  /* border: 1px solid rgb(21, 32, 5); */
  margin-top: 30px;
  /* background-color: rgb(165, 134, 42); */
}

.outborder {
  /* border: 1px solid rgb(244, 38, 38); */
  display: flex;
  justify-content: center;
}

li {
  background-color: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

a,
a:hover,
a:visited,
a:link,
a:active {
  color: black;
}
.MerchandiseItem {
  margin-left: -10px;
}
</style>
