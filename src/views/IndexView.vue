<script setup>
import ForgetPasswordComponent from "@/components/ForgetPasswordComponent.vue";
import { ref } from "vue";
import { onMounted } from "vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
const router = useRouter();
const transition = ref(false); //控制轉場遮罩
//----------------註冊帳號-------------------------------------
const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/IndexPlayers`;

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

const UserData = ref({
  Useraccount: "",
  UserPassword: "",
  UserChaeckPassword: "",
  UserEmail: "",
  UserState: false, //他因為預設是bool的false，所以本來沒有送出name就是false，但token是字串，送出沒有name的話，預設值會送不出去，會變成null而發生400錯誤
  Token: "temporary-token",
});
const APISubmit = async (event) => {
  const form = event.target;
  if (!form.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
  } else {
    try {
      const UserRegisterformData = new FormData(document.UserData); //如果有檔案，使用formdata比較好，沒有檔案的話打包成json比較好
      const response = await fetch(API_URL, {
        method: "POST",
        body: UserRegisterformData,
      });
      if (response.ok) {
        const data = await response.json();
        if (data.message == "註冊成功") {
          Swal.fire({
            text: "註冊成功，請至信箱收取驗證信",
            icon: "success",
          });
        } else {
          Swal.fire({
            text: data.message,
            icon: "error",
          });
        }

        console.log(UserData.value);
      }
    } catch (error) {
      console.error("Fetch error: ", error);
      Swal.fire({
        text: "註冊失敗",
        icon: "error",
      });
    }
  }
};

//----------------註冊帳號end-------------------------------------
//----------------帳號登入----------------------------------------
const PiniaPlayer = Playerinformation(); //初始化
const LoginData = ref({
  account: "",
  password: "",
});

const updatePlayer = (data) => {
  PiniaPlayer.updatePlayerData(data.playerCharacter);
  PiniaPlayer.updateCharacterBody(data.characterAccessorie);
};

const API_URLlogin = `${Base_URL}/IndexPlayers/Login`;
const Login = async () => {
  try {
    const POSTLogin = await fetch(API_URLlogin, {
      method: "POST",
      body: JSON.stringify(LoginData.value),
      headers: { "Content-Type": "application/json" },
    });
    if (POSTLogin.ok) {
      const data = await POSTLogin.json();
      if (data.message === "success") {
        updatePlayer(data); // 更新至pinina
        await showSuccessAlert("登入成功");
        transition.value = true;
        PiniaPlayer.isnewcharacter = false;
        PiniaPlayer.music = true;
        await new Promise((resolve) => setTimeout(resolve, 500)); //等候一秒才跳轉
        console.log(PiniaPlayer);
        await router.push("/outdoor");
      } else {
        if (data.respond === "newcharacter") {
          console.log(data);
          await showSuccessAlert(data.message);
          PiniaPlayer.playerAccount = data.player;
          PiniaPlayer.music = true;
          transition.value = true;
          await new Promise((resolve) => setTimeout(resolve, 500)); //等候一秒才跳轉
          await router.push("/createcharacter");
        } else if (data.respond === "gameover") {
          await showErrorAlert(data.message);
          updatePlayer(data);
          PiniaPlayer.music = true;
          transition.value = true;
          await new Promise((resolve) => setTimeout(resolve, 500)); //等候一秒才跳轉
          await router.push("/outdoor");
        } else {
          await showErrorAlert(data.message);
        }
      }
    }
  } catch (error) {
    console.error("Fetch error: ", error);
  }
};
//----------------帳號登入end-------------------------------------

//---------------忘記密碼------------------------------------------

const submitok = ref(false);
const API_URLForget = `${Base_URL}/IndexPlayers/ForgetPasswordEmail`;
const FORUemail = ref({
  forgetEmail: "",
});
const Istrueinput = async () => {
  console.log(FORUemail.value.forgetEmail);
  const ForgetformData = new FormData(document.FORUemail); //如果有檔案，使用formdata比較好，沒有檔案的話打包成json比較好
  const PostEmail = await fetch(API_URLForget, {
    method: "POST",
    body: ForgetformData,
  });
  if (PostEmail.ok) {
    const response = await PostEmail.json(); // 取得後端回傳回來的內容
    console.log(response);
    if (response.message != "Noaccount") {
      //Noaccount是後端回傳回來的內容
      submitok.value = true;
      console.log(submitok.value);
      console.log(FORUemail.value.forgetEmail);
      await Swal.fire({
        text: response.message,
        icon: "success",
      });
    } else {
      Swal.fire({
        text: "此信箱尚未註冊帳號",
        icon: "error",
      });
      submitok.value = false;
    }
  }
};

const goback = () => {
  //子傳父，關閉component
  submitok.value = false;
};
//---------------忘記密碼end---------------------------------------

//---------------聯絡我們------------------------------------------
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
      const feedbackresponseData = await response.json(); // 解析 JSON 回應
      await Swal.fire({
        text: feedbackresponseData.message,
        icon: "success",
      });
    } else {
      await Swal.fire({
        text: "發生錯誤，請重新填寫表單",
        icon: "error",
      });
    }
  }

  form.classList.add("was-validated"); // 添加檢核標記，只有提交後才檢核
};

//---------------聯絡我們end---------------------------------------
onMounted(() => {
  $(document).ready(function () {
    // 檢查密碼與確認密碼
    $("#checkPassword").on("keyup change", function () {
      var password = $("#creatPassword").val();
      var checkPassword = $(this).val();

      if (password !== checkPassword) {
        $("#checkPassword").addClass("is-invalid").removeClass("is-valid");
        $("#checkPassword").next(".invalid-feedback").css("opacity", 1);
      } else {
        $("#checkPassword").removeClass("is-invalid").addClass("is-valid");
        $("#checkPassword").next(".invalid-feedback").css("opacity", 0); // 隱藏錯誤提示
      }
    });

    // 當密碼欄位更改時，同步檢查確認密碼
    $("#creatPassword").on("keyup change", function () {
      $("#checkPassword").trigger("keyup"); // 觸發確認密碼的檢查
    });
  });

  // 關閉後清空表單
  $("#modal_creatnewaccount,#modal_forgetpassword,#modal_feedback").on(
    "hidden.bs.modal",
    function () {
      var form = $(this).find("form")[0];
      form.reset(); // 清空表單
      form.classList.remove("was-validated"); // 清除驗證狀態
    }
  );
  //開啟的時後清空表單(因為上面那個有時候會有bug沒清乾淨)
  $("#modal_creatnewaccount,#modal_forgetpassword,#modal_feedback").on(
    "show.bs.modal",
    function () {
      var form = $(this).find("form")[0];
      if (form) {
        form.reset(); // 清空表單
        form.classList.remove("was-validated"); // 清除驗證狀態
      }
    }
  );
  function additionalReset() {
    // 重置密码确认字段的状态
    $("#checkPassword").removeClass("is-invalid is-valid");
    $("#checkPassword").next(".invalid-feedback").css("opacity", 0);

    // 重置创建密码字段的状态
    $("#creatPassword").removeClass("is-invalid is-valid");

    // 清除所有输入字段的值
    $("input").val("");
  }

  // 在模态框显示和隐藏时调用额外的重置功能
  $("#modal_creatnewaccount,#modal_forgetpassword,#modal_feedback").on(
    "show.bs.modal hidden.bs.modal",
    function () {
      additionalReset();
    }
  );

  (function () {
    "use strict";

    // 選擇所有需要驗證的表單
    var forms = document.querySelectorAll(".needs-validation");

    // 迴圈遍歷每個表單，並監聽表單的 submit 事件
    Array.prototype.slice.call(forms).forEach(function (form) {
      form.addEventListener(
        "submit",
        function (event) {
          // 檢查表單是否有效
          if (!form.checkValidity()) {
            // 如果表單無效，阻止提交動作和事件傳播
            event.preventDefault();
            event.stopPropagation();
          } else {
            // 如果表單有效，可以執行提交動作
            $(form).closest(".modal").modal("hide"); // 當驗證成功後手動關閉模態框
          }

          // 添加驗證類，以顯示驗證提示
          form.classList.add("was-validated");
        },
        false
      );
    });
  })();
});
</script>

<template>
  <body>
    <transition name="fade" v-show="transition" class="blacktransition">
      <div class="black"></div>
    </transition>
    <div class="introduce">
      <h1>再見！沙發Potato</h1>
      <p>想要擺脫如同couch potato一般的生活，卻不知如何下手嗎？</p>
      <p>趕緊和角色一同搬進 再見！沙發Potato 小鎮</p>
      <p>
        透過記錄每日生活累積金幣，換上喜歡的衣服與房間擺設，向couch potato說掰掰
      </p>
    </div>

    <div v-if="submitok" class="forgetpassword">
      <ForgetPasswordComponent
        :forgetemail="FORUemail.forgetEmail"
        @goback="goback"
      ></ForgetPasswordComponent>
    </div>
    <div
      class="login-container col-4"
      style="border: solid, 1px; text-align: center"
    >
      <h3 style="text-align: center">登入</h3>
      <hr />
      <form style="font: size 12px" name="LoginData" @submit.prevent="Login">
        <div>
          <label for="account">帳號</label>
          <input
            id="account"
            name="account"
            class="form-control"
            style="display: inline-block; margin-left: 5px; width: 80%"
            required
            v-model="LoginData.account"
            autocomplete="off"
          />
        </div>
        <div style="margin-top: 10px">
          <label for="Password">密碼</label>
          <input
            id="Password"
            name="password"
            type="password"
            class="form-control"
            style="display: inline-block; margin-left: 5px; width: 80%"
            required
            v-model="LoginData.password"
            autocomplete="off"
          />
        </div>
        <div style="margin-top: 15px">
          <!-- <RouterLink class="nav-link" :to="{ name: 'roommap' }"> -->
          <button
            id="btn_login"
            class="btn button-55"
            style="font-weight: bolder"
          >
            <i class="bi bi-door-open"></i>&nbsp;登入
          </button>
          <!-- </RouterLink> -->
        </div>

        <!-- 其他功能 -->
        <div style="margin-top: 15px">
          <button
            style="font-size: 12px; margin-right: 10px"
            id="btn_creatnewaccount"
            type="button"
            class="btn button-54"
            data-bs-toggle="modal"
            data-bs-target="#modal_creatnewaccount"
          >
            <i class="fa-solid fa-user"></i>&nbsp;註冊新帳號
          </button>

          <button
            style="font-size: 12px; margin-left: 10px"
            id="btn_forgetpassword"
            type="button"
            class="btn button-54"
            data-bs-toggle="modal"
            data-bs-target="#modal_forgetpassword"
          >
            <i class="fa-solid fa-lock"></i>&nbsp;忘記密碼
          </button>
        </div>
        <div style="margin-top: 5px">
          <button
            style="font-size: 12px; float: right"
            id="btn_feedback"
            type="button"
            class="btn"
            data-bs-toggle="modal"
            data-bs-target="#modal_feedback"
          >
            <i class="fa-regular fa-envelope"></i>&nbsp;聯絡我們
          </button>
        </div>
      </form>
    </div>

    <!-- 註冊新帳號(creatnewaccount)Modal -->
    <div
      class="modal fade"
      id="modal_creatnewaccount"
      tabindex="-1"
      aria-labelledby="creatnewaccountLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="creatnewaccountLabel">
              <i class="fa-solid fa-user"></i>&nbsp;註冊新帳號
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form
              name="UserData"
              class="needs-validation"
              style="font: size 12px"
              novalidate
              @submit.prevent="APISubmit"
            >
              <div>
                <div style="margin-top: 30px">
                  <label for="account" style="width: 15%; text-align: right"
                    >帳號 &nbsp;</label
                  >
                  <input
                    id="account"
                    name="account"
                    type="text"
                    class="form-control"
                    style="display: inline-block; margin-left: 5px; width: 80%"
                    maxlength="30"
                    placeholder="請輸入英文字母、數字"
                    pattern="[0-9a-zA-Z]+"
                    required
                    v-model.trim="UserData.Useraccount"
                    autocomplete="off"
                  />
                  <div class="invalid-feedback">
                    請輸入英數字混合，30位以下字串
                  </div>
                </div>
                <div style="margin-top: 10px">
                  <label for="Email" style="width: 15%; text-align: right"
                    >信箱 &nbsp;</label
                  >
                  <input
                    id="Email"
                    name="email"
                    type="email"
                    class="form-control"
                    style="display: inline-block; margin-left: 5px; width: 80%"
                    placeholder="請輸入可收驗證信之信箱"
                    required
                    v-model.trim="UserData.UserEmail"
                    autocomplete="off"
                  />

                  <div class="invalid-feedback">請輸入正確信箱</div>
                </div>
                <div style="margin-top: 10px">
                  <label
                    for="creatPassword"
                    style="width: 15%; text-align: right"
                    >密碼&nbsp;</label
                  >
                  <input
                    id="creatPassword"
                    name="password"
                    type="password"
                    class="form-control"
                    style="display: inline-block; margin-left: 5px; width: 80%"
                    minlength="6"
                    maxlength="30"
                    placeholder="請輸入英文字母、數字"
                    required
                    pattern="^(?=.*[0-9])(?=.*[a-zA-Z]).*$"
                    v-model.trim="UserData.UserPassword"
                  />
                  <div class="invalid-feedback">請輸入英數字混合，6-30位數</div>
                </div>
                <div style="margin-top: 10px; margin-bottom: 5px">
                  <label
                    for="checkPassword"
                    style="width: 15%; text-align: right"
                    >確認密碼&nbsp;</label
                  >
                  <input
                    id="checkPassword"
                    name="CheckPassword"
                    type="password"
                    class="form-control"
                    style="display: inline-block; margin-left: 5px; width: 80%"
                    minlength="6"
                    maxlength="30"
                    placeholder="請再次輸入密碼"
                    required
                    v-model.trim="UserData.UserChaeckPassword"
                  />
                  <div class="invalid-feedback">與密碼不相符</div>
                </div>
              </div>
              <div
                class="modal-footer justify-content-center"
                style="margin-top: 5%; padding-bottom: 0%"
              >
                <input
                  name="Token"
                  id="Token"
                  v-model="UserData.Token"
                  hidden
                />
                <!-- 一定要有這一行，不然token送不出去 -->
                <button
                  type="button"
                  class="btn button-71"
                  data-bs-dismiss="modal"
                >
                  取消
                </button>
                <button type="submit" class="btn button-70">註冊</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 忘記密碼(forgetpassword)Modal -->

    <div
      class="modal fade"
      id="modal_forgetpassword"
      tabindex="-1"
      aria-labelledby="forgetpasswordLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="forgetpasswordLabel">
              <i class="fa-solid fa-lock"></i>&nbsp;忘記密碼
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form
              name="FORUemail"
              class="needs-validation"
              style="font: size 12px"
              novalidate
              @submit.prevent="Istrueinput"
            >
              <div style="height: 320px">
                <div style="padding-top: 15%">
                  <label for="forgetEmail" style="width: 15%; text-align: right"
                    >信箱 &nbsp;</label
                  >
                  <input
                    id="forgetEmail"
                    type="email"
                    class="form-control"
                    style="display: inline-block; margin-left: 5px; width: 80%"
                    placeholder="請輸入註冊時使用之信箱"
                    required
                    name="forgetEmail"
                    v-model.trim="FORUemail.forgetEmail"
                  />
                  <div class="invalid-feedback">信箱格式錯誤</div>
                </div>
              </div>
              <div
                class="modal-footer justify-content-center"
                style="margin-top: 3%"
              >
                <button
                  type="button"
                  class="btn button-71"
                  data-bs-dismiss="modal"
                >
                  取消
                </button>
                <button type="submit" class="btn button-70">確定</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 聯絡我們(feedback)Modal -->
    <div
      class="modal fade"
      id="modal_feedback"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="feedbackLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="feedbackLabel">
              <i class="fa-regular fa-envelope"></i>&nbsp;聯絡我們
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form
              class="needs-validation"
              name="feedbackdata"
              style="font: size 12px"
              novalidate
              @submit.prevent="feedbacksub"
            >
              <div>
                <div style="margin-top: 10px">
                  <label for="Email" style="width: 15%; text-align: right"
                    >信箱 &nbsp;</label
                  >
                  <input
                    id="Email"
                    type="email"
                    class="form-control"
                    style="display: inline-block; margin-left: 5px; width: 80%"
                    placeholder="請輸入可聯絡之信箱"
                    required
                    name="feedbackdataemail"
                    v-model="feedbackdata.Email"
                  />

                  <div class="invalid-feedback">請輸入正確信箱</div>
                </div>
                <div style="margin-top: 10px">
                  <div style="display: flex; flex-wrap: wrap">
                    <label for="feedback" style="width: 15%; text-align: right"
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
                    <div
                      class="invalid-feedback"
                      style="display: block; margin-left: 16%"
                    >
                      請輸入您的意見
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="modal-footer justify-content-center"
                style="margin-top: 5%"
              >
                <button
                  type="button"
                  class="btn button-71"
                  data-bs-dismiss="modal"
                >
                  取消
                </button>
                <button type="submit" class="btn button-70">傳送</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </body>
</template>

<style lang="css" scoped>
body {
  background-image: linear-gradient(
      rgba(79, 79, 79, 0.5),
      rgba(79, 79, 79, 0.5)
    ),
    url("../components/image/index.png");
  height: 100vh;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
}

.introduce {
  color: rgb(255, 255, 255);
  padding: 10px;
  text-align: center;
  max-width: 800px;
  width: 100%;
  margin-top: 5%;
  margin-bottom: 10px;
}

.login-container {
  background-color: rgba(255, 255, 255);
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.modal.fade {
  margin-top: 5%;
}

/* 移除按鈕點擊時會出現的藍色框 */
.btn:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

.modal-dialog {
  max-width: 900px;
  /* 自訂寬度 */
  width: 100%;
  /* 設定寬度 */
}

.modal-content {
  height: 500px;
  /* 自訂高度 */
  background-color: aliceblue;
}

.invalid-feedback {
  display: block;
  opacity: 0;
  /* 初始隱藏，但保留佔位 */
  height: 20px;
  /* 固定高度來確保佔位 */
  width: 80%;
  margin-left: 16%;
  /* 與 input 的 margin 保持一致 */
  margin-top: 2px;
  margin-bottom: 5px;
}

.was-validated .form-control:invalid ~ .invalid-feedback {
  opacity: 1;
  /* 顯示錯誤提示 */
}

.was-validated .form-control:valid ~ .valid-feedback {
  opacity: 1;
  /* 顯示成功提示 */
}

/* CSS */
.button-55 {
  align-self: center;
  background-color: #bce1f6;
  background-image: none;
  background-position: 0 80%;
  background-repeat: repeat no-repeat;
  background-size: 4px 3px;
  border-radius: 15px 225px 255px 15px 15px 255px 225px 15px;
  border-style: solid;
  border-width: 2px;
  box-shadow: rgba(0, 0, 0, 0.2) 15px 28px 25px -18px;
  box-sizing: border-box;
  color: #41403e;
  cursor: pointer;
  display: inline-block;
  font-family: Neucha, sans-serif;
  font-size: 1rem;
  line-height: 23px;
  outline: none;
  padding: 0.75rem;
  text-decoration: none;
  transition: all 235ms ease-in-out;
  border-bottom-left-radius: 15px 255px;
  border-bottom-right-radius: 225px 15px;
  border-top-left-radius: 255px 15px;
  border-top-right-radius: 15px 225px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-55:hover {
  box-shadow: rgba(0, 0, 0, 0.3) 2px 8px 8px -5px;
  transform: translate3d(0, 2px, 0);
}

.button-55:focus {
  box-shadow: rgba(0, 0, 0, 0.3) 2px 8px 4px -6px;
}

.button-54 {
  font-family: "Open Sans", sans-serif;
  font-size: 16px;
  letter-spacing: 2px;
  text-decoration: none;
  text-transform: uppercase;
  color: #000;
  cursor: pointer;
  border: 3px solid;
  padding: 0.25em 0.5em;
  box-shadow: 1px 1px 0px 0px, 2px 2px 0px 0px, 3px 3px 0px 0px, 4px 4px 0px 0px,
    5px 5px 0px 0px;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-54:active {
  box-shadow: 0px 0px 0px 0px;
  top: 5px;
  left: 5px;
}

@media (min-width: 768px) {
  .button-54 {
    padding: 0.25em 0.75em;
  }
}

/* CSS */
.button-70 {
  background-image: linear-gradient(#81e3d4, #488278);
  border: 0;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.3) 0 5px 15px;
  box-sizing: border-box;
  color: #f4f1f1;
  cursor: pointer;
  font-family: Montserrat, sans-serif;
  font-size: 0.9em;
  margin: 5px;
  padding: 10px 15px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-71 {
  background-image: linear-gradient(#d88fa2, #71434c);
  border: 0;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.3) 0 5px 15px;
  box-sizing: border-box;
  color: #f4eded;
  cursor: pointer;
  font-family: Montserrat, sans-serif;
  font-size: 0.9em;
  margin: 5px;
  padding: 10px 15px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.forgetpassword {
  position: absolute;
  top: 13%;
  left: 37%;
  z-index: 10;
}
</style>
