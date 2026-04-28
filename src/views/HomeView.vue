<script setup>
import { onMounted, ref } from 'vue'
import Swiper from 'swiper' // ДОБАВЬТЕ ЭТУ СТРОКУ
import '@/assets/main.css'

import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'

// Стили тоже импортируем здесь
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const slides = ref([
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo1.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 1,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo2.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo6.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 2,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo3.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 3,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo4.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 4,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo5.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 5,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo6.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 6,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo7.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo9.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 7,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo8.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo10.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 8,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo9.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo12.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 9,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo10.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo11.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 10,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo11.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 11,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: '/images/new-photo12.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo8.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 12,
  },

  // ... другие слайды
])

const element = ref([
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.1.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 1,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.2.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo6.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 2,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.3.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 3,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.4.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 4,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.5.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 5,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.6.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 6,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.7.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo9.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 7,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.8.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo10.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 8,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.9.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo12.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 9,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.10.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo11.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 10,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.11.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo7.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 11,
  },
  {
    title: 'Заголовок 1',
    text: 'Описание 1',
    image: 'images/pictures.12.png',
    isLiked: false,
    oldPrice: '4.400',
    price: '1.900',
    hoverImage: 'images/new-photo8.png', // Новое поле
    discount: '-20%', // Новое поле
    id: 12,
  },

  // ... другие слайды
])

onMounted(async () => {
  // 1. Первый слайдер
  new Swiper('.Top-swiper', {
    modules: [Pagination, Autoplay, EffectFade],
    effect: 'fade',
    pagination: { el: '.swiper-pagination', clickable: true },
    autoplay: { delay: 3000 },
  })

  // 2. Слайдер с картинками
  new Swiper('.pictures__slider', {
    modules: [Navigation],
    slidesPerView: 6,
    spaceBetween: 30,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  })

  // ... добавьте сюда остальные слайдеры (new__slider, card-related и т.д.)

  const swipernew = new Swiper('.new_slider', {
    modules: [Navigation],
    slidesPerView: 6,
    spaceBetween: 30,
    observer: true,
    observeParents: true,
    freeMode: true,
    roundLengths: true,

    navigation: {
      nextEl: '.new-next',
      prevEl: '.new-prev',
    },
  })

  const swiper3 = new Swiper('.best_slider', {
    modules: [Navigation],
    slidesPerView: 6,
    spaceBetween: 30,
    observer: true,
    observeParents: true,
    freeMode: true,
    updateOnWindowResize: true,
    resizeObserver: true,
    preloadImages: true,
    roundLengths: true,

    navigation: {
      nextEl: '.best-next',
      prevEl: '.best-prev',
    },
  })

  const Swiper2 = new Swiper('.card-related__slider', {
    modules: [Pagination],

    slidesPerView: 4,
    spaceBetween: 30,
    loop: true,
    observer: true,
    observeParents: true,
    freeMode: true,
    pagination: {
      el: '.related-pag',
      type: 'bullets',
      clickable: true,
    },
  })

  const Swiperty = new Swiper('.card-related__slider2', {
    modules: [Navigation],
    slidesPerView: 4,
    spaceBetween: 30,
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  })
})
</script>

<template>
  <div class="wrapper">
    <main>
      <section class="top">
        <div class="container">
          <h1 class="title">более 500 различных обрамлений для рам</h1>

          <router-link to="/catalog" class="top__link">Найти обрамление</router-link>
        </div>
      </section>
      <div class="slider">
        <div class="Top-swiper">
          <div class="swiper-wrapper">
            <div
              class="swiper-slide"
              style="
                background-image: url('/images/big-picture1.jpg');
                height: 100vh;
                background-size: cover;
              "
            ></div>
            <div
              class="swiper-slide"
              style="
                background-image: url('/images/big-picture2.jpg');
                height: 100vh;
                background-size: cover;
              "
            ></div>
            <div
              class="swiper-slide"
              style="
                background-image: url('/images/big-picture3.jpg');
                height: 100vh;
                background-size: cover;
              "
            ></div>

            <div
              class="swiper-slide"
              style="
                background-image: url('/images/big-picture4.jpg');
                height: 100vh;
                background-size: cover;
              "
            ></div>
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </div>
      <section class="what_we_do">
        <div class="container">
          <div class="what_we_do2">
            <router-link to="/catalog">
              <div class="what_we_do_item">
                <img src="/images/passepartouts_cat_img.webp" class="what_we_do_img" alt="" />
                <div class="what_we_do_title" id="img1">КУПИТЬ РАМКИ</div>
              </div>
            </router-link>
            <router-link to="/catalog">
              <div class="what_we_do_item">
                <img src="/images/opmaat_cat_img2.webp" class="what_we_do_img" alt="" />
                <div class="what_we_do_title" id="img2">Пользовательские фоторамки</div>
              </div>
            </router-link>
            <router-link to="/catalog">
              <div class="what_we_do_item">
                <img src="/images/ethnic_cat_img3.webp" class="what_we_do_img" alt="" />
                <div class="what_we_do_title" id="img3">Деревянные фоторамки</div>
              </div>
            </router-link>
            <router-link to="/catalog">
              <div class="what_we_do_item">
                <img src="/images/collagelijsten_cat_img4.webp" class="what_we_do_img" alt="" />
                <div class="what_we_do_title" id="img4">Беспорядочные фоторамки</div>
              </div>
            </router-link>
          </div>
          <div class="what_we_do2">
            <router-link to="/catalog">
              <div class="what_we_do_item">
                <img src="/images/country_cat_img5.webp" class="what_we_do_img" alt="" />
                <div class="what_we_do_title" id="img5">КУПИТЬ РАМКИ</div>
              </div>
            </router-link>
            <router-link to="/catalog">
              <div class="what_we_do_item">
                <img src="/images/urban_cat_img6.webp" class="what_we_do_img" alt="" />
                <div class="what_we_do_title" id="img6">Пользовательские фоторамки</div>
              </div>
            </router-link>
            <router-link to="/catalog">
              <div class="what_we_do_item">
                <img src="/images/portretlijsten_cat_img7.webp" class="what_we_do_img" alt="" />
                <div class="what_we_do_title" id="img7">Серебренные фоторамки</div>
              </div>
            </router-link>
            <router-link to="/catalog">
              <div class="what_we_do_item">
                <img src="/images/silverplated_cat_img8.webp" class="what_we_do_img" alt="" />
                <div class="what_we_do_title" id="img8">Серебряные фоторамки</div>
              </div>
            </router-link>
          </div>
        </div>
      </section>
      <section class="small_information">
        <div class="container2">
          <div class="small_information_2">
            <div class="information_item">
              <img class="information_img" src="/images/text_decoration.webp" alt="" />
              <p class="information_text">
                Ниже вы найдете обзор всех цветных фоторамок, которые мы предлагаем. Помимо <br />
                разных цветов, у нас также есть разные размеры, поэтому вы сможете найти подходящую
                <br />рамку для каждой картины. Мы предлагаем фоторамки следующих <br />
                размеров: А3 (29,7х42 см) и А4 (21х29,7 см), а также форматы 40х60 см, 30х40 см и
                15х20 см.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section class="new_bestsellers">
        <div class="container">
          <h2 class="new_title">новинки</h2>
        </div>
        <div class="swiper-container-wrapper">
          <div class="new_slider swiper">
            <div class="swiper-wrapper">
              <div class="swiper-slide" v-for="(slide, index) in slides" :key="index">
                <router-link
                  :to="`/product/${slide.id}`"
                  class="new_slide"
                  :style="{
                    backgroundImage: `url(${slide.isHovered ? slide.hoverImage : slide.image})`,
                  }"
                  @mouseenter="slide.isHovered = true"
                  @mouseleave="slide.isHovered = false"
                >
                  <!-- Плашка скидки -->

                  <div v-if="slide.discount" class="discount-badge">{{ slide.discount }}</div>

                  <!-- Кнопка-сердечко -->
                  <button
                    class="heart-btn"
                    :class="{ 'is-active': slide.isLiked }"
                    @click.prevent="slide.isLiked = !slide.isLiked"
                  >
                    <svg viewBox="0 0 24 24" width="30" height="30">
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                  </button>
                </router-link>
                <div class="slide_text">
                  <router-link to="/catalog">
                    <h3>{{ slide.title }}</h3>
                  </router-link>

                  <div class="price-row">
                    <p class="slide_p">{{ slide.text }}</p>
                    <span class="current-price">{{ slide.price }} ₽</span>
                    <span v-if="slide.oldPrice" class="old-price">{{ slide.oldPrice }} ₽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-button-prev new-prev">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="black"
              stroke="black"
              stroke-width="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
          <div class="swiper-button-next new-next">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              stroke-width="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </section>
      <section class="bestsellers">
        <div class="container">
          <div class="bestsellers_2">
            <div class="bestsellers_item">
              <router-link to="">
                <img
                  src="/images/Desktop_Banner1_Bestlsellers.jpg"
                  class="bestsellers_img"
                  alt="bestseller"
                />
                <p class="bestsellers_text" id="bestsellers_text1">бестселлеры</p>
              </router-link>
            </div>
            <div class="bestsellers_item">
              <router-link to="">
                <img
                  src="/images/Desktop_Banner3_Canvas2.jpg"
                  class="bestsellers_img"
                  alt="bestseller"
                />
                <p class="bestsellers_text" id="bestsellers_text2">холст</p>
              </router-link>
            </div>
          </div>
          <div class="bestsellers_item">
            <router-link to="/catalog">
              <img src="/images/Desktop_Banner6_Brands3.jpg" class="bestsellers_img" alt="holst" />
              <p class="bestsellers_text" id="bestsellers_text3">Фильмы и сериалы</p>
            </router-link>
          </div>
        </div>
      </section>
      <section class="new_pictures">
        <div class="container">
          <h2 class="pictures_title">бестселлеры</h2>
        </div>
        <div class="swiper-container-wrapper">
          <div class="best_slider swiper">
            <div class="swiper-wrapper">
              <div class="swiper-slide" v-for="(elm, index) in element" :key="index">
                <router-link
                  :to="`/product/${elm.id}`"
                  class="best_slide"
                  :style="{
                    backgroundImage: `url(${elm.isHovered ? elm.hoverImage : elm.image})`,
                  }"
                  @mouseenter="elm.isHovered = true"
                  @mouseleave="elm.isHovered = false"
                >
                  <!-- Плашка скидки -->

                  <div v-if="elm.discount" class="discount-badge">{{ elm.discount }}</div>

                  <!-- Кнопка-сердечко -->
                  <button
                    class="heart-btn"
                    :class="{ 'is-active': elm.isLiked }"
                    @click.prevent="elm.isLiked = !elm.isLiked"
                  >
                    <svg viewBox="0 0 24 24" width="30" height="30">
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                  </button>
                </router-link>
                <div class="slide_text">
                  <router-link to="/catalog">
                    <h3>{{ elm.title }}</h3>
                  </router-link>

                  <div class="price-row">
                    <p class="slide_p">{{ elm.text }}</p>
                    <span class="current-price">{{ elm.price }} ₽</span>
                    <span v-if="elm.oldPrice" class="old-price">{{ elm.oldPrice }} ₽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-button-prev best-prev">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="black"
              stroke="black"
              stroke-width="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
          <div class="swiper-button-next best-next">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              stroke-width="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </section>

      <section class="last_blog">
        <div class="container">
          <h2 class="title_main">НАСТЕННОЕ ИСКУССТВО ОНЛАЙН В МАГАЗИНЕ РАМКА</h2>

          <div class="blok_container">
            <div class="blok_item">
              <router-link to="catalog">
                <h3 class="blok_title">
                  ОБрамляйте свои работы и создавайте настенные рисунки <br />
                  по индивидуальному дизайну.
                </h3>
                <p class="blok_text">
                  Обрамляя отпечатки, вы можете создавать индивидуальные композиции. Найдите
                  идеальное сочетание рамок и принтов, чтобы передать нужное ощущение на вашей
                  уникальной стене галереи. Мы предлагаем как большие, так и маленькие рамки, а
                  также плакаты в самых разных стилях и дизайнах. У нас есть цветные и <br />
                  черно-белые принты, блестящие золотые, серебряные и медные рамы, а также рамы из
                  натурального дуба, ореха, белого и черного дерева. Освежите свои стены картой мира
                  или почему бы не выбрать красивую фотографию бенгальского тигра в деревянной
                  рамке? В РАМКА вы найдете дешевые и высококачественные настенные рисунки, которые
                  выполнят все ваши пожелания по дизайну интерьера <br />
                  и превратят вашу комнату в настоящее личное убежище.
                </p>
              </router-link>
            </div>

            <div class="blok_item">
              <router-link to="catalog">
                <h3 class="blok_title">
                  НАСТЕННЫЕ ИСКУССТВА РАЗНЫХ РАЗМЕРОВ ДЛЯ СТЕНЫ ВАШЕЙ ГАЛЕРЕИ
                </h3>
                <p class="blok_text">
                  Мы очень увлечены дизайном интерьера и с удовольствием даем вам советы и
                  рекомендации по созданию идеальной стены галереи. Простой совет по дизайну
                  интерьера: объедините мелкие и крупные принты друг с другом, чтобы создать
                  собственную галерею или фотостену. Мы предлагаем плакаты в широком диапазоне
                  размеров: 13x18 см (5,1 x 7,1 дюйма), A4 (8,3 x 11,8 дюйма), 30 x 40 см (11,8 x
                  15,7 дюйма), 40 x 50 см (15,7 x 19,7 дюйма), 50 x 50 см. см (19,7 x 19,7 дюйма),
                  50 x 70 см (19,7 x 27,6 дюйма) и 70 x 100 см (27,6 x 39,4 дюйма). Мы разработали
                  обширное руководство, в котором собрали наши лучшие советы. Кроме того, мы также
                  создали шаблоны для стильного оформления стен галереи, чтобы вы могли легко
                  создать потрясающую фотостену. Загляните на нашу страницу вдохновения с реальными
                  примерами домов наших креативных клиентов. Не забудьте также ознакомиться с нашими
                  самыми продаваемыми печатными изданиями и новыми разделами печатных изданий.
                </p>
              </router-link>
            </div>
          </div>

          <div class="blok_container">
            <div class="blok_item">
              <router-link to="catalog">
                <h3 class="blok_title">ОТКРОЙТЕ ДЛЯ СЕБЯ НАШИ СТИЛЬНЫЕ РАМКИ</h3>
                <p class="blok_text">
                  Если вы ищете красивые рамки для фотографий в Интернете, вы попали по адресу.
                  Наш<br />
                  широкий ассортимент больших и маленьких рамок специально разработан для печатных
                  изображений, что позволяет вам создавать самые стильные настенные рисунки. У нас
                  есть деревянные рамы черного, белого, орехового цвета и натурального дуба, а также
                  потрясающе блестящие золотые, серебряные и медные металлические рамы из легкого
                  алюминия для удобного подвешивания. Все рамки для фотографий можно вешать как
                  вертикально, так и горизонтально. Они соответствуют высоким стандартам качества
                  <br />
                  и легко открываются сзади. Вы можете быть уверены, что у нас есть настенные
                  рисунки, идеально подходящие для всех комнат вашего дома. Купите недорогие <br />
                  красивые репродукции и рамки для гостиной, детской, прихожей, спальни и кухни в<br />
                  Интернете в магазине плакатов.
                </p>
              </router-link>
            </div>
            <div class="blok_item">
              <div>
                <h3 class="blok_title">УЗКИЕ КАТЕГОРИИ</h3>
                <div class="blok_content">
                  В РАМКА вы можете найти разделы:
                  <router-link class="color" to="catalog">«Рамы для вышивки бисером», </router-link>
                  <router-link class="color" to="catalog">«Оформление икон», </router-link>
                  <router-link class="color" to="catalog"
                    >«Рамы для зеркала в ванную»,
                  </router-link>
                  <router-link class="color" to="catalog">«Лофт-багет для офиса». </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
/* Пишем БЕЗ scoped, чтобы стили точно дотянулись до внутренних элементов Swiper */
.swiper-pagination {
  bottom: 20px !important;
  z-index: 99 !important;
}

.swiper-pagination-bullet {
  width: 120px;
  height: 3px;
  background-color: #151515;
  border-radius: 0;
  opacity: 1;
}

.swiper-pagination-bullet-active {
  height: 6px;
  background-color: #ffffff;
}
.swiper-wrapper {
  background-color: rgba(21, 21, 21, 0.3);
}
</style>
