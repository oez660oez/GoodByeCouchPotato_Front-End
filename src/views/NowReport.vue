<script setup>
import { useRouter, useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { Playerinformation } from '@/Stores/PlayerCharacter';

const router = useRouter();
const route = useRoute();
const playerStore = Playerinformation();

// 使用 ref 來管理響應式狀態
const activeButton = ref(null);

// 定義按鈕名稱映射
const buttonNameMap = {
  shoes: '足跡',
  drink: '飲品',
  weight: '體重',
  bed: '睡眠',
  smile: '心情'
};

// 方法定義
const setActiveButton = (buttonId) => {
  activeButton.value = buttonId;
};

const getButtonName = (buttonId) => {
  return buttonNameMap[buttonId];
};

const goBack = () => {
  if (route.matched.length > 1) {
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    router.go(-1);
  }
};

onMounted(() => {
  
});


</script>

<template>
   <div id="formborder">
    <div class="button-container">
      <button 
        class="icon-button" 
        :class="{ active: activeButton === 'shoes' }"
        @click="setActiveButton('shoes')"
      >
      <i class="fa-solid fa-shoe-prints fa-rotate-270"></i>
      </button>
      <button 
        class="icon-button" 
        :class="{ active: activeButton === 'drink' }"
        @click="setActiveButton('drink')"
      >
        <i class="fa-solid fa-whiskey-glass"></i>
      </button>
      <button 
        class="icon-button" 
        :class="{ active: activeButton === 'weight' }"
        @click="setActiveButton('weight')"
      >
        <i class="fa-solid fa-weight-scale"></i>
      </button>
      <button 
        class="icon-button" 
        :class="{ active: activeButton === 'bed' }"
        @click="setActiveButton('bed')"
      >
        <i class="fa-solid fa-bed"></i>
      </button>
      <button 
        class="icon-button" 
        :class="{ active: activeButton === 'smile' }"
        @click="setActiveButton('smile')"
      >
        <i class="fa-regular fa-face-smile"></i>
      </button>
    </div>
    <div v-if="activeButton" class="status-text">
      {{ getButtonName(activeButton) }}
    </div>
    <button id="back" class="bi bi-x-circle" @click="goBack"></button>
  </div>
</template>

<style lang="css" scoped>
#formborder {
  border: 1px solid rgb(12, 61, 70);
  background-color: rgb(230, 213, 198);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
}

.button-container {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.icon-button {
  background: white;
  border: 1px solid black;
  cursor: pointer;
  padding: 10px;
  font-size: 30px;
  transition: all 0.3s ease;
}


.icon-button.active {
  background-color: rgb(12, 61, 70);
  color: white;
}


.icon-button:hover {
  transform: scale(1.1);
  color: rgb(240, 246, 247);
  background-color: rgba(20, 77, 87, 0.668);
}

#back {
  position: absolute;
  border: none;
  top: 0px;
  right: 5px;
  z-index: 1;
}
</style>
