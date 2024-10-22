<script setup></script>

<template>
  <div class="merchandiseclass">
    <select>
      <option>顯示全部商品</option>
      <option>頭部</option>
      <option>衣服</option>
    </select>

    <select>
      <option>顯示全部等級</option>
      <option>Lv1-10</option>
      <option>Lv11-20</option>
    </select>

    <input type="text" placeholder="請輸入商品名稱" />
  </div>
</template>

<style lang="css" scoped>
.merchandiseclass {
  width: 656px;
  height: 32px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin: 15px;
}

select {
  text-align: center;
  height: 35px;
}
</style>
