<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import Swal from "sweetalert2";

const Base_URL = import.meta.env.VITE_API_BASEURL;
const router = useRouter();
const route = useRoute();

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

const goBack = () => {
  if (route.matched.length > 1) {
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    router.go(-1);
  }
};

// ---開啟表單----------------------------
const API_URLgetmail = `${Base_URL}/Feedbacks`;
async function getmail(account) {
  try {
    var response = await fetch(API_URLgetmail, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });
    if (response.ok) {
      const feedbackresponseData = await response.json(); // 解析 JSON 回應
      feedbackdata.value.Email = feedbackresponseData.message;
    }
  } catch (error) {
    // 錯誤處理
    console.error("There was a problem with the fetch operation:", error);
  }
}
onMounted(() => {
  const userAccountString = sessionStorage.getItem("UserAccount");
  const userAccount = JSON.parse(userAccountString);
  const account = userAccount.playerAccount;
  getmail(account);
});

// ---開啟表單 end -----------------------

// 提交表單
const API_URLfeedback = `${Base_URL}/Feedbacks/PostFeedback`;
const feedbackdata = ref({
  Email: "",
  Content: "",
});
const feedbacksub = async (event) => {
  const form = event.target;

  if (!form.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
  } else {
    const response = await fetch(API_URLfeedback, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackdata.value),
    });

    if (response.ok) {
      const feedbackresponseData = await response.json();
      feedbackdata.value.Content = "";
      goBack();
      await showSuccessAlert(feedbackresponseData.message);
    } else {
      await showErrorAlert("發生錯誤，請重新填寫表單");
    }
  }

  form.classList.add("was-validated"); // 添加檢核標記，只有提交後才檢核
};

// ---提交表單 end -----------------------
</script>

<template>
  <div id="feedbackborder">
    <p id="title">聯絡我們</p>
    <!-- <button id="back" class="bi bi-x-circle" @click="goBack"></button> -->
    <div class="inside">
      <form
        class="needs-validation"
        name="feedbackdata"
        novalidate
        @submit.prevent="feedbacksub"
      >
        <div>
          <div style="margin-top: 150px; position: relative">
            <label for="Email" style="width: 12%; text-align: right"
              >信箱 &nbsp;</label
            >
            <input
              id="Email"
              type="email"
              class="form-control"
              style="
                display: inline-block;
                margin-left: 5px;
                width: 80%;
                height: 24px;
              "
              placeholder="請輸入可聯絡之信箱"
              required
              v-model="feedbackdata.Email"
            />
            <div class="invalid-feedback">請輸入正確信箱</div>
          </div>

          <div style="margin-top: 30px; position: relative">
            <div style="display: flex; flex-wrap: wrap">
              <label for="feedback" style="width: 12%; text-align: right"
                >您的意見&nbsp;</label
              >
              <textarea
                name="feedback"
                id="feedbackcontent"
                class="form-control"
                style="
                  margin-left: 7px;
                  resize: none;
                  width: 80%;
                  height: 200px;
                "
                required
                v-model="feedbackdata.Content"
              ></textarea>
              <div class="invalid-feedback">請輸入您的意見</div>
            </div>
          </div>
        </div>

        <div class="modal-footer justify-content-center" style="margin-top: 5%">
          <button type="button" class="btn" @click="goBack"> 取消 </button>
          <button type="submit" class="btn">傳送</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
#feedbackborder {
  /* border: 1px solid rgb(12, 61, 70);
  background-color: rgb(230, 213, 198); */
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
  background-image: url("@/assets/border.png");
  background-size: cover;
}

/* #back {
  position: absolute;
  border: none;
  top: 0px;
  right: 5px;
  z-index: 1;
} */

.btn{
  background-image: url("/images/ConfirmBtn.png");
  background-color: transparent !important;
  border: none !important;
  position: relative;
  margin-right: 50px;
  width: 96px !important;
  height: 51px !important;
}
#title {
  font-size: 30px;
  /* color: rgb(17, 63, 103); */
  position: absolute;
  top: 40px;
  left: 45%;
}

.invalid-feedback {
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 0.875em;
  color: #dc3545;
  padding-left: 13%;
  visibility: hidden; /* 預設隱藏，避免出現時干擾佈局 */
}

.was-validated .form-control:invalid ~ .invalid-feedback {
  visibility: visible; /* 提交後才顯示錯誤訊息 */
}

/* 確保表單輸入框不會被錯誤訊息推動 */
.form-control {
  margin-bottom: 0;
  min-height: 40px; /* 確保不會位移 */
}
.inside {
  width: 800px;
  margin-left: 50px;
}
</style>
