<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref } from "vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
const PiniaPlayer = Playerinformation();
const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/IndexPlayers/ChangePassword`;

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

const renewpassword = ref({
  playerAccount: PiniaPlayer.playerAccount,
  oldpassword: "",
  newpassword: "",
});

const changepassword = async () => {
  const checkpassword = $(".checkpassword").val();
  const passwordPattern = /^(?=.*[0-9])(?=.*[a-zA-Z])[A-Za-z0-9]{6,30}$/; //用斜線來定義正則表達式，用引號會變成字串，就無法使用test
  $(".checknewmatch").html("");
  $(".checknewpassword").html(""); //先清空之前的所有訊息

  if (passwordPattern.test(renewpassword.value.newpassword)) {
    if (checkpassword == renewpassword.value.newpassword) {
      const changeform = new FormData(document.renewpassword);
      const response = await fetch(API_URL, {
        method: "POST",
        body: changeform,
      });
      if (response.ok) {
        var serverrespone = await response.json();
        alert(serverrespone.message);
        goBack();
      }
    } else {
      $(".checknewmatch").html("確認密碼與新密碼不相符");
    }
  } else {
    $(".checknewpassword").html("請輸入英數字混合，6-30位數");
  }
};
</script>

<template>
  <div id="feedbackborder">
    <p id="title">更改密碼</p>
    <button id="back" class="bi bi-x-circle" @click="goBack"></button>
    <form
      name="renewpassword"
      class="changepasswordform"
      @submit.prevent="changepassword"
    >
      <div>
        <input
          id="Account"
          name="Account"
          hidden
          v-model.trim="renewpassword.playerAccount"
        />
      </div>
      <div>
        <label for="OldPassword">原密碼</label>
        <input
          type="password"
          id="OldPassword"
          name="OldPassword"
          v-model.trim="renewpassword.oldpassword"
          class="form-control"
          required
        />
      </div>
      <div>
        <label for="NewPassword">新密碼</label>
        <input
          type="password"
          id="NewPassword"
          name="NewPassword"
          v-model.trim="renewpassword.newpassword"
          class="form-control"
          required
        />
        <div class="text-danger checknewpassword"></div>
      </div>
      <div>
        <label for="NewPassword">確認密碼</label>
        <input type="password" class="form-control checkpassword" required />
        <div class="text-danger checknewmatch"></div>
      </div>
      <button type="submit">確定</button>
      <button @click="goBack" type="reset">取消</button>
    </form>
  </div>
</template>

<style lang="css" scoped>
#feedbackborder {
  border: 1px solid rgb(12, 61, 70);
  background-color: rgb(246, 232, 204);
  width: 912px;
  height: 608px;
  position: fixed;
  top: 50px;
  left: 350px;
}
#back {
  position: absolute;
  border: none;
  top: 0px;
  right: 5px;
  z-index: 1;
}
#title {
  font-size: 30px;
  color: rgb(0, 0, 0);
  position: absolute;
  top: 30px;
  left: 45%;
}
.changepasswordform {
  height: 100px;
  width: 400px;
  position: absolute;
  top: 20%;
  left: 30%;
}
.changepasswordform label {
  padding-top: 20px;
  padding-bottom: 10px;
}
.changepasswordform button {
  margin-top: 20px;
  margin-right: 15px;
}
</style>
