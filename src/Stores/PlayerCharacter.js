import { defineStore } from "pinia";
import { ref } from "vue";

export const Playerinformation = defineStore(
  "UserAccount",
  () => {
    //狀態，用來儲存玩家的角色與帳號資訊
    const playerAccount = ref("");
    const isLoggedIn = ref(false);
    const characterID = ref(""); // 保存使用者的角色ID
    const characterName = ref(""); // 角色名稱
    const characterLevel = ref(""); // 角色等級
    const characterExperience = ref(""); // 角色經驗值
    const characterEnvironment = ref(""); // 角色環境值
    const characterCoins = ref(""); // 角色金幣
    const characterTargetWater = ref(""); // 角色目標飲水量
    const characterTargetStep = ref(""); // 角色目標步數
    const characterGetEnvironment = ref(""); // 角色前一日結算取得的環境值
    const characterGetExperience = ref(""); // 角色前一日結算取得的經驗值
    const characterGetCoins = ref(""); // 角色前一日結算取得的金幣
    const Head = ref(""); //頭
    const Upper = ref(""); //衣服
    const Lower = ref(""); //配件
    const isnewcharacter = ref(false); //是否是新角色，要不要觸發劇情,true為新角色
    const music = ref(false); //判斷音樂是否開啟
    const musicvolume = ref(0.2);

    // 建立一個方法，把資料更新到狀態裡
    const updatePlayerData = (data) => {
      playerAccount.value = data.account;
      isLoggedIn.value = true;
      characterID.value = data.cId;
      characterName.value = data.name;
      characterLevel.value = data.level;
      characterExperience.value = data.experience;
      characterEnvironment.value = data.environment;
      characterCoins.value = data.coins;
      characterTargetWater.value = data.targetWater;
      characterTargetStep.value = data.targetStep;
      characterGetEnvironment.value = data.getEnvironment;
      characterGetExperience.value = data.getExperience;
      characterGetCoins.value = data.getCoins;
    };

    const updateCharacterBody = (data) => {
      Head.value = data.head;
      Lower.value = data.lower;
      Upper.value = data.upper;
    };

    const changecoins = (data) => {
      characterCoins.value = data.coins;
    };

    //設定一個將所有資料清空的方法
    const logout = () => {
      playerAccount.value = "";
      isLoggedIn.value = "";
      characterID.value = "";
      characterName.value = "";
      characterLevel.value = "";
      characterExperience.value = "";
      characterEnvironment.value = "";
      characterCoins.value = "";
      characterTargetWater.value = "";
      characterTargetStep.value = "";
      characterGetEnvironment.value = "";
      characterGetExperience.value = "";
      characterGetCoins.value = "";
    };

    const logoutBody = () => {
      Head.value = "";
      Upper.value = "";
      Lower.value = "";
    };
    // 返回ref及方法，外部才可以引用
    return {
      playerAccount,
      isLoggedIn,
      characterID,
      characterName,
      characterLevel,
      characterExperience,
      characterEnvironment,
      characterCoins,
      characterTargetWater,
      characterTargetStep,
      characterGetEnvironment,
      characterGetExperience,
      characterGetCoins,
      Head,
      Upper,
      Lower,
      isnewcharacter,
      music,
      musicvolume,
      updatePlayerData,
      updateCharacterBody,
      logout,
      changecoins,
      logoutBody,
    };
  },
  {
    persist: {
      enabled: true,
      storage: sessionStorage, // 使用 sessionStorage 來存儲資料
    },
  }
);
