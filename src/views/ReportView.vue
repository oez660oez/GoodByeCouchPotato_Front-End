<script setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, watch } from "vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import { useReportDataStore } from "@/Stores/reportDataStore";
import GoBackComponent from "@/components/GoBackComponent.vue";
const router = useRouter();
const route = useRoute();

// 使用pinia
const playerStore = Playerinformation();
const reportData = useReportDataStore();
const oldData = ref(null); // 用來記錄上一次的值

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

//目前無過往紀錄
const noData = ref(false);

onMounted(() => {
  // fetchCharacters();
  firstload();
  fetchPreviousCharacters();
});

const firstload = () => {
  oldData.value = reportData.Data;
};

//取過往角色Data
const fetchCharacters = async (cId) => {
  try {
    const response = await fetch(`${DAILYHEALTHRECORDS_API_URL}/${cId}`, {
      method: "GET",
    });
    if (response.ok) {
      const data = await response.json();
      charactersData.value = data;
      reportData.setReportData(data); // 將 apiData 保存到 Pinia

      console.log("抓取到的資料:", charactersData.value);

      // test.value = reportData.Data;
      // console.log('000', test.value);
      // console.log('抓取到的資料:', charactersData.value);
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
};

//取過往角色的所有data
const fetchPreviousCharacters = async () => {
  try {
    const response = await fetch(
      `${PREVIOUSCHARACTERS_API_URL}/${targetAccount}`,
      {
        method: "GET",
      }
    );
    if (response.ok) {
      const data = await response.json();
      const charactersAll = data;
      charactersAllData.value = charactersAll.filter(
        (character) => character.livingStatus === "搬離"
      );
      if (charactersAll.value == {}) {
        noData.value = true;
      }
      console.log("抓取到的資料123:", charactersAllData.value);
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
};
</script>

<template>
  <div class="container">
    <div class="reportGoback">
      <GoBackComponent @goback="goBack"></GoBackComponent>
    </div>
    <div class="accordion">
      <h3 v-if="noData">目前無過往紀錄</h3>
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
            <p>
              {{ character.name }} - LV.{{ character.level }} 居住時間:{{
                character.moveInDate
              }}
              ~ {{ character.moveOutDate }}
            </p>
          </button>
        </h2>
        <div
          :id="'collapse' + index"
          class="accordion-collapse collapse"
          :aria-labelledby="'heading' + index"
          data-bs-parent="#accordionFlushExample"
        >
          <div class="accordion-body">
            <div>
              <p>
                <img src="/images/coins.png" /> 金幣 :
                {{ character.coins }}
              </p>
              <p>
                <img src="/images/Ex.png" alt="" /> 經驗 :
                {{ character.experience }}
              </p>
              <p>
                <img src="/images/body.png" /> 身高: {{ character.height }}cm,
                體重: {{ character.weight }}kg
              </p>
            </div>
            <RouterLink
              :to="{
                name: $route.name.startsWith('in-')
                  ? 'in-reportdata'
                  : 'out-reportdata',
              }"
            >
              <button class="goData" @click="fetchCharacters(character.cId)">
                前往報告數據頁面
              </button>
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
/* 容器樣式 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
  background-image: url("/images/border.png");
}

/* Accordion 主體樣式 */
.accordion {
  margin-top: auto;
  margin-bottom: 40px;
  width: 100%;
  max-width: 820px;
  height: 100%;
  max-height: 500px;
  overflow-y: scroll; /* 始終顯示垂直滾動軸 */
  overflow-x: hidden; /* 隱藏水平滾動軸 */
}

/* Accordion 項目樣式 */
.accordion-item {
  width: 800px;
  background-color: #f2e8d5; /* 項目背景顏色 */
}

/* Accordion 按鈕樣式 */
.accordion-button {
  padding: 12px 15px;
  background-color: transparent;
  background-image: url("/images/accordion btn.png"); /* 自訂按鈕圖片 */
  background-size: 100% 100%;
  border: none;
  color: inherit; /* 保持文字顏色不變 */
  box-shadow: none; /* 移除陰影效果 */
  transition: transform 0.1s ease;
}

.accordion-button.collapsed::after {
  content: "";
  display: inline-block;
  background-image: url("/images/accordion.png");
  background-size: contain;
  transform: rotate(180deg);
}

.accordion-button::after {
  content: "";
  display: inline-block;
  background-image: url("/images/accoridion2.png");
  background-size: contain;
}

.accordion-button:hover {
  background-color: inherit;
  color: inherit;
  border-color: inherit;
}

/* Accordion 內容樣式 */
.accordion-body {
  background-color: transparent;
  color: #6c757d; /* 內容文字顏色 */
}

/* 自訂滾動條樣式 */
.accordion::-webkit-scrollbar {
  width: 15px;
  background: url("/images/scroll bar.png");
  background-size: 100% 100%; /* 確保圖片填滿滑道 */
}

.accordion::-webkit-scrollbar-thumb {
  background-image: url("/images/scroll bar hover.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom; /* 圖片靠下對齊 */
  min-height: 27px; /* 設置滑塊的最小高度 */
  border-radius: 10px;
}

.accordion::-webkit-scrollbar-thumb:hover {
  background-image: url("/images/scroll bar nohover.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom;
  min-height: 27px;
}

.accordion::-webkit-scrollbar-track {
  background: url("/images/scroll bar.png");
  background-size: 100% 100%; /* 確保圖片填滿滑道 */
  border-radius: 10px;
}

.goData {
  width: 160px;
  height: 51px;
  background-image: url("/images/ConfirmBtn_2.png");
  background-color: transparent;
  background-size: 100% 100%;
  border: none;
}
/* .movein {
  margin-left: auto;
} */
</style>
