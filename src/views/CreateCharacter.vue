<script setup>
import { ref } from "vue";

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/CreateCharacter`;

//玩家在input填入的資訊儲存在這裡
const form = ref({
  name: "",
  height: "",
  weight: "",
  exerciseIntensity: "-請選擇-",
});
//下拉選單內的選項
const exercises = ref([
  { name: "-請選擇-" },
  { name: "久坐" },
  { name: "低活動" },
  { name: "中活動" },
  { name: "高活動" },
]);
//填入錯誤訊息
const errors = ref({
  height: "",
  weight: "",
});

const validateHeight = () => {
  const height = Number(form.value.height);
  //判斷身高有無超出條件
  if (height <= 0 || height > 300) {
    //填入錯誤訊息
    errors.value.height = "身高只允許0-300公分";
    return false;
  }
  //滿足條件沒錯誤訊息
  errors.value.height = "";
  return true;
};
const validateWeight = () => {
  const weight = Number(form.value.weight);
  if (weight <= 0 || weight > 600) {
    errors.value.weight = "體重只允許0-600公斤";
    return false;
  }
  errors.value.weight = "";
  return true;
};
//form通過後的邏輯
const handleSubmit = async () => {
  if (!validateHeight() || !validateWeight()) {
    return;
  }
  //撈登入時儲存於localStorage的Account
  const account = localStorage.getItem("Account");
  if (!account) {
    alert("請先登入");
    return;
  }
  try {
    //傳出到後端api
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        //傳出的資料
        name: form.value.name,
        height: Number(form.value.height),
        weight: Number(form.value.weight),
        exerciseIntensity: form.value.exerciseIntensity,
        account: account,
      }),
    });
    if (response.ok) {
      alert("角色創建成功！");
      // 可以在這裡添加導航到其他頁面的邏輯
    } else {
      alert("創建失敗，請稍後再試");
    }
  } catch (error) {
    console.error("存資料發生錯誤囉:", error);
    alert("發生錯誤，請稍後再試");
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="CreateCharacterData">
    <!-- start -->
    <!-- offset控制留白 -->
    <!-- name其實是select最重要的屬性，沒有會無法傳資料 -->
    <div class="container">
      <div class="row">
        <h2 class="col-12 mt-5 mb-5 text-center">創建角色</h2>
      </div>
      <!-- end -->
      <!-- start -->
      <div class="row mb-3 d-flex align-items-center">
        <div class="col-12 col-xl-2 text-center p-0 offset-xl-3">
          <label for="name" class="form-label">角色名稱</label>
        </div>
        <div class="col-12 col-xl-3">
          <input
            v-model="form.name"
            type="text"
            id="name"
            class="form-control"
            minlength="3"
            maxlength="16"
            placeholder="請輸入角色名稱"
            required
          />
          <div class="invalid-feedback">此為必填欄位</div>
        </div>
      </div>
      <!-- end -->
      <!-- start -->
      <div class="row mb-3 d-flex align-items-center">
        <div class="col-12 col-xl-2 text-center p-0 offset-xl-3">
          <label for="height" class="form-label">身高</label>
        </div>
        <div class="col-12 col-xl-3">
          <!-- <input type="tel" id="tel" class="form-control" pattern="[A-Z]{1}[0-9]{9}" placeholder="請輸入身分證字號" required> -->
          <input
            v-model="form.height"
            type="text"
            id="height"
            class="form-control"
            pattern="^\d+(\.\d)?$"
            minlength="2"
            maxlength="5"
            placeholder="請輸入身高"
            @input="validateHeight"
            required
          />
          <div class="invalid-feedback" v-if="errors.height">
            {{ errors.height }}
          </div>
        </div>
        <div class="col-12 col-xl-1">
          <label class="form-label">公分</label>
        </div>
      </div>
      <!-- end -->
      <!-- start -->
      <div class="row mb-3 d-flex align-items-center">
        <div class="col-12 col-xl-2 text-center p-0 offset-xl-3">
          <label for="weight" class="form-label">體重</label>
        </div>
        <div class="col-12 col-xl-3">
          <input
            v-model="form.weight"
            type="text"
            id="weight"
            class="form-control"
            minlength="2"
            maxlength="5"
            pattern="^\d+(\.\d)?$"
            placeholder="請輸入體重"
            @input="validateWeight"
            required
          />
          <div class="invalid-feedback" v-if="errors.weight">
            {{ errors.weight }}
          </div>
        </div>
        <div class="col-12 col-xl-1">
          <label class="form-label">公斤</label>
        </div>
      </div>
      <!-- end -->
      <!-- start -->
      <div class="row mb-3 d-flex align-items-center">
        <div class="col-12 col-xl-2 text-center p-0 offset-xl-3">
          <label for="exercise" class="form-label">運動強度</label>
        </div>
        <div class="col-12 col-xl-3">
          <select v-model="form.exerciseIntensity" class="form-select" required>
            <!-- key避免使用index，因為取陣列，資料改變陣列排序也會改變 -->
            <option v-for="exercise in exercises" :key="exercise.name" :value="exercise.name">
              {{ exercise.name }}
            </option>
          </select>
        </div>
      </div>
      <!-- end -->
      <!-- start -->
      <div class="row mb-5 mt-5">
        <div class="col-12 text-center">
          <!-- input:submit -->
          <button type="submit" class="button-62">創建</button>
        </div>
      </div>
      <!-- end -->
    </div>
  </form>
</template>

<style lang="css" scoped>
.container {
  width: 900px;
  height: 500px;
  background: linear-gradient(161.98deg, #fff9e6 13.65%, #fdbdbd 87.85%);
  margin: 100px auto;
  position: relative;
  border-radius: 20px;
  box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
}
.button-62 {
  width: 100px;
  background: linear-gradient(to bottom right, #ef4765, #ff9a5a);
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 2.5;
  outline: transparent;
  padding: 0 1rem;
  text-align: center;
  text-decoration: none;
  transition: box-shadow 0.2s ease-in-out;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
}

.button-62:not([disabled]):focus {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-62:not([disabled]):hover {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}
</style>
