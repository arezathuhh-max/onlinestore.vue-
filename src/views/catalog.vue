<script setup>
import { ref, watch, nextTick } from 'vue'
import { onMounted, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { bus } from './bus.js'
import { drawFullFrame } from '../utils.js'

const supabase = createClient(
  'https://aqfposmbxcqbpumvydhb.supabase.co',
  'sb_publishable_fhBTokXYW4pHJx2MI78jSA_9nysDSdd',
)

// 1. Создаем реактивную переменную (по умолчанию 5)
const selectedCount = ref(5)

// 2. Функция, которая будет менять это число
const setColumns = (num) => {
  selectedCount.value = num
}
// Переменные для открытия боковых фильтров (параметры сбоку)
const isVisible = ref(true)
const isFilterOpen = ref(true)
const isFilterOpen2 = ref(true)
const isFilterOpen3 = ref(true)
const isFilterOpen4 = ref(true)

// Переменные для работы выпадающего списка (сортировка)
const iscustomopen = ref(false)
const selectedText = ref('по умолчанию')

// Функция для выбора из списка (чтобы закрывался при клике)
const selectItem = (text) => {
  selectedText.value = text
  iscustomopen.value = false
}
const products = ref([])

onMounted(async () => {
  // 1. Берем данные из таблицы
  /* const { data } = await supabase.from('products').select('*')*/
  const { data } = await supabase.from('products').select('*').order('id', { ascending: true })

  products.value = data

  bus.on('update-favorites', (updatedProduct) => {
    const product = products.value.find((p) => p.id === updatedProduct.id)
    if (product) {
      product.is_liked = updatedProduct.is_liked
    }
  })
  // 2. Рисуем на каждом канвасе после того, как Vue их создаст
  setTimeout(() => {
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
  }, 100)
})

const loadAndDraw = async (fileName) => {
  const { data } = supabase.storage.from('products').getPublicUrl('baget3.jpg')

  // Вызываем твою функцию отрисовки, передавая полученный URL
  drawFullFrame('canvasId1', data.publicUrl, 800, data.publicUrl, 600, 50, false)
}

const selectItem2 = async (text) => {
  selectedText.value = text
  iscustomopen.value = false

  let query = supabase.from('products').select('*')

  if (text === 'Сначала дешевые') {
    // Сначала дешевые (от низких к высоким)
    query = query.order('price', { ascending: true })
  } else if (text === 'Сначала новые') {
    // По ID (созданные последними будут сверху, если ID автоинкремент)
    query = query.order('id', { ascending: false })
  } else if (text === 'По умолчанию') {
    // По ID (созданные последними будут сверху, если ID автоинкремент)
    query = query.order('id', { ascending: true })
  } else if (text === 'Сначала дорогие') {
    query = query.order('price', { ascending: false })
  }

  const { data, error } = await query
  if (!error) {
    products.value = data // Vue обновил порядок карточек на экране

    // Ждем 100мс, пока Vue создаст новые HTML-узлы, и рисуем в них
    setTimeout(() => {
      products.value.forEach((p) =>
        drawFullFrame(`canvas-${p.id}`, p.frame_url, 205, p.image_url, 300, 50, p.is_stretch),
      )
    }, 100)
  }
}
// Функция для переключения лайка и сохранения в базу
/*
const toggleLike = async (product) => {
  // 1. Меняем локально (мгновенный эффект для пользователя)
  product.is_liked = !product.is_liked
  product.color_name = selectedColor.value // сохраняем текущий цвет в объект товара
  await supabase.from('products').update({ is_liked: product.is_liked }).eq('id', product.id)

  bus.emit('update-favorites', product)
  if (product.is_liked) {
    // Ждем обновления DOM и рисуем раму
    nextTick(() => {
      drawFullFrame(
        `canvas-fav-${product.id}`,
        product.textureUrl,
        150,
        product.photoUrl,
        200,
        20,
        product.isStretch,
        product.colorName,
      )
    })
  }

  // 2. Сохраняем в Supabase
  const { error } = await supabase
    .from('products')
    .update({ is_liked: product.is_liked })
    .eq('id', product.id)

  if (error) {
    console.error('Ошибка при сохранении лайка:', error.message)
    // Если ошибка, возвращаем как было (опционально)
    product.is_liked = !product.is_liked
  }
  if (product.is_liked) {
    bus.emit('draw-frame', product) // Отправляем данные товара напрямую в хедер
  }
}*/
const toggleLike = async (product) => {
  // 1. Меняем локально (мгновенный эффект для пользователя)
  product.is_liked = !product.is_liked

  // Зануление: если лайк убран, записываем null, иначе — выбранный цвет
  product.selected_color = product.is_liked ? selectedColor.value : null
  product.color_name = product.selected_color

  bus.emit('update-favorites', product)

  if (product.is_liked) {
    // Ждем обновления DOM и рисуем раму
    nextTick(() => {
      drawFullFrame(
        `canvas-fav-${product.id}`,
        product.textureUrl,
        150,
        product.photoUrl,
        200,
        20,
        product.isStretch,
        product.color_name,
      )
    })
    /* bus.emit('draw-frame', product) // Отправляем данные товара напрямую в хедер*/
  }

  // 2. Сохраняем в Supabase (лайк и зануление/запись цвета одним запросом)
  const { error } = await supabase
    .from('products')
    .update({
      is_liked: product.is_liked,
      selected_color: product.selected_color,
    })
    .eq('id', product.id)

  if (error) {
    console.error('Ошибка при сохранении лайка:', error.message)
    // Откат изменений при ошибке
    product.is_liked = !product.is_liked
    product.selected_color = product.is_liked ? selectedColor.value : null
    product.color_name = product.selected_color
    bus.emit('update-favorites', product)
  }
}
const selectedCategory = ref('all') // Переменная для хранения активного фильтра

const fetchProducts = async () => {
  let query = supabase.from('products').select('*')
  // Если нажали на ту же категорию, что уже выбрана — переключаем на 'all'

  // Если НЕ "все категории", добавляем фильтрацию
  if (selectedCategory.value !== 'all') {
    if (selectedCategory.value === 'new') query = query.eq('new_label', 'Новинка')
    else if (selectedCategory.value === 'hit') query = query.eq('bestseller_label', 'Хит')
    // Фильтры по скидкам из колонки second_discount_label
    else if (selectedCategory.value === 'sale_70') query = query.gte('second_discount_label', 70)
    else if (selectedCategory.value === 'sale_50') query = query.eq('second_discount_label', '50')
    else if (selectedCategory.value === 'sale_40')
      query = query.lte('second_discount_label', 40).gte('second_discount_label', 16)
    else if (selectedCategory.value === 'sale_15') query = query.eq('second_discount_label', '15')
    else query = query.eq('category', selectedCategory.value)
  }

  const { data, error } = await query.order('id', { ascending: true })
  if (!error && data) {
    products.value = data

    await nextTick()

    // Добавляем микро-задержку, чтобы Vue успел не просто создать тег,
    // а полностью вставить его в дерево отрисовки браузера
    setTimeout(() => {
      data.forEach((product) => {
        const canvasId = `canvas-${product.id}`
        const canvas = document.getElementById(canvasId)

        if (canvas) {
          drawFullFrame(
            canvasId,
            product.frame_url,
            205,
            product.image_url,
            300,
            50,
            product.is_stretch,
          )
        } else {
          console.warn(`Канвас ${canvasId} не найден в DOM`)
        }
      })
    }, 100) // 100 миллисекунд обычно достаточно
  }
}

// 3. ОТДЕЛЬНАЯ функция для кнопок (убедись, что она не внутри fetchProducts)
const filterByCategory = (key) => {
  // Логика: если жмем на ту же кнопку — сбрасываем, если на новую — выбираем её
  selectedCategory.value = selectedCategory.value === key && key !== 'all' ? 'all' : key
  fetchProducts()
}

// 1. Просто следим за "блокнотом"
watch(selectedCategory, () => {
  // Как только в блокноте что-то поменялось — сразу бежим в базу
  fetchProducts()
})

onMounted(() => {
  filterByCategory('all')
})
const selectedColor = ref('')

const changeColor = (name) => {
  if (selectedColor.value === name) {
    selectedColor.value = ''
    name = undefined
  } else {
    selectedColor.value = name
  }
  products.value.forEach((p) => {
    drawFullFrame('canvas-' + p.id, p.frame_url, 205, p.image_url, 300, 50, p.is_stretch, name)
  })
}
/*
const changeColor = (name, currentProduct) => {
  const isReset = selectedColor.value === name
  selectedColor.value = isReset ? '' : name
  const paintCost = Number(currentProduct?.paint_price) || 0

  products.value.forEach((p) => {
    // Если цвет отменили — вычитаем стоимость покраски, если выбрали новый — прибавляем
    p.price = isReset ? p.price - paintCost : p.price + paintCost
    drawFullFrame(
      'canvas-' + p.id,
      p.frame_url,
      205,
      p.image_url,
      300,
      50,
      p.is_stretch,
      selectedColor.value || undefined,
    )
  })
}
*/
/*
const changeColor = (name, currentProduct) => {
  const paintCost = Number(currentProduct?.paint_price) || 0

  if (selectedColor.value === name) {
    selectedColor.value = ''
    // Сбрасываем к базовой цене и убираем цвет со всех canvas
    products.value.forEach((p) => {
      if (p.base_price !== undefined) {
        p.price = p.base_price
      }
      drawFullFrame('canvas-' + p.id, p.frame_url, 205, p.image_url, 300, 50, p.is_stretch, '')
    })
  } else {
    selectedColor.value = name
    // Сохраняем исходную цену ОДИН раз и прибавляем стоимость покраски
    products.value.forEach((p) => {
      if (p.base_price === undefined) {
        p.base_price = p.price
      }
      p.price = p.base_price + paintCost
      drawFullFrame('canvas-' + p.id, p.frame_url, 205, p.image_url, 300, 50, p.is_stretch, name)
    })
  }
}*/ /*
const changeColor = (name) => {
  selectedColor.value = selectedColor.value === name ? '' : name

  products.value.forEach((p) => {
    drawFullFrame(
      'canvas-' + p.id,
      p.frame_url,
      205,
      p.image_url,
      300,
      50,
      p.is_stretch,
      selectedColor.value || undefined,
    )
  })
}*/

// 1. Умная переменная для списка избранного
const likedProducts = computed(() => {
  return products.value.filter((product) => product.is_liked)
})
</script>

<template>
  <main class="main">
    <section class="catalog">
      <div class="container4">
        <div class="catalog__content">
          <div class="container4">
            <div class="catalog__filters">
              <button class="hide__filters btn__rest" @click="isVisible = !isVisible">
                скрыть параметры
              </button>

              <div
                v-if="isVisible"
                class="catalog__filter"
                :class="{ 'catalog__filter--open': isFilterOpen }"
              >
                <div class="catalog__filter-top">
                  <div class="catalog__filter-caption">
                    <h3 class="catalog__filter-title">категории</h3>
                    <span class="catalog__filter-qantity qantity">1</span>
                  </div>
                  <span class="catalog__filter-toggle" @click="isFilterOpen = !isFilterOpen"></span>
                </div>
                <div class="catalog__filter-bottom">
                  <ul class="catalog-filter__items">
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedCategory === 'all'"
                          @click="filterByCategory('all')"
                        />
                        <span class="custom__checkbox-text">все категории</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="Accessories">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedCategory === 'photo_messy'"
                          @click="filterByCategory('photo_messy')"
                        />
                        <span class="custom__checkbox-text"> фооторамки: </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="dresses">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">пользовательские </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="coats">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedCategory === 'photo_frames'"
                          @click="filterByCategory('photo_frames')"
                        />
                        <span class="custom__checkbox-text"> беспорядочные</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="clothes">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">деревянные</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text"> Все Зеркала</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text"> Зеркала круглые </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Зеркала овальные зеркала</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text"
                          >Зеркала прямоугольные и квадратные</span
                        >
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text"> Зеркала для ванной</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Зеркала для прихожей и гардероба</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Зеркала для гостиной</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Зеркала настенные </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">
                          Зеркала напольные (в полный рост)
                        </span>
                      </label>
                    </li>

                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text"> Зеркала в классическом багете </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">
                          Зеркала в современном алюминиевом профиле
                        </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text"> Зеркала в деревянной раме </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">
                          Зеркала с фронтальной LED-подсветкой
                        </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">
                          Зеркала с интерьерной (парящей) подсветкой
                        </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item"></li>
                    <label class="custom__checkbox" data-text="clothes">
                      <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                      <span class="custom__checkbox-text">Рамы для вышивки биссером</span>
                    </label>

                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="t-shirt">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">новинки </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">хит продаж</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="summer">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Оформление икон</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="jacket">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Рамы для зеркал в ванную </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Лофт-багет для офиса</span>
                      </label>
                    </li>
                  </ul>
                </div>
              </div>

              <div
                v-if="isVisible"
                class="catalog__filter"
                :class="{ 'catalog__filter--open': isFilterOpen2 }"
              >
                <div class="catalog__filter-top">
                  <div class="catalog__filter-caption">
                    <h3 class="catalog__filter-title">цвет</h3>
                    <span class="catalog__filter-qantity qantity">2</span>
                  </div>
                  <span
                    class="catalog__filter-toggle"
                    @click="isFilterOpen2 = !isFilterOpen2"
                  ></span>
                </div>
                <div class="catalog__filter-bottom">
                  <ul class="catalog-filter__items">
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Черный матовый'"
                          @click="changeColor('Черный матовый', product)"
                        />
                        <span class="custom__checkbox-text">Черный матовый</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="Accessories">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Белый'"
                          @click="changeColor('Белый', product)"
                        />
                        <span class="custom__checkbox-text">Белый</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="dresses">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Золотой антик'"
                          @click="changeColor('Золотой антик')"
                        />
                        <span class="custom__checkbox-text">Золотой антик </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="dresses">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'желтый'"
                          @click="changeColor('желтый')"
                        />
                        <span class="custom__checkbox-text">желтый </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="coats">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Светлый дуб'"
                          @click="changeColor('Светлый дуб')"
                        />
                        <span class="custom__checkbox-text">Светлый дуб</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="clothes">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Венге'"
                          @click="changeColor('Венге')"
                        />
                        <span class="custom__checkbox-text">Венге</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="t-shirt">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'синий'"
                          @click="changeColor('синий')"
                        />
                        <span class="custom__checkbox-text">синий</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="t-shirt">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Серебряный'"
                          @click="changeColor('Серебряный')"
                        />
                        <span class="custom__checkbox-text">Серебряный</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Графит'"
                          @click="changeColor('Графит')"
                        />
                        <span class="custom__checkbox-text">Графит</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'зеленый'"
                          @click="changeColor('зеленый')"
                        />
                        <span class="custom__checkbox-text">зеленый</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="summer">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Слоновая кость'"
                          @click="changeColor('Слоновая кость')"
                        />
                        <span class="custom__checkbox-text"> Слоновая кость </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="jacket">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Бордовый с позолотой'"
                          @click="changeColor('Бордовый с позолотой')"
                        />
                        <span class="custom__checkbox-text">Бордовый с позолотой</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Шалфейный'"
                          @click="changeColor('Шалфейный')"
                        />
                        <span class="custom__checkbox-text">Шалфейный</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'красный'"
                          @click="changeColor('красный')"
                        />
                        <span class="custom__checkbox-text">красный</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Медный'"
                          @click="changeColor('Медный')"
                        />
                        <span class="custom__checkbox-text">Медный</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Антрацит'"
                          @click="changeColor('Антрацит')"
                        />
                        <span class="custom__checkbox-text">Антрацит</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'фиолетовый'"
                          @click="changeColor('фиолетовый')"
                        />
                        <span class="custom__checkbox-text">фиолетовый</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Темный орех'"
                          @click="changeColor('Темный орех')"
                        />
                        <span class="custom__checkbox-text">Темный орех</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Бежевый песок'"
                          @click="changeColor('Бежевый песок')"
                        />
                        <span class="custom__checkbox-text">Бежевый песок</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Темно-синий (Нави)'"
                          @click="changeColor('Темно-синий (Нави)')"
                        />
                        <span class="custom__checkbox-text">Темно-синий (Нави)</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Шампань'"
                          @click="changeColor('Шампань')"
                        />
                        <span class="custom__checkbox-text">Шампань</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'коричневый'"
                          @click="changeColor('коричневый')"
                        />
                        <span class="custom__checkbox-text">коричневый</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Оливковый'"
                          @click="changeColor('Оливковый')"
                        />
                        <span class="custom__checkbox-text">Оливковый</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Сталь (Сатин)'"
                          @click="changeColor('Сталь (Сатин)')"
                        />
                        <span class="custom__checkbox-text">Сталь (Сатин)</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'розовый'"
                          @click="changeColor('розовый')"
                        />
                        <span class="custom__checkbox-text">розовый</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Терракотовый'"
                          @click="changeColor('Терракотовый')"
                        />
                        <span class="custom__checkbox-text">Терракотовый</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'Пыльная роза'"
                          @click="changeColor('Пыльная роза')"
                        />
                        <span class="custom__checkbox-text">Пыльная роза</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedColor === 'оранджевый'"
                          @click="changeColor('оранджевый')"
                        />
                        <span class="custom__checkbox-text">оранджевый</span>
                      </label>
                    </li>
                  </ul>
                </div>
              </div>

              <div
                v-if="isVisible"
                class="catalog__filter"
                :class="{ 'catalog__filter--open': isFilterOpen3 }"
              >
                <div class="catalog__filter-top">
                  <div class="catalog__filter-caption">
                    <h3 class="catalog__filter-title">размер</h3>
                    <span class="catalog__filter-qantity qantity">3</span>
                  </div>
                  <span
                    class="catalog__filter-toggle"
                    @click="isFilterOpen3 = !isFilterOpen3"
                  ></span>
                </div>
                <div class="catalog__filter-bottom">
                  <ul class="catalog-filter__items">
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">all categories</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="Accessories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Accessories</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="dresses">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">dresses</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="coats">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">coats</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="clothes">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">clothes</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="t-shirt">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">t-shirt</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">all categories</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="summer">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">summer</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="jacket">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">jacket</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">short</span>
                      </label>
                    </li>
                  </ul>
                </div>
              </div>

              <div
                v-if="isVisible"
                class="catalog__filter"
                :class="{ 'catalog__filter--open': isFilterOpen4 }"
              >
                <div class="catalog__filter-top">
                  <div class="catalog__filter-caption">
                    <h3 class="catalog__filter-title">скидки</h3>
                    <span class="catalog__filter-qantity qantity">4</span>
                  </div>
                  <span
                    class="catalog__filter-toggle"
                    @click="isFilterOpen4 = !isFilterOpen4"
                  ></span>
                </div>
                <div class="catalog__filter-bottom catalog-filter--columns">
                  <ul class="catalog-filter__items catalog-filter--columns">
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="Accessories">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedCategory === 'sale_70'"
                          @click="filterByCategory('sale_70')"
                        />
                        <span class="custom__checkbox-text">Скидка 70% и выше</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="dresses">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedCategory === 'sale_50'"
                          @click="filterByCategory('sale_50')"
                        />
                        <span class="custom__checkbox-text">Скидка 50%</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="coats">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedCategory === 'sale_40'"
                          @click="filterByCategory('sale_40')"
                        />
                        <span class="custom__checkbox-text">Скидка менее 40%</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="clothes">
                        <input
                          type="checkbox"
                          class="custom__checkbox-input visual-hidden"
                          :checked="selectedCategory === 'sale_15'"
                          @click="filterByCategory('sale_15')"
                        />
                        <span class="custom__checkbox-text">скидка 15%</span>
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="catalog__grid">
              <div class="catalog__grid-props catalog-props">
                <div class="catalog-props__top">
                  <div class="catalog-props__calumns catalog-colums">
                    <span class="catalog-calumns__text"> количество колонок </span>
                    <ul class="catalog-colums-list">
                      <li class="catalog-colums__item">
                        <button
                          @click="setColumns(3)"
                          class="btn-reset main-link catalog__columns-btn"
                          :class="{ 'catalog__columns-btn--current': selectedCount === 3 }"
                          data-grid-colums="3"
                        >
                          3
                        </button>
                      </li>
                      <li class="catalog-colums__item">
                        <button
                          @click="setColumns(4)"
                          class="btn-reset main-link catalog__columns-btn"
                          :class="{ 'catalog__columns-btn--current': selectedCount === 4 }"
                          data-grid-colums="4"
                        >
                          4
                        </button>
                      </li>
                      <li class="catalog-colums__item">
                        <button
                          @click="setColumns(5)"
                          class="btn-reset main-link catalog__columns-btn"
                          :class="{ 'catalog__columns-btn--current': selectedCount === 5 }"
                          data-grid-colums="5"
                        >
                          5
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div class="custom-select" tabindex="0">
                    <div class="custom-select__top" @click="iscustomopen = !iscustomopen">
                      {{ selectedText }}
                    </div>
                    <div class="custom-select__dropdown" :class="{ 'custom-select': iscustomopen }">
                      <ul class="custom-select__list">
                        <li class="custom-select__item" @click="selectItem2('Сначала новые')">
                          Сначала новые
                        </li>
                        <li class="custom-select__item" @click="selectItem2('Сначала дешевые')">
                          Сначала дешевые
                        </li>
                        <li class="custom-select__item" @click="selectItem2('Сначала дорогие')">
                          Сначала дорогие
                        </li>

                        <li class="custom-select__item" @click="selectItem2('По умолчанию')">
                          По умолчанию
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div class="catalog-props__choice catalog-choice">
                <button class="btn-reset catalog-choice__item">
                  Accessories

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 26 26"
                  >
                    <path
                      d="M 21.734375 19.640625 L 19.636719 21.734375 C 19.253906 22.121094 18.628906 22.121094 18.242188 21.734375 L 13 16.496094 L 7.761719 21.734375 C 7.375 22.121094 6.746094 22.121094 6.363281 21.734375 L 4.265625 19.640625 C 3.878906 19.253906 3.878906 18.628906 4.265625 18.242188 L 9.503906 13 L 4.265625 7.761719 C 3.882813 7.371094 3.882813 6.742188 4.265625 6.363281 L 6.363281 4.265625 C 6.746094 3.878906 7.375 3.878906 7.761719 4.265625 L 13 9.507813 L 18.242188 4.265625 C 18.628906 3.878906 19.257813 3.878906 19.636719 4.265625 L 21.734375 6.359375 C 22.121094 6.746094 22.121094 7.375 21.738281 7.761719 L 16.496094 13 L 21.734375 18.242188 C 22.121094 18.628906 22.121094 19.253906 21.734375 19.640625 Z"
                    ></path>
                  </svg>
                </button>

                <button class="btn-reset catalog-choice__item">
                  28
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 26 26"
                  >
                    <path
                      d="M 21.734375 19.640625 L 19.636719 21.734375 C 19.253906 22.121094 18.628906 22.121094 18.242188 21.734375 L 13 16.496094 L 7.761719 21.734375 C 7.375 22.121094 6.746094 22.121094 6.363281 21.734375 L 4.265625 19.640625 C 3.878906 19.253906 3.878906 18.628906 4.265625 18.242188 L 9.503906 13 L 4.265625 7.761719 C 3.882813 7.371094 3.882813 6.742188 4.265625 6.363281 L 6.363281 4.265625 C 6.746094 3.878906 7.375 3.878906 7.761719 4.265625 L 13 9.507813 L 18.242188 4.265625 C 18.628906 3.878906 19.257813 3.878906 19.636719 4.265625 L 21.734375 6.359375 C 22.121094 6.746094 22.121094 7.375 21.738281 7.761719 L 16.496094 13 L 21.734375 18.242188 C 22.121094 18.628906 22.121094 19.253906 21.734375 19.640625 Z"
                    ></path>
                  </svg>
                </button>
                <button class="btn-reset catalog-choice__clear">clear all</button>
              </div>

              <ul class="catalog-grid__content" :data-grid-colums="selectedCount">
                <li v-for="product in products" :key="product.id" class="catalog__grid-item">
                  <article class="product">
                    <!-- router-link теперь и есть блок с картинкой -->
                    <router-link :key="product.id" :to="product.link" class="product__image">
                      <canvas :id="'canvas-' + product.id">
                        /*:src="product.currentImg"*/ @mouseover="product.currentImg =
                        product.imgHover" @mouseleave="product.currentImg = product.imgDefault"
                        alt="product-1"
                      </canvas>
                      <button
                        class="heart-btn2"
                        :class="{ 'is-active': product.is_liked }"
                        @click.prevent="toggleLike(product)"
                      >
                        <svg viewBox="0 0 24 24" width="30" height="30">
                          <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          />
                        </svg>
                      </button>
                    </router-link>
                    <!-- Кнопка-сердечко (ДОБАВЛЕНО) -->

                    <span v-if="product.discount" class="product__sale">
                      {{ product.discount }}
                    </span>
                    <!-- Плашки поверх картинки -->
                    <span v-for="(tag, index) in product.tags" :key="index" :class="tag.class">
                      {{ tag.text }}
                    </span>
                    <!-- Вторая скидка (новая колонка) -->
                    <span v-if="product.second_discount_label" class="product__sale">
                      -{{ product.second_discount_label }}%
                    </span>

                    <div
                      class="product__props-container"
                      style="display: flex; flex-direction: column; gap: 3px; margin-left: 15px"
                    >
                      <span v-if="product.discount_label" class="product__prop2 sales">{{
                        product.discount_label
                      }}</span>

                      <span v-if="product.new_label" class="product-prop product__prop new">{{
                        product.new_label
                      }}</span>
                      <span
                        v-if="product.bestseller_label"
                        class="product-prop product__prop best"
                        >{{ product.bestseller_label }}</span
                      >
                    </div>

                    <h3 class="product__title">
                      <router-link :to="product.link" class="catalog_link_color">{{
                        product.title
                      }}</router-link>
                    </h3>
                    <div class="prices">
                      <span class="product__price">
                        BYN
                        {{
                          selectedColor ? product.price + (product.paint_price || 0) : product.price
                        }}</span
                      >
                      <span v-if="product.old_price" class="product__oldprice">
                        BYN {{ product.old_price }}</span
                      >
                    </div>
                  </article>
                </li>
              </ul>

              <ul class="pagination">
                <li class="pagination__item">
                  <a href="#" class="pagination__link pagination__link--current">1</a>
                </li>
                <li class="pagination__item"><a href="#" class="pagination__link">2</a></li>

                <li class="pagination__item"><a href="#" class="pagination__link">3</a></li>

                <li class="pagination__item">
                  <a href="#" class="pagination__link"
                    >дальше

                    <img src="/images/right (1).png" alt="" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style>
.product__props-container {
  display: flex;
  gap: 2px;
}
/*.container4 {
  max-width: 1406px;
  padding: 0 40px;
  margin: 0 auto;
}

.catalog__content {
  min-height: 500px;
}

.catalog__content .container4 {
  display: flex;
}
.catalog__filters {
  width: 309px;
  padding-top: 27px;
  padding-right: 62px;
  border-top: 1px solid #eee;
  margin-right: 30px;
}*/
/*catalog***************/
.product2 {
  position: relative;
}

.heart-btn2 {
  position: absolute;
  bottom: 45px;
  right: 40px;

  background: none;
  border: none;
  cursor: pointer;
  fill: rgba(255, 255, 255, 0.7);
  transition: fill 0.3s;
}
.heart-btn2.is-active svg {
  fill: red;
  stroke: red;
}

/* Контейнер для плашек */

.product__image {
  position: relative;
  display: block;
  overflow: hidden;
  position: relative;
  max-height: 100%;
  object-fit: cover;
  width: fit-content;
  height: min-content;
}

.product__image span {
  margin-right: 8px; /* Расстояние между ними */
}

.product__sale {
  position: absolute;
  left: 45px;
  top: 50px;
  /*border: 2px solid #151515;*/

  /*color: #111;*/

  /* text-transform: uppercase;*/
  background: #ff4d4d;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  z-index: 1;
}
.catalog_link_color {
  color: #000;
}
.sales {
  background-image: url(../images/sale-tag.png);
}

.product__prop2 {
  display: inline-block;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  color: #111;
  background-position: left center;
  background-repeat: no-repeat;
  padding-left: 16px;
}
.best {
  background-image: url(../images/best-seller.png);
}

.product__oldprice {
  font-weight: 700;
  font-size: 13px;
  color: #959595;
  text-decoration: line-through;
  margin-left: 5px;
}
.new {
  background-image: url(../images/new1.png);
}

.product-prop {
  display: inline-block;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  color: #111;
  background-position: left center;
  background-repeat: no-repeat;
  padding-left: 16px;
}
.product__title {
  color: #454545;
  font-family: sans-serif;
  font-size: 13px;
  margin: 0;
  margin-left: 15px;
}
.product__price {
  width: 55px;
  height: 13px;
  color: #151515;
  font-weight: 700;
  font-size: 13px;
  margin-left: 15px;
}
.catalog {
  padding-top: 220px; /* или другое значение, чтобы «отлепить» от верха */
}
.breadcrumbs__list {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-top: 36px;
  padding-bottom: 26px;
}
.breadcrumbs__item {
  position: relative;
}
.breadcrumbs__item::after {
  content: '/';
  position: absolute;
  right: -20px;
  top: 50%;
  color: #585858;
  font-size: 10px;
  text-transform: uppercase;
  transform: translateY(-50%);
}

.breadcrumbs__item:not(:last-child) {
  margin-right: 35px;
}

.breadcrumbs {
  color: #858585;
  font-family:
    'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.breadcrumbs__link {
  font-size: 10px;
  text-transform: uppercase;
  color: gray;
  transition: color 0.3s;
}
.breadcrumbs__link:hover {
  color: #000;
  transition: color 0.3s;
}
.breadcrumbs__link--current {
  color: #000;
}

/*catalog filter*****************/

.catalog__filters {
  width: 309px;
  padding-top: 27px;
  padding-right: 62px;
  border-top: 1px solid #eee;
  margin-right: 30px;
}

.catalog__filter {
  border-top: 1px solid #eee;
}

.catalog__filter-top {
  display: flex;
  justify-content: space-between;
  padding-top: 34px;
  padding-bottom: 34px;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

/*display: flex;
   align-items: center;*/

.catalog__filter-title {
  display: inline-block;
  margin: 0;
}

.catalog__filter--open {
  display: block;
}

.catalog__filter--open .catalog__filter-bottom {
  display: block;
}

.catalog__filter--open .catalog__filter-toggle::before {
  display: none;
}

.catalog__filter-qantity {
  min-width: 16px;
  margin-left: 5px;
  transform: translateY(-1px);
}
.catalog-filter:last-child {
  border-bottom: 1px solid #eee;
}
.qantity {
  display: inline-flex;
  align-items: center;
  border-radius: 25px;
  padding: 0 5px;
  height: 16px;
  font-weight: 700;
  font-size: 10px;
  color: #fff;
  background-color: #000;
}

.catalog__filter-bottom {
  display: none;

  padding-bottom: 34px;
}

.hide__filters {
  color: #151515;
  font-family:
    'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana,
    sans-serif;
  padding-left: 24px;
  background-image: url('/images/close\ \(1\).png');
  background-repeat: no-repeat;
  background-position: left center;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  border: 0;
  background-color: #fff;
  margin-bottom: 18px;
}

.catalog__filter-toggle {
  position: relative;
  width: 12px;
  height: 12px;
  color: #aaa;
}

.catalog-filter__items {
  columns: 2;
}
.catalog-filter--columns {
  columns: 1;
}
.catalog-filter__item {
  margin-bottom: 14px;
}

.catalog-filter__item:nth-child(5n) {
  margin-bottom: 0;
}
.catalog__filter-toggle::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: currentColor;
  transform: translateX(-50%);
}

.catalog__filter-toggle::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  height: 2px;
  width: 100%;
  background-color: currentColor;
  transform: translateY(-50%);
}

/*pagination*/

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination__item:not(:last-child) {
  margin-right: 8px;
}

.pagination__link {
  display: inline-flex;
  align-items: center;
  color: #858585;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid #eee;
  padding: 0 16px;
  height: 40px;
  text-transform: uppercase;

  transition:
    color 0.3s,
    background-color 0.3s,
    border 0.3s;
}
.pagination__link:hover {
  border: 2px solid #000;
  background-color: #000;
  color: #fff;
  transition:
    color 0.3s,
    background-color 0.3s,
    border 0.3s;
}

.pagination__link--current {
  border: 2px solid #000;

  background-color: #000;
  color: #fff;
}

.pagination__item img {
  margin-left: 3px;
  width: 10px;
  height: 10px;
  fill: currentColor;
}

/*catalog content*******/

.catalog__content {
  min-height: 500px;
}
.catalog__content .container4 {
  display: flex;
}
.container4 {
  /* max-width: 1406px;*/

  padding: 0 10px;

  margin: 0 auto;
}
/*custom__checkbox**************/

.custom__checkbox {
  display: inline-block;
  cursor: pointer;
  user-select: none;
}

.custom__checkbox-text {
  color: gray;
  /*font-family: serif;*/
  font-size: 13px;
  padding-left: 15px;
  position: relative;
  transition: color 0.3s;
}
.custom__checkbox-text:hover {
  color: #000;
  transition: color 0.3s;
}
.custom__checkbox-input:checked + span {
  color: #000;
}

.custom__checkbox-input:checked + span::before {
  border-color: #000;
}
.custom__checkbox-input {
  display: none;
}

.custom__checkbox-input:checked::before {
  border-color: #000;
}

.custom__checkbox-input:checked + span::after {
  color: #000;
}

.custom__checkbox-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 3px;
  border: 2px solid #aaa;
  width: 11px;
  height: 11px;
}

.custom__checkbox-text::after {
  content: '\2713';
  position: absolute;
  left: 2px;
  top: 0;
  color: #000000;
  display: none;
}
.custom__checkbox-input:checked + .custom__checkbox-text::after {
  display: block;
}

/**catalog__grid******************/

.catalog__grid {
  width: 987px;
  width: 1130px;
  padding-top: 34px;
  padding-bottom: 60px;
}

.catalog-grid__content {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 70px;
}

.catalog__grid-item {
  /*padding-bottom: 16px;*/
  margin-bottom: 79px;
  margin-left: -10px; /*изменил*/
}

[data-grid-colums='3'] .catalog__grid-item {
  width: 31.3%;
}
[data-grid-colums='3'].catalog__grid-item:not(:nth-child(3n)) {
  margin-right: 3%;
}

[data-grid-colums='3'] .catalog__grid-item:nth-last-child(-n + 3) {
  margin-bottom: 0;
}

[data-grid-colums='4'] .catalog__grid-item {
  width: 22.7%;
}

[data-grid-colums='4'].catalog__grid-item:not(:nth-child(4n)) {
  margin-right: 3%;
}

[data-grid-colums='4'] .catalog__grid-item:nth-last-child(-n + 4) {
  margin-bottom: 0;
}

[data-grid-colums='5'] .catalog__grid-item {
  width: 17.6%;
}

[data-grid-colums='5'] .catalog__grid-item:not(:nth-child(5n)) {
  margin-right: 3%;
}

[data-grid-colums='5'] .catalog__grid-item:nth-last-child(-n + 5) {
  margin-bottom: 0;
}

.catalog-props {
  margin-bottom: 15px;
}
.catalog-props__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}
.catalog-choice {
  padding-bottom: 20px;
  display: none;
}

.custom-select {
  min-width: 115px;
  position: relative;
}

.custom-select__dropdown {
  display: none;
  position: absolute;
  left: 0;
  width: 100%;
  padding-bottom: 10px;
  top: calc(100%+2px);
  z-index: 20;
  width: 100%;
  background-color: #fff;
}

.custom-select__item {
  cursor: pointer;
  transition: color 0.3s;
}

.custom-select__item:hover {
  color: rgb(234, 234, 234);
  transition: color 0.3s;
}
.custom-select__item:not(:last-child) {
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
}

.custom-select__top {
  position: relative;
  padding-right: 32px;
  padding-bottom: 12px;
  /*  color: #151515;*/
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e5e7;
  cursor: pointer;
}

.custom-select__top::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  margin-top: -6px;

  width: 10px;
  height: 10px;
  transform: translateY(-50%);
  background-image: url('../images/arrows.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.custom-select--open .custom-select__top::after {
  transform: translateY(-50%) rotate(180deg);
}

.custom-select.custom-select__dropdown {
  display: block;
}
/*
.catalog-props select{
   display: none;
}*/

.btn-reset {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  position: relative;
}
.catalog__columns-btn {
  padding: 0 5px;
  color: gray;
  font-size: 10px;
}
.catalog__columns-btn--current {
  position: relative;
  font-size: 15px;
}

.catalog__columns-btn--current::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 100%;
  height: 2px;
  background-color: #000;
  transition: width 0.15s;
}
.catalog__columns-btn--current::before {
  width: 100%;
  transition: width 0.15s;
}
.catalog-calumns,
.catalog__columns-btn {
  font-size: 10px;
  color: gray;
}

.catalog-calumns,
.catalog__columns-btn:hover {
  color: #000;
}
.catalog__columns,
.catalog__columns-btn--current {
  color: #000;
}

.catalog__columns-btn--current::before {
  opacity: 1;
}

.main-link {
  position: relative;
  font-size: 10px;
  color: #000;
}

/*catalog-colums************/

.catalog-colums {
  display: flex;
  align-items: center;

  color: #151515;
  font-family: sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}
.catalog-colums__item,
.catalog-colums__item:not(:last-child) {
  margin-right: 5px;
}
.catalog-calumns__text {
  margin-right: 3px;
}

.catalog-colums-list {
  display: flex;
  align-items: center;
}

.main-link {
  position: relative;
  font-size: 10px;
  color: #7c7676;
}

.main-link::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -7px;
  opacity: 0;

  transition: opacity 0.15s;
  width: 100%;
  height: 2px;
  background-color: #000;
}

.main-link--current::before {
  opacity: 1;

  transition: opacity 0.15s;
}
.main-link:hover::before {
  opacity: 1;

  transition: opacity 0.15s;
}

.catalog__columns-btn--current {
  color: #000;
}

.catalog__columns-btn--current::before {
  opacity: 1;
}

/*catalog choice****************/
.catalog-choice {
  font-size: 0;
  display: none;
}
.catalog-choice__clear {
  position: relative;

  font-size: 13px;
  font-weight: 500;
}

.catalog-choice__clear::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 100%;
  height: 2px;
  background-color: currentColor;
  opacity: 1;
  transition: opacity 0.15s;
}
.catalog-choice__item {
  width: 110px;
  height: 24px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 12px;
  background-color: #eee;
  color: #454545;
  font-family: serif;
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;

  transition:
    background-color 0.3s,
    color 0.3s;
}

.catalog-choice svg {
  width: 8px;
  height: 9px;
}

.catalog-choice__item svg {
  width: 8px;
  height: 9px;
  fill: currentColor;
  margin-left: 5px;
  pointer-events: none;
}

.catalog-choice__item:hover {
  transition: color 0.3s;
  color: #fff;
  background-color: black;
  transition:
    background-color 0.3s,
    color 0.3s;
}
</style>
