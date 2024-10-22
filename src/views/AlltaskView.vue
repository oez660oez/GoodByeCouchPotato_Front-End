<script setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref } from "vue";
const router = useRouter();
const route = useRoute();

const sportdone = ref("12");
const cleandone = ref("20");

const Base_URL = import.meta.env.VITE_API_BASEURL;

//-------------獲取每日任務--------------------
const API_URLgettask = `${Base_URL}/DailyTaskRecords/GetDailyTaskRecords`;
const gettask = async (CId) => {
  var response = await fetch(API_URLgettask, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CId: CId }), //也可以直接簡寫成{ CId }
  });
  if (response.ok) {
    const dailytaskData = await response.json(); // 解析 JSON 響應
    console.log(dailytaskData);
    //放資料
    document.getElementById("task1lbl").textContent = dailytaskData.t1name;
    document.getElementById("task2lbl").textContent = dailytaskData.t2name;
    document.getElementById("task3lbl").textContent = dailytaskData.t3name;
    document.getElementById(
      "T1reward"
    ).textContent = `任務獎勵 ${dailytaskData.t1Reward}金幣`;
    document.getElementById(
      "T2reward"
    ).textContent = `任務獎勵 ${dailytaskData.t2Reward}金幣`;
    document.getElementById(
      "T3reward"
    ).textContent = `任務獎勵 ${dailytaskData.t3Reward}金幣`;
    document.getElementById("task1").checked = dailytaskData.t1completed;
    document.getElementById("task2").checked = dailytaskData.t2completed;
    document.getElementById("task3").checked = dailytaskData.t3completed;
    //已經達成的 checkbox變成disable
    document.getElementById("task1").disabled =
      dailytaskData.t1completed === true;
    document.getElementById("task2").disabled =
      dailytaskData.t2completed === true;
    if (dailytaskData.t3completed == true) {
      document.getElementById("task3").disabled = true;
    }
    //三個都達成的 更新btn變成disable
    if (
      dailytaskData.t1completed === true &&
      dailytaskData.t3completed == true &&
      dailytaskData.t2completed === true
    ) {
      document.getElementById("btndaily").disabled = true;
    }
  }
};
//-------------獲取每日任務end--------------------
//-------------更新每日任務--------------------

//-------------更新每日任務end--------------------
// 打開表單時
onMounted(() => {
  const userAccountString = localStorage.getItem("UserAccount");
  const userAccount = JSON.parse(userAccountString);
  const CId = userAccount.characterID;
  console.log(CId);

  gettask(CId);
});

const goBack = () => {
  if (route.matched.length > 1) {
    // 如果當前路由有父路由，返回到父路由
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    // 否則，使用瀏覽器的後退功能
    router.go(-1);
  }
};
</script>

<template>
  <div id="feedbackborder">
    <div>
      <p id="title">&nbsp;&nbsp;任務區</p>
      <button id="back" class="bi bi-x-circle" @click="goBack"></button>
    </div>

    <!-- 每日任務區塊 -->
    <div id="Dailytaskblock">
      <form class="needs-validation" name="feedbackdata">
        <h4 style="padding-left: 100px">每日任務</h4>
        <div class="task-group">
          <div class="task-list">
            <div class="task-item">
              <input type="checkbox" id="task1" />
              <label for="task1" id="task1lbl"></label>
              <i id="T1reward"></i>
            </div>
            <div class="task-item">
              <input type="checkbox" id="task2" />
              <label for="task2" id="task2lbl"></label>
              <i id="T2reward"></i>
            </div>
            <div class="task-item">
              <input type="checkbox" id="task3" />
              <label for="task3" id="task3lbl"></label>
              <i id="T3reward"></i>
            </div>
          </div>
          <button id="btndaily" class="update-btn">更新</button>
        </div>
      </form>
    </div>

    <hr />

    <!-- 每週任務區塊 -->
    <div id="weeklytaskblock">
      <form class="needs-validation" name="feedbackdata">
        <h4 style="padding-left: 100px; margin-top: 3%">每週任務</h4>
        <div class="weeklytask-group">
          <div class="task-list">
            <div class="task-item">
              <input type="checkbox" id="sport" />
              <label id="sportdonelbl" for="sport">運動 </label>
              <span>進度：{{ sportdone }}/7 &nbsp;&nbsp;目標：每週三次</span>
            </div>
            <div class="task-item">
              <input type="checkbox" id="clean" />
              <label id="cleandonelbl" for="clean">整理環境 </label>
              <span>進度：{{ cleandone }}/7 &nbsp;&nbsp;目標：每週一次</span>
            </div>
          </div>
          <button class="update-btn">更新</button>
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
  margin-top: 30px;
}

.task-group {
  display: flex;
  justify-content: space-between; /* 讓任務列表和按鈕在水平兩側 */
  align-items: center;
  margin-bottom: 20px;
  margin-top: 30px;
  height: 150px;
  position: relative;
}

.weeklytask-group {
  display: flex;
  justify-content: space-between; /* 讓任務列表和按鈕在水平兩側 */
  align-items: center;
  margin-bottom: 30px;
  margin-top: 0px;
  height: 150px;
  position: relative;
}

.task-list {
  display: flex;
  flex-direction: column;
}

.task-item {
  display: flex;
  align-items: center;
  font-size: large;
  margin-bottom: 20px;
  margin-left: 40%;
  width: 500px; /* 固定寬度，避免因為 label 長度影響排版 */
  position: relative;

  padding-top: 10px;
}

.task-item input {
  margin-right: 10px;
}

.task-item label {
  flex-shrink: 0; /* 防止 label 擠壓 checkbox */
  width: 250px; /* 設定 label 固定寬度 */
}

#sportdonelbl,
#cleandonelbl {
  flex-shrink: 0; /* 防止 label 擠壓 checkbox */
  width: 200px; /* 設定 label 固定寬度 */
}

.task-item span {
  width: 400px; /* 設定 label 固定寬度 */
}

.update-btn {
  padding: 5px 10px;
  cursor: pointer;
  position: relative;
  right: 15%; /* 保證按鈕在 task-group 的右方 */
}
</style>
