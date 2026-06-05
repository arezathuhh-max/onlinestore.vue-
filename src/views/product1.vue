<script setup>
import { Pagination } from 'swiper/modules' // 1. Импортируем модуль пагинации
import { ref, computed, onMounted, watch } from 'vue'
import '@/assets/main.css'
import 'swiper/css/pagination'
import Swiper from 'swiper' // ДОБАВЬТЕ ЭТУ СТРОКУ
import { useRoute } from 'vue-router' // Импортируем для работы с URL
import { products, loadProducts } from '@/productsData.js'
// Входные параметры (Props)
const props = defineProps({
  photoUrl: String,
  textureOuterUrl: String,
  textureInnerUrl: String,
  frameW: Number, // Общая ширина конструкции
  frameH: Number, // Общая высота конструкции
  sOuter: Number, // Ширина внешней рамы
  sInner: Number, // Ширина внутренней рамы
  isStretchOuter: Boolean,
  isStretchInner: Boolean,
  colorOuter: String,
  colorInner: String,
  scaleOuter: { type: Number, default: 270 },
  scaleInner: { type: Number, default: 270 },
})

function drawOuterFrame(canvasId, textureUrl, frameW, frameH, s, isStretch, colorName, scale) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  Object.assign(canvas, { width: frameW, height: frameH })

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = textureUrl
  img.onload = () => {
    ctx.clearRect(0, 0, frameW, frameH)

    const pattern = ctx.createPattern(img, 'repeat')
    const currentScale = scale || 270
    pattern.setTransform(new DOMMatrix().scale(s / currentScale, s / currentScale))

    const sides = [
      [0, 0, frameW, 0, frameW - s, s, s, s],
      [frameW, 0, frameW, frameH, frameW - s, frameH - s, frameW - s, s],
      [frameW, frameH, 0, frameH, s, frameH - s, frameW - s, frameH - s],
      [0, frameH, 0, 0, s, s, s, frameH - s],
    ]

    sides.forEach((points, index) => {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(points[0], points[1])
      for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1])
      ctx.closePath()
      ctx.clip()

      const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2]
      // ИСПРАВЛЕНО: ТОЧКА [0, 0] НА МЕСТЕ
      const translates = [
        [0, 0],
        [frameW, 0],
        [frameW, frameH],
        [0, frameH],
      ]
      const len = index % 2 === 0 ? frameW : frameH

      ctx.translate(...translates[index])
      ctx.rotate(angles[index])

      if (isStretch) {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, len, s)
      } else {
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, len, s)
        ctx.fillRect(0, 0, len + 1, s)
        if (typeof applyColorOverlay === 'function') {
          applyColorOverlay(ctx, colorName, 0, 0, len + 1, s) // ИСПРАВЛЕНО: передаем точные 6 параметров
        }
      }
      ctx.restore()
    })

    ctx.save()
    ctx.beginPath()
    ctx.rect(s, s, frameW - s * 2, frameH - s * 2)
    ctx.clip()
    ctx.shadowBlur = 10
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.strokeRect(s - 5, s - 5, frameW - s * 2 + 10, frameH - s * 2 + 10)
    ctx.restore()
  }
}

function drawInnerFrame(
  canvasId,
  textureUrl,
  frameW,
  frameH,
  sOuter,
  sInner,
  isStretch,
  colorName,
  scale,
) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  Object.assign(canvas, { width: frameW, height: frameH })

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = textureUrl
  img.onload = () => {
    ctx.clearRect(0, 0, frameW, frameH)

    const pattern = ctx.createPattern(img, 'repeat')
    const currentScale = scale || 270
    pattern.setTransform(new DOMMatrix().scale(sInner / currentScale, sInner / currentScale))

    const start = sOuter - 1
    const s = sInner + 1

    const sides = [
      [start, start, frameW - start, start, frameW - (start + s), start + s, start + s, start + s],
      [
        frameW - start,
        start,
        frameW - start,
        frameH - start,
        frameW - (start + s),
        frameH - (start + s),
        frameW - (start + s),
        start + s,
      ],
      [
        frameW - start,
        frameH - start,
        start,
        frameH - start,
        start + s,
        frameH - (start + s),
        frameW - (start + s),
        frameH - (start + s),
      ],
      [start, frameH - start, start, start, start + s, start + s, start + s, frameH - start - s],
    ]

    sides.forEach((points, index) => {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(points[0], points[1])
      for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1])
      ctx.closePath()
      ctx.clip()

      const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2]
      // ИСПРАВЛЕНО: ТОЧКА [0, 0] НА МЕСТЕ
      const translates = [
        [0, 0],
        [frameW, 0],
        [frameW, frameH],
        [0, frameH],
      ]

      const len = index % 2 === 0 ? frameW : frameH

      ctx.translate(...translates[index])
      ctx.rotate(angles[index])

      if (isStretch) {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, start, len, s)
      } else {
        ctx.fillStyle = pattern
        ctx.fillRect(0, start, len, s)
        ctx.fillRect(0, start, len + 1, s)
        if (typeof applyColorOverlay === 'function') {
          applyColorOverlay(ctx, colorName, 0, start, len + 1, s)
        }
      }
      ctx.restore()
    })

    ctx.save()
    const totalOffset = sOuter + sInner
    ctx.beginPath()
    ctx.rect(totalOffset, totalOffset, frameW - totalOffset * 2, frameH - totalOffset * 2)
    ctx.clip()
    ctx.shadowBlur = 12
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.strokeRect(
      totalOffset - 5,
      totalOffset - 5,
      frameW - totalOffset * 2 + 10,
      frameH - totalOffset * 2 + 10,
    )
    ctx.restore()
  }
}
function applyColorOverlay(ctx, colorName, x, y, width, height) {
  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.globalAlpha = 0.9

  const colors = {
    'Черный матовый': '#222222',
    Белый: '#FFFFFF',
    'Золотой антик': '#997945',
    'Светлый дуб': '#e3c6a3',
    Венге: '#3b2f2b',
    Серебряный: '#c0c0c0',
    Графит: '#4b4b4b',
    'Слоновая кость': '#fffaf0',
    'Бордовый с позолотой': '#800000',
    Шалфейный: '#9ca998',
    Медный: '#b87333',
    Антрацит: '#2f353b',
    'Темный орех': '#5d4037',
    'Бежевый песок': '#d2b48c',
    'Темно-синий (Нави)': '#000080',
    Шампань: '#f7e7ce',
    Оливковый: '#808000',
    'Сталь (Сатин)': '#8e8e93',
    Терракотовый: '#e2725b',
    'Пыльная роза': '#c08081',
    желтый: '#FFFF00',
    синий: '#0000FF',
    зеленый: '#008000',
    оранджевый: '#FFA500',
    красный: '#FF0000',
    розовый: '#FF69B4',
    фиолетовый: '#800080',
    коричневый: '#964B00',
    // Добавим английские ID на случай, если они приходят из каталога URL
    black: '#222222',
    white: '#FFFFFF',
    Green: '#997945',
    'pure-green': '#008000',
  }

  if (colors[colorName]) {
    ctx.fillStyle = colors[colorName]
    ctx.fillRect(x, y, width, height)
  }
  ctx.restore()
}
// ... Сюда вставляются функции отрисовки (см. код ниже) ...

// Перерисовываем при изменении любых параметров

// Функция тонирования (остается без изменений)
function drawFullFrame(
  canvasId,
  textureUrl,
  frameW,
  photoUrl,
  frameH,
  s,
  isStretch,
  colorName,
  innerTextureUrl = null,
  innerS = 0,
  innerColorName = '',
) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  Object.assign(canvas, { width: frameW, height: frameH })

  function applyColor(color) {
    ctx.globalCompositeOperation = 'overlay'
    ctx.globalAlpha = 0.9
    if (color === 'Черный матовый') ctx.fillStyle = '#222222'
    else if (color === 'Белый') ctx.fillStyle = '#FFFFFF'
    else if (color === 'Золотой антик') ctx.fillStyle = '#997945'
    else if (color === 'Светлый дуб') ctx.fillStyle = '#e3c6a3'
    else if (color === 'Венге') ctx.fillStyle = '#3b2f2b'
    else if (color === 'Серебряный') ctx.fillStyle = '#c0c0c0'
    else if (color === 'Графит') ctx.fillStyle = '#4b4b4b'
    else if (color === 'Слоновая кость') ctx.fillStyle = '#fffaf0'
    else if (color === 'Бордовый с позолотой') ctx.fillStyle = '#800000'
    else if (color === 'Шалфейный') ctx.fillStyle = '#9ca998'
    else if (color === 'Медный') ctx.fillStyle = '#b87333'
    else if (color === 'Антрацит') ctx.fillStyle = '#2f353b'
    else if (color === 'Темный орех') ctx.fillStyle = '#5d4037'
    else if (color === 'Бежевый песок') ctx.fillStyle = '#d2b48c'
    else if (color === 'Темно-синий (Нави)') ctx.fillStyle = '#000080'
    else if (color === 'Шампань') ctx.fillStyle = '#f7e7ce'
    else if (color === 'Оливковый') ctx.fillStyle = '#808000'
    else if (color === 'Сталь (Сатин)') ctx.fillStyle = '#8e8e93'
    else if (color === 'Терракотовый') ctx.fillStyle = '#e2725b'
    else if (color === 'Пыльная роза') ctx.fillStyle = '#c08081'
    else if (color === 'желтый') ctx.fillStyle = '#FFFF00'
    else if (color === 'синий') ctx.fillStyle = '#0000FF'
    else if (color === 'зеленый') ctx.fillStyle = '#008000'
    else if (color === 'оранджевый') ctx.fillStyle = '#FFA500'
    else if (color === 'красный') ctx.fillStyle = '#FF0000'
    else if (color === 'розовый') ctx.fillStyle = '#FF69B4'
    else if (color === 'фиолетовый') ctx.fillStyle = '#800080'
    else if (color === 'коричневый') ctx.fillStyle = '#964B00'
  }

  // 1. ОТРИСОВКА ПЕРВОЙ (ВНЕШНЕЙ) РАМЫ
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = textureUrl
  img.onload = () => {
    const pattern = ctx.createPattern(img, 'repeat')
    pattern.setTransform(new DOMMatrix().scale(s / 270, s / 270))
    ctx.fillStyle = pattern

    const sides = [
      [0, 0, frameW, 0, frameW - s, s, s, s],
      [frameW, 0, frameW, frameH, frameW - s, frameH - s, frameW - s, s],
      [frameW, frameH, 0, frameH, s, frameH - s, frameW - s, frameH - s],
      [0, frameH, 0, 0, s, s, s, frameH - s],
    ]

    sides.forEach((points, index) => {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(points[0], points[1]) // ИСПРАВЛЕНО: Четкие индексы начальной точки
      for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1])
      ctx.closePath()
      ctx.clip()

      const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2]
      const translates = [
        [0, 0],
        [frameW, 0],
        [frameW, frameH],
        [0, frameH],
      ] // ИСПРАВЛЕНО: Заполнено без пропусков
      const len = index % 2 === 0 ? frameW : frameH

      ctx.translate(...translates[index])
      ctx.rotate(angles[index])

      if (isStretch) {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, len, s)
      } else {
        ctx.fillRect(0, 0, len + 1, s)
        if (colorName && colorName !== '') {
          applyColor(colorName)
          ctx.fillRect(0, 0, len + 1, s)
        }
      }
      ctx.restore()
    })

    // 2. ОТРИСОВКА ВНУТРЕННЕЙ РАМЫ
    if (innerTextureUrl && innerS > 0) {
      const img2 = new Image()
      img2.crossOrigin = 'anonymous'
      img2.src = innerTextureUrl
      img2.onload = () => {
        const pattern2 = ctx.createPattern(img2, 'repeat')
        pattern2.setTransform(new DOMMatrix().scale(innerS / 270, innerS / 270))
        ctx.fillStyle = pattern2

        // Для бесшовного соединения делаем нахлест на 1 пиксель (s - 1)
        const k = s - 1
        const total = k + innerS + 1

        const innerSides = [
          [k, k, frameW - k, k, frameW - total, total, total, total],
          [
            frameW - k,
            k,
            frameW - k,
            frameH - k,
            frameW - total,
            frameH - total,
            frameW - total,
            total,
          ],
          [
            frameW - k,
            frameH - k,
            k,
            frameH - k,
            total,
            frameH - total,
            frameW - total,
            frameH - total,
          ],
          [k, frameH - k, k, k, total, total, total, frameH - total],
        ]

        innerSides.forEach((points, index) => {
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(points[0], points[1]) // ИСПРАВЛЕНО: Четкие индексы начальной точки
          for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1])
          ctx.closePath()
          ctx.clip()

          const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2]
          const translates = [
            [0, 0],
            [frameW, 0],
            [frameW, frameH],
            [0, frameH],
          ] // ИСПРАВЛЕНО: Заполнено без пропусков
          const len = index % 2 === 0 ? frameW : frameH

          ctx.translate(...translates[index])
          ctx.rotate(angles[index])

          // Отрисовка начинается строго от шва k (139px от края холста)
          if (isStretch) {
            ctx.drawImage(img2, 0, 0, img2.width, img2.height, 0, k, len, innerS + 2)
          } else {
            ctx.fillRect(0, k, len + 1, innerS + 2)
            if (innerColorName && innerColorName !== '') {
              applyColor(innerColorName)
              ctx.fillRect(0, k, len + 1, innerS + 2)
            }
          }
          ctx.restore()
        })

        loadPhoto(s + innerS)
      }
    } else {
      loadPhoto(s)
    }
  }

  // 3. ОТРИСОВКА ЦЕНТРАЛЬНОГО ФОТО
  function loadPhoto(totalS) {
    const photo = new Image()
    photo.crossOrigin = 'anonymous'
    photo.src = photoUrl
    photo.onload = () => {
      ctx.drawImage(
        photo,
        0,
        0,
        photo.width,
        photo.height,
        totalS,
        totalS,
        frameW - 2 * totalS,
        frameH - 2 * totalS,
      )

      const g = ctx.createLinearGradient(totalS, totalS, frameW, frameH)
      g.addColorStop(0, 'rgba(255,255,255,0.4)')
      g.addColorStop(0.5, 'rgba(255,255,255,0)')
      g.addColorStop(1, 'rgba(255,255,255,0.1)')
      ctx.fillStyle = g
      ctx.fillRect(totalS, totalS, frameW - 2 * totalS, frameH - 2 * totalS)

      ctx.save()
      ctx.beginPath()
      ctx.rect(totalS, totalS, frameW - 2 * totalS, frameH - 2 * totalS)
      ctx.clip()
      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.strokeRect(totalS - 2, totalS - 2, frameW - 2 * totalS + 4, frameH - 2 * totalS + 4)
      ctx.restore()
    }
  }
}

const route = useRoute()
const productId = Number(route.params.id) // Получаем ID товара из URL-адреса страницы

// Автоматически находим текущий товар по его ID из URL
const currentProduct = computed(() => {
  if (!products.value.length) return {}
  return products.value.find((p) => String(p.id) === String(productId)) || {}
})
watch(currentProduct, (newProduct) => {
  if (newProduct && newProduct.id) {
    setTimeout(renderCanvas, 50)
  }
})
// Переменная для выбранного цвета (по умолчанию подставляем Green, как в вашем HTML)
const selectedColor = ref(route.query.color || '')

// Функция переключения цвета

const changeColor = (colorName) => {
  selectedColor.value = selectedColor.value === colorName ? '' : colorName
  renderAll() // Просто вызываем общую перерисовку трех слоев
}
/*// 1. Исправленная функция одиночной отрисовки
const renderCanvas = () => {
  if (currentProduct.value && currentProduct.value.id) {
    drawFullFrame(
      'canvas-detail',
      currentProduct.value.frame_url,
      574,
      currentProduct.value.image_url, // Используем правильное поле image_url
      759,
      140,
      currentProduct.value.is_stretch || false, // Проверьте имя поля в БД!
      selectedColor.value || undefined,
    )
  }
}*/
// 1. Исправленный рендер при загрузке страницы

function renderAll() {
  if (!currentProduct.value || !currentProduct.value.id) return

  // НАСТРОЙКА РАЗМЕРОВ: Задайте здесь нужную ширину рам в пикселях
  const outerW = 60 // Ширина внешней узорчатой рамы
  const innerW = 60 // Ширина внутренней рамы (канта)

  // 1. Отрисовка центрального фото (сдвигается ровно на сумму ширин рам)
  drawPhotoLayer('photoCanvas', currentProduct.value.image_url, 574, 759, outerW, innerW)

  // 2. Отрисовка внешней рамы
  drawOuterFrame(
    'outerFrameCanvas',
    currentProduct.value.frame_url,
    574,
    759,
    outerW,
    currentProduct.value.is_stretch,
    selectedColor.value || '',
    270,
  )

  // 3. Отрисовка внутренней рамы (только если выбран режим двойной рамы)
  if (frameType.value === 'double' && selectedInnerFrame.value) {
    // 3. Отрисовка внутренней рамы (ИСПРАВЛЕННЫЙ ВЫЗОВ)
    if (frameType.value === 'double' && selectedInnerFrame.value) {
      drawInnerFrame(
        'innerFrameCanvas',
        selectedInnerFrame.value.frame_url,
        574,
        759,
        outerW,
        innerW,
        false,
        innerFrameColor.value || '', // 8-й параметр: правильная переменная цвета канта!
        270, // 9-й параметр: число масштаба
      )
    }
  } else {
    // Если рама одиночная — полностью очищаем внутренний холст от старых рисунков
    const canvas = document.getElementById('innerFrameCanvas')
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, 574, 759)
    }
  }
}

// Если данные пришли чуть позже рендера, watch заметит появление товара и нарисует холст
watch(currentProduct, (newProduct) => {
  if (newProduct && newProduct.id) {
    setTimeout(renderAll, 50) // ИСПРАВЛЕНО: вызываем renderAll вместо renderCanvas
  }
})

// Отрисовка холста при первой загрузке страницы карточки
onMounted(async () => {
  await loadProducts() // 1. Ждем окончания загрузки данных из базы
  dbFrames.value = products.value
  renderAll()
})
// Управление видимостью формы
const showForm = ref(false)
const newComment = ref('')

// Начальный массив комментариев
const comments = ref([
  {
    id: 1,
    text: 'Отличный товар, доставили быстро! Рекомендую.',
    likes: 12,
    isLiked: false,
    dislikes: 0,
    isDisliked: false,
  },
  {
    id: 2,
    text: 'Качество среднее, но за такую цену нормально.',
    likes: 3,
    isLiked: false,
    dislikes: 1,
    isDisliked: false,
  },
])

// Добавление нового комментария
const addComment = () => {
  comments.value.unshift({
    id: Date.now(),
    text: newComment.value,
    likes: 0,
    isLiked: false,
    dislikes: 0,
    isDisliked: false,

    isMyComment: true, // Помечаем, что этот комментарий добавили именно вы
  })
  newComment.value = ''
  showForm.value = false // Скрываем форму после отправки
}

// Логика лайка
const toggleLike = (comment) => {
  if (comment.isDisliked) {
    comment.dislikes-- // Сразу уменьшаем дизлайки
    comment.isDisliked = false // Сбрасываем флаг дизлайка
  }
  if (comment.isLiked) {
    // Убираем дизлайк, если он был
    comment.likes--
    comment.isLiked = false
  } else {
    comment.likes++
    comment.isLiked = true
  }
}

// Логика дизлайка
const toggleDislike = (comment) => {
  if (comment.isLiked) {
    comment.likes--
    comment.isLiked = false
  }
  if (comment.isDisliked) {
    comment.dislikes--
    comment.isDisliked = false
  } else {
    comment.dislikes++
    comment.isDisliked = true
  }
}

// Удаление комментария по ID
const deleteComment = (id) => {
  comments.value = comments.value.filter((comment) => comment.id !== id)
}

onMounted(() => {
  new Swiper('.card-related__slider', {
    modules: [Pagination], // 2. Регистрируем модуль
    slidesPerView: 4,
    spaceBetween: 30,
    pagination: {
      // 3. Настраиваем пагинацию
      el: '.swiper-pagination',
      clickable: true, // Чтобы точки кликались
      dynamicMainBullets: 6, // Отображает ровно 6 главных точек на экране
    },
  })
})
const frameType = ref('single')

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Создаем временную безопасную ссылку на загруженный файл
  currentProduct.value.image_url = URL.createObjectURL(file)

  // Мгновенно перерисовываем холст с новым фото
  // ИСПРАВЛЕНО: Мгновенно перерисовываем все три слоя холста через актуальную функцию
  renderAll()
}

/*двойная рама*/
const dbFrames = ref([]) // Сюда запишите массив рам, полученный из Supabase
const innerFrameColor = ref('')
const selectedInnerFrame = ref(null)

// Массив из 28 цветов в нужном вам порядке
const allColors = [
  { id: 'black', name: 'Черный матовый', bg: '#222222' },
  { id: 'white', name: 'Белый', bg: '#FFFFFF' },
  { id: 'Green', name: 'Золотой антик', bg: '#997945' },
  { id: 'light-oak', name: 'Светлый дуб', bg: '#e3c6a3' },
  { id: 'wenge', name: 'Венге', bg: '#3b2f2b' },
  { id: 'silver', name: 'Серебряный', bg: '#c0c0c0' },
  { id: 'graphite', name: 'Графит', bg: '#4b4b4b' },
  { id: 'ivory', name: 'Слоновая кость', bg: '#fffaf0' },
  { id: 'maroon', name: 'Бордовый с позолотой', bg: '#800000' },
  { id: 'sage', name: 'Шалфейный', bg: '#9ca998' },
  { id: 'copper', name: 'Медный', bg: '#b87333' },
  { id: 'anthracite', name: 'Антрацит', bg: '#2f353b' },
  { id: 'dark-walnut', name: 'Темный орех', bg: '#5d4037' },
  { id: 'beige-sand', name: 'Бежевый песок', bg: '#d2b48c' },
  { id: 'navy', name: 'Темно-синий (Нави)', bg: '#000080' },
  { id: 'champagne', name: 'Шампань', bg: '#f7e7ce' },
  { id: 'olive', name: 'Оливковый', bg: '#808000' },
  { id: 'steel', name: 'Сталь (Сатин)', bg: '#8e8e93' },
  { id: 'terracotta', name: 'Терракотовый', bg: '#e2725b' },
  { id: 'dusty-rose', name: 'Пыльная роза', bg: '#c08081' },
  { id: 'yellow', name: 'желтый', bg: '#FFFF00' },
  { id: 'blue', name: 'синий', bg: '#0000FF' },
  { id: 'pure-green', name: 'зеленый', bg: '#008000' },
  { id: 'Orange', name: 'оранджевый', bg: '#FFA500' },
  { id: 'pure-red', name: 'красный', bg: '#FF0000' },
  { id: 'pink', name: 'розовый', bg: '#FF69B4' },
  { id: 'purple', name: 'фиолетовый', bg: '#800080' },
  { id: 'brown', name: 'коричневый', bg: '#964B00' },
]

const selectFrameType = (type) => {
  frameType.value = type

  if (type === 'double') {
    isPanelOpen.value = true
    if (dbFrames.value.length === 0) {
      dbFrames.value = products.value
    }
  } else {
    // ПОЛНОЕ УДАЛЕНИЕ ВТОРОЙ РАМЫ ПРИ КЛИКЕ НА «ОДИНАРНАЯ РАМА»:
    isPanelOpen.value = false
    innerFrameColor.value = '' // Удаляем выбранный цвет канта
    selectedInnerFrame.value = null // Удаляем саму выбранную внутреннюю раму

    // Мгновенно стираем вторую раму с холста
    const canvas = document.getElementById('innerFrameCanvas')
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, 574, 759)
    }

    // Перерисовываем оставшиеся слои (фото и внешнюю раму), чтобы обновить отступы
    renderAll()
  }
}
// 2. Исправленная функция для применения внутренней рамы
// 3. Исправленное применение внутренней рамы
const applyInnerFrame = (frame) => {
  selectedInnerFrame.value = frame
  renderAll() // Перерисовывает холст, беря правильные URL и цвета
}

const selectInnerColor = (colorName) => {
  frameType.value = 'double' // ИСПРАВЛЕНО: активируем режим двойной рамы
  innerFrameColor.value = innerFrameColor.value === colorName ? '' : colorName
  renderAll()
}

/*двойная рама*/

function drawPhotoLayer(canvasId, photoUrl, frameW, frameH, sOuter, sInner) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  Object.assign(canvas, { width: frameW, height: frameH })

  const photo = new Image()
  photo.crossOrigin = 'anonymous'
  photo.src = photoUrl
  photo.onload = () => {
    ctx.clearRect(0, 0, frameW, frameH)

    // Вычисляем точный внутренний край
    const offset = Number(sOuter) + Number(sInner)

    // Рисуем фото с нахлестом в 4 пикселя ПОД раму, чтобы гарантированно закрыть белое пространство
    ctx.drawImage(
      photo,
      0,
      0,
      photo.width,
      photo.height,
      offset - 60,
      offset - 60,
      frameW - offset * 2 + 120,
      frameH - offset * 2 + 120,
    )

    // Эффект глянца поверх картины
    const g = ctx.createLinearGradient(offset, offset, frameW, frameH)
    g.addColorStop(0, 'rgba(255,255,255,0.4)')
    g.addColorStop(0.5, 'rgba(255,255,255,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.1)')
    ctx.fillStyle = g
    ctx.fillRect(offset, offset, frameW - offset * 2, frameH - offset * 2)
  }
}
const isPanelOpen = ref(true) // По умолчанию панель отображается

const totalPrice = computed(() => {
  // Базовая цена товара
  let price = Number(currentProduct.value?.price || 0)

  // 1. Покраска первой (внешней) рамы
  if (selectedColor.value) {
    price += Number(currentProduct.value?.paint_price || 0)
  }

  // 2. Условия для двойной рамы
  if (frameType.value === 'double') {
    // Цена выбранной внутренней рамы
    if (selectedInnerFrame.value?.price) {
      price += Number(selectedInnerFrame.value.price)
    }
    // Покраска внутренней рамы (фиксированная цена 50)
    if (innerFrameColor.value) {
      price += 50
    }
  }

  return price
})
</script>

<template>
  <main class="main">
    <section class="card-big">
      <div class="card">
        <!-- Конструктор двойной рамы (показывается только при активной вкладке) -->
        <div
          v-if="frameType === 'double' && isPanelOpen"
          class="double-frame-constructor"
          @click.stop
        >
          <!-- Левая панель: багеты из БД -->
          <div class="double-frame-left">
            <div
              v-for="frame in dbFrames"
              :key="frame.id"
              class="frame-sample-card"
              @click="applyInnerFrame(frame)"
            >
              <div class="frame-sample-img-wrapper">
                <img :src="frame.frame_url" :alt="frame.title" class="frame-sample-img" />
              </div>
              <p class="frame-sample-title">{{ frame.title }}</p>
              <p class="frame-sample-price">{{ frame.price }} BYN</p>
            </div>
          </div>

          <!-- Правая панель: 28 цветов вертикальной линией -->
          <div class="double-frame-right">
            <div class="color-vertical-list">
              <button
                v-for="color in allColors"
                :key="color.id"
                class="color-vertical-btn"
                :class="{ active: innerFrameColor === color.name }"
                :style="{ backgroundColor: color.bg }"
                :title="color.name"
                @click="selectInnerColor(color.name)"
              ></button>
            </div>
            <!-- HTML-элемент (кнопка с SVG внутри) -->
            <button class="close-btn" aria-label="Закрыть" @click="isPanelOpen = false">
              <svg class="close-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="container7">
          <h2 class="visually-hidden">product card</h2>

          <div class="card-container">
            <div class="card-content">
              <div class="card-content__top">
                <div class="card-top">
                  <div class="card-top__left">
                    <div class="card-slider">
                      <div
                        class="card-slider__thumbs"
                        :class="{ 'is-invisible': frameType === 'double' && isPanelOpen }"
                      >
                        <div class="card-slider__thumb">
                          <img src="/images/card-photo small.png" alt="" />
                        </div>
                        <div class="card-slider__thumb">
                          <img src="/images/card-photo small.png" alt="" />
                        </div>
                        <div class="card-slider__thumb">
                          <img src="/images/card-photo small.png" alt="" />
                        </div>
                        <div class="card-slider__thumb">
                          <img src="/images/card-photo small.png" alt="" />
                        </div>
                        <div class="card-slider__thumb">
                          <img src="/images/card-photo small.png" alt="" />
                        </div>
                      </div>

                      <div class="frame-constructor">
                        <!-- Общий контейнер, задающий физический размер багета -->
                        <!-- Вариант 1: Если вы используете независимые слои (функция renderAll) -->
                        <div
                          class="canvas-container"
                          style="position: relative; width: 574px; height: 759px"
                        >
                          <canvas
                            id="photoCanvas"
                            style="position: absolute; left: 0; top: 0; z-index: 1"
                          ></canvas>

                          <canvas
                            id="innerFrameCanvas"
                            style="position: absolute; left: 0; top: 0; z-index: 2"
                          ></canvas>
                          <canvas
                            id="outerFrameCanvas"
                            style="position: absolute; left: 0; top: 0; z-index: 3"
                          ></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="card-top__right">
                    <div class="card-info">
                      <div
                        v-if="
                          currentProduct.discount_label ||
                          currentProduct.new_label ||
                          currentProduct.bestseller_label
                        "
                        class="product__props-container"
                        style="display: flex; gap: 5px"
                      >
                        <span
                          v-if="currentProduct.discount_label"
                          class="card-info__prop product-prop sales"
                          >{{ currentProduct.discount_label }}</span
                        >
                        <span
                          v-if="currentProduct.new_label"
                          class="card-info__prop product-prop new"
                          >{{ currentProduct.new_label }}</span
                        >
                        <span
                          v-if="currentProduct.bestseller_label"
                          class="card-info__prop product-prop best"
                          >{{ currentProduct.bestseller_label }}</span
                        >
                      </div>
                      <h3 class="card-info__title">{{ currentProduct.title }}</h3>
                      <div class="card-info__rate">
                        <img src="/images/rating (4).png" alt="rate 4 of 5" />
                        <span class="">2 отзыва</span>
                      </div>
                      <div class="card-info__price info-price">
                        <div class="info-price__current">BYN {{ totalPrice }}</div>
                        <div v-if="currentProduct.old_price" class="info-price__old">
                          BYN {{ currentProduct.old_price }}
                        </div>
                      </div>

                      <label
                        class="upload-btn"
                        style="
                          display: block;
                          max-width: 277px;
                          padding: 10px 20px;
                          background: #000;
                          color: #fff;
                          cursor: pointer;
                          margin-bottom: 20px;
                          border-radius: 6px;
                          text-align: center;
                        "
                      >
                        Загрузить своё фото
                        <input
                          type="file"
                          accept="image/*"
                          @change="handlePhotoUpload"
                          style="display: none"
                        />
                      </label>
                      <div class="card-info__select size-select card-info__second-select">
                        <p class="size-select__selected">Размер: <span>Выберите размер </span></p>

                        <button class="btn-reset size-select__clear">
                          <img src="/images/cross.png" alt="" />

                          очистить
                        </button>
                      </div>
                      <div class="toggle-container" role="radiogroup" aria-label="Выбор рамы">
                        <button
                          class="toggle-btn"
                          data-value="single"
                          role="radio"
                          :aria-checked="frameType === 'single'"
                          :class="{ active: frameType === 'single' }"
                          @click="selectFrameType('single')"
                        >
                          Одинарная рама
                        </button>
                        <button
                          class="toggle-btn"
                          data-value="double"
                          role="radio"
                          :aria-checked="frameType === 'double'"
                          :class="{ active: frameType === 'double' }"
                          @click="selectFrameType('double')"
                        >
                          Двойная рама
                        </button>
                      </div>
                      <div class="card-info__first-select color-select">
                        <p class="color-select__selected">
                          Цвет: <span>{{ selectedColor || 'Не выбран' }}</span>
                        </p>

                        <ul class="color-select__list">
                          <li
                            v-for="item in [
                              { id: 'black', name: 'Черный матовый', bg: '#222222' },
                              { id: 'white', name: 'Белый', bg: '#FFFFFF' },
                              { id: 'Green', name: 'Золотой антик', bg: '#997945' },
                              { id: 'light-oak', name: 'Светлый дуб', bg: '#e3c6a3' },
                              { id: 'wenge', name: 'Венге', bg: '#3b2f2b' },
                              { id: 'silver', name: 'Серебряный', bg: '#c0c0c0' },
                              { id: 'graphite', name: 'Графит', bg: '#4b4b4b' },
                              { id: 'ivory', name: 'Слоновая кость', bg: '#fffaf0' },
                              { id: 'maroon', name: 'Бордовый с позолотой', bg: '#800000' },
                              { id: 'sage', name: 'Шалфейный', bg: '#9ca998' },
                              { id: 'copper', name: 'Медный', bg: '#b87333' },
                              { id: 'anthracite', name: 'Антрацит', bg: '#2f353b' },
                              { id: 'dark-walnut', name: 'Темный орех', bg: '#5d4037' },
                              { id: 'beige-sand', name: 'Бежевый песок', bg: '#d2b48c' },
                              { id: 'navy', name: 'Темно-синий (Нави)', bg: '#000080' },
                              { id: 'champagne', name: 'Шампань', bg: '#f7e7ce' },
                              { id: 'olive', name: 'Оливковый', bg: '#808000' },
                              { id: 'steel', name: 'Сталь (Сатин)', bg: '#8e8e93' },
                              { id: 'terracotta', name: 'Терракотовый', bg: '#e2725b' },
                              { id: 'dusty-rose', name: 'Пыльная роза', bg: '#c08081' },
                              { id: 'yellow', name: 'желтый', bg: '#FFFF00' },
                              { id: 'blue', name: 'синий', bg: '#0000FF' },
                              { id: 'pure-green', name: 'зеленый', bg: '#008000' },
                              { id: 'Orange', name: 'оранджевый', bg: '#FFA500' },
                              { id: 'pure-red', name: 'красный', bg: '#FF0000' },
                              { id: 'pink', name: 'розовый', bg: '#FF69B4' },
                              { id: 'purple', name: 'фиолетовый', bg: '#800080' },
                              { id: 'brown', name: 'коричневый', bg: '#964B00' },
                            ]"
                            :key="item.id"
                            class="color-select__item"
                          >
                            <button
                              class="color-select__btn btn-reset"
                              :class="{
                                'color-select__btn--active':
                                  selectedColor === item.id || selectedColor === item.name,
                              }"
                              :data-color="item.id"
                              :aria-label="'choise ' + item.id + ' color'"
                              :style="{ backgroundColor: item.bg }"
                              @click="changeColor(item.name)"
                            ></button>
                          </li>
                        </ul>
                      </div>

                      <div class="card-info__stepper stepper">
                        <button
                          class="btn-reset stepper__btn stepper__btn--minus"
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

                        <input type="text" class="stepper__input" value="1" />
                        <button class="btn-reset stepper__btn stepper__btn--plus" aria-label="plus">
                          <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                            <rect fill="none" height="256" width="256" />
                            <path d="M216,136H40a8,8,0,0,1,0-16H216a8,8,0,0,1,0,16Z" />
                          </svg>
                        </button>
                      </div>
                      <button class="btn-reset card-info__btn card-info__btn--tocart">
                        добавить в корзину
                      </button>
                      <button class="btn-reset card-info__btn card-info__btn--towishlist">
                        добавить в Понравившиеся
                      </button>

                      <div class="card-info__bottom card-bottom">
                        <div class="card-botttom__item">
                          <span> Sku:</span> <span class="card-botttom__item-color">fw511</span>
                        </div>
                        <div class="card-botttom__item">
                          <span>Category:</span>
                          <span class="card-botttom__item-color">trousers,</span>
                          <span class="card-botttom__item-color">life style</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- card top -->

                <div class="description_bottom">
                  <div class="description_bottom__text">Описание</div>
                  <p class="card-info__descr">
                    Эта стильная рама из качественных материалов надежно защитит ваше изображение от
                    внешних воздействий. Её лаконичный и универсальный дизайн гармонично подчеркнет
                    красоту любого постера, картины или холста. Изделие идеально впишется в любой
                    стиль интерьера квартиры, студии или уютного офиса. Прочные встроенные крепления
                    обеспечивают легкий монтаж и безупречную фиксацию на стене.
                  </p>
                </div>
                <div class="card-content__bottom">
                  <!--    card bottom    -->
                  <div class="card-bottom-content">
                    <!--<div class="card-description">
                      <div class="card-description__left">
                        <ul class="card-description__navigation">
                          <li class="card-description__item">
                            <a
                              href="#one"
                              class="card-description__link card-description__link--active"
                              >описание</a
                            >
                          </li>
                          <li class="card-description__item">
                            <a href="#two" class="card-description__link"
                              >Дополнительная информация</a
                            >
                          </li>
                          <li class="card-description__item">
                            <a href="#three" class="card-description__link">обзоры (2)</a>
                          </li>
                          <li class="card-description__item">
                            <a href="#four" class="card-description__link">описание</a>
                          </li>
                        </ul>
                      </div>
                      <div class="card-description__right">
                        <div class="warning">
                          <img src="/images/warning (1).png" alt="" />
                          <p class="warning-text">каментарии не удаляються</p>
                        </div>
                        <div
                          class="card-description__content card-description__content--active"
                          data-target="#one"
                        >
                          <p>
                            orem Ipsum is simply dummy text of the printing and typesetting
                            industry. Lorem Ipsum has been the industry's standard dummy text ever
                            since the 1500s, when an unknown printer took a galley of type and
                            scrambled it to make a type specimen book. It has survived not only five
                            centurie, but also the leap into electronic typesetting, remaining
                            essentially unchanged. It was popularised in the 1960s with the release
                            of Letraset sheets containing Lorem Ipsum passages, and more recently
                            with deskto
                          </p>
                        </div>
                        <div class="card-description__content" data-target="#two">
                          <p>
                            orem Ipsum is simply dummy text of the printing and typesetting
                            industry. Lorem Ipsum has been the industry's standard dummy text ever
                            since the 1500s, when an unknown printer took a galley of type and
                            scrambled it to make a type specimen book. It has survived not only five
                            centurie, but also the leap into electronic typesetting, remaining
                            essentially unchanged. It was popularised in the 1960s with the release
                            of Letraset sheets containing Lorem Ipsum passages, and more recently
                            with deskto
                          </p>
                        </div>

                        <div class="evaluation">
                          <div class="evaluation_margin">
                            <img src="/images/like (1).png" alt="" />
                            <span>0</span>
                          </div>
                          <div class="evaluation_margin">
                            <img src="/images/dislike (2) (1).png" alt="" />
                            <span>0</span>
                          </div>
                        </div>
                      </div>
                    </div>-->

                    <div class="reviews-section">
                      <h2>Отзывы клиентов</h2>

                      <!-- Кнопка открытия формы -->
                      <button @click="showForm = !showForm" class="btn-toggle">
                        {{ showForm ? 'Отменить отзыв' : 'Написать отзыв' }}
                      </button>

                      <!-- Скрытие/показ формы через Vue v-if -->
                      <form v-if="showForm" @submit.prevent="addComment" class="comment-form">
                        <textarea
                          v-model="newComment"
                          placeholder="Поделитесь вашим мнением о товаре..."
                          required
                        ></textarea>
                        <button type="submit" class="btn-submit">Отправить</button>
                      </form>

                      <!-- Список комментариев -->
                      <div class="comments-list">
                        <div v-for="comment in comments" :key="comment.id" class="comment-card">
                          <p class="comment-text">{{ comment.text }}</p>

                          <!-- Блок лайков в стиле Amazon -->
                          <div class="comment-actions">
                            <button
                              @click="toggleLike(comment)"
                              :class="{ 'is-liked': comment.isLiked }"
                              class="btn-like"
                            >
                              Полезно ({{ comment.likes }})
                            </button>
                            <!-- Кнопка ДИЗЛАЙК -->
                            <button
                              @click="toggleDislike(comment)"
                              :class="{ 'is-disliked': comment.isDisliked }"
                              class="btn-dislike"
                            >
                              Не полезно ({{ comment.dislikes }})
                            </button>

                            <!-- Кнопка УДАЛЕНИЯ (показывается только для добавленных вами комментов) -->
                            <button
                              v-if="comment.isMyComment"
                              @click="deleteComment(comment.id)"
                              class="btn-delete"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="card-relatred">
                      <!--card-related-->
                      <h2 class="card-relatred__title">сопутствующие товары</h2>
                      <div class="card-related__slider">
                        <div class="swiper-wrapper">
                          <div class="swiper-slide">
                            <article class="product3">
                              <div class="product__image">
                                <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                              </div>
                              <span class="product-prop product__prop best">Хит продаж</span>

                              <h3 class="product__title2">
                                <a href="#"> Eyes Mesh Boat Shoes </a>
                              </h3>

                              <span class="product__price2">$220.00 </span>
                            </article>
                          </div>

                          <div class="swiper-slide">
                            <article class="product3">
                              <div class="product__image">
                                <span class="product__sale2">скидка</span>

                                <img
                                  src="/images/works22 (1) (2) (3).png "
                                  class="no-visible"
                                  alt=""
                                />
                              </div>

                              <span class="product-prop product__prop best">Хит продаж</span>

                              <h3 class="product__title2">
                                <a href="#"> Eyes Mesh Boat Shoes </a>
                              </h3>

                              <div class="product-custom">
                                <div class="product-custom__price">
                                  <span class="product__price2">$220.00 </span>
                                </div>
                              </div>
                            </article>
                          </div>

                          <div class="swiper-slide">
                            <article class="product3">
                              <div class="product__image">
                                <span class="product__sale2">скидка</span>
                                <img src="/images/beautiful1.png" alt="product-1" />
                              </div>

                              <span class="product__prop22 sales2">скидка</span>

                              <h3 class="product__title2">
                                <a href="#"> Eyes Mesh Boat Shoes </a>
                              </h3>
                              <div class="product-custom">
                                <div class="product-custom__price">
                                  <span class="product__price2">$220.00 </span>

                                  <span class="product__oldprice">$210.00</span>
                                </div>
                              </div>
                            </article>
                          </div>

                          <div class="swiper-slide">
                            <article class="product3">
                              <div class="product__image">
                                <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                              </div>
                              <span class="product-prop product__prop best">Хит продаж</span>

                              <h3 class="product__title2">
                                <a href="#"> Eyes Mesh Boat Shoes </a>
                              </h3>

                              <div class="product-custom">
                                <div class="product-custom__price">
                                  <span class="product__price2">$220.00 </span>
                                </div>
                              </div>
                            </article>
                          </div>

                          <div class="swiper-slide">
                            <article class="product3">
                              <div class="product__image">
                                <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                              </div>
                              <span class="product-prop product__prop best">Хит продаж</span>

                              <h3 class="product__title2">
                                <a href="#"> Eyes Mesh Boat Shoes </a>
                              </h3>

                              <div class="product-custom">
                                <div class="product-custom__price">
                                  <span class="product__price2">$220.00 </span>
                                </div>
                              </div>
                            </article>
                          </div>

                          <div class="swiper-slide">
                            <article class="product3">
                              <div class="product__image">
                                <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                              </div>
                              <span class="product-prop product__prop best">Хит продаж</span>

                              <h3 class="product__title2">
                                <a href="#"> Eyes Mesh Boat Shoes </a>
                              </h3>

                              <span class="product__price">$220.00 </span>
                            </article>
                          </div>
                        </div>

                        <div class="swiper-pagination related-pag"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style>
/* CSS-стили для смены цвета при наведении */
.close-btn {
  position: absolute; /* Позволяет свободно двигать крестик внутри блока */
  top: 60%; /* Опускает кнопку в самый низ родительского контейнера */
  left: 50%; /* Сдвигает левый край кнопки ровно на половину ширины блока */
  transform: translateX(
    -50%
  ); /* Сдвигает кнопку обратно на её полуширину для идеального центрирования */

  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  /* Начальный цвет крестика (например, серый) */
  color: #888888;
  transition: color 0.2s ease;
}

/* При наведении цвет stroke у SVG меняется на черный благодаря currentColor */
.close-btn:hover {
  color: #000000;
}

/* Фиксируем размер иконки */
.close-icon {
  width: 24px;
  height: 24px;
}
/*тройной конструктор */

.frame-constructor {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* Контейнер-бутерброд */
.frame-container {
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); /* Тень всей конструкции на стену */
  overflow: hidden;
}

/* Общие стили для всех слоев */
.layer-photo,
.layer-inner-frame,
.layer-outer-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Чтобы не мешать кликам, если нужны */
}

/* Порядок наложения: фото снизу, внешняя рама сверху */
.layer-photo {
  z-index: 1;
}
.layer-inner-frame {
  z-index: 2;
}
.layer-outer-frame {
  z-index: 3;
}

/*тройной конструктор*/
/*конструктор*/
.constructor-canvas-wrapper {
  position: relative;
  width: 574px; /* Ваша актуальная ширина рамы */
  height: 759px; /* Ваша актуальная высота рамы */
  background: transparent;
}

.constructor-canvas-wrapper canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Слой с фото всегда должен быть на переднем плане, перекрывая швы */
#canvas-photo {
  z-index: 3;
}
#canvas-inner {
  z-index: 2;
}
#canvas-outer {
  z-index: 1;
}
/*конструктор*/

.description_bottom {
  margin-top: 90px;
  display: block;
}
.description_bottom__text {
  color: #000;
  font-size: 24px;
  padding-bottom: 10px;
}

/*двойная рама*/
.double-frame-constructor {
  display: flex;
  justify-content: space-between;
  margin-top: 17%;
  gap: 15px;
  float: left;
  max-width: 25%;
  margin-left: 5px;
}
/* Левый блок багетов */
.double-frame-left {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 700px;

  overflow-y: auto;
  scrollbar-color: #000;
  flex: 1;
  scrollbar-color: #000000 transparent;
  scrollbar-width: thin;
}

.frame-sample-card {
  cursor: pointer;
  text-align: center;
  padding-bottom: 10px;
}
.frame-sample-img-wrapper {
  border-bottom: 1px solid #888787; /* Тонкая черная линия под планкой */
  padding-bottom: 15px;
  margin-bottom: 5px;
}
.frame-sample-img {
  width: 100%;
  height: auto;
  height: 130px;
  display: block;
}
.frame-sample-title {
  font-size: 14px;
  margin: 2px 0;
  color: #000;
}
.frame-sample-price {
  font-weight: bold;
  font-size: 13px;
  color: #333;
}

/* Правый блок вертикальных цветов */
.double-frame-right {
  position: relative; /* Создает опорную точку для абсолютного позиционирования крестика */
  padding-bottom: 40px;
  width: 60px;
}
/*
.color-vertical-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 700px;
  max-width: 60px;
  overflow-y: auto;

  padding-right: 5px;
}*/
.color-vertical-list {
  display: block;
  overflow-x: hidden;
  max-width: 60px;

  /*max-height: 750px; /* Ограничивает высоту, чтобы кружки умещались ровно в два ряда */
  overflow-y: auto; /* Включает прокрутку, если цветов станет больше */
  scrollbar-color: #000000 transparent;
  scrollbar-width: thin;
}
.color-vertical-btn {
  margin-right: 5px;
  margin-bottom: 5px;
  width: 24px;
  height: 24px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #ccc;
  cursor: pointer;
  transition: transform 0.2s;
}
.color-vertical-btn:hover,
.color-vertical-btn.active {
  transform: scale(1.15);
  border-color: #000;
}

.card-slider__thumbs.is-invisible {
  display: none;
}

/*двойная рама*/

.toggle-container {
  display: inline-flex;
  background-color: #ff4405;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #dee2e6;
  margin-bottom: 15px;
}

.toggle-btn {
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #f4f4f4;
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.toggle-btn:hover {
  color: #c4c4c4;
}

.toggle-btn.active {
  background-color: #ffffff;
  color: #000000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn:focus-visible {
  box-shadow: 0 0 0 2px #e8351a;
}
.reviews-section {
  max-width: 600px;
  font-family: Arial, sans-serif;
}
.btn-toggle {
  background: #fff;
  border: 1px solid #a88734;
  border-radius: 3px;
  padding: 6px 12px;
  cursor: pointer;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset;
}
.comment-form {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-form textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.btn-submit {
  width: max-content;
  background: #f0c14b;
  border: 1px solid #a88734;
  border-radius: 3px;
  padding: 6px 20px;
  cursor: pointer;
}
.comments-list {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 310px; /* Примерная высота под 5 средних отзывов */
  overflow-y: auto; /* Вертикальная прокрутка при переполнении */
  padding-right: 5px;
}
.comment-card {
  border-bottom: 1px solid #e7e7e7;
  padding-bottom: 15px;
}
.comment-text {
  font-size: 14px;
  color: #111;
  margin-bottom: 8px;
}
.comment-actions {
  display: flex; /* Включает гибкую сетку Flexbox для выстраивания кнопок в ряд */
  align-items: center; /* Выравнивает все кнопки ровно по центру по вертикали */
  gap: 10px; /* Создает автоматический ровный отступ в 10 пикселей между всеми кнопками */
}
/* Кнопка "Полезно" в стиле Amazon */
.btn-like,
.btn-dislike,
.btn-delete {
  background: #f7f8f8;
  border: 1px solid #adb1b8;
  border-radius: 3px;
  padding: 4px 10px;
  font-size: 12px;
  color: #111;
  cursor: pointer;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
}

.btn-like.is-liked {
  background: #e7f4f5;
  border-color: #007185;
  color: #007185;
}
.btn-dislike.is-disliked {
  background: #fbeee0;
  border-color: #c45500;
  color: #c45500;
}
.container7 {
  max-width: 1220px;
  margin: 0px auto;
  padding: 0px 10px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;
  white-space: nowrap;
  clip-path: inset(100%);
  clip: rect(0 0 0 0);
  overflow: hidden;
}
.card-container {
  padding-top: 240px;
}
.card-top {
  display: flex;
}

.card-top__left {
  width: 57.5%;
}
.card-slider__main {
  margin-left: 15px;
  width: 474px;
}
.card-slider {
  display: flex;
}
.card-slider__thumb:not(:last-child) {
  margin-bottom: 10px;
}
.card-slider__thumbs {
  margin-top: 60px; /* Подберите нужный отступ в пикселях */
}
.card-slider__thumb {
  cursor: pointer;
}

.card-top__right {
  padding-top: 10px;
  padding-top: 60px;
  padding-left: 10.7%;
}
.card-info__prop {
  padding-left: 19px;
  margin-bottom: 16px;
}
.product-prop {
  display: inline-block;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  color: rgb(17, 17, 17);
  background-repeat: no-repeat;
  padding-left: 16px;
  background-position: left center;
}
.best {
  background-image: url(../images/best-seller.png);
}
.card-info__title {
  font-weight: 500;
  font-size: 24px;
  margin: 0px 0px 5px;
}

.card-info__rate {
  color: rgb(133, 133, 133);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
}
.card-info__price {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-end;
}
.info-price__current {
  margin-right: 20px;
  color: rgb(21, 21, 21);
  font-size: 24px;
  font-weight: 700;
}
.info-price__old {
  font-weight: 500;
  font-size: 16px;
  color: rgb(149, 149, 149);
  text-decoration: line-through;
}
.card-info__descr {
  color: rgb(247, 115, 0);
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  margin-bottom: 22px;
}
.card-info__first-select {
  margin-bottom: 28px;
}
.color-select__selected {
  color: rgb(133, 133, 133);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  margin: 0px 0px 17px;
}
.color-select__selected span {
  color: rgb(21, 21, 21);
}
.color-select__list {
  display: flex;
  align-items: center;
  padding-left: 4px;
  flex-wrap: wrap; /* Разрешает перенос элементов на новую строку */
  max-width: 600px; /* Ограничивает максимальную ширину списка (измените 200px на нужное вам значение) */
  /* Рекомендуется: добавляет аккуратные отступы между рядами и кнопками */
  row-gap: 8px;
}

.color-select__item:not(:last-child) {
  margin-right: 13px;
}

.btn-reset {
  cursor: pointer;
  position: relative;
  border-width: medium;
  border-style: none;
  border-color: currentcolor;
  border-image: initial;
  background: transparent;
  padding: 0px;
}
.color-select__btn {
  width: 24px;
  height: 24px;
  position: relative;
  border-radius: 100%;
  box-shadow: inset 0 0 0 3px transparent;
  transition:
    transform 0.2s ease,
    box-shadow none;
}
.color-select__btn::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border-radius: 100%;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(204, 204, 204);
  transition: border 0.2s ease;
}
/* ЭФФЕКТ ПРИ НАВЕДЕНИИ (:hover) */
.color-select__btn:hover,
.color-select__btn--active {
  /* Смещение всей кнопки с цветом на 3 пикселя вниз */
  transform: translateY(1px);
  /* Внутренняя обводка самого кружка цвета становится черной */
  box-shadow: inset 0 0 0 1px #000000;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.color-select__btn:hover::before,
.color-select__btn--active::before {
  /* Внешний круг обводки тоже становится черным */
  border-color: #000000;
}

/*
.btn-reset:hover {
  border-color: black;
}*/
.card-info__first-select {
  margin-bottom: 28px;
}
.card-info__second-select {
  margin-bottom: 22px;
}
.size-select__selected {
  color: rgb(133, 133, 133);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  margin: 0px 0px 13px;
}
.size-select__selected span {
  color: rgb(21, 21, 21);
}
.size-select__clear {
  display: inline-block;
  color: rgb(210, 66, 66);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}
.btn-reset {
  cursor: pointer;
  position: relative;
  border-width: medium;
  border-style: none;
  border-color: currentcolor;
  border-image: initial;
  background: transparent;
  padding: 0px;
}
.size-select__clear img {
  margin-right: 4px;
  fill: currentcolor;
}
.stepper {
  display: flex;
  height: 58px;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(204, 204, 204);
  border-image: initial;
}
.card-info__stepper {
  margin-bottom: 10px;
}
.stepper__btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 44px;
}
.stepper__btn svg {
  display: block;
  height: 12px;
  width: 12px;
  fill: rgb(133, 133, 133);
  transition: fill 0.3s;
}
.stepper__input {
  height: 100%;
  flex-grow: 1;
  text-align: center;
  color: rgb(21, 21, 21);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  border-width: medium;
  border-style: none;
  border-color: currentcolor;
  border-image: initial;
}
.card-info__btn {
  margin-bottom: 10px;
  width: 100%;
  height: 58px;
  background-color: rgb(242, 242, 242);
  color: rgb(21, 21, 21);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  transition:
    color 0.3s,
    background-color 0.3s;
}
.card-info__btn:hover {
  background-color: #000000;
  color: #ffffff;

  transition:
    color 0.3s,
    background-color 0.3s;
}
.card-info__btn--tocart {
  background-color: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
}

.card-info__btn--tocart:hover {
  background-color: #ffffff;
  color: #000000;

  transition:
    color 0.3s,
    background-color 0.3s;
}

.card-bottom {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  color: rgb(45, 45, 45);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}
.card-bottom span {
  color: rgb(133, 133, 133);
}
.card-bottom span {
  color: #858585;
}
.card-botttom__item .card-botttom__item-color {
  color: rgb(247, 147, 26);
}
.card-content__bottom {
  padding-top: 20px;
}
.card-description {
  display: flex;
  align-items: flex-start;
}
.card-description__left {
  width: 16%;
  padding-top: 30px;
  overflow-y: scroll;
  /* Настройки для Firefox */
  scrollbar-width: thin;
  scrollbar-color: #000000 transparent;
}
/* 1. Ширина всей полосы прокрутки */
.card-description__left::-webkit-scrollbar {
  width: 3px;
}
/* 2. Фон дорожки, по которой двигается ползунок (делаем прозрачным) */
.card-description__left::-webkit-scrollbar-track {
  background: transparent;
}
/* 3. Внешний вид ползунка (черный) */
.card-description__left::-webkit-scrollbar-thumb {
  background-color: #000000;
  border-radius: 0px;
}
/* 4. Скрытие стрелок вверх и вниз */
.card-description__left::-webkit-scrollbar-button {
  display: none;
  height: 0;
}
.card-description__navigation {
  max-height: 210px;
  width: 100%;
  padding: 23px 0px;
}
.card-description__item:not(:last-child) {
  margin-bottom: 80px;
}

.card-description__link {
  color: rgb(133, 133, 133);
  font-size: 15px;
  font-weight: 700;
  transition: color 0.3s;
}
.card-description__link--active {
  color: rgb(0, 0, 0);
  pointer-events: none;
}
.card-description__right {
  width: 84%;
  padding-left: 125px;
  padding-top: 21px;
  padding-right: 120px;
}
.warning {
  font-size: 14px;
  display: flex;
  float: right;
}
.warning-text {
  color: red;
  margin-left: 10px;
}
.card-description__content p {
  margin-top: 0px;
  margin-bottom: 30px;
  font-size: 13px;
  font-weight: 500;
  line-height: 26px;
}

.card-description__content {
  display: none;
  margin-top: 40px;
}
.card-description__content--active {
  display: block;
}
.evaluation {
  float: right;
  display: flex;
}
.evaluation_margin {
  margin-left: 3px;
}
.card-relatred {
  padding-top: 40px;
}

.card-relatred__title {
  padding-bottom: 40px;
  color: #151515;
  font-size: 24px;
  font-weight: 500;
  line-height: 26px;
}

.card-related__slider {
  overflow: hidden;
  position: relative;
  padding-bottom: 0px;
  padding-bottom: 100px;
  height: 460px;
}
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
.product-prop {
  display: inline-block;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  color: rgb(17, 17, 17);
  background-repeat: no-repeat;
  padding-left: 16px;
  background-position: left center;
}

.product__sale2 {
  position: absolute;
  left: 25px;
  top: 25px;
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
.best {
  background-image: url(../images/best-seller.png);
}
.sales {
  background-image: url(../images/sale-tag.png);
}
.product__title2 {
  color: #454545;
  font-family: sans-serif;
  font-size: 13px;
  margin: 0;
}
.product__title2 a {
  color: #000000;
}
.product__price2 {
  width: 55px;
  height: 13px;
  color: #151515;
  font-weight: 700;
  font-size: 13px;
}
.product__prop22 {
  display: inline-block;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  color: #111;
  background-position: left center;
  background-repeat: no-repeat;
  padding-left: 16px;
}
.swiper-pagination-bullets.swiper-pagination-horizontal {
  bottom: 50px;
}
.related-pag .swiper-pagination-bullet {
  margin: 0 8px !important;
  width: 6px;
  height: 6px;
  background-color: #ccc;
  opacity: 0.5;
  border-radius: 50%;
}
.related-pag .swiper-pagination-bullet-active {
  background-color: #000;
  position: relative;
  opacity: 1;
}
.swiper-pagination-clickable .swiper-pagination-bullet {
  cursor: pointer;
}
.related-pag .swiper-pagination-bullet-active::before {
  content: '';
  background-color: #ccc;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: -1;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
}
.related-pag {
  position: absolute;
  left: 0;
  bottom: 0;
  text-align: left;
}

.container {
  margin: 0; /* Убираем маргин */
  padding: 0; /* Убираем паддинг */
}

.frame {
  padding: 0; /* Убираем лишний паддинг */
  margin: 0; /* Убираем лишний маргин */
}

.element {
  margin-bottom: 0; /* Убираем отступы между элементами */
}
</style>
