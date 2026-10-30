<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { drawFullFrame } from '../utils.js'
import { bus } from './bus.js'
import { supabase } from '../router/supabase.js'
const selectedCount = ref(5)
// 1. Инициализация клиента базы данных

const favoriteProducts = ref([])
/*
onMounted(async () => {
  const { data, error } = await supabase
    .from('products') // Название вашей таблицы в Supabase
    .select('*')
    .eq('is_liked', true)
  if (!error && data) {
    favoriteProducts.value = data
    nextTick(() => {
      data.forEach((p) =>
        drawFullFrame(
          `canvas-${p.id}`,
          p.frame_url,
          205,
          p.image_url,
          300,
          50,
          p.is_stretch,
          p.colorName,
        ),
      )
    })
  } else if (error) {
    console.error('Ошибка Supabase:', error.message)
  }
})*/

// Функция удаления товара из избранного
const toggleLike = async (product) => {
  product.is_liked = false

  // Удаляем строку из новой таблицы favourites_items в БД
  await supabase.from('favourites_items').delete().eq('id', product.id)

  // Мгновенно убираем товар с экрана избранного
  favoriteProducts.value = favoriteProducts.value.filter((p) => p.id !== product.id)

  // Отправляем глобальный сигнал для обновления счетчика в шапке
  bus.emit('update-favorites', product)
}

onMounted(() => {
  // Загрузка сохраненных товаров из новой таблицы избранного
  const loadStored = async () => {
    const { data, error } = await supabase
      .from('favourites_items')
      .select('*')
      .order('created_at', { ascending: false }) // Новые добавленные товары будут вверху списка

    if (!error && data) {
      favoriteProducts.value = data.map((p) => ({
        ...p,
        is_liked: true,
        link: p.link || `/product/${p.id}`,
        base_price: p.base_price || p.price,
        price: p.price,
      }))
    } else if (error) {
      console.error('Ошибка Supabase:', error.message)
    }
  }

  loadStored()

  // Если лайк снят в шапке сайта, мгновенно убираем товар с экрана избранного
  bus.on('update-favorites', (updatedProduct) => {
    if (!updatedProduct.is_liked) {
      favoriteProducts.value = favoriteProducts.value.filter((p) => p.id !== updatedProduct.id)
    }
  })
})
</script>

<template>
  <ul class="favoriteProducts-grid__content" :data-grid-colums="selectedCount">
    <li
      v-for="favoriteProduct in favoriteProducts"
      :key="favoriteProduct.id"
      class="favoriteProduct__grid-item"
    >
      <article class="product3">
        <!-- router-link теперь и есть блок с картинкой -->
        <router-link
          :to="`/product/${favoriteProduct.product_id}?details=${favoriteProduct.details}`"
          class="favoriteProduct__image"
        >
          <img
            :src="favoriteProduct.image_preview"
            alt="Сборка рамы"
            style="width: 250px; height: auto; display: block; object-fit: contain"
          />
          <button
            class="heart-btn2"
            :class="{
              'is-active': favoriteProduct.is_liked,
              'is-double': favoriteProduct.frame_type === 'double',
            }"
            @click.prevent="toggleLike(favoriteProduct)"
          >
            <svg viewBox="0 0 24 24" width="30" height="30">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </button>
        </router-link>
        <!-- Кнопка-сердечко (ДОБАВЛЕНО) -->

        <span v-if="favoriteProduct.discount" class="favoriteProduct">
          {{ favoriteProduct.discount }}
        </span>
        <!-- Плашки поверх картинки -->
        <span v-for="(tag, index) in favoriteProduct.tags" :key="index" :class="tag.class">
          {{ tag.text }}
        </span>
        <!-- Вторая скидка (новая колонка) -->
        <span v-if="favoriteProduct.second_discount_label" class="favoriteProduct__sale">
          -{{ favoriteProduct.second_discount_label }}%
        </span>

        <div
          class="favoriteProduct__props-container"
          style="display: flex; flex-direction: column; gap: 3px; margin-left: 15px"
        >
          <span v-if="favoriteProduct.discount_label" class="favoriteProduct__prop sales">{{
            favoriteProduct.discount_label
          }}</span>

          <span
            v-if="favoriteProduct.new_label"
            class="favoriteProduct-prop favoriteProduct__prop new"
            >{{ favoriteProduct.new_label }}</span
          >
          <span
            v-if="favoriteProduct.bestseller_label"
            class="favoriteProduct-prop favoriteProduct__prop best"
            >{{ favoriteProduct.bestseller_label }}</span
          >
        </div>

        <h3 class="favoriteProduct__title">
          <router-link
            :to="'/product/' + favoriteProduct.id"
            class="favoriteProduct_catalog_link_color"
            >{{ favoriteProduct.title }}</router-link
          >
        </h3>
        <div class="prices">
          <span class="favoriteProduct__price">
            BYN
            {{
              selectedColor
                ? favoriteProduct.price + (favoriteProduct.paint_price || 0)
                : favoriteProduct.price
            }}</span
          >
          <span v-if="favoriteProduct.old_price" class="favoriteProduct__oldprice">
            BYN {{ favoriteProduct.old_price }}</span
          >
        </div>
      </article>
    </li>
  </ul>
</template>

<style>
.heart-btn2.is-double {
  bottom: 53px; /* Сдвинули на 5px вверх */
  right: 55px; /* Сдвинули на 5px влево */
}
.heart-btn2.is-active svg {
  fill: #ff4d4d;
}
.favoriteProducts-grid__content {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 70px;
  margin-top: 220px;
  /* margin-left: 10px;
  margin-right: 10px;*/
  gap: 50px;
  padding-left: 20px;
  padding-right: 20px;
}
/*
[data-grid-colums='5'] .favoriteProduct__grid-item:not(:nth-child(5n)) {
  margin-right: 3%;
}

[data-grid-colums='5'] .favoriteProduct__grid-item {
  width: 17.6%;
}
  */
.favoriteProduct__grid-item {
  /* padding-bottom: 16px; */
  margin-bottom: 79px;
  /*margin-left: -10px;*/
}

.product2 {
  position: relative;
}

.favoriteProduct__image {
  position: relative;
  display: block;
  overflow: hidden;
  position: relative;
  max-height: 100%;
  object-fit: cover;
  width: fit-content;
  height: min-content;
}
.favoriteProduct__sale {
  position: absolute;
  left: 45px;
  top: 50px;
  /* border: 2px solid #151515; */
  /* color: #111; */
  /* text-transform: uppercase; */
  background: #ff4d4d;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  z-index: 1;
}
.favoriteProduct__title {
  color: #454545;
  font-family: sans-serif;
  font-size: 13px;
  margin: 0;
  margin-left: 15px;
}
.favoriteProduct_link_color {
  color: #000;
}
.favoriteProduct__prop2 {
  display: inline-block;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  color: #111;
  background-position: left center;
  background-repeat: no-repeat;
  padding-left: 16px;
}
.favoriteProduct__title {
  color: #454545;
  font-family: sans-serif;
  font-size: 13px;
  margin: 0;
  margin-left: 15px;
}
.favoriteProduct__price {
  width: 55px;
  height: 13px;
  color: #151515;
  font-weight: 700;
  font-size: 13px;
  margin-left: 15px;
}

.favoriteProduct__oldprice {
  font-weight: 700;
  font-size: 13px;
  color: #959595;
  text-decoration: line-through;
  margin-left: 5px;
}
.favoriteProduct_catalog_link_color {
  color: #000;
}
.heart-btn2 {
  position: absolute;
  bottom: 45px; /* Поднимет сердечко на картинку */
  right: 40px; /* Сдвинет сердечко внутрь картинки справа */
  background: none;
  border: none;
  cursor: pointer;
  z-index: 5; /* Положит кнопку поверх канваса */
}
.favoriteProduct__prop {
  display: inline-block;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  color: #111;
  background-position: left center;
  background-repeat: no-repeat;
  padding-left: 16px;
}
</style>
