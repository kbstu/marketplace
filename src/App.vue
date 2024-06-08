<template>
    <v-app>
        <NavBar/>
        <v-main>
            <RouterView />
        </v-main>
    </v-app>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<style scoped>
.cart-items {
	text-align: end;
	padding: 16px;
	font-weight: bold;
	font-size: 24px;
	cursor: pointer;
}
</style>
