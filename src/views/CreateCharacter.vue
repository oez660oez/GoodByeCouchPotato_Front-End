<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import { useRouter } from "vue-router";

const router = useRouter();
const PiniaPlayer = Playerinformation(); //初始化
const transition = ref(false); //是否開啟遮罩

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/CreateCharacter`;

//Alert樣式
const showErrorAlert = async (message) => {
  await Swal.fire({
    imageUrl: "/images/SweetAlert2_ERROR.png",
    customClass: {
      popup: "swal-custom-popup",
      confirmButton: "swal-custom-confirm",
    },
    imageHeight: 100,
    imageWidth: 300,
    imageAlt: "A Error image",
    title: message,
    confirmButtonText: "",
  });
};

const showSuccessAlert = async (message) => {
  await Swal.fire({
    customClass: {
      popup: "swal-custom-popup",
      confirmButton: "swal-custom-confirm",
    },
    imageUrl: "/images/SweetAlert2_SUCCESS.png",
    imageHeight: 100,
    imageWidth: 300,
    title: message,
    confirmButtonText: "",
  });
};
//Alert樣式結束

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
  exerciseIntensity: "",
  general: "",
});

// 添加運動強度驗證函數，驗證玩家不能選預設選項提交
const validateExercise = () => {
  if (form.value.exerciseIntensity === "-請選擇-") {
    errors.value.exerciseIntensity = "請選擇運動強度";
    return false;
  }
  errors.value.exerciseIntensity = "";
  return true;
};

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

//檢查現有角色狀態
const checkExistingCharacter = async (account) => {
  try {
    //後端GET方法，檢查Account
    const response = await fetch(
      `${Base_URL}/CreateCharacter/Status/${account}`
    );
    if (!response.ok) throw new Error("檢查角色狀態失敗");
    const data = await response.json();
    return data.livingStatus; // 假設 API 返回包含 livingStatus 的對象
  } catch (error) {
    console.error("檢查角色狀態時發生錯誤:", error);
    throw error;
  }
};
//form通過後的邏輯
const handleSubmit = async () => {
  //重置所有錯誤訊息
  errors.value = {
    height: "",
    weight: "",
    exerciseIntensity: "",
    general: "",
  };
  //驗證所有欄位
  const isHeightValid = validateHeight();
  const isWeightValid = validateWeight();
  const isExerciseValid = validateExercise();
  //進行表單驗證，確保用戶輸入的身高和體重都符合要求，否則停止提交表單。
  if (!isHeightValid || !isWeightValid || !isExerciseValid) {
    return;
  }

  // 撈登入時儲存於sessionStorage的UserAccount
  let playerAccount = null;
  try {
    const userAccountJson = sessionStorage.getItem("UserAccount");
    if (!userAccountJson) {
      console.log("取不到用戶json");
      await showErrorAlert();
      return;
    }
    const userAccount = JSON.parse(userAccountJson);
    playerAccount = userAccount.playerAccount;

    if (!playerAccount) {
      console.log("取不到用戶帳號");
      await showErrorAlert();
      return;
    }
  } catch (error) {
    console.error("解析 UserAccount 失敗:", error);
    await showErrorAlert("無法取得用戶");
    return;
  }
  try {
    //檢查現有角色狀態
    const livingStatus = await checkExistingCharacter(playerAccount);
    if (livingStatus === "居住") {
      await showErrorAlert("該帳號已有活躍角色");
      return;
    }
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
        account: playerAccount,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      PiniaPlayer.updatePlayerData(data.character);
      PiniaPlayer.updateCharacterBody(data.characterAccessorie);

      await showSuccessAlert("創建角色成功！");
      transition.value = true;
      await new Promise((resolve) => setTimeout(resolve, 500)); //等候一秒才跳轉
      await router.push("/StartStory");
      // 可以在這裡添加導航到其他頁面的邏輯
    } else {
      const errorData = await response.json();
      errors.value.general = errorData.message || "創建失敗，請稍後再試";
      await showErrorAlert(error);
    }
  } catch (error) {
    console.error("發生錯誤:", error);
    errors.value.general = "發生錯誤，請稍後再試";
    await showErrorAlert("發生錯誤，請稍後再試");
  }
};
</script>

<template>
  <body>
    <transition name="fade" v-show="transition" class="blacktransition">
      <div class="black"></div>
    </transition>
    <form @submit.prevent="handleSubmit" class="CreateCharacterData">
      <!-- start -->
      <!-- offset控制留白 -->
      <!-- name其實是select最重要的屬性，沒有會無法傳資料 -->
      <div class="block"></div>
      <div class="container" id="Frame">
        <div class="row">
          <h2 class="col-12 mt-5 mb-5 text-center">創建角色</h2>
        </div>
        <!-- end -->
        <!-- start -->
        <div class="row mb-5 d-flex align-items-center">
          <div class="col-3 offset-2 col-xl-2 text-center p-0 offset-xl-3">
            <label for="name" class="form-label">角色名稱</label>
          </div>
          <div class="col-4 col-xl-3">
            <input
              v-model="form.name"
              type="text"
              id="name"
              class="form-control"
              minlength="2"
              maxlength="16"
              placeholder="請輸入角色名稱"
              required
              autocomplete="off"
            />
          </div>
        </div>
        <!-- end -->
        <!-- start -->
        <div class="row mb-5 d-flex align-items-center">
          <div class="col-3 offset-2 col-xl-2 text-center p-0 offset-xl-3">
            <label for="height" class="form-label">身高</label>
          </div>
          <div class="col-4 col-xl-3" id="input-wrapper">
            <!-- <input type="tel" id="tel" class="form-control" pattern="[A-Z]{1}[0-9]{9}" placeholder="請輸入身分證字號" required> -->
            <input
              v-model="form.height"
              type="text"
              id="height"
              class="form-control"
              :class="{ 'is-invalid': errors.height }"
              pattern="^\d+(\.\d)?$"
              minlength="2"
              maxlength="5"
              placeholder="請輸入身高/公分"
              @input="validateHeight"
              required
              autocomplete="off"
            />
            <div class="invalid-feedback" v-if="errors.height">
              {{ errors.height }}
            </div>
          </div>
          <div class="col-12 col-xl-1">
            <label class="form-label d-none d-xl-block">公分</label>
          </div>
        </div>
        <!-- end -->
        <!-- start -->
        <div class="row mb-5 d-flex align-items-center">
          <div class="col-3 offset-2 col-xl-2 text-center p-0 offset-xl-3">
            <label for="weight" class="form-label">體重</label>
          </div>
          <div class="col-4 col-xl-3" id="input-wrapper">
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
              autocomplete="off"
            />
            <div class="invalid-feedback" v-if="errors.weight">
              {{ errors.weight }}
            </div>
          </div>
          <div class="col-12 col-xl-1">
            <label class="form-label d-none d-xl-block">公斤</label>
          </div>
        </div>
        <!-- end -->
        <!-- start -->
        <div class="row mb-5 d-flex align-items-center">
          <div class="col-3 offset-2 col-xl-2 text-center p-0 offset-xl-3">
            <label for="exercise" class="form-label">運動強度</label>
          </div>
          <div class="col-4 col-xl-3" id="input-wrapper">
            <select
              v-model="form.exerciseIntensity"
              class="form-control"
              :class="{ 'is-invalid': errors.exerciseIntensity }"
              required
              @change="validateExercise"
            >
              <option
                v-for="exercise in exercises"
                :key="exercise.name"
                :value="exercise.name"
              >
                {{ exercise.name }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="errors.exerciseIntensity">
              {{ errors.exerciseIntensity }}
            </div>
          </div>
        </div>
        <!-- end -->
        <!-- start -->
        <div class="row mb-5 mt-4">
          <div class="col-12 text-center">
            <!-- input:submit -->
            <button type="submit" class="btn"></button>
            <div v-if="errors.general" class="row">
              <div class="col-12 text-center text-danger" id="buttonError">
                {{ errors.general }}
              </div>
            </div>
          </div>
        </div>
        <!-- end -->
      </div>
    </form>
  </body>
</template>

<style lang="css" scoped>
body {
  background-image: url("/images/FormBackground.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin: 0; /* 改為 0 */
  min-height: 100vh; /* 新增這行 */
  width: 100%; /* 新增這行 */
  position: relative; /* 新增這行 */
  display: flex; /* 新增這行 */
  flex-direction: column; /* 新增這行 */
  justify-content: center; /* 新增這行 */
}
.container {
  /* 移除固定寬度 */
  max-width: 900px; /* 改用最大寬度 */
  min-width: 320px; /* 設定最小寬度避免過度壓縮 */
  height: auto;
  min-height: 660px; /* 最小高度保持原來的大小 */
  max-height: 660px;
  background-image: url("/images/CreateCharacterForm.png");
  background-size: 100% 100%; /* 確保背景圖片完整顯示 */
  background-repeat: no-repeat;
  /* margin: 30px auto; */
  position: relative;
  padding: 40px 15px; /* 增加左右內距 */
  padding-left: 30px;
}

/* 在小螢幕時調整間距 */
@media (max-width: 768px) {
  .container {
    margin: 15px auto;
    padding: 20px 10px;
  }
}
#Frame {
  padding-top: 60px;
}

#input-wrapper {
  position: relative;
}
.invalid-feedback {
  position: absolute;
}
#buttonError {
  padding-right: 20px;
  position: absolute;
}

.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}
.btn {
  background-image: url("/images/SweetAlert2_Confirm.png") !important;
  background-color: transparent;
  width: 48px !important;
  height: 50px !important;
}
.CreateCharacterData {
  position: relative;
}

.block {
  height: 30px;
}
</style>
