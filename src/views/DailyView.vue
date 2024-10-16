<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

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

const BASE_URL = import.meta.env.VITE_API_BASEURL;

const API_URL = `${BASE_URL}/dailyhealthrecords/0/2024-10-18`;

const dailyHealthData = ref({
  water: 0,
  steps: 0,
  sleep: '00:00',
  mood: '不透露',
  vegetables: 0,
  snacks: 0
});

// 判斷是否已存在資料
const isExistingRecord = ref(false);

onMounted(() => {
  fetchdailyHealth(); //載入表單DATA
});

const fetchdailyHealth = async () => {
  const response = await fetch(API_URL, {
    method: 'GET'
  });

  if (response.ok) {
    const data = await response.json();
    dailyHealthData.value = data;
    isExistingRecord.value = true; // 如果有資料，設置為 true
    alert('good'); // 沒有資料
  } else {
    isExistingRecord.value = false;
    alert('notfound'); // 沒有資料
  }
};

// 選項列表
const moodOptions = ref([
  { label: '非常開心', value: '非常開心' },
  { label: '開心', value: '開心' },
  { label: '普通', value: '普通' },
  { label: '有點不開心', value: '有點不開心' },
  { label: '不開心', value: '不開心' },
  { label: '不透露', value: '不透露' }
]);

// 用來顯示時間的變量
const currentTime = ref('');

// 取得當前時間並格式化為 HH:mm
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}`;
};
</script>

<template>
  <div id="formborder">
    <div class="container mt-5 form-container">
      <h3 class="header-text">每日健康紀錄表</h3>
      <form>
        <!-- 飲水量和步數 -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="water" class="form-label">飲水量</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                id="water"
                pattern="\d{5}"
                placeholder="0"
                maxlength="5"
                min="0"
              />
              <div class="invalid-feedback">僅能輸入數字，最大長度為5位</div>
              <span class="input-group-text">c.c.</span>
            </div>
            <small class="small-text"
              >{{ dailyHealthData.water }}c.c. / 3000c.c.</small
            >
          </div>
          <div class="col-md-6">
            <label for="steps" class="form-label">步數</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                id="steps"
                placeholder="0"
                pattern="\d{7}"
                maxlength="7"
                min="0"
              />
              <div class="invalid-feedback">僅能輸入數字，最大長度為7位</div>
              <span class="input-group-text">步</span>
            </div>
            <small class="small-text">{{ dailyHealthData.steps }}步</small>
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
                id="sleep-time"
                v-model="currentTime"
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
                :id="option.value"
                :value="option.value"
                v-model="dailyHealthData.mood"
              />
              <label class="form-check-label" :for="option.value">{{
                option.label
              }}</label>
            </div>
          </div>
        </div>

        <!-- 飲食記錄 -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="fruits" class="form-label">蔬果</label>
            <input
              type="text"
              class="form-control"
              id="fruits"
              placeholder="0"
              pattern="^([0-9]|10)$"
              maxlength="2"
              min="0"
            />
            <small class="small-text">{{ dailyHealthData.vegetables }}份</small>
          </div>

          <div class="invalid-feedback">僅能輸入數字，最大長度為7位</div>

          <div class="col-md-6">
            <label for="sugar-drinks" class="form-label"
              >含糖飲料、點心、消夜</label
            >
            <input
              type="text"
              class="form-control"
              id="sugar-drinks"
              placeholder="0"
              pattern="^([0-9]|10)$"
              maxlength="2"
              min="0"
            />
            <small class="small-text">{{ dailyHealthData.snacks }}份</small>

            <div class="invalid-feedback">
              僅能輸入數字，最大長度為2位，範圍為0~10
            </div>
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
