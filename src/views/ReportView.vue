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
const DAILYHEALTHRECORDS_API_URL = `${BASE_URL}/dailyhealthrecords`;
const PREVIOUSCHARACTERS_API_URL = `${BASE_URL}/PreviousCharacters`;

//取得ID及健康目標
const targetID = playerStore.characterID;
const targetAccount = playerStore.playerAccount;

//過往角色集合
const charactersData = ref([]);
const charactersAllData = ref([]);

onMounted(() => {
  // fetchCharacters();
  // fetchCharacterAccessories();
  fetchPreviousCharacters();
});

//取過往角色Data
// const fetchCharacters = async () => {
//   try {
//     const response = await fetch(`${CHARACTER_API_URL}/${targetAccount}`, {
//       method: 'GET'
//     });
//     if (response.ok) {
//       const { characters: fetchedCharacters, cIds: fetchedCIds } =
//         await response.json();

//       charactersData.value = fetchedCharacters;
//       charactersID.value = fetchedCIds;
//       // console.log('抓取到的資料:', charactersData.value);

//       // console.log('抓取到的資料:', charactersID.value);
//     }
//   } catch (error) {
//     console.error('Error fetching data:', error.message);
//   }
// };

//取過往角色的所有data
const fetchPreviousCharacters = async () => {
  try {
    const response = await fetch(
      `${PREVIOUSCHARACTERS_API_URL}/${targetAccount}`,
      {
        method: 'GET'
      }
    );
    if (response.ok) {
      const data = await response.json();
      charactersAllData.value = data;
      console.log('抓取到的資料:', charactersAllData.value);
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};
</script>

<template>
  <div class="container" id="formborder">
    <div class="accordion accordion-flush" id="accordionFlushExample">
      <!-- 使用 v-for 生成每個角色的 Accordion 項目 -->
      <div
        class="accordion-item"
        v-for="(character, index) in charactersAllData"
        :key="index"
      >
        <h2 class="accordion-header" :id="'heading' + index">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="'#collapse' + index"
            aria-expanded="false"
            :aria-controls="'collapse' + index"
          >
            {{ character.name }} - 等級 {{ character.level }}
          </button>
        </h2>
        <div
          :id="'collapse' + index"
          class="accordion-collapse collapse"
          :aria-labelledby="'heading' + index"
          data-bs-parent="#accordionFlushExample"
        >
          <div class="accordion-body">
            <strong>取得環境值:</strong> {{ character.getEnvironment }}<br />
            <strong>取得經驗值:</strong> {{ character.getExperience }}<br />
            <strong>取得金幣:</strong> {{ character.getCoins }}
            <!-- <p>{{ character }}</p> -->
            <RouterLink
              :to="{
                name: 'in-reportdata',
                // query: { data: JSON.stringify(character) }
                query: { data: character.cId }
              }"
            >
              <button>前往報告數據頁面</button>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div>
    <router-view></router-view>
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

.accordion {
  flex-grow: 1;
  overflow-y: auto;
}

#back {
  height: 30px;
  border: none;
  justify-content: flex-end;
  margin-right: 5px;
  background-color: white;
}
</style>
