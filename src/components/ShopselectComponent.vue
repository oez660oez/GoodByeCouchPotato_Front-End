<script setup>
import { ref } from "vue";
const props = defineProps({
  allitem: Object, //直接使用而不要用變數，如果使用變數可能會抓不到新的內容，defineprops本來就自帶響應式，父改變了子也會改變
  allclass: Array,
  selectedLevel: Object,
});

const emit = defineEmits(["lastpage", "nextpage", "changeselect"]);

const lastpage = () => {
  emit("lastpage");
};

const nextpage = () => {
  emit("nextpage");
};

const changeselect = (type, value) => {
  emit("changeselect", type, value);
};
</script>

<template>
  <div class="merchandiseclass">
    <select @change="(event) => changeselect('Class', event.target.value)">
      <option value="">顯示全部商品</option>
      <option
        v-for="(item, index) in props.allclass"
        :key="index"
        :value="item"
      >
        {{ item }}
      </option>
    </select>
    <!-- event.target.value用來獲取選擇的value -->
    <select @change="(event) => changeselect('Level', event.target.value)">
      <option value="">{{ selectedLevel.Nochoose }}</option>
      <option
        v-for="range in selectedLevel.levelRanges"
        :key="range"
        :value="range"
      >
        Lv{{ range }} - Lv{{ range + 9 }}
      </option>
    </select>

    <input
      type="text"
      @keyup="(event) => changeselect('input', event.target.value)"
      placeholder="請輸入商品名稱"
    />

    <button class="lastpage" @click="lastpage"></button>
    <h4>{{ allitem.currentpage }}</h4>
    <button class="nextpage" @click="nextpage"></button>
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
  margin-left: 2px;
}

select {
  text-align: center;
  height: 35px;
}

input {
  width: 150px;
}

.lastpage,
.nextpage {
  width: 32px;
  height: 32px;
  background-size: cover;
  background-repeat: no-repeat;
}

.lastpage {
  background-image: url("@/assets/lastpagebutton.png");
}

.nextpage {
  background-image: url("@/assets/nextpagebutton.png");
}

button {
  background: none;
  border: none;
  padding: 0;
  outline: none;
  cursor: pointer;
}

h4 {
  background-color: white;
  width: 48px;
  height: 35px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(82, 50, 50, 0.847);
  color: rgba(82, 50, 50, 0.847);
}
</style>
