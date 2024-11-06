<script setup>
import "bootstrap/dist/css/bootstrap.css";
import { ref } from "vue";
import Swal from "sweetalert2";

const emit = defineEmits(["goback"]); //子傳父
const closeComponent = () => {
  emit("goback");
};

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/IndexPlayers/NewPassword`;

//Alert樣式
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

const props = defineProps({
  forgetemail: String,
});

let useremail = props.forgetemail; //如果直接讓信箱的value是它的話，沒有填寫的時候會產生bug
if (useremail == null) {
  useremail = "讀取信箱失敗，請重試";
}

const usernewpassword = ref({
  email: useremail,
  account: "",
  password: "",
  Verificationnumber: "",
});

const postnewpassword = async () => {
  console.log(usernewpassword.value);
  const userdata = new FormData(document.usernewpassword);
  const postforgerdata = await fetch(API_URL, {
    method: "POST",
    body: userdata,
  });
  if (postforgerdata.ok) {
    const response = await postforgerdata.json();
    await showSuccessAlert(response.message);
    emit("goback");
  }
};
</script>

<template>
  <div class="container col-cm-12">
    <h3>忘記密碼</h3>
    <hr />
    <form
      class="form-group"
      name="usernewpassword"
      @submit.prevent="postnewpassword"
    >
      <div>
        <label id="email" class="form-label toplabel">電子信箱</label>
        <input
          id="email"
          name="email"
          type="text"
          readonly
          class="form-control"
          v-model="usernewpassword.email"
        />
      </div>
      <div>
        <label for="account" class="form-label">帳號</label>
        <input
          id="account"
          name="account"
          v-model.trim="usernewpassword.account"
          type="text"
          class="form-control"
        />
      </div>
      <div>
        <label for="newpassword" class="form-label">重設密碼</label>
        <input
          name="password"
          id="newpassword"
          type="password"
          class="form-control"
          v-model.trim="usernewpassword.password"
        />
      </div>
      <div>
        <label for="verificationnumber">驗證碼</label>
        <input
          id="verificationnumber"
          name="verificationnumber"
          v-model.trim="usernewpassword.Verificationnumber"
          type="number"
          class="form-control"
        />
      </div>
      <div>
        <button type="submit">送出</button>
        <button @click="closeComponent" type="reset">取消</button>
      </div>
    </form>
  </div>
</template>

<style lang="css" scoped>
.container {
  width: 400px;
  height: 600px;
  background-color: white;
  border: 1px solid black;

  border-radius: 2%;
  padding: 50px;
}

.container div {
  margin-bottom: 30px;
}
.container label {
  margin-bottom: 10px;
  display: flex;
}
.toplabel {
  padding-top: 10px;
}
</style>
