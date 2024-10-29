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
    const Head = ref("");
    const Upper = ref("");
    const Lower = ref("");

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
      Playerinformation.value.PlayerAccount = "";
      Playerinformation.value.IsLoggedIn = false;
      Playerinformation.value.CharacterID = "";
      Playerinformation.value.CharacterName = "";
      Playerinformation.value.CharacterLevel = "";
      Playerinformation.value.CharacterExperience = "";
      Playerinformation.value.CharacterEnvironment = "";
      Playerinformation.value.CharacterCoins = "";
      Playerinformation.value.CharacterTargetWater = "";
      Playerinformation.value.CharacterTargetStep = "";
      Playerinformation.value.CharacterGetEnvironment = "";
      Playerinformation.value.CharacterGetExperience = "";
      Playerinformation.value.CharacterGetCoins = "";
      Playerinformation.value.Head = "";
      Playerinformation.value.Upper = "";
      Playerinformation.value.Lower = "";
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
      updatePlayerData,
      updateCharacterBody,
      logout,
      changecoins,
    };
  },
  // {
  //   persist: true, //在這裡啟用pinia持久化
  // }
  {
    persist: {
      enabled: true,
      storage: sessionStorage, // 使用sessionStorage來存儲資料
    },
  }
);
