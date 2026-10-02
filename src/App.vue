<script setup>
import { onMounted } from 'vue'
import $ from 'jquery'
import Swiper from 'swiper'
import 'swiper/css' // Не забудь стили!
import HomeView from './views/HomeView.vue'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import catalog from './views/catalog.vue'
import { useFavoritesStore } from './favoritepinia.js'
import { useCartStore } from './pinia.js' // Путь к вашему стору корзины
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

onMounted(async () => {
  // Запускаем обе загрузки параллельно, чтобы сайт работал быстрее
  await Promise.all([cartStore.loadCartFromDb(), favoritesStore.loadFavoritesFromDb()])
})
</script>

<template>
  <Header />
  <div class="wrapper">
    <RouterView :key="$route.fullPath" />
  </div>
  <Footer />
</template>

<style scoped></style>
