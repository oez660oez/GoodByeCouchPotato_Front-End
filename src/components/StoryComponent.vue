<script setup>
import { Playerinformation } from "@/Stores/PlayerCharacter";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const PiniaPlayer = Playerinformation();

const props = defineProps({
  type: String,
});

//遊戲開始
const StartStory = [
  "已經厭倦與人合租的日子了",
  "如果有一棟自己的房子該有多好，最好外面有個花園",
  "馬上搭車去尋找一下理想家園", //這段以後要關掉角色名字
  "操作方式： W：上、A：左、S：下、D：右",
  "請試著走到指定位置（找到紅色區域）",
];

//進入遊戲
const StartInStory = [
  "尋尋覓覓終於找到了夢想中的家！",
  "但想要長久居住，維持家園的環境也是很重要的", //這段以後要關掉角色名字
  "每日填寫的生活紀錄會在半夜十二點進行結算，根據每日填寫內容做計算，將影響環境值",
  "如果環境值歸0，遊戲將會結束，請記得每日填寫「健康紀錄」",
  "現在可以開始新的生活了", //這裡名字要出現
];

//遊戲結束
const EndStory = [
  "家園變得越來越髒亂，不再適合居住了",
  "雖然要離開這裡很難受，但已經無法改變了",
  "現在，跟這個馬鈴薯小鎮說再見吧！", //這段以後要關掉角色名字
  "因環境值歸0，角色搬家了，請重新創建角色，重新開始新的生活",
  "過去的生活紀錄，仍可以透過過往角色紀錄表查看，並會保留已購買的裝備",
];

const currenttext = ref(0); //紀錄目前看到第幾個句子

//創建角色的下一頁
const Startnexttext = () => {
  if (currenttext.value < StartStory.length - 1) {
    currenttext.value += 1;
    Starttypewriter();
    // $(".story").text(StartStory[currenttext.value]);
    if (currenttext.value > StartStory.length - 3) {
      //到第四筆的時候把名字隱藏
      $(".charactername").text("　");
    }
  } else {
    $(".talkborder").css("display", "none");
    // console.log(currenttext.value);
  }
};

//進入遊戲的下一頁
const Startingamenexttext = () => {
  if (currenttext.value < StartInStory.length - 1) {
    currenttext.value += 1;
    Startingame();
    if (currenttext.value > StartInStory.length - 4) {
      $(".charactername").text("　");
    }
  } else {
    $(".talkborder").css("display", "none");
    PiniaPlayer.isnewcharacter = false;
    // console.log(currenttext.value);
  }
};

//遊戲結束的下一頁
const Endnexttext = async () => {
  if (currenttext.value < EndStory.length - 1) {
    currenttext.value += 1;
    Endgame();
    if (currenttext.value > EndStory.length - 3) {
      $(".charactername").text("　");
    }
  } else {
    $(".talkborder").css("display", "none");
    await router.push("/createcharacter");
    // console.log(currenttext.value);
  }
};

//製作打字機效果
let i = 0; //製作打字效果的輸出迴圈
let addtext = ""; //逐漸增加字數

//創建角色的
const Starttypewriter = () => {
  if (StartStory[currenttext.value]) {
    //要確認裡面有值，沒有值的話使用length會卡死
    let textlength = StartStory[currenttext.value].length;
    let alltext = StartStory[currenttext.value];

    if (i < textlength) {
      addtext += alltext[i];
      $(".story").text(addtext);
      i++;
      setTimeout(Starttypewriter, 50);
      $(".nexttext").css("display", "none");
    } else {
      i = 0;
      addtext = "";
      $(".nexttext").show();
    }
  }
};

//進入遊戲之後的
const Startingame = () => {
  if (StartInStory[currenttext.value]) {
    //要確認裡面有值，沒有值的話使用length會卡死
    let textlength = StartInStory[currenttext.value].length;
    let alltext = StartInStory[currenttext.value];

    if (i < textlength) {
      addtext += alltext[i];
      $(".story").text(addtext);
      i++;
      setTimeout(Startingame, 50);
      $(".nexttext").css("display", "none");
    } else {
      i = 0;
      addtext = "";
      $(".nexttext").show();
    }
  }
};

//遊戲結束的
const Endgame = () => {
  if (EndStory[currenttext.value]) {
    //要確認裡面有值，沒有值的話使用length會卡死
    let textlength = EndStory[currenttext.value].length;
    let alltext = EndStory[currenttext.value];

    if (i < textlength) {
      addtext += alltext[i];
      $(".story").text(addtext);
      i++;
      setTimeout(Endgame, 50);
      $(".nexttext").css("display", "none");
    } else {
      i = 0;
      addtext = "";
      $(".nexttext").show();
    }
  }
};

onMounted(() => {
  if (props.type == "Startstory") {
    Starttypewriter();
  } else if (props.type == "StartInStory") {
    Startingame();
  } else if (props.type == "EndStory") {
    Endgame();
  } else {
    console.log("指令傳遞錯誤");
  }
  console.log(props.type);
});
</script>
<template>
  <div class="talkborder">
    <div class="text">
      <p class="charactername">{{ PiniaPlayer.characterName }}：</p>
      <p class="story"></p>
    </div>
    <button
      v-if="props.type == 'Startstory'"
      @click="Startnexttext"
      class="nexttext"
    ></button>
    <button
      v-if="props.type == 'StartInStory'"
      @click="Startingamenexttext"
      class="nexttext"
    ></button>
    <button
      v-if="props.type == 'EndStory'"
      @click="Endnexttext"
      class="nexttext"
    ></button>
  </div>
</template>

<style lang="css" scoped>
.talkborder {
  width: 650px;
  height: 200px;
  background-image: url("@/assets/storyborder.png");
  background-size: cover;
}
.text {
  padding: 50px;
  width: 650px;
  height: 200px;
  /* border: 2px solid red; */
}
.nexttext {
  position: absolute;
  left: 570px;
  bottom: 40px;
  width: 32px;
  height: 32px;
  background-image: url("@/assets/nextpagebutton.png");
  background-size: cover;
}

button {
  background: none;
  border: none;
  padding: 0;
  outline: none;
  cursor: pointer;
}
</style>
