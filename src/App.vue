<script setup>
import { onMounted } from 'vue'
import $ from 'jquery'
import Swiper from 'swiper'
import 'swiper/css' // Не забудь стили!
import HomeView from './views/HomeView.vue'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import catalog from './views/catalog.vue'
</script>

<template>
  <Header />
  <div class="wrapper">
    <RouterView />
  </div>
  <Footer />
</template>

<style scoped></style>
