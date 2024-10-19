<script setup>
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
}
</script>

<template>
    <div id="feedbackborder">
      <div>
      <p id="title">任務區</p>
      <button id="back" class="bi bi-x-circle" @click="goBack"></button>
    </div>
  <div id="Dailytaskblock">
      <form class="needs-validation" name="feedbackdata">
        <h4>每日任務</h4>
        <div>
          <div style="margin-top: 150px; position: relative;">
            <label for="Email" style="width: 12%; text-align: right">信箱 &nbsp;</label>
            <input/>
            <div class="invalid-feedback">請輸入正確信箱</div>
          </div>
  
          
        </div>
  
        <div class="modal-footer justify-content-center" style="margin-top: 5%">
          <button type="button" class="btn button-71" @click="goBack">取消</button>
          <button type="submit" class="btn button-70">傳送</button>
        </div>
      </form>
    </div>
<hr>
<div id="Weeklytaskblock">     
<form class="needs-validation" name="feedbackdata">
        <div>
          <div style="margin-top: 150px; position: relative;">
            <label for="Email" style="width: 12%; text-align: right">信箱 &nbsp;</label>
            <input/>
            <div class="invalid-feedback">請輸入正確信箱</div>
          </div>
  
          
        </div>
  
        <div class="modal-footer justify-content-center" style="margin-top: 5%">
          <button type="button" class="btn button-71" @click="goBack">取消</button>
          <button type="submit" class="btn button-70">傳送</button>
        </div>
      </form>
    </div>
    </div>
    
</template>

<style lang="css" scoped>
#feedbackborder {
  border: 1px solid rgb(12, 61, 70);
  background-color: rgb(230, 213, 198);
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
  color: rgb(17, 63, 103);
  position: absolute;
  top: 30px;
  left: 45%;
}
</style>