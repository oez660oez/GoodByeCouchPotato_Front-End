<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";
import { Playerinformation } from "@/Stores/PlayerCharacter";
const PiniaPlayer = Playerinformation(); //初始化

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
      await Swal.fire({
        imageUrl: "/images/SweetAlert2_test.png",
        customClass: {
          popup: "swal-custom-popup",
        },
        imageHeight: 100,
        imageWidth: 380,
        imageAlt: "A Error image",
        background: "#fff url(/images/SweetAlert2_Background_test.png)",
        confirmButtonText: "",
      });
      return;
    }
    const userAccount = JSON.parse(userAccountJson);
    playerAccount = userAccount.playerAccount;

    if (!playerAccount) {
      await Swal.fire({
        imageUrl: "/images/SweetAlert2_test.png",
        customClass: {
          popup: "swal-custom-popup",
        },
        imageHeight: 100,
        imageWidth: 380,
        imageAlt: "A Error image",
        background: "#fff url(/images/SweetAlert2_Background_test.png)",
        confirmButtonText: "",
      });
      return;
    }
  } catch (error) {
    console.error("解析 UserAccount 失敗:", error);
    await Swal.fire({
      imageUrl: "/images/SweetAlert2_test.png",
      customClass: {
        popup: "swal-custom-popup",
      },
      imageHeight: 100,
      imageWidth: 380,
      imageAlt: "A Error image",
      background: "#fff url(/images/SweetAlert2_Background_test.png)",
      confirmButtonText: "",
    });
    return;
  }
  try {
    //檢查現有角色狀態
    const livingStatus = await checkExistingCharacter(playerAccount);
    if (livingStatus === "居住") {
      await Swal.fire({
        imageUrl: "/images/SweetAlert2_test.png",
        customClass: {
          popup: "swal-custom-popup",
        },
        imageHeight: 100,
        imageWidth: 380,
        imageAlt: "A Error image",
        background: "#fff url(/images/SweetAlert2_Background_test.png)",
        confirmButtonText: "",
      });
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
      await Swal.fire({
        icon: "success",
        title: "成功",
        text: "角色創建成功！",
      });
      // const res = response.json();
      // console.log(res);
      // PiniaPlayer.updatePlayerData(res.playercharacter);
      // PiniaPlayer.updateCharacterBody(res.charactrtbody);
      // window.location.href = "/outdoor";
      // 可以在這裡添加導航到其他頁面的邏輯
    } else {
      const errorData = await response.json();
      errors.value.general = errorData.message || "創建失敗，請稍後再試";
      await Swal.fire({
        imageUrl: "/images/SweetAlert2_test.png",
        customClass: {
          popup: "swal-custom-popup",
        },
        imageHeight: 100,
        imageWidth: 380,
        imageAlt: "A Error image",
        background: "#fff url(/images/SweetAlert2_Background_test.png)",
        confirmButtonText: "",
      });
    }
  } catch (error) {
    console.error("發生錯誤:", error);
    errors.value.general = "發生錯誤，請稍後再試";
    await Swal.fire({
      imageUrl: "/images/SweetAlert2_test.png",
      customClass: {
        popup: "swal-custom-popup", // 更改類別名稱
      },
      imageHeight: 100,
      imageWidth: 380,
      imageAlt: "A Error image",
      background: "#fff url(/images/SweetAlert2_Background_test.png)",
      confirmButtonText: "",
    });
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
        <div class="col-3 offset-2 col-xl-2 text-center p-0 offset-xl-3">
          <label for="name" class="form-label">角色名稱</label>
        </div>
        <div class="col-4 col-xl-3">
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
        </div>
      </div>
      <!-- end -->
      <!-- start -->
      <div class="row mb-3 d-flex align-items-center">
        <div class="col-3 offset-2 col-xl-2 text-center p-0 offset-xl-3">
          <label for="height" class="form-label">身高</label>
        </div>
        <div class="col-4 col-xl-3">
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
      </div>
      <!-- end -->
      <!-- start -->
      <div class="row mb-3 d-flex align-items-center">
        <div class="col-3 offset-2 col-xl-2 text-center p-0 offset-xl-3">
          <label for="exercise" class="form-label">運動強度</label>
        </div>
        <div class="col-4 col-xl-3">
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
      <div class="row mb-5 mt-5">
        <div class="col-12 text-center">
          <!-- input:submit -->
          <button type="submit" class="button-62">創建</button>
        </div>
      </div>
      <!-- end -->
      <!-- 一般錯誤訊息 -->
      <div v-if="errors.general" class="row">
        <div class="col-12 text-center text-danger">
          {{ errors.general }}
        </div>
      </div>
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
/* 修改後的 SweetAlert2 自訂樣式 */
.swal2-popup.swal-custom-popup {
  height: 300px !important;
}

/* 如果需要調整按鈕樣式 */
.swal2-popup.swal-custom-popup .swal2-confirm {
  background-image: url("/images/SweetAlert2_Button_test.png") !important;
  background-color: transparent !important;
  border: none;
  border-radius: 12px;
  width: 86px;
  height: 40px;
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
