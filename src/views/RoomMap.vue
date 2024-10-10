<script setup>
    import SidebarinView from './SidebarinView .vue';
</script>

<template>
    <RouterLink class="nav-link" :to="{name:'outdoor'}">  <i class="fa-regular fa-map"></i> </RouterLink>
    <body id="formborder">
        <SidebarinView ></SidebarinView >
    </body>
</template>

<style lang="css" scoped>
#formborder
{
    height: 900px;
    background-color: rgb(227, 194, 234);
}
</style>