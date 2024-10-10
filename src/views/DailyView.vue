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
    <div id="formborder">
        <button id="back" class="bi bi-x-circle" @click="goBack"></button>
    </div>
</template>

<style lang="css" scoped>
#formborder {
    display: flex;
    justify-content: flex-end;
    border: 1px solid rgb(63, 12, 70);
    background-color: rgb(225, 230, 245);
    width: 912px;
    height: 608px;
    position: fixed;
    top: 50px;
    left: 350px;
}

#back {
    height: 30px;
    border: none;
    justify-content: flex-end;
    margin-right: 5px;
    background-color: white;
}
</style>