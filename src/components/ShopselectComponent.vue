<script setup>
const props = defineProps({
  currentpage: Number, //直接使用而不要用變數，如果使用變數可能會抓不到新的內容，defineprops本來就自帶響應式，父改變了子也會改變
  allclass: Array,
});

const emit = defineEmits(["lastpage", "nextpage"]);

const lastpage = () => {
  emit("lastpage");
};

const nextpage = () => {
  emit("nextpage");
};
</script>

<template>
  <div class="merchandiseclass">
    <select>
      <option>顯示全部商品</option>
      <option v-for="(item, index) in props.allclass" :key="index">
        {{ item }}
      </option>
    </select>

    <select>
      <option>顯示全部等級</option>
      <option>Lv1-10</option>
      <option>Lv11-20</option>
    </select>

    <input type="text" @keyup="searchitem" placeholder="請輸入商品名稱" />

    <button @click="lastpage">上</button>
    <h4>{{ props.currentpage }}</h4>
    <button @click="nextpage">下</button>
  </div>
</template>

<style lang="css" scoped>
.merchandiseclass {
  width: 656px;
  height: 32px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin: 15px;
}

select {
  text-align: center;
  height: 35px;
}
</style>
