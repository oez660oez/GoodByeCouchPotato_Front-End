<script setup>
   import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const goBack = () => {
    if (route.matched.length > 1) {
        // 如果當前路由有父路由，返回到父路由
        router.push({ name: route.matched[route.matched.length - 2].name });
    } else {
        // 否則，使用瀏覽器的後退功能
        router.go(-1);
    }
}
</script>

<template>
    <div id="feedbackborder">
        <p id="title">更改密碼</p>
        <button id="back" class="bi bi-x-circle" @click="goBack" ></button>
    <form action="" >
        <div>
            
        </div>
    </form>
    </div>
</template>

<style lang="css" scoped>
#feedbackborder {
    border: 1px solid rgb(12, 61, 70);
    background-color: rgb(79, 61, 44);
    width: 912px;
    height: 608px;
    position: fixed;
    top: 50px;
    left: 350px;
}
#back {
    position: absolute;
    border:none;
    top: 0px;
    right: 5px;
    z-index: 1;
}
#title{
    font-size: 30px;
    color: aliceblue;
    position: absolute;
    top: 30px;
    left: 45%;
}
</style>