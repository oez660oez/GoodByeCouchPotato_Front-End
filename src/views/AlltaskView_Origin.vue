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
      } else {
        await showErrorAlert(feedbackresponseData.returnword);
      }
      alert(feedbackresponseData.returnword);
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
    alert(weeklyupdateresult.returnword);
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
        <h4 style="padding-left: 100px; margin-top: 3%">每週任務</h4>
        <div class="weeklytask-group">
          <div class="task-list">
            <div class="task-item">
              <input
                type="checkbox"
                id="sport"
                v-model="todaysport"
                :disabled="isDisabledSport"

              />
              <label id="sportdonelbl" for="sport">運動 </label>
              <span
                >本週累積：{{ sportdone }}/7 &nbsp;&nbsp;目標：每週三次</span
              >
            </div>
            <div class="task-item">
              <input
                type="checkbox"
                id="clean"
                v-model="todayclean"
                :disabled="isDisabledClean"
              />
              <label id="cleandonelbl" for="clean">整理環境 </label>
              <span
                >本週累積：{{ cleandone }}/7 &nbsp;&nbsp;目標：每週一次</span
              >
            </div>
          </div>
          <button
            type="submit"
            id="btnweekly"
            class="update-btn"
            :disabled="isDisabledUpdate"
          >
            達成
          </button>
        </div>
      </form>
    </div>
  </div>
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

#Dailytaskblock{
  margin-top: 80px;
}

#weeklytaskblock{
  margin-top: 80px;
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
  width: 150px; /* 設定 label 固定寬度 */
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