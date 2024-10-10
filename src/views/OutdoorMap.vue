<script setup>
import SidebarView from './SidebarView.vue';
</script>

<template>
    <RouterLink class="nav-link" :to="{ name: 'roommap' }"> <i class="fa-regular fa-map"></i> </RouterLink>

    <body id="formborder">
        <SidebarView></SidebarView>
    </body>
</template>

<style lang="css" scoped>
#formborder {
    height: 900px;
    background-color: rgb(194, 234, 228);
}
</style>