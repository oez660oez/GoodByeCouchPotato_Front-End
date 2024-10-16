<script setup>
import "bootstrap/dist/css/bootstrap.css";
import { ref } from "vue";

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/IndexPlayers`;

const props = defineProps({
  forgetemail: String,
});

const useremail = 0;
if (forgetemail != null) {
  useremail = forgetemail; //如果直接讓信箱的value是它的話，沒有填寫的時候會產生bug
}

const usernewpassword = ref({
  email: "",
  account: "",
  newpassword: "",
  verification: "",
});

const postnewpassword = async () => {
  const userdata = new FormData(Document.usernewpassword);
  const postforgerdata = await fetch(API_URL, {
    method: "POST",
    body: userdata,
  });
  if (postforgerdata.ok) {
    const response = await postforgerdata.json();
    alert(response.message);
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
          name="email"
          type="text"
          readonly
          class="form-control"
          value="useremail"
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
          name="newpassword"
          id="newpassword"
          type="text"
          class="form-control"
          v-model.trim="usernewpassword.newpassword"
        />
      </div>
      <div>
        <label for="verificationnumber">驗證碼</label>
        <input
          id="verificationnumber"
          name="verificationnumber"
          v-model.trim="usernewpassword.verification"
          type="text"
          class="form-control"
        />
      </div>
      <div>
        <button type="submit"></button>>
        <button>取消</button>
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
