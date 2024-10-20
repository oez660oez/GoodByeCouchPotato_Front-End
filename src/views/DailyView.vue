<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Playerinformation } from '@/Stores/PlayerCharacter';

// 使用 Vue 路由
const router = useRouter();
const route = useRoute();
// 使用 Pinia
const playerStore = Playerinformation();

// 返回功能
const goBack = () => {
  if (route.matched.length > 1) {
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    router.go(-1);
  }
};

// API 基本 URL
const BASE_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${BASE_URL}/dailyhealthrecords`;

//取得ID及健康目標
const targetID = playerStore.characterID;
const targetWater = playerStore.characterTargetWater;
const targetStep = playerStore.characterTargetStep;

// 取得當天日期
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayDate = `${year}-${month}-${day}`;

// 表單初始數據
const dailyHealthData = ref({
  cId: targetID,
  hrecordDate: todayDate,
  water: null,
  steps: null,
  sleep: '00:00',
  mood: '不透露',
  vegetables: null,
  snacks: null
});

// 表單提交數據
const dailyHealthDataSubmit = ref({
  cId: targetID,
  hrecordDate: todayDate,
  water: null,
  steps: null,
  sleep: null,
  mood: '不透露',
  vegetables: null,
  snacks: null
});

// 判斷當天是否已有記錄
const isExistingRecord = ref(false);

onMounted(() => {
  checkDataExists();
});

// 檢查是否已有紀錄
const checkDataExists = async () => {
  try {
    const response = await fetch(`${API_URL}/${targetID}/${todayDate}`, {
      method: 'GET'
    });
    if (response.ok) {
      const data = await response.json();
      dailyHealthData.value = data;
      dailyHealthDataSubmit.value.mood = dailyHealthData.value.mood;
      isExistingRecord.value = true;
    } else {
      isExistingRecord.value = false;
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    isExistingRecord.value = false;
  }
};

// 初始化驗證狀態
const isValid = ref(true);
const snacksisValid = ref(false);
const vegetablesisValid = ref(false);

// 表單驗證
const validateForm = () => {
  isValid.value = true;
  validateVegetables();
  validateSnacks();
};

// 驗證零食輸入
const validateSnacks = () => {
  const snacksValue = dailyHealthDataSubmit.value.snacks;
  if (snacksValue > 10 || snacksValue < 0) {
    isValid.value = false;
    snacksisValid.value = true;
  } else {
    snacksisValid.value = false;
  }
};

// 驗證蔬果輸入
const validateVegetables = () => {
  const vegetablesValue = dailyHealthDataSubmit.value.vegetables;
  if (vegetablesValue > 10 || vegetablesValue < 0) {
    isValid.value = false;
    vegetablesisValid.value = true;
  } else {
    vegetablesisValid.value = false;
  }
};

// 提交表單資料
const submitData = async () => {
  // 執行驗證
  validateForm();

  if (!isValid.value) {
    alert('請修正表單中的錯誤後再提交');
    return;
  }

  try {
    const method = isExistingRecord.value ? 'PATCH' : 'POST';
    const url = isExistingRecord.value
      ? `${API_URL}/${targetID}/${todayDate}`
      : API_URL;

    checkWaterValue();

    const response = await fetch(url, {
      method: method,
      body: JSON.stringify(dailyHealthDataSubmit.value),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      console.log('Data submitted successfully');
      await checkDataExists();
      alert('資料更新成功');
    } else {
      const errorMsg = await response.text();
      console.error('Error submitting data:', errorMsg);
      alert('資料提交失敗');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  resetForm();
};

// 重置表單
const resetForm = () => {
  dailyHealthDataSubmit.value = {
    cId: targetID,
    hrecordDate: todayDate,
    water: null,
    steps: null,
    sleep: null,
    mood: dailyHealthData.value.mood,
    vegetables: null,
    snacks: null
  };
};

// 檢查 water 值是否超過 99999
const checkWaterValue = () => {
  if (dailyHealthDataSubmit.value.water > 99999) {
    dailyHealthDataSubmit.value.water = 99999;
  }
};

// 取得當前時間
const currentTime = ref('');
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}`;
  dailyHealthDataSubmit.value.sleep = `${hours}:${minutes}`;
};

// 心情選項
const moodOptions = ref([
  { label: '非常開心', value: '非常開心' },
  { label: '開心', value: '開心' },
  { label: '普通', value: '普通' },
  { label: '有點不開心', value: '有點不開心' },
  { label: '不開心', value: '不開心' },
  { label: '不透露', value: '不透露' }
]);
</script>

<template>
  <div id="formborder">
    <div class="container mt-5 form-container">
      <h3 class="header-text">每日健康紀錄表</h3>
      <form @submit.prevent="submitData" novalidate>
        <!-- 飲水量和步數 -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="water" class="form-label">飲水量</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                name="water"
                id="water"
                v-model="dailyHealthDataSubmit.water"
                pattern="\d{1,5}"
                placeholder="0"
                maxlength="5"
                min="0"
              />
              <div class="invalid-feedback">僅能輸入數字，最大長度為5位</div>
              <span class="input-group-text">c.c.</span>
            </div>
            <small class="small-text"
              >{{ dailyHealthData.water }}c.c. /{{ targetWater }} c.c.</small
            >
          </div>
          <div class="col-md-6">
            <label for="steps" class="form-label">步數</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                name="steps"
                id="steps"
                v-model="dailyHealthDataSubmit.steps"
                placeholder="0"
                pattern="\d{1,7}"
                maxlength="7"
                min="0"
              />
              <div class="invalid-feedback">僅能輸入數字，最大長度為7位</div>
              <span class="input-group-text">步</span>
            </div>
            <small class="small-text"
              >{{ dailyHealthData.steps }}步 /{{ targetStep }}步</small
            >
          </div>
        </div>

        <!-- 睡眠時間 -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="sleep" class="form-label">睡眠時間</label>
            <div class="input-group">
              <input
                type="time"
                class="form-control"
                name="sleep"
                id="sleep-time"
                v-model="dailyHealthDataSubmit.sleep"
              />
            </div>
            <small class="small-text">{{ dailyHealthData.sleep }}</small>
          </div>
          <div class="col-md-6 d-flex align-items-end">
            <button type="button" @click="getCurrentTime">取得現在時間</button>
          </div>
        </div>

        <!-- 心情狀態 -->
        <div class="mb-3">
          <label class="form-label">心情狀態</label>
          <div>
            <div
              v-for="option in moodOptions"
              :key="option.value"
              class="form-check form-check-inline"
            >
              <input
                class="form-check-input"
                type="radio"
                :name="option.value"
                :id="option.value"
                :value="option.value"
                v-model="dailyHealthDataSubmit.mood"
              />
              <label class="form-check-label" :for="option.value">{{
                option.label
              }}</label>
            </div>
          </div>
        </div>

        <!-- 飲食記錄 -->
        <!-- 飲食記錄 -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="fruits" class="form-label">蔬果</label>
            <input
              type="text"
              class="form-control"
              name="fruits"
              id="fruits"
              v-model="dailyHealthDataSubmit.vegetables"
              placeholder="0"
              @input="validateVegetables"
              :class="{ 'is-invalid': vegetablesisValid }"
              maxlength="2"
              min="0"
            />
            <small class="small-text">{{ dailyHealthData.vegetables }}份</small>
            <div class="invalid-feedback">一日最多輸入10份</div>
          </div>

          <div class="col-md-6">
            <label for="sugar-drinks" class="form-label"
              >含糖飲料、點心、消夜</label
            >
            <input
              type="text"
              class="form-control"
              name="sugar-drinks"
              id="sugar-drinks"
              v-model="dailyHealthDataSubmit.snacks"
              placeholder="0"
              @input="validateSnacks"
              :class="{ 'is-invalid': snacksisValid }"
              maxlength="2"
              min="0"
            />
            <small class="small-text">{{ dailyHealthData.snacks }}份</small>
            <div class="invalid-feedback">一日最多輸入10份</div>
          </div>
        </div>

        <!-- 提交按鈕 -->
        <button type="submit" class="btn btn-primary w-100">更新</button>
      </form>
    </div>
    <button id="back" class="bi bi-x-circle" @click="goBack"></button>
  </div>
</template>

<style lang="css" scoped>
#formborder {
  display: flex;
  justify-content: flex-end;
  border: 1px solid rgb(63, 12, 70);
  background-color: rgb(225, 230, 245);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
}

#back {
  height: 30px;
  border: none;
  justify-content: flex-end;
  margin-right: 5px;
  background-color: white;
}
</style>
