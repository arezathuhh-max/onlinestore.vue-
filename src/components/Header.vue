<script setup>
import { onMounted, onUnmounted, nextTick, watch, ref, computed } from 'vue'
import { bus } from '../views/bus.js'
import { drawFullFrame } from '../utils.js'

import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://aqfposmbxcqbpumvydhb.supabase.co',
  'sb_publishable_fhBTokXYW4pHJx2MI78jSA_9nysDSdd',
)
const favorites = ref([])

const activeBlock = ref(null) // Хранит 'heart', 'cart' или null

const toggle = (name) => {
  activeBlock.value = activeBlock.value === name ? null : name
}

const props = defineProps(['products'])

const likedProducts = computed(() => (props.products || []).filter((p) => p.is_liked))
/*
onMounted(() => {
  // 1. Быстрая фоновая загрузка без блокировки
  const loadStored = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_liked', true)
      .order('updated_at', { ascending: true })
    if (data) {
      favorites.value = data
      // Рисуем с большой задержкой, чтобы не мешать каталогу
      setTimeout(() => {
        data.forEach((p) =>
          drawFullFrame(
            `canvas-fav-${p.id}`,
            p.frame_url,
            120,
            p.image_url,
            120,
            40,
            p.is_stretch,
            p.selected_color,
          ),
        )
      }, 800)
    }
  }
  loadStored()

  // 2. Слушатель кликов (всегда активен)
  bus.on('update-favorites', (updatedProduct) => {
    const index = favorites.value.findIndex((p) => p.id === updatedProduct.id)
    if (updatedProduct.is_liked) {
      if (index === -1) {
        favorites.value.push(updatedProduct)
        nextTick(() =>
          setTimeout(() => {
            drawFullFrame(
              `canvas-fav-${updatedProduct.id}`,
              updatedProduct.frame_url,
              120,
              updatedProduct.image_url,
              120,
              40,
              updatedProduct.is_stretch,
              updatedProduct.color_name,
            )
          }, 100),
        )
      } else {
        // Вычисляем новую цену
        if (favorites.is_liked) {
          favorites.value[index].price =
            favorites.value[index].price + favorites.value[index].paint_price
        } else if (!favorites.is_liked) {
          favorites.value[index].price = favorites.value[index].price
        }
      }
    } else if (index !== -1) {
      favorites.value.splice(index, 1)
    }
  })
})*/

onMounted(() => {
  const loadStored = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_liked', true)
      .order('updated_at', { ascending: true })
    if (data) {
      // При загрузке сразу считаем цену с учетом цвета
      favorites.value = data.map((p) => ({
        ...p,
        base_price: p.price, // Сохраняем базовую цену
        price: p.selected_color
          ? (p.base_price || p.price) + (p.paint_price || 0)
          : p.base_price || p.price,
      }))

      setTimeout(() => {
        favorites.value.forEach((p) =>
          drawFullFrame(
            `canvas-fav-${p.id}`,
            p.frame_url,
            120,
            p.image_url,
            120,
            40,
            p.is_stretch,
            p.selected_color,
          ),
        )
      }, 800)
    }
  }
  loadStored()

  bus.on('update-favorites', (updatedProduct) => {
    const index = favorites.value.findIndex((p) => p.id === updatedProduct.id)

    if (updatedProduct.is_liked) {
      // Гарантируем наличие базовой цены для расчетов
      const basePrice = updatedProduct.base_price || updatedProduct.price
      const paintPrice = updatedProduct.paint_price || 0

      // Вычисляем финальную цену: если цвет выбран, плюсуем покраску
      const finalPrice =
        updatedProduct.color_name || updatedProduct.selected_color
          ? basePrice + paintPrice
          : basePrice

      const productToSave = {
        ...updatedProduct,
        base_price: basePrice,
        price: finalPrice,
      }

      if (index === -1) {
        favorites.value.push(productToSave)
        nextTick(() =>
          setTimeout(() => {
            drawFullFrame(
              `canvas-fav-${updatedProduct.id}`,
              updatedProduct.frame_url,
              120,
              updatedProduct.image_url,
              120,
              40,
              updatedProduct.is_stretch,
              updatedProduct.color_name || updatedProduct.selected_color,
            )
          }, 100),
        )
      } else {
        favorites.value[index] = productToSave
      }
    } else if (index !== -1) {
      favorites.value.splice(index, 1)
    }
  })
})
const toggleLike = async (product) => {
  product.is_liked = false
  product.selected_color = null // Очищаем цвет локально
  product.color_name = null

  // Сохраняем в Supabase: отключаем лайк и обнуляем цвет, чтобы он не стирался некорректно
  await supabase
    .from('products')
    .update({
      is_liked: false,
      selected_color: null,
    })
    .eq('id', product.id)

  favorites.value = favorites.value.filter((p) => p.id !== product.id)
  bus.emit('update-favorites', product)
}
/*
const changeColorInHeader = (name) => {
  favorites.value.forEach((p) => {
    // Если цвет уже такой же — сбрасываем, иначе ставим новый
    p.color_name = p.color_name === name ? null : name
    const currentPaintPrice = p.paint_price || 50
    // Если цвет есть — прибавляем цену покраски, если сбросили — оставляем базовую
    p.price = p.color_name ? p.base_price + currentPaintPrice : p.base_price
  })
}
  */
</script>

<template>
  <header class="header header-main">
    <div class="header_inner">
      <router-link class="logo" to="/"
        ><img src="/images/logo (1).png" alt="" class="logo__img"
      /></router-link>

      <div class="search_form">
        <input class="search_form_text" type="text" placeholder="искать..." />
        <button class="search_form_btn">
          <img class="search_form_img" src="/images/search (2).png" alt="search-icon" />
        </button>
      </div>

      <div class="header_icons">
        <div class="icon">
          <img src="/images/telephone-call (1) (1).png" alt="" />
          <h3 class="icon_title">+375 29 6755573</h3>
        </div>

        <div class="purchase_navigation">
          <div class="icon">
            <div class="cart_icon">
              <img src="/images/card (1).png" @click="toggle('cart')" alt="" />
            </div>
            <span class="cart_quantity">3</span>
          </div>
          <div class="purchase" :class="{ 'purchase--open': activeBlock === 'cart' }">
            <div class="purchase_top">
              <h2 class="purchase_title">Карзина</h2>
              <div class="purchase_products">
                <article class="product2">
                  <span class="product_sale2">20%</span>
                  <router-link to="/carzina">
                    <div class="product_image2">
                      <img src="/images/sadas.png" alt="" />
                    </div>
                  </router-link>

                  <div class="purchase_prices">
                    <div class="purchase_prices_top">
                      <router-link to="/carzina">
                        <h3 class="product_title2">
                          <a href=""> Eyes Mesh Boat Shoes</a>
                        </h3>
                      </router-link>
                    </div>
                    <div class="purchase_prices_bottom">
                      <span class="product_price2">$220.00</span>
                      <span class="product_oldprice2">$210.00</span>
                      <span class="purchase_size">21x30см</span>
                      <div class="car_info_stepper2 stepper2">
                        <button
                          class="btn-reset stepper_btn2 stepper_btn--minus border-brand-500"
                          aria-label="minus"
                        >
                          <svg
                            height="512px"
                            id="Layer_1"
                            style="enable-background: new 0 0 512 512"
                            version="1.1"
                            viewBox="0 0 512 512"
                            width="512px"
                            xml:space="preserve"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                          >
                            <path
                              d="M417.4,224H288V94.6c0-16.9-14.3-30.6-32-30.6c-17.7,0-32,13.7-32,30.6V224H94.6C77.7,224,64,238.3,64,256  c0,17.7,13.7,32,30.6,32H224v129.4c0,16.9,14.3,30.6,32,30.6c17.7,0,32-13.7,32-30.6V288h129.4c16.9,0,30.6-14.3,30.6-32  C448,238.3,434.3,224,417.4,224z"
                            />
                          </svg>
                        </button>
                        <input type="text" class="stepper_input2" value="1" />
                        <button
                          class="btn-reset stepper_btn2 stepper_btn--plus border-brand-500"
                          aria-label="plus"
                        >
                          <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                            <rect fill="none" height="256" width="256" />
                            <path d="M216,136H40a8,8,0,0,1,0-16H216a8,8,0,0,1,0,16Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <span class="purchase_toggle2">
                      <svg
                        id="1"
                        style="enable-background: new 0 0 512 512"
                        version="1.1"
                        viewBox="0 0 512 512"
                        xml:space="preserve"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                      >
                        <g>
                          <g>
                            <g>
                              <path
                                d="M256,48C141.1,48,48,141.1,48,256s93.1,208,208,208c114.9,0,208-93.1,208-208S370.9,48,256,48z M256,446.7     c-105.1,0-190.7-85.5-190.7-190.7c0-105.1,85.5-190.7,190.7-190.7c105.1,0,190.7,85.5,190.7,190.7     C446.7,361.1,361.1,446.7,256,446.7z"
                              />
                            </g>
                          </g>
                          <rect height="17" width="256" x="128" y="248" />
                        </g>
                      </svg>
                    </span>
                  </div>
                </article>
                <article class="product2">
                  <span class="product_sale2">20%</span>
                  <router-link to="/carzina">
                    <div class="product_image2">
                      <img src="/images/sadas.png" alt="" />
                    </div>
                  </router-link>

                  <div class="purchase_prices">
                    <div class="purchase_prices_top">
                      <router-link to="/carzina">
                        <h3 class="product_title2">
                          <a href=""> Eyes Mesh Boat Shoes</a>
                        </h3>
                      </router-link>
                    </div>
                    <div class="purchase_prices_bottom">
                      <span class="product_price2">$220.00</span>
                      <span class="product_oldprice2">$210.00</span>
                      <span class="purchase_size">21x30см</span>
                      <div class="car_info_stepper2 stepper2">
                        <button
                          class="btn-reset stepper_btn2 stepper_btn--minus border-brand-500"
                          aria-label="minus"
                        >
                          <svg
                            height="512px"
                            id="Layer_1"
                            style="enable-background: new 0 0 512 512"
                            version="1.1"
                            viewBox="0 0 512 512"
                            width="512px"
                            xml:space="preserve"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                          >
                            <path
                              d="M417.4,224H288V94.6c0-16.9-14.3-30.6-32-30.6c-17.7,0-32,13.7-32,30.6V224H94.6C77.7,224,64,238.3,64,256  c0,17.7,13.7,32,30.6,32H224v129.4c0,16.9,14.3,30.6,32,30.6c17.7,0,32-13.7,32-30.6V288h129.4c16.9,0,30.6-14.3,30.6-32  C448,238.3,434.3,224,417.4,224z"
                            />
                          </svg>
                        </button>
                        <input type="text" class="stepper_input2" value="1" />
                        <button
                          class="btn-reset stepper_btn2 stepper_btn--plus border-brand-500"
                          aria-label="plus"
                        >
                          <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                            <rect fill="none" height="256" width="256" />
                            <path d="M216,136H40a8,8,0,0,1,0-16H216a8,8,0,0,1,0,16Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <span class="purchase_toggle2">
                      <svg
                        id="1"
                        style="enable-background: new 0 0 512 512"
                        version="1.1"
                        viewBox="0 0 512 512"
                        xml:space="preserve"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                      >
                        <g>
                          <g>
                            <g>
                              <path
                                d="M256,48C141.1,48,48,141.1,48,256s93.1,208,208,208c114.9,0,208-93.1,208-208S370.9,48,256,48z M256,446.7     c-105.1,0-190.7-85.5-190.7-190.7c0-105.1,85.5-190.7,190.7-190.7c105.1,0,190.7,85.5,190.7,190.7     C446.7,361.1,361.1,446.7,256,446.7z"
                              />
                            </g>
                          </g>
                          <rect height="17" width="256" x="128" y="248" />
                        </g>
                      </svg>
                    </span>
                  </div>
                </article>
              </div>
            </div>
            <div class="purchase_bottom">
              <div class="purchase_totalprise">
                <h2 class="purchase_totletitle2">Итого</h2>
                <span class="product_totleprice2">$220.00</span>
              </div>
            </div>
            <router-link to="/carzina" class="pur_button">
              Перейти к оформлению заказа
            </router-link>
          </div>
        </div>
        <div class="icon">
          <router-link to="/registration.vue">
            <img src="/images/user (3) (2).png" alt="" />
          </router-link>
        </div>
        <div class="heart_navigation">
          <div class="icon">
            <div @click="toggle('heart')">
              <div class="icon_heart">
                <svg
                  class="icon_heart2 icon_heart2--active"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="34"
                  height="34"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                  />
                </svg>
              </div>
            </div>
            <span class="cart_quantity">3</span>
          </div>

          <div class="heart" :class="{ 'heart--open': activeBlock === 'heart' }">
            <div class="purchase_top">
              <h2 class="heart_title">Избранное</h2>
              <div class="purchase_products">
                <!-- Цикл v-for по массиву лайкнутых товаров -->
                <article v-for="product in favorites" :key="product.id" class="product2">
                  <!-- Скидка из БД -->
                  <span v-if="product.discount" class="product_sale2">{{ product.discount }}</span>

                  <router-link :to="'/product/' + product.id">
                    <div class="product_image2">
                      <!-- Тот самый канвас для отрисовки рамы -->
                      <canvas :id="'canvas-fav-' + product.id"></canvas>
                    </div>
                  </router-link>

                  <div class="purchase_prices">
                    <div class="purchase_prices_top">
                      <h3 class="product_title2">
                        <!-- Название из БД -->
                        <router-link :to="product.link">{{ product.title }}</router-link>
                      </h3>
                    </div>
                    <div class="purchase_prices_bottom">
                      <!-- Цены и размер из БД -->
                      <span class="product_price2">BYN {{ product.price }}</span>
                      <span v-if="product.old_price" class="product_oldprice2"
                        >BYN {{ product.old_price }}</span
                      >
                      <span class="purchase_size">{{ product.selectedSize || '21x30см' }}</span>
                    </div>

                    <!-- Кнопка удаления (дизлайк) -->
                    <span class="purchase_toggle2heart" @click.prevent="toggleLike(product)">
                      <div class="icon_heart">
                        <svg
                          class="icon_heart2 icon_heart2--active"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="red"
                        >
                          <path
                            d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                          />
                        </svg>
                      </div>
                    </span>
                  </div>
                </article>
              </div>
            </div>
            <div class="purchase_bottom">
              <div class="purchase_totalprise">
                <h2 class="purchase_totletitle2">Итого</h2>
                <span class="product_totleprice2">$220.00</span>
              </div>
            </div>
            <router-link to="/favorites" class="pur_button_heart"> Показать избранное </router-link>
          </div>
        </div>
      </div>
    </div>

    <nav class="menu">
      <ul class="menu__list">
        <router-link to="catalog">
          <li class="menu__list-item">
            <a href="" class="menu__list-link">католог</a>
          </li>
        </router-link>
        <li class="menu__list-item">
          <a href="" class="menu__list-link">наши работы</a>
        </li>
        <li class="menu__list-item">
          <a href="" class="menu__list-link">адрес</a>
        </li>
        <li class="menu__list-item">
          <a href="" class="menu__list-link">наши контакты</a>
        </li>
        <li class="menu__list-item">
          <a href="" class="menu__list-link">о нас</a>
        </li>
      </ul>
    </nav>
    <div class="site-sales winter">
      <h1>Зимнии скидки:</h1>
      <p>40% на постеры, 15% на холсты и 10% на рамы*</p>
    </div>
  </header>
</template>

<style>
/*carzina*/
.cart_icon {
  cursor: pointer;
}

.header {
  background-color: #151515;
}

.header-main {
  /* background-color: transparent; */
  position: absolute;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: #fff;
}

.header_inner {
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-right: 35px;
}

.header_icons {
  display: flex;
  gap: 35px;
  margin-right: 150px;
}

.icon {
  display: flex;
  font-size: 12px;
  align-items: center;
}
.cart_quantity {
  display: inline-flex;
  align-items: center;
  border-radius: 25px;
  padding: 0 5px;
  height: 16px;
  font-weight: 700;
  font-size: 10px;
  color: white;
  background-color: #000;
}

/* SEARCh*/
.search_form {
  border: 1px solid #000;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  height: 38px;
  border-radius: 5px;
  overflow: hidden;
  background-color: #fff;
}

.search_form_text {
  border: none;
  width: 400px;
  outline: none;
  font-size: 20px;
  padding-left: 10px;
  padding-right: 10px;
  background-color: transparent;
}
.search_form_btn {
  border: none;
  background-color: transparent;
}

/*heart*/
.icon_heart {
  display: flex;
  font-size: 12px;
  align-items: center;
  background-color: #fff;
  transition: background-color 0.3s;
}
.icon_heart2 {
  color: rgb(0, 0, 0);
}

.icon_heart2--active {
  color: red;
}
.heart_navigation {
  position: relative;
}
/*heart*/
/*SEARCh */
/*carzina*/

.product_title2 {
  position: absolute;
  color: #454545;
  font-family: sans-serif;
  font-size: 13px;
  margin: 0;
  margin-bottom: 8px;
  top: 0;
  left: 90px;
}
.product_title2 a {
  color: #454545;
}
.product_title2 a::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.purchase_title {
  font-size: 16px;
  font-weight: 700;
  font-family: sans-serif;
  padding-bottom: 20px;
  color: rgb(255, 132, 0);
}

.purchase_navigation {
  position: relative;
  z-index: 999;
}
.purchase_prices {
  display: flex;
  flex-wrap: wrap;
}

.product_title2 {
  position: absolute;
  color: #454545;
  font-family: sans-serif;
  font-size: 13px;
  margin: 0;
  margin-bottom: 8px;
  top: 0;
  left: 90px;
}
.product_image2 {
  overflow: hidden;
  position: relative;
  max-height: 100%;
  object-fit: cover;
  margin-bottom: 20px;
  margin-right: 10px;
  width: 64px;
  height: 89px;
}
.product_image2 canvas {
  width: 100%; /* Занимает всю ширину контейнера */
  height: auto; /* Высота подстроится автоматически, чтобы не было искажений */
  display: block; /* Убирает лишние отступы снизу */
}

.product_sale2 {
  /*
  position: absolute;
  left: 280px;
  top: 0px;
  font-family: 'Inter', sans-serif;

  /* border: 2px solid #151515; */
  /* padding: 4px 10px;
  color: #111;
  color: rgb(255, 255, 255);
  font-weight: 700;
  font-size: 10px;
  font-size: 13px;
  text-transform: uppercase;
  background-color: rgb(174, 218, 3);
  background-color: rgb(213, 128, 64);
  */
  position: absolute;
  top: 0px;
  left: 280px;
  background: #ff4d4d;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
  z-index: 5;
}

.purchase_prices_bottom {
  margin-top: -40px;
  z-index: 10;
  margin-top: -20px;
  z-index: 10;
  position: absolute;
  top: 40px;
  left: 90px;
}

.product_price2 {
  width: 55px;
  height: 13px;
  color: #151515;
  font-weight: 300;
  font-size: 15px;
}
.purchase_toggle2 {
  position: absolute;
  width: 1px;
  height: 1px;
  color: #aaa;
  right: 1px;
  top: 50px;
}

.product_oldprice2 {
  font-weight: 300;
  font-size: 12px;
  color: #959595;
  text-decoration: line-through;
  margin-left: 5px;
}

.purchase_size {
  font-weight: 300;
  font-size: 12px;
  color: #393939;
  margin-left: 5px;
}
.stepper2 {
  display: flex;
  height: 24px;
  width: 124px;
  border: 1px solid #ccc;
  position: relative;
  margin-top: 10px;
}

.card_info_stepper2 {
  margin-bottom: -190px;
}

.product_image2 {
  overflow: hidden;
  position: relative;
  max-height: 100%;
  object-fit: cover;
  margin-bottom: 20px;
  margin-right: 10px;
  width: 64px;
  height: 89px;
}
.product_image2 {
  overflow: hidden;
  position: relative;
}

.btn_reset {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  position: relative;
}
.stepper_btn2 svg {
  display: block;
  height: 12px;
  width: 12px;
  fill: #6e6e6e;
  transition: fill 0.3s;
}
.stepper_btn2 {
  display: flex;
  align-items: center;
  height: 100%;
  margin-top: 3px;
  justify-content: center;
  width: 14px;
  height: 14px;
}
.stepper_btn2:hover svg {
  fill: #000000;
  transition: fill 0.3s;
}
.stepper_btn2 {
  display: flex;
  align-items: center;
  height: 100%;
  margin-top: 3px;
  justify-content: center;
  width: 14px;
  height: 14px;
}
.stepper_btn--plus {
  position: absolute;
  right: 0px;
}
.purchase_toggle2 {
  position: absolute;
  width: 12px;
  height: 12px;
  color: #aaa;
  right: 1px;
  top: 50px;
}
.purchase_toggle2 svg {
  position: absolute;
  margin-top: 3px;
  width: 25px;
  height: 25px;
  left: -18px;
  top: 0px;
  background-color: #fff;
  transition: fill 0.3s;
}
.purchase_toggle2:hover svg {
  fill: #f41414;
  transition: fill 0.3s;
}

.btn-reset {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  position: relative;
}
.purchase--open {
  z-index: 30px;
}
.stepper_input2 {
  border: 1px solid #ccc;
  height: 100%;
  /* flex-grow: 1; */
  padding-left: 41px;
  padding-right: 35px;
  width: 94px;
  /* text-align: center; */
  color: #151515;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.purchase_toggle2 {
  position: absolute;
  width: 12px;
  height: 12px;
  color: #aaa;
  right: 1px;
  top: 50px;
}

.product2 {
  position: relative;
  display: flex;
  width: 100%;
  margin-bottom: 15px;
}

.purchase {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 360px;
  height: 346px;
  background-color: #fff;
  padding: 10px;
  /* position: relative; */
  overflow: auto;
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 60;
  display: none;
  border-radius: 10px;
}
.purchase--open {
  display: block;
}

/*purchase_bottom*/
.purchase_totalprise {
  display: flex;
  justify-content: space-between;
}
.product_totleprice2 {
  width: 55px;
  height: 13px;
  color: #151515;
  font-weight: 700;
  font-size: 15px;
  margin-right: 10px;
}

.pur_button {
  display: inline-block; /* Чтобы работали отступы и размеры */
  text-decoration: none; /* Убирает подчеркивание ссылки */
  text-align: center;
  /* Ваши остальные стили: background, padding, border и т.д. */
  height: 44px;
  padding-left: 77px;
  padding-right: 77px;
  background-color: #000;
  color: #fff;
  font-family: serif;
  margin-top: 10px;
  width: 324.4px;
  cursor: pointer;
}
.pur_button_heart {
  display: inline-block; /* Чтобы работали отступы и размеры */
  text-decoration: none; /* Убирает подчеркивание ссылки */
  text-align: center;
  /* Ваши остальные стили: background, padding, border и т.д. */
  height: 44px;
  padding-left: 77px;
  padding-right: 77px;
  background-color: #000;
  color: #fff;
  font-family: serif;
  margin-top: 10px;
  width: 324.4px;
  cursor: pointer;
  padding-top: 10px;
}

.heart-navigation {
  position: relative;
  z-index: 999;
}

.heart {
  position: absolute;
  right: 0;
  top: 100%;
  width: 360px;
  background-color: #fff;
  padding: 10px;
  border-radius: 10px;
  z-index: 20;
  opacity: 0;
  pointer-events: none;
  z-index: 999;
}
.heart_title {
  font-size: 16px;
  font-weight: 700;
  font-family: sans-serif;
  padding-bottom: 20px;
  color: rgb(255, 132, 0);
}
.icon_heart {
  display: flex;
  font-size: 12px;
  align-items: center;
  background-color: #fff;
  transition: background-color 0.3s;
  cursor: pointer;
}

.purchase-toggle2heart {
  position: absolute;
  width: 25px;
  height: 25px;
  /* color: #aaa; */
  left: 90px;
  top: 50px;
  fill: #000000;
  transition: color 0.3s;
}
.heart--open {
  /*visibility: visible;
  overflow: visible;
  height: 340px;*/
  opacity: 1;
  pointer-events: auto;
}
.icon_heart {
  /*display: flex;*/
  /* font-size: 12px;
  align-items: center;*/
  /*background-color: #fff;*/
  /*  transition: background-color 0.3s;*/
}
.purchase_toggle2heart:hover svg {
  fill: #f41414;
  transition: fill 0.3s;
  color: rgb(43, 238, 43);
}
.purchase_toggle2heart svg {
  position: absolute;
  margin-top: 3px;
  width: 25px;
  height: 25px;
  right: 0px;
  top: 60px;
  color: #dcb825;
  /*background-color: #fff;*/
  transition: fill 0.3s;
}

.heart {
  overflow: auto;
  scrollbar-color: #fa8128 transparent; /* Оставляем только для Firefox */
  /* scrollbar-width: thin;  <-- УДАЛИТЕ ЭТУ СТРОКУ, она блокирует webkit-стили в Chrome */
}

.heart::-webkit-scrollbar {
  width: 10px;
}

.heart::-webkit-scrollbar-thumb {
  background-color: #fa8128;
  border-radius: 5px;
}

.purchase {
  overflow: auto;
  scrollbar-color: #fa8128 transparent; /* Оставляем только для Firefox */
  /* scrollbar-width: thin;  <-- УДАЛИТЕ ЭТУ СТРОКУ, она блокирует webkit-стили в Chrome */
  z-index: 999;
}

.purchase::-webkit-scrollbar {
  width: 10px;
}

.purchase::-webkit-scrollbar-thumb {
  background-color: #fa8128;
  border-radius: 5px;
}

.purchase_products {
  max-height: 220px;
  overflow-y: auto;
}

/*CARZINA  */
</style>
