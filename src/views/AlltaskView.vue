<script setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import GoBackComponent from "@/components/GoBackComponent.vue";
import Swal from "sweetalert2";
const PiniaPlayer = Playerinformation();
const router = useRouter();
const route = useRoute();

const Base_URL = import.meta.env.VITE_API_BASEURL;
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
//-------------獲取每日任務--------------------
// 新增添加響應式狀態來追蹤任務完成狀態Start
const taskStatus = ref({
  task1Completed: false,
  task2Completed: false,
  task3Completed: false
});
//新增End
const API_URLgettask = `${Base_URL}/DailyTaskRecords/GetDailyTaskRecords`;
var temreward = {
  t1Reward: 0,
  t2Reward: 0,
  t3Reward: 0,
};
const gettask = async (CId) => {
  var response = await fetch(API_URLgettask, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CId: CId }), //也可以直接簡寫成{ CId }
  });
  if (response.ok) {
    const dailytaskData = await response.json(); // 解析 JSON 響應
    console.log(dailytaskData);

    //新增更新任務完成狀態Start
    taskStatus.value = {
      task1Completed: dailytaskData.t1completed,
      task2Completed: dailytaskData.t2completed,
      task3Completed: dailytaskData.t3completed
    };
    //新增End

    //放資料
    document.getElementById("task1lbl").textContent = dailytaskData.t1name;
    document.getElementById("task2lbl").textContent = dailytaskData.t2name;
    document.getElementById("task3lbl").textContent = dailytaskData.t3name;
    document.getElementById(
      "T1reward"
    ).innerHTML = `X ${dailytaskData.t1Reward}`;
    document.getElementById(
      "T2reward"
    ).innerHTML = `X ${dailytaskData.t2Reward}`;
    document.getElementById(
      "T3reward"
    ).innerHTML = `X ${dailytaskData.t3Reward}`;

    document.getElementById("task1").checked = dailytaskData.t1completed;
    document.getElementById("task2").checked = dailytaskData.t2completed;
    document.getElementById("task3").checked = dailytaskData.t3completed;

    //站存一下reward
    temreward.t1Reward = dailytaskData.t1Reward;
    temreward.t2Reward = dailytaskData.t2Reward;
    temreward.t3Reward = dailytaskData.t3Reward;

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

//-------------獲取每週任務-----------------------
const API_URLgetweektask = `${Base_URL}/WeeklyHealthRecords/GetWeeklyHealthRecords`;
const sportdone = ref("");
const cleandone = ref("");
const tempSportStatus = ref(false); //負責控制前台的btn顯示
//因為是響應式，isabled會變成只要使用者打勾，disabled就立刻轉成true，因此要一組是從後端傳來、一組為當前頁面(要傳回後端的)
const tempCleanStatus = ref(false);
const todaysport = ref(false); // 當前頁面的btn狀態
const todayclean = ref(false);
const isDisabledSport = computed(() => tempSportStatus.value === true);
const isDisabledClean = computed(() => tempCleanStatus.value === true);
const isDisabledUpdate = computed(
  () => tempSportStatus.value === true && tempCleanStatus.value === true
);

const getweeklytask = async (CId) => {
  var response = await fetch(API_URLgetweektask, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CId }), //也可以直接簡寫成{ CId }
  });
  if (response.ok) {
    const WeeklytaskData = await response.json(); // 解析 JSON 響應
    console.log(WeeklytaskData);
    sportdone.value = WeeklytaskData.countsport;
    cleandone.value = WeeklytaskData.countclean;

    todaysport.value = WeeklytaskData.todaysport;
    todayclean.value = WeeklytaskData.todayclean;
    tempSportStatus.value = WeeklytaskData.todaysport;
    tempCleanStatus.value = WeeklytaskData.todayclean;
  }
};

//-------------獲取每週任務end--------------------
// -------------打開表單時------------------
onMounted(() => {
  const userAccountString = sessionStorage.getItem("UserAccount");
  const userAccount = JSON.parse(userAccountString);
  const CId = userAccount.characterID;
  console.log(CId);
  gettask(CId);
  getweeklytask(CId);
  // --------------打開表單end--------------------

  //-------------更新每日任務--------------------
  const API_URLDailyupdate = `${Base_URL}/DailyTaskRecords`;
  var dailyupdate = document.getElementById("btndaily");
  dailyupdate.addEventListener("click", async function (event) {
    event.preventDefault();
    //建要傳送的資料
    const updatedata = {
      CId: userAccount.characterID,
      t1name: document.getElementById("task1lbl").textContent,
      t1completed: document.getElementById("task1").checked,
      t1Reward: temreward.t1Reward,
      t2name: document.getElementById("task2lbl").textContent,
      t2completed: document.getElementById("task2").checked,
      t2Reward: temreward.t2Reward,
      t3name: document.getElementById("task3lbl").textContent,
      t3completed: document.getElementById("task3").checked,
      t3Reward: temreward.t3Reward,
    };
    console.log(updatedata);
    //呼叫API
    var response = await fetch(API_URLDailyupdate, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedata),
    });
    if (response.ok) {
      const feedbackresponseData = await response.json();
      // 執行對應的 alert
      if (feedbackresponseData.done > 0) {
        await showSuccessAlert(feedbackresponseData.returnword);
        //新增更新任務完成狀態Start
      taskStatus.value = {
        task1Completed: document.getElementById("task1").checked,
        task2Completed: document.getElementById("task2").checked,
        task3Completed: document.getElementById("task3").checked
      };
      //新增End
      } else {
        await showErrorAlert(feedbackresponseData.returnword);
      }

      if (updatedata.t1completed) {
        document.getElementById("task1").disabled = true;
      }
      if (updatedata.t2completed) {
        document.getElementById("task2").disabled = true;
      }
      if (updatedata.t3completed) {
        document.getElementById("task3").disabled = true;
      }
      if (
        updatedata.t1completed == true &&
        updatedata.t3completed == true &&
        updatedata.t2completed == true
      ) {
        document.getElementById("btndaily").disabled = true;
      }
      //更新Pinia的金幣
      PiniaPlayer.characterCoins = feedbackresponseData.coin;
    } else {
      alert("更新失敗，請稍後再試");
    }
  });
  //-------------更新每日任務end--------------------
});

//-------------更新每週任務--------------------

const API_URLWeeklyupdate = `${Base_URL}/WeeklyHealthRecords`;
const weeklyupdate = async () => {
  console.log("OK");
  const userAccountString = sessionStorage.getItem("UserAccount");
  const userAccount = JSON.parse(userAccountString);
  const CId = userAccount.characterID;
  const weeklyupdatedata = {
    CId: CId,
    countsport: sportdone.value,
    countclean: cleandone.value,
    todaysport: todaysport.value,
    todayclean: todayclean.value,
  };
  var response = await fetch(API_URLWeeklyupdate, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weeklyupdatedata),
  });
  if (response.ok) {
    const weeklyupdateresult = await response.json();
    // 判斷條件
    const isError =
      (!weeklyupdateresult.todaysport &&
        !weeklyupdateresult.todayclean &&
        !tempCleanStatus.value &&
        !tempSportStatus.value) ||
      (weeklyupdateresult.todaysport &&
        !weeklyupdateresult.todayclean &&
        tempSportStatus.value &&
        !tempCleanStatus.value) ||
      (!weeklyupdateresult.todaysport &&
        weeklyupdateresult.todayclean &&
        !tempSportStatus.value &&
        tempCleanStatus.value);

    // 執行對應的 alert
    if (isError) {
      await showErrorAlert(weeklyupdateresult.returnword);
    } else {
      await showSuccessAlert(weeklyupdateresult.returnword);
    }
    console.log({
      "weeklyupdateresult.todaysport": weeklyupdateresult.todaysport,
      "weeklyupdateresult.todayclean": weeklyupdateresult.todayclean,
      todaysport: tempSportStatus.value,
      todayclean: tempCleanStatus.value,
    });

    sportdone.value = weeklyupdateresult.countsport;
    cleandone.value = weeklyupdateresult.countclean;
    todaysport.value = weeklyupdateresult.todaysport;
    todayclean.value = weeklyupdateresult.todayclean;
    tempSportStatus.value = todaysport.value;
    tempCleanStatus.value = todayclean.value;
  } else {
    alert("更新失敗，請稍後再試");
  }
};

//-------------更新每週任務end--------------------

//-------------回上一層--------------------
const goBack = () => {
  if (route.matched.length > 1) {
    // 如果當前路由有父路由，返回到父路由
    router.push({ name: route.matched[route.matched.length - 2].name });
  } else {
    // 否則，使用瀏覽器的後退功能
    router.go(-1);
  }
};
//-------------回上一層end--------------------
</script>

<template>
  <div id="feedbackborder">
    <div>
      <!-- <p id="title">&nbsp;&nbsp;任務區</p> -->
      <div class="goback">
        <GoBackComponent @goback="goBack"></GoBackComponent>
      </div>
    </div>

    <!-- 每日任務區塊 -->
    <div id="Dailytaskblock">
      <form class="needs-validation" name="feedbackdata">
        <div>
          <h4 class="vertical-title">每日任務</h4>
        </div>
        <div class="task-group">
          <div class="task-list">
            <div class="task-item">
              <div class="card" :class="{ 'completed-task': taskStatus.task1Completed }">
                <div class="card-body">
                  <blockquote class="blockquote mb-0">
                    <label for="task1" id="task1lbl"></label>
                    <div class="footer">
                      <p>任務獎勵：</p>
                      <div class="reward-container">
                        <div class="coin-image"></div>
                        <div class="coin-count mt-2"><p id="T1reward"></p></div>

    </div>
                    </div>
                  </blockquote>
                </div>
                <div class="task-footer">
                  <div class="checkbox-wrapper-23">
                    <input
                      type="checkbox"
                      class="check-23"
                      id="task1"
                    />
                    <label for="task1" style="--size: 25px">
                      <svg viewBox="0,0,50,50">
                        <path d="M5 30 L 20 45 L 45 5"></path>
                      </svg>
                    </label>
                  </div>
                  <div v-if="taskStatus.task1Completed" class="stamp-image"></div>
                </div>
              </div>

              <div class="card" :class="{ 'completed-task': taskStatus.task2Completed }">
                <div class="card-body">
                  <blockquote class="blockquote mb-0">
                    <label for="task2" id="task2lbl"></label>
                    <div class="footer">
                      <p>任務獎勵：</p>
                      <div class="reward-container">
                        <div class="coin-image"></div>
                        <div class="coin-count mt-2"><p id="T2reward"></p></div>

    </div>
                    </div>
                  </blockquote>
                </div>
                <div class="task-footer">
                  <div class="checkbox-wrapper-23">
                    <input
                      type="checkbox"
                      class="check-23"
                      id="task2"
                    />
                    <label for="task2" style="--size: 25px">
                      <svg viewBox="0,0,50,50">
                        <path d="M5 30 L 20 45 L 45 5"></path>
                      </svg>
                    </label>
                  </div>
                  <div v-if="taskStatus.task2Completed" class="stamp-image"></div>
                </div>
              </div>

              <div class="card" :class="{ 'completed-task': taskStatus.task3Completed }">
                <div class="card-body">
                  <blockquote class="blockquote mb-0">
                    <label for="task3" id="task3lbl"></label>
                    <div class="footer">
                      <p>任務獎勵：</p>
                      <div class="reward-container">
                        <div class="coin-image"></div>
                        <div class="coin-count mt-2"><p id="T3reward"></p></div>

    </div>
                    </div>
                  </blockquote>
                </div>
                <div class="task-footer">
                  <div class="checkbox-wrapper-23">
                    <input
                      type="checkbox"
                      class="check-23"
                      id="task3"
                    />
                    <label for="task3" style="--size: 25px">
                      <svg viewBox="0,0,50,50">
                        <path d="M5 30 L 20 45 L 45 5"></path>
                      </svg>
                    </label>
                  </div>
                  <div v-if="taskStatus.task3Completed" class="stamp-image"></div>
                </div>
              </div>
            </div>
          </div>
          <button id="btndaily" class="update-btn">達成</button>
        </div>
      </form>
    </div>

    <!-- 每週任務區塊 -->
    <div id="weeklytaskblock">
      <form
        @submit.prevent="weeklyupdate"
        class="needs-validation"
        name="feedbackdata"
      >
      <h4 class="vertical-title" id="week-title">每週任務</h4>
        <div class="weeklytask-group">
          <div class="task-list">
            <div class="task-item-week">
              <div class="card-week" :class="{ 'completed-task': tempSportStatus }">
                <div class="card-header">
                  <p>進度
    <span :class="{ 'incomplete': sportdone < 3 }">{{ sportdone }}</span>/7 &nbsp;&nbsp;
  </p>
                </div>
                <div class="card-body" for="sport">
                  <blockquote class="blockquote mb-0">
                    <label id="sportdonelbl" for="sport">運動</label>

                    <div class="footer">
                      <span>目標：每週三次</span>
                    </div>
                  </blockquote>
                </div>
                <div class="task-footer">
                <div class="checkbox-wrapper-23">
                    <input
                      type="checkbox"
                      class="check-23"
                      id="sport"
                      v-model="todaysport"
                      :disabled="isDisabledSport"
                    />
                    <label for="sport" style="--size: 25px">
                      <svg viewBox="0,0,50,50">
                        <path d="M5 30 L 20 45 L 45 5"></path>
                      </svg>
                    </label>
                  </div>
                  <div v-if="tempSportStatus" class="stamp-image"></div>
                </div>
              </div>

              <div class="card-week" :class="{ 'completed-task': tempCleanStatus }">
                <div class="card-header">
                  <p>進度
    <span :class="{ 'incomplete': cleandone < 1 }">{{ cleandone }}</span>/7 &nbsp;&nbsp;
  </p>
                </div>
                <div class="card-body">
                  <blockquote class="blockquote mb-0">
                    <label id="cleandonelbl" for="clean">整理環境</label>
                    <div class="footer">
                      <span>目標：每週一次</span>
                    </div>
                  </blockquote>
                </div>
                <div class="task-footer">
                <div class="checkbox-wrapper-23">
                    <input
                      type="checkbox"
                      class="check-23"
                      id="clean"
                      v-model="todayclean"
                      :disabled="isDisabledClean"
                    />
                    <label for="clean" style="--size: 25px">
                      <svg viewBox="0,0,50,50">
                        <path d="M5 30 L 20 45 L 45 5"></path>
                      </svg>
                    </label>
                  </div>
                  <div v-if="tempCleanStatus" class="stamp-image"></div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            id="btnweekly"
            class="update-btn"
            :disabled="isDisabledUpdate"
          >達成</button>
        </div>
      </form>
    </div>
  </div>
  <!-- <div class="checkbox-wrapper-23">
    <input type="checkbox" id="check-23" />
    <label for="check-23" style="--size: 30px">
      <svg viewBox="0,0,50,50">
        <path d="M5 30 L 20 45 L 45 5"></path>
      </svg>
    </label>
  </div> -->
</template>

<style lang="css" scoped>
#feedbackborder {
  /* border: 1px solid rgb(12, 61, 70);
  background-color: rgb(230, 213, 198); */
  background-image: url("@/assets/Taskborder.png");
  background-size: cover;
  width: 912px;
  height: 620px;
  position: fixed;
  top: 50px;
  left: 350px;
}

.vertical-title {
  writing-mode: vertical-rl;
  text-orientation: upright;
  padding-left: 0;  /* 移除原有的左邊距 */
  margin: 20px;     /* 加入適當的邊距 */
  height: 150px;    /* 設定高度以容納文字 */
  position: absolute;
  left: 70px;       /* 調整標題的左側位置 */
}

#week-title{
margin-top: 60px;
}
#Dailytaskblock {
  margin-top: 80px;
}

#weeklytaskblock {
  margin-top: 120px;
}

/* #back {
  position: absolute;
  border: none;
  top: 0px;
  right: 5px;
  z-index: 1;
} */

#title {
  font-size: 30px;
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
.blockquote {
  width: 100%;
  max-width: 160px; /* 確保 blockquote 不會超出卡片寬度 */
}

.blockquote label {
  display: block;
  width: 100%;
  word-break: break-word; /* 強制換行 */
  white-space: pre-wrap; /* 保留空格並換行 */
  line-height: 1.4;
  margin-bottom: 8px;
  font-size: 16px; /* 調整字體大小 */
  overflow-wrap: break-word; /* 確保長單詞也會換行 */
  max-width: 160px; /* 限制最大寬度 */
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
.card {
  background-color: transparent;
  background-image: url("/images/DailyTask.png");
  border: none;
  margin-right: 0px !important;
  margin-top: 70px !important;
  min-width: 192px !important;
  max-width: 192px !important;
  min-height: 230px !important;
  max-height: 230px !important;
  position: relative;
  padding: 10px;
}
.card-header {
  margin-left: 20px !important;
  margin-top: 25px !important;
}
.card-body {
  min-width: 120px !important;
  padding: 15px 15px 0 15px!important;
  max-height: 120px !important;
}
.task-footer{
  display: flex;
  justify-content: center;
  margin-top: 30px;
  position: relative; /* 確保絕對定位的印章相對於這個元素定位 */
}
.footer {
  color: gray;
  font-size: 16px;
}
p{
  margin: 0px !important;
}
.incomplete {
  color: #CC0000; /* 未完成時的紅色 */
}
.card-week {
  background-color: transparent;
  background-image: url("/images/DailyTask_2.png");
  border: none;
  margin-right: 25px !important;
  margin-top: 100px !important;
  min-width: 200px !important;
  max-width: 200px !important;
  min-height: 230px !important;
  max-height: 230px !important;
  position: relative;
}
.reward-container {
    display: flex;
    align-items: center;
    gap: 10px; /* 控制文字和圖示之間的間距 */
    margin: 10px 0px 0px 20px;
    position: absolute;
}
.stamp-image {
  background-color: transparent;
  background-image: url("/images/Stamp.png");
  width: 61px;
  height: 62px;
  position: absolute;
  margin-left: 100px;
  transform: translateY(-5px); /* 使用 transform 來向上移動印章 */
  opacity: 1;
  transition: opacity 0.3s ease; /* 添加淡入效果 */
}
.coin-image {
  background-color: transparent;
  background-image: url("/images/BigCoin.png");
  background-size: contain; /* 確保圖片適當縮放 */
  background-repeat: no-repeat; /* 防止圖片重複 */
  background-position: center; /* 圖片置中 */
  width: 51px;
  height: 45px;
  display: inline-block; /* 確保 div 會顯示出來 */
}
.task-item-week {
  display: flex;
  align-items: center;
  font-size: large;
  margin-bottom: 20px;
  margin-left: 50%;
  min-width: 500px; /* 固定寬度，避免因為 label 長度影響排版 */
  position: relative;
  padding-top: 10px;
}

.task-item {
  display: flex;
  align-items: center;
  font-size: large;
  margin-bottom: 20px;
  margin-left: 30%;
  min-width: 500px; /* 固定寬度，避免因為 label 長度影響排版 */
  position: relative;
  padding-top: 10px;
}

.task-item input {
  margin-right: 10px;
}

.task-item label {
  flex-shrink: 0; /* 防止 label 擠壓 checkbox */
}

#sportdonelbl,
#cleandonelbl {
  flex-shrink: 0; /* 防止 label 擠壓 checkbox */
  width: 150px; /* 設定 label 固定寬度 */
}

.task-item span {
  width: 400px; /* 設定 label 固定寬度 */
}

.update-btn {
  background-image: url("/images/ConfirmBtn.png");
  background-color: transparent !important;
  border: none !important;
  position: relative;
  margin-right: 50px;
  width: 96px !important;
  height: 51px !important;
}
#btnweekly{
  margin-top: 70px;
}
.completed-task {
  filter: brightness(0.8) saturate(1.2);  /* 降低亮度並稍微提升飽和度 */
  opacity: 0.9;  /* 稍微提高不透明度 */
  transition: all 0.3s ease;
}

/* 懸停效果也可以相應調整 */
.completed-task:hover {
  filter: brightness(0.85) saturate(1.1);  /* 懸停時稍微提亮 */
  opacity: 0.95;
}
.checkbox-wrapper-23 *,
.checkbox-wrapper-23 *:after,
.checkbox-wrapper-23 *:before {
  box-sizing: border-box;

}

.checkbox-wrapper-23 input {
  position: absolute;
  opacity: 0;

}

.checkbox-wrapper-23 input:checked + label svg path {
  stroke-dashoffset: 0;
}

.checkbox-wrapper-23 input:focus + label {
  transform: scale(1.03);
}

.checkbox-wrapper-23 input + label {
  display: block;
  border: 2px solid #333;
  width: var(--size);
  height: var(--size);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-wrapper-23 input + label:active {
  transform: scale(1.05);
  border-radius: 12px;
}

.checkbox-wrapper-23 input + label svg {
  pointer-events: none;
  padding: 5%;
}

.checkbox-wrapper-23 input + label svg path {
  fill: none;
  stroke: #333;
  stroke-width: 4px;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 101;
  transition: all 250ms cubic-bezier(1, 0, 0.37, 0.91);
}
</style>
