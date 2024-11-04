<script setup>
import { onMounted, ref } from "vue";
import Swal from "sweetalert2";

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/WeightRecord`;

//玩家在input填入的資訊儲存在這裡
const form = ref({
  weight: "",
});

//上個月的體重紀錄
const LastMonthRecord = ref("暫無體重紀錄")

//填入錯誤訊息
const errors = ref({
  weight: "",
  general: "",
});

// 載入上個月的體重記錄
const loadLastMonthRecord = async () => {
  try{
    const userAccountJson = sessionStorage.getItem("UserAccount");
    if (!userAccountJson) return;

    const userAccount = JSON.parse(userAccountJson);
    const response = await fetch(`${API_URL}/Status/${userAccount.playerAccount}`);
    const data = await response.json();

    if(data.weight){
      LastMonthRecord.value = `上個月的體重: ${data.weight} 公斤`;
      form.value.weight = data.weight.toString(); // 預設顯示上個月體重
    }else{
      LastMonthRecord.value = "暫無體重紀錄";
    }
  }catch{
    console.error("載入上個月體重記錄失敗:", error);
    LastMonthRecord.value = "暫無體重紀錄";
  }
}
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
  //重置所有錯誤訊息
  errors.value = {
    weight: "",
    general: "",
  };
  //驗證體重欄位
  const isWeightValid = validateWeight();
  //進行表單驗證，確保用戶輸入的體重符合要求，否則停止提交表單。
  if (!isWeightValid) {
    return;
  }
  // 撈登入時儲存於sessionStorage的UserAccount
  try {
    const userAccountJson = sessionStorage.getItem("UserAccount");
    if (!userAccountJson) {
      await Swal.fire({
      imageUrl: "/images/SweetAlert2_ERROR.png",
      customClass: {
        popup: "swal-custom-popup",
      },
      imageHeight: 100,
      imageWidth: 380,
      imageAlt: "A Error image",
      confirmButtonText: "",
    });
      return;
    }
    const userAccount = JSON.parse(userAccountJson);
    const playerAccount = userAccount.playerAccount;

    if (!playerAccount) {
      await Swal.fire({
      imageUrl: "/images/SweetAlert2_ERROR.png",
      customClass: {
        popup: "swal-custom-popup",
      },
      imageHeight: 100,
      imageWidth: 380,
      imageAlt: "A Error image",
      confirmButtonText: "",
    });
      return;
    }
    //傳出到後端api，移動位置確保playerAccount可用
try {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      //傳出的資料
      weight: Number(form.value.weight),
      account: playerAccount,
    }),
  });
  if (response.ok) {
    await Swal.fire({
      imageUrl: "/images/SweetAlert2_SUCCESS.png",
      customClass: {
        popup: "swal-custom-popup", // 更改類別名稱
      },
      imageHeight: 100,
      imageWidth: 390,
      imageAlt: "A SUCCESS image",
      confirmButtonText: "",
    });
    //重新載入上個月紀錄
    await loadLastMonthRecord();
    //清空表單
    form.value.weight = "";
    // 可以在這裡添加導航到其他頁面的邏輯
  } else {
    const errorData = await response.json();
    errors.value.general = errorData.message || "送出表單失敗，請稍後再試";
    await Swal.fire({
      imageUrl: "/images/SweetAlert2_ERROR.png",
      customClass: {
        popup: "swal-custom-popup",
      },
      imageHeight: 100,
      imageWidth: 380,
      imageAlt: "A Error image",
      confirmButtonText: "",
    });
  }
} catch (error) {
  console.error("發生錯誤:", error);
  errors.value.general = "發生錯誤，請稍後再試";
  await Swal.fire({
      imageUrl: "/images/SweetAlert2_ERROR.png",
      customClass: {
        popup: "swal-custom-popup",
      },
      imageHeight: 100,
      imageWidth: 380,
      imageAlt: "A Error image",
      confirmButtonText: "",
    });
}
  } catch (error) {
    console.error("解析 UserAccount 失敗:", error);
    await Swal.fire({
      imageUrl: "/images/SweetAlert2_ERROR.png",
      customClass: {
        popup: "swal-custom-popup",
      },
      imageHeight: 100,
      imageWidth: 380,
      imageAlt: "A Error image",
      confirmButtonText: "",
    });
    return;
  }
};

//當組件掛載時載入上個月紀錄
onMounted(()=>{
  loadLastMonthRecord();
});
</script>

<template>
  <form @submit.prevent="handleSubmit" class="WeighttaskViewData">
    <!-- start -->
    <!-- offset控制留白 -->
    <!-- name其實是select最重要的屬性，沒有會無法傳資料 -->
    <div class="container">
      <div class="row" id="Frame">
        <h2 class="col-12 mt-5 mb-5 text-center">每月填寫體重</h2>
      </div>
      <!-- end -->
      <!-- start -->
      <div class="row mb-3 d-flex align-items-center">
        <div class="col-3 offset-2 col-xl-2 text-center p-0 offset-xl-3">
          <label for="weight" class="form-label">體重</label>
        </div>
        <div class="col-4 col-xl-3">
          <input
            v-model="form.weight"
            type="text"
            id="weight"
            class="form-control"
            :class="{ 'is-invalid': errors.weight }"
            minlength="2"
            maxlength="5"
            pattern="^\d+(\.\d)?$"
            placeholder="請輸入體重/公斤"
            @input="validateWeight"
            required
          />
          <div class="invalid-feedback" v-if="errors.weight">
            {{ errors.weight }}
          </div>
        </div>
        <div class="col-12 col-xl-1">
          <label class="form-label d-none d-xl-block">公斤</label>
        </div>
        <div class="row col-4 offset-4 col-xl-4 text-center p-0 offset-xl-4 mt-5">
          <span>{{ LastMonthRecord }}</span>
        </div>
      </div>
      <!-- end -->
      <!-- start -->
      <div class="row mb-5 mt-5">
        <div class="col-12 text-center">
          <!-- input:submit -->
          <button type="submit" class="button-62">更新</button>
          <div v-if="errors.general" class="row">
        <div class="col-12 text-center text-danger" id="error">
          {{ errors.general }}
        </div>
      </div>
        </div>
      </div>
      <!-- end -->
      <!-- 一般錯誤訊息 -->

    </div>
  </form>
</template>

<style lang="css" scoped>
.container {
  width: 900px;
  height: 450px;
  background-image: url('/images/WeightForm.png');
  margin: 100px auto;
  position: relative;
}
#Frame{
  padding-top: 40px;
}
.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
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
