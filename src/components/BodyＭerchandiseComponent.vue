<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import ShopselectComponentVue from "./ShopselectComponent.vue";

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/ShopAccessoriesLists`;
const GetItem = ref({
  allclass: [],
  qualifiedItem: [],
});

onMounted(async () => {
  const ShopAccessoriesLists = await fetch(API_URL, {
    method: "GET",
  });
  if (ShopAccessoriesLists.ok) {
    var data = await ShopAccessoriesLists.json();
    GetItem.value = data;
    console.log(GetItem.value.allclass, GetItem.value.qualifiedItem);
  }
});
</script>
<template>
  <div class="selectclass">
    <ShopselectComponentVue></ShopselectComponentVue>
  </div>
  <div class="container">
    <div class="merchandiselist">
      <div class="row">
        <div class="photoborder" v-for="item in GetItem.qualifiedItem">
          <img :src="item.pImageShop" :alt="item.pImageShop" />
          <div class="namelevel">
            <div class="merchandisname itemdetail">{{ item.pName }}</div>
            <div class="level itemdetail">LV {{ item.pLevel }}</div>
          </div>
          <div class="buybutton">
            <button type="submit">＄ {{ item.pPrice }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.merchandiselist {
  width: 656px;
  height: 464px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
.photoborder {
  height: 80px;
  width: 312px;
  background-color: rgb(235, 219, 167);
  border: 1px solid black;
  display: flex;
  padding-top: 8px;
  padding-left: 8px;
  margin: 8px;
  margin-top: 0px;
  border-radius: 10px;
}

.photoborder button {
  height: 32px;
  width: 80px;
}
.photoborder img {
  height: 64px;
  width: 64px;
  background-color: white;
  margin-right: 15px;
  border-radius: 10px;
}
.level {
  font-size: 15px;
}

.merchandisname {
  font-size: 17px;
}
.namelevel {
  height: 48px;
  width: 128px;
}
.buybutton {
  display: flex;
  align-items: end;
  margin-bottom: 8px;
  margin-right: 0px;
}
button {
  border-radius: 10px;
}
.itemdetail {
  margin-bottom: 5px;
}
</style>
