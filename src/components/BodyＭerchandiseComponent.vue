<script setup>
import { onMounted } from "vue";
import { ref, watch } from "vue";
import ShopselectComponentVue from "./ShopselectComponent.vue";
import { Playerinformation } from "@/Stores/PlayerCharacter";
import { computed } from "vue";
import { Merchandiselist } from "@/Stores/Merchandiselist";
import Swal from "sweetalert2";
const PiniaMerchandise = Merchandiselist();
const PiniaPlayer = Playerinformation();

const Base_URL = import.meta.env.VITE_API_BASEURL;
const API_URL = `${Base_URL}/ShopAccessoriesLists/GetList`;
const API_URL_Purchase = `${Base_URL}/ShopAccessoriesLists/purchase`;

const GetItem = ref({
  allclass: [],
  qualifiedItem: [],
  currentpage: 1,
  totalpages: 0,
  allqualifiedItem: [],
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

const selectedLevel = ref({
  Nochoose: "請選擇等級範圍",
  levelRanges: [], //用來儲存等級區間
});

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

const generateLevelRanges = () => {
  if (GetItem.value.allqualifiedItem.length > 0) {
    //確認有商品存在
    //提取所有的等級，map是創造新的陣列
    const levels = GetItem.value.allqualifiedItem.map((item) => item.pLevel);
    const maxLevel = Math.max(...levels); // 找到最高等級，三個點是展開運算符，將陣列轉換成一個個數值，因為在javascript中，max只能處裡單一數值
    selectedLevel.value.levelRanges = []; //先清空一次數據以免干擾
    for (let i = 1; i <= maxLevel; i += 10) {
      selectedLevel.value.levelRanges.push(i); // 每隔十級生成一個區間
    }
  }
};

//取得商品
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
      console.log(GetItem.value);
      // console.log(GetItem.value.allclass, GetItem.value.qualifiedItem);
      // console.log(GetItem.value.currentpage, GetItem.value.totalpages);
      generateLevelRanges(); //計算等級區間
      Nofiltertiemlist.value = JSON.parse(
        JSON.stringify(GetItem.value) //JSON.stringify()先將資料轉換成新json格式，使資料與原始物件沒有引用關係，再去做解析
      ); //將所有商品複製到存放原始資料的物件裡
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

//載入頁面後執行
onMounted(async () => {
  await RenewtheList(); //顯示商品清單
  // console.log(GetItem.value.allqualifiedItem ); //檢查內容是否被加載出來了。沒有
  console.log(selectedLevel.value);
  PiniaMerchandise.First = true;
});

//上一頁
const lastpage = async () => {
  // console.log("Next page event triggered"); 用來確認事件可以執行
  if (GetItem.value.totalpages > 1) {
    if (GetItem.value.currentpage - 1 < 1) {
      requestBody.value.page = GetItem.value.totalpages;
      GettheAccessoriesList(requestBody.value);
    } else {
      (requestBody.value.page = GetItem.value.currentpage - 1),
        GettheAccessoriesList(requestBody.value);
    }
  }
};

//下一頁
const nextpage = () => {
  // console.log("Next page event triggered");
  if (GetItem.value.totalpages > 1) {
    if (GetItem.value.currentpage + 1 > GetItem.value.totalpages) {
      requestBody.value.page = 1;
      GettheAccessoriesList(requestBody.value);
    } else {
      (requestBody.value.page = GetItem.value.currentpage + 1),
        GettheAccessoriesList(requestBody.value);
    }
  }
};

//試穿事件
const MerchandiseOnBody = (pCode) => {
  PiniaMerchandise.Choosemerchandise = true;
  PiniaMerchandise.First = false;
  PiniaMerchandise.setPcode(pCode);
  const Getchoosemerchandise = GetItem.value.allqualifiedItem.filter(
    (item) => item.pCode === pCode
  );
  // PiniaMerchandise.Myhead.value = GetItem.value.allqualifiedItem.find(
  //   (item) => item.pCode == PiniaPlayer.Head
  // );
  PiniaMerchandise.Getmerchandise(Getchoosemerchandise);
  // console.log(Mybody.value);
  // console.log(PiniaMerchandise.Myaccessory);
  // console.log(PiniaMerchandise.Myhead);
  console.log(PiniaMerchandise.Choose);
  console.log(PiniaMerchandise.Getpcode);
  console.log(PiniaMerchandise.Choosemerchandise);
};

//購買商品
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
      await showSuccessAlert(response.message);
      PiniaPlayer.characterCoins = response.newcoins;
      RenewtheList();
    }
  } else {
    await showErrorAlert("Coins或等級不足");
  }
};

const Nofiltertiemlist = ref({
  allclass: [], //沒用到但整批複製
  qualifiedItem: [],
  currentpage: 1,
  totalpages: 0, //沒用到
  allqualifiedItem: [],
}); //用來存放所有分頁後未篩選的資料，因為篩選後會改變GetItem，取消後要還原

const Getsearch = ref({
  Class: "",
  level: 0,
  input: "",
  allqualifiedItem: [],
});

const changeselect = (type, value) => {
  //因為商品是動態顯示，綁定GetItem.qualifiedItem，所以只要這個的內容有改變，就會自動刷新商品列表
  GetItem.value.qualifiedItem = Nofiltertiemlist.value.qualifiedItem; //每次都先還原所有資料再篩選，確保所有資料都有篩到
  Getsearch.value.allqualifiedItem = Nofiltertiemlist.value.allqualifiedItem;

  //=================取所有篩選條件==================
  if (type === "Level") {
    if (value != "") {
      value = Number(value); //將值轉為數字
      Getsearch.value.level = value;
    } else {
      GetItem.value = Nofiltertiemlist.value;
      Getsearch.value.level = 0;
    }
  }
  if (type === "Class") {
    if (value != "") {
      value = String(value);
      Getsearch.value.Class = value;
    } else {
      GetItem.value = Nofiltertiemlist.value;
      Getsearch.value.Class = "";
    }
  }
  if (type === "input") {
    if (value != "") {
      value = String(value);
      Getsearch.value.input = value;
    } else {
      GetItem.value = Nofiltertiemlist.value;
      Getsearch.value.input = "";
    }
  }
  //=================取所有篩選條件==================
  const filteredItems = computed(() => {
    //篩選條件
    let items = Nofiltertiemlist.value.allqualifiedItem; //用來篩選的基底資料
    if (Getsearch.value.Class) {
      //如果有篩選的值
      items = items.filter((item) => item.pClass == Getsearch.value.Class);
    }
    if (Getsearch.value.level > 0) {
      //如果有篩選的值
      items = items.filter(
        (item) =>
          item.pLevel >= Getsearch.value.level &&
          item.pLevel < Getsearch.value.level + 9
      );
    }
    if (Getsearch.value.input) {
      //如果有篩選的值
      items = items.filter((item) =>
        item.pName.includes(Getsearch.value.input)
      );
    }
    // 計算篩選後的總頁數
    GetItem.value.totalpages = Math.ceil(items.length / 10); //ceil是無條件進位法

    // 取得當前頁的項目
    const start = (GetItem.value.currentpage - 1) * 10; //這是用索引的方式取資料，所以要計算開始的索引要用0，乘以10表示取10個，但為0表示從第0項開始，若為第二頁會變成1，取10，從第10，也就是第十一個商品開始
    return items.slice(start, start + 10); //如果start為0，意思就是取從索引0到10的資料，slice是取a到b之間的資料
  });
  GetItem.value.qualifiedItem = filteredItems.value;
  //=================篩選=========================

  // watch(
  //   [() => PiniaPlayer.Upper, () => PiniaPlayer.Lower, () => PiniaPlayer.Head],
  //   () => {
  //     GetMyClothes();
  //     RenewtheList();
  //   }
  // );
};
</script>
<template>
  <div class="selectclass">
    <ShopselectComponentVue
      :allitem="GetItem"
      :allclass="GetItem.allclass"
      :selectedLevel="selectedLevel"
      @lastpage="lastpage"
      @nextpage="nextpage"
      @changeselect="changeselect"
    ></ShopselectComponentVue>
  </div>
  <div class="container">
    <div class="merchandiselist">
      <div class="row">
        <div
          class="photoborder"
          @click="MerchandiseOnBody(item.pCode)"
          v-for="item in GetItem.qualifiedItem"
        >
          <div class="playerhaveitem" v-if="item.ishaveitem"></div>
          <img :src="item.pImageShop" :alt="item.pName" />
          <div class="namelevel">
            <!-- <input type="text" name="PCode" :value="item.pCode" hidden />  -->
            <div class="merchandisname itemdetail">{{ item.pName }}</div>
            <div class="level itemdetail">LV {{ item.pLevel }}</div>
          </div>
          <div class="buybutton">
            <button
              @click="purchase(item.pCode)"
              name="PCode"
              v-if="item.ishaveitem == false"
            >
              ＄ {{ item.pPrice }}
            </button>
            <button
              @click="purchase(item.pCode)"
              name="PCode"
              v-if="item.ishaveitem"
            >
              已售完
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
  height: 85px;
  width: 310px;
  background-color: rgb(189, 168, 124);
  border: 3px dashed rgba(82, 50, 50, 0.847);
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

button {
  background-color: rgba(82, 50, 50, 0.847);
  border: 1.5px dashed rgba(250, 250, 250, 0.847);
  color: white;
}
</style>
