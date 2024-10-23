<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import ShopselectComponentVue from "./ShopselectComponent.vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
const PiniaPlayer = Playerinformation();

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/ShopAccessoriesLists/GetList`;
const API_URL_Purchase = `${Base_URL}/ShopAccessoriesLists/purchase`;
const GetItem = ref({
  allclass: [],
  qualifiedItem: [],
  currentpage: 1,
  totalpages: 0,
});

const purchaseinformation = ref({
  Account: "",
  CId: 0,
  Coins: 0,
  PCode: 0,
  PPrice: 0,
  PLevel: 0,
});

const requestBody = ref({
  page: 1,
  Account: PiniaPlayer.playerAccount,
});

//顯示商品
const GettheAccessoriesList = async (requestBody) => {
  try {
    const GetNewpage = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });
    if (GetNewpage.ok) {
      var data = await GetNewpage.json();
      GetItem.value = data;
      console.log("Fetched data:", data);
      // console.log(GetItem.value.allclass, GetItem.value.qualifiedItem);
      // console.log(GetItem.value.currentpage, GetItem.value.totalpages);
    }
  } catch (error) {
    console.log(error);
  }
};

//刷新
const RenewtheList = async () => {
  requestBody.value.page = 1;
  requestBody.value.Account = PiniaPlayer.playerAccount;
  console.log(PiniaPlayer.characterCoins);
  GettheAccessoriesList(requestBody.value);
};

onMounted(async () => {
  RenewtheList();
});

const lastpage = async () => {
  // console.log("Next page event triggered");
  if (GetItem.value.currentpage - 1 < 1) {
    requestBody.value.page = GetItem.value.totalpages;
    GettheAccessoriesList(requestBody.value);
  } else {
    (requestBody.value.page = GetItem.value.currentpage - 1),
      GettheAccessoriesList(requestBody.value);
  }
};

const nextpage = () => {
  // console.log("Next page event triggered");
  if (GetItem.value.currentpage + 1 > GetItem.value.totalpages) {
    requestBody.value.page = 1;
    GettheAccessoriesList(requestBody.value);
  } else {
    (requestBody.value.page = GetItem.value.currentpage + 1),
      GettheAccessoriesList(requestBody.value);
  }
};

const purchase = async (pcode) => {
  const purchasemerchandise = GetItem.value.qualifiedItem.find(
    (s) => s.pCode == pcode
  );
  let enoughcoins =
    PiniaPlayer.characterCoins - purchasemerchandise.pPrice >= 0;
  let enoughLevel = PiniaPlayer.characterLevel >= purchasemerchandise.pLevel;
  if (enoughcoins && enoughLevel) {
    //驗證等級和貨幣是否足夠
    //因為沒有form送資料，也沒有v-model，所以就在這裡加入資料
    purchaseinformation.value.Account = PiniaPlayer.playerAccount;
    purchaseinformation.value.CId = PiniaPlayer.characterID;
    purchaseinformation.value.Coins = PiniaPlayer.characterCoins;
    purchaseinformation.value.PCode = purchasemerchandise.pCode;
    purchaseinformation.value.PPrice = purchasemerchandise.pPrice;
    purchaseinformation.value.PLevel = purchasemerchandise.pLevel;
    console.log(purchaseinformation.value);
    // const purchaseData = new FormData(document.purchaseinformation);
    const Getpurchase = await fetch(API_URL_Purchase, {
      method: "POST",
      body: JSON.stringify(purchaseinformation.value),
      headers: { "Content-Type": "application/json" },
    });
    if (Getpurchase.ok) {
      const response = await Getpurchase.json();
      alert(response.message);
      PiniaPlayer.characterCoins = response.newcoins;
      RenewtheList();
    }
  } else {
    alert("Coins或等級不足");
  }
};
</script>
<template>
  <div class="selectclass">
    <ShopselectComponentVue
      :currentpage="GetItem.currentpage"
      :allclass="GetItem.allclass"
      @lastpage="lastpage"
      @nextpage="nextpage"
    ></ShopselectComponentVue>
  </div>
  <div class="container">
    <div class="merchandiselist">
      <div class="row">
        <div class="photoborder" v-for="item in GetItem.qualifiedItem">
          <div class="playerhaveitem" v-if="item.ishaveitem"></div>
          <img :src="item.pImageShop" :alt="item.pName" />
          <div class="namelevel">
            <input type="text" name="PCode" :value="item.pCode" hidden />
            <div class="merchandisname itemdetail">{{ item.pName }}</div>
            <div class="level itemdetail">LV {{ item.pLevel }}</div>
          </div>
          <div class="buybutton">
            <button @click="purchase(item.pCode)" name="PCode">
              ＄ {{ item.pPrice }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.merchandiselist {
  width: 656px;
  height: 464px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
.photoborder {
  height: 80px;
  width: 312px;
  background-color: rgb(235, 219, 167);
  border: 1px solid black;
  display: flex;
  padding-top: 8px;
  padding-left: 8px;
  margin: 8px;
  margin-top: 0px;
  margin-left: 14px;
  border-radius: 10px;
  position: relative;
}

.photoborder button {
  height: 32px;
  width: 80px;
}
.photoborder img {
  height: 64px;
  width: 64px;
  background-color: white;
  margin-right: 15px;
  border-radius: 10px;
}
.level {
  font-size: 15px;
}

.merchandisname {
  font-size: 17px;
}
.namelevel {
  height: 48px;
  width: 128px;
}
.buybutton {
  display: flex;
  align-items: end;
  margin-bottom: 8px;
  margin-right: 0px;
}
button {
  border-radius: 10px;
}
.itemdetail {
  margin-bottom: 5px;
}

.playerhaveitem {
  top: 0;
  left: 0;
  /* 把偏移去掉 */
  height: 100%;
  width: 100%;
  /* 令div完全覆蓋 */
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  position: absolute;
}
</style>
