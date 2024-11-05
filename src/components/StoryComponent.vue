<script setup>
import { Playerinformation } from "@/Stores/PlayerCharacter";
const PiniaPlayer = Playerinformation();

const StartStory = [
  "厭倦了與人合租的日子了",
  "如果有一棟自己的房子該有多好，最好外面有個花園",
  "馬上搭車去尋找一下理想家園吧",
];

const StartInStory = [
  "尋尋覓覓終於找到了理想的家園！",
  "想要長久居住，維持家園的環境也是很重要的",
];
const EndStory = [
  "家園變得越來越髒亂，不再適合居住了",
  "雖然要離開這裡很難受",
  "但已經無法改變了",
  "現在，跟這個馬鈴薯小鎮說再見吧！",
];

const explain = [
  "操作方式： W：上、A：左、S：下、D；右",
  "請試著走到指定位置",
  "每日填寫的生活紀錄會在半夜十二點進行結算，根據填寫內容及玩家的標準值做計算，將影響環境值",
  "如果環境值歸0，遊戲將會結束，請記得每日進行填寫",
  "現在可以開始您的新生活了",
  "因環境值歸0，角色搬家了，請重新創建角色，重新開始新的生活",
  "過去的生活紀錄，仍可以透過過往角色紀錄表查看，並會保留已購買的裝備",
];
</script>

<template>
  <div class="talkborder">
    <h6>{{ PiniaPlayer.characterName }}</h6>
    <p></p>
  </div>
</template>

<style lang="css" scoped>
.talkborder {
  width: 650px;
  height: 300px;
}
</style>
