<script setup>
import { Pagination } from 'swiper/modules' // 1. Импортируем модуль пагинации
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import '@/assets/main.css'
import 'swiper/css/pagination'
import Swiper from 'swiper'
import { bus } from '../views/bus.js'
import { storeToRefs } from 'pinia' // 1. Импортируем инструмент реактивности

import { supabase } from '../router/supabase.js'
import { interiorsList, loadInteriors } from '../assets/interiors.js' // укажите ваш точный путь к файлу

import { useRoute } from 'vue-router' // Импортируем для работы с URL
import { products, loadProducts } from '@/productsData.js'
import { useCartStore } from '../pinia.js'

const isPaspartuActive = ref(false)
// Цвет кнопки
const hasPaspartu = computed(() => isPaspartuActive.value)

const isMenuOpen = ref(false) // Видимость меню
const topPaspartuImg = new Image()
topPaspartuImg.crossOrigin = 'anonymous'
const selectedKant = ref(null)
const kantFrameImg = new Image()
kantFrameImg.crossOrigin = 'anonymous'

const bottomPaspartuImg = new Image()
bottomPaspartuImg.crossOrigin = 'anonymous'
const userLength = ref(759)

const userWidth = ref(574)

const userWidth1 = ref(60)
const userLength1 = ref(100)
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
// Создаем постоянные объекты картинок для кэша
const outerFrameImg = new Image()
outerFrameImg.crossOrigin = 'anonymous'

const innerFrameImg = new Image()
innerFrameImg.crossOrigin = 'anonymous'
function drawOuterFrame(canvasId, textureUrl, frameW, frameH, s, isStretch, colorName, scale) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  Object.assign(canvas, { width: frameW, height: frameH })

  const render = () => {
    if (!ctx) return
    ctx.clearRect(0, 0, frameW, frameH)
    const pattern = ctx.createPattern(outerFrameImg, 'repeat')
    if (!pattern) return
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
        ctx.drawImage(outerFrameImg, 0, 0, outerFrameImg.width, outerFrameImg.height, 0, 0, len, s)
      } else {
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, len, s)

        ctx.fillRect(0, 0, len + 1, s)
        if (typeof applyColorOverlay === 'function') {
          applyColorOverlay(ctx, colorName, 0, 0, len + 1, s)
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

  if (outerFrameImg.src !== textureUrl) {
    outerFrameImg.src = textureUrl
    outerFrameImg.onload = render
  } else {
    render() // Если картинка уже загружена, рисуем мгновенно
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

  const render = () => {
    ctx.clearRect(0, 0, frameW, frameH)
    const pattern = ctx.createPattern(innerFrameImg, 'repeat')
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
        ctx.drawImage(
          innerFrameImg,
          0,
          0,
          innerFrameImg.width,
          innerFrameImg.height,
          0,
          start,
          len,
          s,
        )
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

  if (innerFrameImg.src !== textureUrl) {
    innerFrameImg.src = textureUrl
    innerFrameImg.onload = render
  } else {
    render()
  }
}

function drawPaspartu(
  canvasId,
  frameW,
  frameH,
  sOuter,
  sInner,
  paspartuWidth,
  layersCount,
  topTextureUrl,
  bottomTextureUrl,
  hasKant,
  kantTextureUrl,
  bottomPaspartuWidth,
) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  Object.assign(canvas, { width: frameW, height: frameH })
  ctx.clearRect(0, 0, frameW, frameH)

  const pWidth = Number(paspartuWidth)
  if (pWidth <= 0) return

  const frameOffset = sOuter + sInner

  const renderLayers = () => {
    ctx.save()

    // 1. Отрисовка ВЕРХНЕГО слоя паспарту
    if (topTextureUrl && topPaspartuImg.complete) {
      const patternTop = ctx.createPattern(topPaspartuImg, 'repeat')
      patternTop.setTransform(new DOMMatrix().scale(0.15, 0.15))
      ctx.fillStyle = patternTop
      ctx.fillRect(frameOffset, frameOffset, frameW - frameOffset * 2, frameH - frameOffset * 2)
    }

    // 2. Отрисовка НИЖНЕГО слоя паспарту
    if (
      (layersCount === 2 || layersCount === '2 слоя') &&
      bottomTextureUrl &&
      bottomPaspartuImg.complete
    ) {
      const patternBottom = ctx.createPattern(bottomPaspartuImg, 'repeat')
      patternBottom.setTransform(new DOMMatrix().scale(0.15, 0.15))
      ctx.fillStyle = patternBottom
      const bpWidth = Number(bottomPaspartuWidth || paspartuWidth)
      const innerStep = frameOffset + bpWidth
      ctx.fillRect(innerStep, innerStep, frameW - innerStep * 2, frameH - innerStep * 2)
    }

    // 3. ОТРИСОВКА ДЕКОРАТИВНОГО КАНТА КАК ПОЛНОЦЕННОЙ РАМКИ С УГЛАМИ 45°
    if (hasKant && kantTextureUrl && kantFrameImg.complete) {
      try {
        const kantS = 15 // Фиксированная толщина канта
        const start = frameOffset + pWidth
        const total = start + kantS

        const patternKant = ctx.createPattern(kantFrameImg, 'repeat')
        patternKant.setTransform(new DOMMatrix().scale(kantS / 270, kantS / 270))

        const sides = [
          [start, start, frameW - start, start, frameW - total, total, total, total], // Верхняя
          [
            frameW - start,
            start,
            frameW - start,
            frameH - start,
            frameW - total,
            frameH - total,
            frameW - total,
            total,
          ], // Правая
          [
            frameW - start,
            frameH - start,
            start,
            frameH - start,
            total,
            frameH - total,
            frameW - total,
            frameH - total,
          ], // Нижняя
          [start, frameH - start, start, start, total, total, total, frameH - total], // Левая
        ]

        for (let index = 0; index < 4; index++) {
          const points = sides[index]
          ctx.save()
          ctx.beginPath()

          // Явно прописываем индексы, чтобы исключить баг компилятора текста
          ctx.moveTo(points[0], points[1])
          ctx.lineTo(points[2], points[3])
          ctx.lineTo(points[4], points[5])
          ctx.lineTo(points[6], points[7])

          ctx.closePath()
          ctx.clip()

          // Полностью развернутая логика смещения без использования опасного пустого массива
          let currentAngle = 0
          let transX = 0
          let transY = 0
          let len = frameW

          if (index === 0) {
            currentAngle = 0
            transX = 0
            transY = 0
            len = frameW
          } else if (index === 1) {
            currentAngle = Math.PI / 2
            transX = frameW
            transY = 0
            len = frameH
          } else if (index === 2) {
            currentAngle = Math.PI
            transX = frameW
            transY = frameH
            len = frameW
          } else if (index === 3) {
            currentAngle = -Math.PI / 2
            transX = 0
            transY = frameH
            len = frameH
          }

          ctx.translate(transX, transY)
          ctx.rotate(currentAngle)

          ctx.fillStyle = patternKant
          ctx.fillRect(0, start, len + 1, kantS + 1)
          ctx.restore()
        }
      } catch (e) {
        console.error('Ошибка сборки сторон канта:', e)
      }
    }

    // 4. Вырезаем сквозное окно для фотографии строго по внутреннему краю канта
    ctx.globalCompositeOperation = 'destination-out'
    const kantS = hasKant && kantTextureUrl ? 15 : 0
    const finalInnerOffset = frameOffset + pWidth + kantS

    ctx.fillRect(
      finalInnerOffset,
      finalInnerOffset,
      frameW - finalInnerOffset * 2,
      frameH - finalInnerOffset * 2,
    )

    ctx.restore()
  }

  let loadedCount = 0
  let targetsCount = 0

  if (topTextureUrl && topPaspartuImg.src !== topTextureUrl) {
    targetsCount++
    topPaspartuImg.src = topTextureUrl
    topPaspartuImg.onload = () => {
      loadedCount++
      if (loadedCount === targetsCount) renderLayers()
    }
  }
  if (
    (layersCount === 2 || layersCount === '2 слоя') &&
    bottomTextureUrl &&
    bottomPaspartuImg.src !== bottomTextureUrl
  ) {
    targetsCount++
    bottomPaspartuImg.src = bottomTextureUrl
    bottomPaspartuImg.onload = () => {
      loadedCount++
      if (loadedCount === targetsCount) renderLayers()
    }
  }
  if (hasKant && kantTextureUrl && kantFrameImg.src !== kantTextureUrl) {
    targetsCount++
    kantFrameImg.src = kantTextureUrl
    kantFrameImg.onload = () => {
      loadedCount++
      if (loadedCount === targetsCount) renderLayers()
    }
  }

  if (
    targetsCount === 0 ||
    (topPaspartuImg.complete &&
      (layersCount !== 2 || bottomPaspartuImg.complete) &&
      (!hasKant || kantFrameImg.complete))
  ) {
    renderLayers()
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

function drawGlass(
  canvasId,
  frameType,
  frameW,
  frameH,
  sOuter,
  sInner,
  glassType,
  selectedInnerFrame,
) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  Object.assign(canvas, { width: frameW, height: frameH })
  ctx.clearRect(0, 0, frameW, frameH)

  if (!glassType) return

  const totalOffset = frameType === 'double' && selectedInnerFrame ? sOuter + sInner : sOuter
  const glassX = totalOffset
  const glassY = totalOffset
  const glassWidth = frameW - totalOffset * 2
  const glassHeight = frameH - totalOffset * 2

  ctx.save()

  if (glassType === 'regular') {
    ctx.globalCompositeOperation = 'source-over'

    // 1. Мягкий угловой отсвет
    const glare1 = ctx.createLinearGradient(
      glassX,
      glassY,
      glassX + glassWidth,
      glassY + glassHeight,
    )
    glare1.addColorStop(0, 'rgba(255, 255, 255, 0.42)')
    glare1.addColorStop(0.3, 'rgba(255, 255, 255, 0.15)')
    glare1.addColorStop(0.6, 'rgba(255, 255, 255, 0.0)')

    ctx.fillStyle = glare1
    ctx.fillRect(glassX, glassY, glassWidth, glassHeight)

    // 2. Та самая мощная и широкая центральная полоса окна
    const glare2 = ctx.createLinearGradient(
      glassX,
      glassY,
      glassX + glassWidth,
      glassY + glassHeight,
    )
    glare2.addColorStop(0, 'rgba(255, 255, 255, 0.0)')
    glare2.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)')
    glare2.addColorStop(0.5, 'rgba(255, 255, 255, 0.38)') // Плотное отражение по центру
    glare2.addColorStop(0.65, 'rgba(255, 255, 255, 0.0)')
    glare2.addColorStop(1, 'rgba(255, 255, 255, 0.0)')

    ctx.fillStyle = glare2
    ctx.fillRect(glassX, glassY, glassWidth, glassHeight)
  } else if (glassType === 'antiglare') {
    ctx.globalCompositeOperation = 'source-over'

    const matte = ctx.createLinearGradient(glassX, glassY, glassX, glassY + glassHeight)
    matte.addColorStop(0, 'rgba(255, 255, 255, 0.28)')
    matte.addColorStop(1, 'rgba(230, 235, 245, 0.12)')

    ctx.fillStyle = matte
    ctx.fillRect(glassX, glassY, glassWidth, glassHeight)

    ctx.filter = 'blur(2px)'
  }

  ctx.restore()
}
const route = useRoute()
const productId = Number(route.params.id) // Получаем ID товара из URL-адреса страницы

// Автоматически находим текущий товар по его ID из URL
const currentProduct = computed(() => {
  if (!products.value.length) return {}
  return products.value.find((p) => String(p.id) === String(productId)) || {}
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
// Добавьте эту строку отдельно в <script setup>, чтобы её видел и HTML, и функция renderAll

function renderAll() {
  if (!currentProduct.value || !currentProduct.value.id) return

  const w1 = Number(userWidth1.value || 0)
  const l1 = Number(userLength1.value || 0)

  // Вычисляем размеры canvas на основе квадратного и горизонтального режимов
  const canvasH = isSquare.value
    ? currentInterior.value
      ? 759
      : 600 // Если без интерьера — строго 574 для ровного квадрата
    : currentInterior.value && !isSquare.value && w1 > l1 * 1.15
      ? 754
      : w1 > l1 * 1.15
        ? 400
        : 759

  const canvasW = isSquare.value ? 574 : w1 > l1 * 1.15 ? 677 : 574

  const outerW = 60
  const innerW = 60

  // 1. ОТРИСОВКА ПАСПАРТУ
  drawPaspartu(
    'paspartuCanvas',
    canvasW,
    canvasH,
    outerW,
    frameType.value === 'double' && selectedInnerFrame.value ? innerW : 0,
    topPaspartuWidth.value,
    paspartuLayers.value,
    isPaspartuActive.value ? selectedTopPaspartu.value?.image : null,
    isPaspartuActive.value ? selectedBottomPaspartu.value?.image : null,
    isPaspartuActive.value ? hasKant.value : false,
    isPaspartuActive.value ? selectedKant.value?.image : null,
    bottomPaspartuWidth.value,
  )

  // 2. ОТРИСОВКА ФОТОГРАФИИ
  drawPhotoLayer('photoCanvas', currentProduct.value.image_url, canvasW, canvasH)

  // 3. ОТРИСОВКА ВНЕШНЕЙ РАМЫ
  drawOuterFrame(
    'outerFrameCanvas',
    currentProduct.value.frame_url,
    canvasW,
    canvasH,
    outerW,
    currentProduct.value.is_stretch,
    selectedColor.value || '',
    270,
  )

  // 4. ОТРИСОВКА ВНУТРЕННЕЙ РАМЫ
  if (frameType.value === 'double' && selectedInnerFrame.value) {
    drawInnerFrame(
      'innerFrameCanvas',
      selectedInnerFrame.value.frame_url,
      canvasW,
      canvasH,
      outerW,
      innerW,
      false,
      innerFrameColor.value || '',
      270,
    )
  } else {
    const canvas = document.getElementById('innerFrameCanvas')
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasW, canvasH)
    }
  }

  // 5. ОТРИСОВКА СТЕКЛА
  drawGlass(
    'glassCanvas',
    frameType.value,
    canvasW,
    canvasH,
    outerW,
    innerW,
    selectedGlassType.value,
    selectedInnerFrame.value,
  )
}

// Отрисовка холста при первой загрузке страницы карточки
onMounted(async () => {
  await loadProducts() // 1. Ждем окончания загрузки данных из базы
  dbFrames.value = products.value
  renderAll()
  await loadInteriors()
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

function drawPhotoLayer(canvasId, imgUrl, frameW, frameH) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  Object.assign(canvas, { width: frameW, height: frameH })

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = imgUrl
  img.onload = () => {
    ctx.clearRect(0, 0, frameW, frameH)

    // ИСПРАВЛЕНО: Размер картины жестко привязан к холсту и больше НЕ зависит от рам!
    // Картинка занимает весь холст (с небольшим фиксированным отступом, например 60px под внешнюю раму)
    const baseOffset = 60
    const photoX = baseOffset
    const photoY = baseOffset
    const photoW = frameW - baseOffset * 2
    const photoH = frameH - baseOffset * 2

    // object-fit: cover для сохранения пропорций без сжатия
    const imgRatio = img.width / img.height
    const canvasRatio = photoW / photoH

    let srcX = 0,
      srcY = 0,
      srcW = img.width,
      srcH = img.height

    if (imgRatio > canvasRatio) {
      srcW = img.height * canvasRatio
      srcX = (img.width - srcW) / 2
    } else {
      srcH = img.width / canvasRatio
      srcY = (img.height - srcH) / 2
    }

    ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoW, photoH)
  }
}

const isPanelOpen = ref(false) // По умолчанию панель отображается

const selectedBottomPaspartuPrice = ref(null)

const totalPrice = computed(() => {
  // Толщина элементов, переведённая в сантиметры (10см, 10см, 5см)
  const outerW = Number(currentProduct.value?.frame_width || 5)
  const innerW = Number(selectedInnerFrame.value?.frame_width || 10)
  const slipW = Number(5)

  // Чистая базовая цена за 1 метр багета (без покраски на этом шаге)
  const basePrice = Number(currentProduct.value?.price || 0)

  // 1. Проверяем ввод размеров пользователем в см
  const hasValidSizes = userWidth1.value > 0 && userLength1.value > 0

  // Если поля пустые, возвращаем базовую цену за метр. Если выбран цвет — плюсуем покраску
  if (!hasValidSizes) {
    const staticPrice =
      basePrice + (selectedColor.value ? Number(currentProduct.value?.paint_price || 0) : 0)
    return Number(staticPrice.toFixed(2))
  }

  // Если размеры валидны, запускаем полный расчёт
  const w1 = Number(userWidth1.value)
  const l1 = Number(userLength1.value)

  // Расчёт первой (внешней) рамы: периметр с запасом на 8 углов в метрах х цена за метр
  const outerLineM = (w1 * 2 + l1 * 2 + outerW * 8) / 100
  let price = outerLineM * basePrice

  // ИСПРАВЛЕНО: Добавляем фиксированную цену покраски ОДИН раз к стоимости готовой рамы
  if (selectedColor.value) {
    price += Number(currentProduct.value?.paint_price || 0)
  }

  // Переменные для хранения остаточного свободного пространства в см
  let currentW = w1
  let currentL = l1

  // Переменные для фиксации размера проёма под стекло (после вычета только рам)
  let glassW = w1
  let glassL = l1

  // 2. РАСЧЁТ ДЛЯ ВТОРОЙ РАМЫ
  if (frameType.value === 'double') {
    // Вычитаем из свободного места толщину внешней рамы (в см)
    currentW = currentW - outerW * 2
    currentL = currentL - outerW * 2

    if (selectedInnerFrame.value?.price && currentW > 4 && currentL > 4) {
      // Погонная длина второй рамы в метрах (деление на 100)
      const innerLineM = (currentW * 2 + currentL * 2 + innerW * 8) / 100
      price += innerLineM * Number(selectedInnerFrame.value.price)
    }
    if (innerFrameColor.value) price += 50 // Покраска канта

    // Вычитаем толщину второй рамы для дальнейших расчётов
    currentW = currentW - innerW * 2
    currentL = currentL - innerW * 2

    // Обновляем габариты проёма под стекло — оно лежит внутри обеих рам
    glassW = currentW
    glassL = currentL
  } else {
    // Если рама одинарная, стекло лежит сразу внутри первой рамы
    glassW = currentW - outerW * 2
    glassL = currentL - outerW * 2
  }

  // 3. РАСЧЁТ ПАСПАРТУ И СЛИПА
  if (isPaspartuActive.value && currentW > 10 && currentL > 10) {
    const topOffsetCm = Number(topPaspartuWidth.value || 0) / 10

    // Верхний слой паспарту
    if (selectedTopPaspartu.value?.price) {
      const areaTop = ((currentW + topOffsetCm * 2) / 100) * ((currentL + topOffsetCm * 2) / 100)
      price += areaTop * Number(selectedTopPaspartu.value.price)
    }

    // Нижний слой паспарту
    if (paspartuLayers.value === 2 && selectedBottomPaspartu.value?.price) {
      const bottomOffsetCm = Number(bottomPaspartuWidth.value || 0) / 10
      const areaBottom =
        ((currentW + bottomOffsetCm * 2) / 100) * ((currentL + bottomOffsetCm * 2) / 100)
      price += areaBottom * Number(selectedBottomPaspartu.value.price)
    }

    // Деревянный кант-слип
    if (hasKant.value && selectedKant.value?.price) {
      const windowW = currentW - topOffsetCm * 2
      const windowL = currentL - topOffsetCm * 2

      if (windowW > 0 && windowL > 0) {
        const slipLineM = (windowW * 2 + windowL * 2 + slipW * 8) / 100
        price += slipLineM * Number(selectedKant.value.price)
      }
    }
  }

  // 4. РАСЧЁТ СТЕКЛА
  if (selectedGlassType.value && glassW > 5 && glassL > 5) {
    const areaGlass = (glassW / 100) * (glassL / 100)
    const glassPricePerMeter =
      selectedGlassType.value === 'regular' ? priceRegular.value : priceAntiglare.value
    price += areaGlass * glassPricePerMeter
  }

  return Number((price * quantity.value).toFixed(2))
})
// 1. Состояние тумблеров и переключателей
/*const hasPaspartu = ref(false)*/ // Тумблер [ Добавить паспарту ]
const paspartuLayers = ref(1) // Количество слоев: 1 или 2
const hasKant = ref(false) // Тумблер [ Добавить кант ]

// 2. Размеры паспарту (в миллиметрах)
const topPaspartuWidth = ref(0) // Изначально ширина равна 0, поэтому паспарту скрыто
// Ползунок №1: Общая (верхняя) ширина
const bottomPaspartuWidth = ref(5) // Ползунок №2: Ширина нижнего слоя
const KANT_FIXED_WIDTH = 3 // Фиксированная ширина канта (слипа)

// 3. Выбранные цвета
const topColor = ref('') // Цвет верхнего (единственного) паспарту
const bottomColor = ref('') // Цвет нижнего паспарту
const kantColor = ref('') // Цвет фиксированного канта

// 4. Ограничитель динамического максимума для нижнего ползунка
const maxBottomWidth = computed(() => {
  return topPaspartuWidth.value > 1 ? topPaspartuWidth.value - 1 : 1
})

// Переменные для хранения выбранного картона
const selectedTopPaspartu = ref(null)
const selectedBottomPaspartu = ref(null)

// Функция для выбора двойной рамы

// Функция для активации паспарту

// Функция для клика по кнопке "2 слоя"
const setTwoLayers = () => {
  paspartuLayers.value = 2
  hasKant.value = false // Автоматически выключаем кант
}

// Функция для клика по кнопке "Добавить кант"
const toggleKant = () => {
  hasKant.value = !hasKant.value
  if (hasKant.value) {
    paspartuLayers.value = 1 // Автоматически сбрасываем на 1 слой
  }
}

const paspartuList = ref([
  { id: 1, name: 'Белый классик', image: '/images/pasportu.jpg', price: 50 },
  {
    id: 2,
    name: 'Черный бархат',
    image: '/images/67810224_vintage_style_recycled_paper_texture_background_0401.jpg',
    price: 50,
  },
  { id: 3, name: 'Кремовый шелк', image: '/images/paspartu/cream.jpg', price: 50 },
  { id: 4, name: 'Серый графит', image: '/images/paspartu/grey.jpg', price: 50 },
  { id: 5, name: 'Глубокий синий', image: '/images/paspartu/blue.jpg', price: 50 },
  { id: 6, name: 'Черный бархат', image: '/images/paspartu/black.jpg', price: 50 },
  { id: 7, name: 'Кремовый шелк', image: '/images/paspartu/cream.jpg', price: 50 },
  { id: 8, name: 'Серый графит', image: '/images/paspartu/grey.jpg', price: 50 },
  { id: 9, name: 'Глубокий синий', image: '/images/paspartu/blue.jpg', price: 50 },
])

const kantList = ref([
  { id: 1, name: 'Белый классик', image: '/images/baget3.jpg', price: 70 },
  { id: 2, name: 'Серебро матовое', image: '/images/kant-silver.jpg', price: 50 },
  { id: 3, name: 'Черный глянец', image: '/images/kant-black.jpg', price: 50 },
  { id: 4, name: 'Белый лак', image: '/images/kant-white.jpg', price: 50 },
  { id: 5, name: 'Бронза антик', image: '/images/kant-bronze.jpg', price: 50 },
])
const paspartuWidth = ref(40)
// Переменные для хранения выбранных объектов
const selectedPaspartu = ref(null)
const paspartuPrice = ref(0)

// Функция клика по кнопке .paspartu-slide-btn
const togglePaspartu = (item) => {
  if (selectedPaspartu.value?.id === item.id) {
    // Второе нажатие: сбрасываем выбор и обнуляем цену
    selectedPaspartu.value = null
    paspartuPrice.value = 0
  } else {
    // Первое нажатие: сохраняем выбор и записываем цену
    selectedPaspartu.value = item
    paspartuPrice.value = item.price
  }
}
// Автоматический перезапуск при изменении ползунка ширины паспарту
// Перерисовывать холст при движении любого ползунка ширины
// 1. ОДИН watch для загрузки товара (удалите старый дубликат!)
watch(currentProduct, (newProduct) => {
  if (newProduct?.id) {
    setTimeout(renderAll, 50)
  }
})

// 2. ЕДИНЫЙ watch для всех ползунков, слоев и кликов паспарту
watch(
  [paspartuWidth, topPaspartuWidth, bottomPaspartuWidth, paspartuLayers, hasPaspartu],
  ([newWidth, newTopWidth]) => {
    // Синхронизируем нижнюю ширину, если она пытается стать больше верхней
    if (bottomPaspartuWidth.value >= newTopWidth) {
      bottomPaspartuWidth.value = newTopWidth > 1 ? newTopWidth - 1 : 1
    }

    // Моментально перерисовываем холст при любом сдвиге
    renderAll()
  },
)
// 1. Следим за переключением количества слоев паспарту
watch(paspartuLayers, (newLayers) => {
  if (newLayers === 1 || newLayers === '1 слой') {
    selectedBottomPaspartu.value = null // Снимаем активность с нижнего паспарту
    selectedKant.value = null // Снимаем активность с карточки канта
    hasKant.value = false // Выключаем тумблер канта
    renderAll()
  }
})

// 2. Следим за тумблером канта (при переходе с канта на 2 слой и наоборот)
watch(hasKant, (kantActive) => {
  if (kantActive) {
    // Если включили кант — снимаем активность с карточки нижнего паспарту
    selectedBottomPaspartu.value = null
  } else {
    // Если выключили кант (перешли на 2 слой) — снимаем активность с карточки канта
    selectedKant.value = null
  }
  renderAll()
})
const pasportuPrice = () => {
  // Складываем базовую цену рамы, цену паспарту и цену канта
  const total = Number(baseFramePrice?.value || 0) + paspartuPrice.value + kantPrice.value

  // Записываем финальный результат в реактивную переменную для экрана
  finalPrice.value = total
}

// Флаг для скрытия контента по нажатию на SVG-крестик
const isKantContentHidden = ref(false)

// Наблюдатель за кнопкой "Добавить паспарту" для полной очистки при удалении
watch(isPaspartuActive, (isActive) => {
  if (!isActive) {
    selectedTopPaspartu.value = null
    selectedBottomPaspartu.value = null
    selectedKant.value = null
    hasKant.value = false
    paspartuLayers.value = 1
    isMenuOpen.value = false

    // ПРЯМОЙ ВЫЗОВ ДЛЯ МГНОВЕННОГО СТИРАНИЯ С ХОЛСТА
    renderAll()
  } else {
    isMenuOpen.value = true
  }
})
// Размеры стекла
const width = ref(0)
const length = ref(0)

// Состояния активности кнопок
const isMainActive = ref(false) // Показ подменю
const selectedGlassType = ref('') // Выбранный тип ('regular' или 'antiglare')

// Две переменные цены за метр
const priceRegular = ref(120)
const priceAntiglare = ref(170)
// Вспомогательная функция, которая собирает все реактивные переменные и вызывает отрисовку

// Переключатель главной кнопки «Добавить стекло»
const toggleMainButton = () => {
  // Если стекло уже выбрано, второй клик полностью его удаляет и гасит кнопку
  if (selectedGlassType.value) {
    selectedGlassType.value = ''
    isMainActive.value = false
    renderAll()
  } else {
    // Если стекло не выбрано, просто переключаем показ меню (открыть/закрыть)
    isMainActive.value = !isMainActive.value
  }
}

// Выбор типа стекла
const selectGlass = (type) => {
  if (selectedGlassType.value === type) {
    selectedGlassType.value = '' // Второе нажатие сбрасывает стекло
  } else {
    selectedGlassType.value = type // Первое нажатие активирует его
  }
  renderAll() // Мгновенно обновляет калькулятор и Canvas
}

// Общая функция/вычисляемое свойство для расчета
const glassPrice = computed(() => {
  // Проверяем ввод размеров
  if (width.value <= 0 || length.value <= 0) return 0

  let currentPricePerMeter = 0

  // Проверяем условие, какое стекло выбрано
  if (selectedGlassType.value === 'regular') {
    currentPricePerMeter = priceRegular.value
  } else if (selectedGlassType.value === 'antiglare') {
    currentPricePerMeter = priceAntiglare.value
  } else {
    return 0 // Если стекло еще не выбрано, цена 0
  }

  // Формула: Площадь (Ширина * Длина) * Цена за метр
  const glassCost = width.value * length.value * currentPricePerMeter

  // Округляем до 2 знаков после запятой
  return Number(glassCost.toFixed(2))
})
const togglePanel = (panelName) => {
  // Перед переключением проверяем: если закрываем двойную раму без выбора багета — сбрасываем на одинарную
  if (panelName !== 'double' && !selectedInnerFrame.value) {
    frameType.value = 'single'
  }
  // Если закрываем паспарту, а цвета не выбраны — полностью деактивируем его
  if (
    panelName !== 'paspartu' &&
    !selectedTopPaspartu.value &&
    !selectedBottomPaspartu.value &&
    !selectedKant.value
  ) {
    isPaspartuActive.value = false
  }

  // 1. Управление ОДИНАРНОЙ и ДВОЙНОЙ рамой
  if (panelName === 'single' || panelName === 'double') {
    frameType.value = panelName

    if (panelName === 'double') {
      isPanelOpen.value = true
      isMenuOpen.value = false
      isMainActive.value = false
    } else {
      isPanelOpen.value = false
      selectedInnerFrame.value = null
      innerFrameColor.value = ''
    }
  }

  // 2. Управление ПАСПАРТУ
  else if (panelName === 'paspartu') {
    isPaspartuActive.value = !isPaspartuActive.value

    if (isPaspartuActive.value) {
      isPanelOpen.value = false
      isMainActive.value = false
    } else {
      selectedTopPaspartu.value = null
      selectedBottomPaspartu.value = null
      hasKant.value = false
      selectedKant.value = null
    }
  }

  // 3. Управление СТЕКЛОМ
  else if (panelName === 'glass') {
    if (selectedGlassType.value) {
      selectedGlassType.value = ''
      isMainActive.value = false
    } else {
      isMainActive.value = !isMainActive.value
      if (isMainActive.value) {
        isPanelOpen.value = false
        isMenuOpen.value = false
      }
    }
  }
  renderAll()
}
const closeAllPanels = () => {
  isPanelOpen.value = false
  isMenuOpen.value = false
  isMainActive.value = false
  isPaspartuActive.value = false // ДОБАВИТЬ ЭТУ СТРОКУ
  // Если вторая рама не выбрана, сбрасываем кнопку на одинарную
  if (!selectedInnerFrame.value) {
    frameType.value = 'single'
  }
}
const sizeText = computed(() => {
  // Если оба поля полностью стерты (равны 0 или пустые), просим ввести размеры
  if (!userWidth1.value && !userLength1.value) {
    return 'Выберите размер'
  }

  // При первой загрузке или вводе возвращаем текущие значения переменных через «×»
  return `${userWidth1.value} × ${userLength1.value} см`
})
// 1. Отдельная чистая функция для полного сброса всех опций калькулятора
const resetAllOptions = () => {
  frameType.value = 'single' // Сброс на одинарную раму
  selectedInnerFrame.value = null // Очистка выбранной второй рамы
  innerFrameColor.value = null // Очистка выбранного цвета второй рамы

  isPaspartuActive.value = false // Отключение паспарту
  selectedTopPaspartu.value = null // Очистка верхнего паспарту
  selectedBottomPaspartu.value = null // Очистка нижнего паспарту
  hasKant.value = false // Отключение канта/слипа

  selectedGlassType.value = null // Отключение стекла

  // Принудительно перерисовываем Canvas, чтобы стереть все лишние слои с экрана
  renderAll()
}
const isSquare = ref(false)

// 2. Функция валидации при потере фокуса или изменении (событие @change)
const validateSize = (fieldName) => {
  const variables = { userWidth1, userLength1 }
  const val = variables[fieldName].value

  if (val > 200 || val < 5 || val === 0 || val === null || val === '') {
    variables[fieldName].value = 0
  }

  // Если оба поля стали равны 0 — сбрасываем опции и чистим холст
  if (userWidth1.value === 0 && userLength1.value === 0) {
    selectedColor.value = '' // Сброс цвета внешней рамы

    resetAllOptions()
  }
  // Обновляем состояние квадрата строго после потери фокуса / Enter
  const w = Number(userWidth1.value || 0)
  const l = Number(userLength1.value || 0)
  isSquare.value = w > 0 && w === l
  checkSizeLimits()
}

// 3. Функция для кнопки «Очистить»
const clearSizes = () => {
  userWidth1.value = 0
  userLength1.value = 0
  selectedColor.value = '' // Сброс цвета внешней рамы при клике на «Очистить»

  // Сразу сбрасываем все опции и очищаем Canvas без лишних проверок
  resetAllOptions()
}

// Блокировка кнопки двойной рамы: если размеры меньше (innerW * 2 + 5 см на картину)
// 1. Фильтруем список вторых рам, пропуская только тонкие варианты
// 1. Фильтруем список вторых рам, используя ваш реальный массив dbFrames
const filteredInnerFrames = computed(() => {
  const w = Number(userWidth1.value || 0)
  const l = Number(userLength1.value || 0)
  const outerW = Number(currentProduct.value?.frame_width || 5)

  // Если размеры еще не ввели, показываем весь ваш список рам
  if (w === 0 || l === 0) return dbFrames.value || []

  // Вычисляем максимальную толщину багета
  const maxInnerW = (Math.min(w, l) - outerW * 2 - 10) / 2

  // Возвращаем только подходящие рамы из dbFrames
  return (dbFrames.value || []).filter((frame) => {
    return Number(frame.frame_width || 5) < maxInnerW
  })
})

// 2. Блокируем кнопку, если подходящих багетов в отфильтрованном списке нет
const isDoubleFrameButtonDisabled = computed(() => {
  const w = Number(userWidth1.value || 0)
  const l = Number(userLength1.value || 0)

  return w > 0 && l > 0 && filteredInnerFrames.value.length === 0
})

// Блокировка кнопки паспарту: если ширина > 60 см или высота > 100 см
const isPaspartuDisabled = computed(() => {
  const w = Number(userWidth1.value || 0)
  const l = Number(userLength1.value || 0)
  return w > 60 || l > 100
})

// Автоматический сброс и очистка памяти при нарушении лимитов размеров
const checkSizeLimits = () => {
  if (frameType.value === 'double' && isDoubleFrameButtonDisabled.value) {
    frameType.value = 'single'
    selectedInnerFrame.value = null
    innerFrameColor.value = null
  }

  // 2. Очистка паспарту и канта, если размеры превысили 60х100 см
  if (isPaspartuActive.value && isPaspartuDisabled.value) {
    isPaspartuActive.value = false
    selectedTopPaspartu.value = null
    selectedBottomPaspartu.value = null
    hasKant.value = false
  }

  // Мгновенно обновляем холст Canvas без зависаний
  renderAll()
}

// Ссылки на HTML-элементы и данные
const mainImageRef = ref(null)
const currentInterior = ref(null) // Сюда прилетит текущая комната из Supabase

// ДИНАМИЧЕСКИЕ СТИЛИ ДЛЯ ТОЧНОГО СДВИГА И МАСШТАБИРОВАНИЯ РАМЫ НА СТЕНЕ
/*
const canvasContainerStyle = computed(() => {
  const originalWidth = 0.2
  // Если датчик еще не выдал ширину экрана, ставим масштаб 1, иначе делим экран на оригинал
  const scaleValue = 0.9

  return {
    position: 'absolute',
    top: `${originalFrameCoords.value.top * scaleValue}px`,
    left: `${originalFrameCoords.value.left * scaleValue}px`,
    width: '574px',
    height: isSquare.value ? '600px' : '759px',
    transform: `scale(${scaleValue})`,
    transformOrigin: 'top left',
    zIndex: 12, // Подняли чуть выше, чтобы точно перекрыть всё
  }
})*/

const canvasContainerStyle = computed(() => {
  // 1. Загружаем оригинальные координаты проёма из базы данных
  const originalWidth = currentInterior.value?.width || 1107
  const frameTop = currentInterior.value?.frame_top || 0
  const frameLeft = currentInterior.value?.frame_left || 0

  // 2. Рассчитываем динамическую ширину контейнера интерьера на экране (для адаптива)
  const isMobile = window.innerWidth <= 768
  const currentContainerWidth = isMobile ? window.innerWidth * 0.95 : 575 // На мобильных — 95% экрана, на ПК — 575px

  // 3. Коэффициент адаптивности самого интерьера (текущий экран / оригинал)
  const screenK = currentContainerWidth / originalWidth

  // 4. Коэффициент уменьшения жестких пикселей для мобильных (пропорция от базовых 575px)
  const mobileScale = currentContainerWidth / 575

  // 5. Создаем переменные для жестких базовых размеров рамы
  let finalScreenWidth = 0
  let finalScreenHeight = 0

  const w = Number(userWidth1.value || 0)
  const l = Number(userLength1.value || 0)

  // 6. Задаем точные пиксели для ПК, которые автоматически умножаются на mobileScale для мобильных
  if (w > 0 && l > 0 && currentInterior.value) {
    const id = currentInterior.value.id

    if (w === l) {
      if (id === 1) {
        finalScreenWidth = 200
        finalScreenHeight = 200
      } else if (id === 2) {
        finalScreenWidth = 200
        finalScreenHeight = 200
      } else if (id === 3) {
        finalScreenWidth = 220
        finalScreenHeight = 220
      } else if (id === 4) {
        finalScreenWidth = 400
        finalScreenHeight = 400
      } else if (id === 5) {
        finalScreenWidth = 248
        finalScreenHeight = 220
      }
    } else if (w > l) {
      if (id === 1) {
        finalScreenWidth = 325
        finalScreenHeight = 180
      } else if (id === 2) {
        finalScreenWidth = 500
        finalScreenHeight = 260
      } else if (id === 3) {
        finalScreenWidth = 500
        finalScreenHeight = 230
      } else if (id === 4) {
        finalScreenWidth = 525
        finalScreenHeight = 230
      } else if (id === 5) {
        finalScreenWidth = 250
        finalScreenHeight = 100
      }
    } else if (w < l) {
      if (id === 1) {
        finalScreenWidth = 230
        finalScreenHeight = 300
      } else if (id === 2) {
        finalScreenWidth = 220
        finalScreenHeight = 290
      } else if (id === 3) {
        finalScreenWidth = 200
        finalScreenHeight = 230
      } else if (id === 4) {
        finalScreenWidth = 300
        finalScreenHeight = 400
      } else if (id === 5) {
        finalScreenWidth = 240
        finalScreenHeight = 330
      }
    } else {
      if (id === 1) {
        finalScreenWidth = 30
        finalScreenHeight = 45
      } else if (id === 2) {
        finalScreenWidth = 350
        finalScreenHeight = 500
      } else {
        finalScreenWidth = 320
        finalScreenHeight = 480
      }
    }
  }

  // 7. Применяем масштабирование: координаты зависят от screenK, а фиксированные размеры — от mobileScale
  const finalScreenLeft = frameLeft * screenK
  const finalScreenTop = frameTop * screenK
  const adaptiveWidth = finalScreenWidth * mobileScale
  const adaptiveHeight = finalScreenHeight * mobileScale

  return {
    position: 'absolute',
    top: `${finalScreenTop}px`,
    left: `${finalScreenLeft}px`,
    width: `${adaptiveWidth}px`,
    height: `${adaptiveHeight}px`,
    transformOrigin: 'top left', // Возвращено по вашему запросу
    transition: 'width 0.3s ease, height 0.3s ease, top 0.3s ease, left 0.3s ease',
    zIndex: 12,
  }
})

watch(
  [userWidth1, userLength1, currentInterior],
  () => {
    renderAll()
  },
  { deep: true, immediate: true },
)
/*
const canvasContainerStyle = computed(() => {
  // Вычисляем процентное положение проёма относительно оригинальной картинки из базы
  const originalWidth = currentInterior.value?.width || 1107
  const originalHeight = currentInterior.value?.height || 1620

  const leftPercent = (originalFrameCoords.value.left / originalWidth) * 100
  const topPercent = (originalFrameCoords.value.top / originalHeight) * 100

  // Вычисляем, какую долю в процентах занимает рама от всей стены
  const widthPercent = (574 / originalWidth) * 100

  return {
    position: 'absolute',
    top: `${topPercent}%`,
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    height: 'auto', // Высота подстроится автоматически со всеми холстами
    transform: 'none', // Больше никакой scale не нужен!
    zIndex: 12,
  }
})*/

// Функция для безопасной записи выбранного интерьера
const selectInterior = async (interior) => {
  currentInterior.value = interior
  await nextTick()
  renderAll()
}
const isHorizontalMode = computed(() => {
  // Добавляем .value к каждой реактивной переменной
  return !isSquare.value && Number(userWidth1.value || 0) > Number(userLength1.value || 0) * 1.15
})
const isHorizontalAndNoInterior = computed(() => {
  const w1 = Number(userWidth1.value || 0)
  const l1 = Number(userLength1.value || 0)
  return !isSquare.value && w1 > l1 * 1.15 && !currentInterior.value
})
/*
const quantity = ref(1)

function increaseQty() {
  if (quantity.value < 500) quantity.value++
}

function decreaseQty() {
  if (quantity.value > 1) quantity.value--
}
*/
const orderReceipt = computed(() => {
  const w1 = Number(userWidth1.value || 0)
  const l1 = Number(userLength1.value || 0)

  if (w1 <= 0 || l1 <= 0) return 'Укажите размеры для расчета'

  // Ширина элементов в см
  const outerW = Number(currentProduct.value?.frame_width || 5)
  const innerW = Number(selectedInnerFrame.value?.frame_width || 10)
  const slipW = Number(5)

  // Исходная цена внешней рамы за метр
  let basePrice = Number(currentProduct.value?.price || 0)
  if (selectedColor.value) basePrice += Number(currentProduct.value?.paint_price || 0)

  let textLines = []

  // 1. РАСЧЕТ ОСНОВНОЙ ВНЕШНЕЙ РАМЫ
  const outerLineM = (w1 * 2 + l1 * 2 + outerW * 8) / 100
  let outerPrice = outerLineM * basePrice
  if (selectedColor.value) outerPrice += Number(currentProduct.value?.paint_price || 0)

  const outerName = currentProduct.value?.name || 'Основная'
  textLines.push(
    `🎨 Рама "${outerName}": ${w1}x${l1} см (Багет: ${outerW} см) — ${(outerPrice * quantity.value).toFixed(2)} BYN`,
  )

  // Копии переменных для пошагового расчета внутренних проемов
  let currentW = w1
  let currentL = l1
  let glassW = w1
  let glassL = l1

  // 2. РАСЧЕТ ВТОРОЙ (ВНУТРЕННЕЙ) РАМЫ
  if (frameType.value === 'double') {
    currentW = currentW - outerW * 2
    currentL = currentL - outerW * 2

    if (selectedInnerFrame.value?.price && currentW > 4 && currentL > 4) {
      const innerLineM = (currentW * 2 + currentL * 2 + innerW * 8) / 100
      let innerPrice = innerLineM * Number(selectedInnerFrame.value.price)
      if (innerFrameColor.value) innerPrice += 50

      const innerName = selectedInnerFrame.value?.name || 'Внутренняя'
      textLines.push(
        `🖼️ Вторая рама "${innerName}": внешний размер ${currentW}x${currentL} см (Багет: ${innerW} см) — ${(innerPrice * quantity.value).toFixed(2)} BYN`,
      )
    }

    currentW = currentW - innerW * 2
    currentL = currentL - innerW * 2
    glassW = currentW
    glassL = currentL
  } else {
    glassW = currentW - outerW * 2
    glassL = currentL - outerW * 2
  }

  // 3. РАСЧЕТ ПАСПАРТУ И СЛИПА
  if (isPaspartuActive.value && currentW > 10 && currentL > 10) {
    const topOffsetCm = Number(topPaspartuWidth.value || 0) / 10
    let paspartuPrice = 0

    if (selectedTopPaspartu.value?.price) {
      const areaTop = ((currentW + topOffsetCm * 2) / 100) * ((currentL + topOffsetCm * 2) / 100)
      paspartuPrice += areaTop * Number(selectedTopPaspartu.value.price)
    }

    if (paspartuLayers.value === 2 && selectedBottomPaspartu.value?.price) {
      const bottomOffsetCm = Number(bottomPaspartuWidth.value || 0) / 10
      const areaBottom =
        ((currentW + bottomOffsetCm * 2) / 100) * ((currentL + bottomOffsetCm * 2) / 100)
      paspartuPrice += areaBottom * Number(selectedBottomPaspartu.value.price)
    }

    const windowW = currentW - topOffsetCm * 2
    const windowL = currentL - topOffsetCm * 2

    if (paspartuPrice > 0) {
      const topName = selectedTopPaspartu.value?.name || 'Верхнее'
      const bottomName =
        paspartuLayers.value === 2 ? ` + "${selectedBottomPaspartu.value?.name || 'Нижнее'}"` : ''
      textLines.push(
        `📐 Паспарту "${topName}"${bottomName}: внешний размер ${currentW}x${currentL} см, вырез ${windowW}x${windowL} см — ${(paspartuPrice * quantity.value).toFixed(2)} BYN`,
      )
    }

    // Деревянный кант-слип идет строго по краю окна паспарту
    if (hasKant.value && selectedKant.value?.price && windowW > 0 && windowL > 0) {
      const slipLineM = (windowW * 2 + windowL * 2 + slipW * 8) / 100
      const kantPrice = slipLineM * Number(selectedKant.value.price)
      const kantName = selectedKant.value?.name || 'Классик'
      textLines.push(
        `✨ Кант-слип "${kantName}": вырез ${windowW}x${windowL} см (Расход: ${slipLineM.toFixed(2)} м) — ${(kantPrice * quantity.value).toFixed(2)} BYN`,
      )
    }
  }

  // 4. РАСЧЕТ СТЕКЛА
  if (selectedGlassType.value && glassW > 5 && glassL > 5) {
    const areaGlass = (glassW / 100) * (glassL / 100)
    const glassPricePerMeter =
      selectedGlassType.value === 'regular' ? priceRegular.value : priceAntiglare.value
    const glassPrice = areaGlass * glassPricePerMeter
    const glassName = selectedGlassType.value === 'regular' ? 'Обычное' : 'Антиблик'

    textLines.push(
      `🔮 Стекло (${glassName}): точный размер ${glassW}x${glassL} см — ${(glassPrice * quantity.value).toFixed(2)} BYN`,
    )
  }

  const qtyText = quantity.value > 1 ? `\n📦 Количество: ${quantity.value} шт.` : ''
  return textLines.join('\n') + qtyText
})

const cartItems = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
/*
const addToCart = async () => {
  if (!currentProduct.value) return

  // 1. Создаем один скрытый холст в памяти для склеивания слоев
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = 600
  finalCanvas.height = 800
  const ctx = finalCanvas.getContext('2d')

  // 2. Находим ваши 5 реальных экранных canvas по их ID
  const c1 = document.getElementById('photoCanvas')
  const c2 = document.getElementById('paspartuCanvas')
  const c3 = document.getElementById('innerFrameCanvas')
  const c4 = document.getElementById('outerFrameCanvas')
  const c5 = document.getElementById('glassCanvas')

  // 3. Поочередно копируем графику с экрана на финальный холст
  // Копируем слои с правильным прямоугольным масштабированием (0, 0, ширина, высота)
  if (c1) ctx.drawImage(c1, 0, 0, finalCanvas.width, finalCanvas.height)
  if (c2) ctx.drawImage(c2, 0, 0, finalCanvas.width, finalCanvas.height)
  if (c3) ctx.drawImage(c3, 0, 0, finalCanvas.width, finalCanvas.height)
  if (c4) ctx.drawImage(c4, 0, 0, finalCanvas.width, finalCanvas.height)
  if (c5) ctx.drawImage(c5, 0, 0, finalCanvas.width, finalCanvas.height)

  // 4. Делаем моментальный снимок получившейся сборки
  const previewImage = finalCanvas.toDataURL('image/jpeg', 0.8)

  const details = `${textureUrl.value || ''}_${colorName.value || ''}_${innerTextureUrl.value || ''}_${innerColorName.value || ''}_${glassType.value || ''}_${topTextureUrl.value || ''}_${bottomTextureUrl.value || ''}_${kantTextureUrl.value || ''}`

  const cartProduct = {
    product_id: currentProduct.value.id,
    title: currentProduct.value.title || 'Рама в сборе',
    price: Number(totalPrice.value || 0),
    old_price: Number(currentProduct.value.old_price || 0),
    quantity: Number(quantity.value || 1),
    size: `${userWidth1.value || 0}x${userLength1.value || 0}см`,
    image_preview: previewImage,
    details: details, // Передаем уже созданную строку внутрь объекта
  }

  // 6. Сохраняем локально в хранилище браузера

  cartItems.value.push(cartProduct)
  localStorage.setItem('cart', JSON.stringify(cartItems.value))
  // 7. Отправляем данные в Supabase
  await supabase.from('cart_items').insert([
    {
      product_id: cartProduct.product_id,
      title: cartProduct.title,
      price: cartProduct.price,
      quantity: cartProduct.quantity,
      size: cartProduct.size,
      image_preview: cartProduct.image_preview,
    },
  ])

  // 8. Оповещаем хедер об обновлении
  bus.emit('update-cart', cartProduct)
}
*/
const currentDetails = computed(() => {
  return [
    currentProduct.value?.frame_url || '',
    selectedColor.value || '',
    frameType.value || 'single',
    selectedInnerFrame.value?.frame_url || '',
    innerFrameColor.value || '',
    isPaspartuActive.value ? 'paspartu-on' : 'paspartu-off',
    isPaspartuActive.value ? selectedTopPaspartu.value?.image || '' : '',
    isPaspartuActive.value ? selectedBottomPaspartu.value?.image || '' : '',
    isPaspartuActive.value && hasKant.value ? 'kant-on' : 'kant-off',
    isPaspartuActive.value && hasKant.value ? selectedKant.value?.image || '' : '',
    selectedGlassType.value || '',
  ].join('_')
})
const addToCart = async () => {
  if (!currentProduct.value || isSubmitting.value) return
  isSubmitting.value = true // Блокируем кнопку перед запросом

  try {
    // 1. Создаем один скрытый холст в памяти для склеивания слоев
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = 600
    finalCanvas.height = 800
    const ctx = finalCanvas.getContext('2d')

    // 2. Находим ваши 5 реальных экранных canvas по их ID
    const c1 = document.getElementById('photoCanvas')
    const c2 = document.getElementById('paspartuCanvas')
    const c3 = document.getElementById('innerFrameCanvas')
    const c4 = document.getElementById('outerFrameCanvas')
    const c5 = document.getElementById('glassCanvas')

    // 3. Поочередно копируем графику с экрана на финальный холст
    if (c1) ctx.drawImage(c1, 0, 0, finalCanvas.width, finalCanvas.height)
    if (c2) ctx.drawImage(c2, 0, 0, finalCanvas.width, finalCanvas.height)
    if (c3) ctx.drawImage(c3, 0, 0, finalCanvas.width, finalCanvas.height)
    if (c4) ctx.drawImage(c4, 0, 0, finalCanvas.width, finalCanvas.height)
    if (c5) ctx.drawImage(c5, 0, 0, finalCanvas.width, finalCanvas.height)

    // 4. Делаем моментальный снимок получившейся сборки
    const previewImage = finalCanvas.toDataURL('image/jpeg', 0.8)
    // Вычисляемая строка уникальных параметров для поиска именно этой сборки рамы
    /*
  const currentDetails = computed(() => {
    return [
      // Внешняя рама: текстура и цвет (заменили несуществующий colorName на selectedColor)
      currentProduct.value?.frame_url || '',
      selectedColor.value || '',

      // Внутренняя рама: тип, текстура и цвет
      frameType.value || 'single',
      selectedInnerFrame.value?.frame_url || '',
      innerFrameColor.value || '',

      // Паспарту: активность, текстура верхнего и текстура нижнего
      isPaspartuActive.value ? 'paspartu-on' : 'paspartu-off',
      isPaspartuActive.value ? selectedTopPaspartu.value?.image || '' : '',
      isPaspartuActive.value ? selectedBottomPaspartu.value?.image || '' : '',

      // Кант-слип: наличие и текстура
      isPaspartuActive.value && hasKant.value ? 'kant-on' : 'kant-off',
      isPaspartuActive.value && hasKant.value ? selectedKant.value?.image || '' : '',

      // Стекло: тип
      selectedGlassType.value || '',
    ].join('_')
  })*/

    // 5. Формируем чистый объект товара для корзины (сверяем детали по существующим переменным)
    const cartProduct = {
      product_id: currentProduct.value.id,
      title: currentProduct.value.title || 'Рама в сборе',
      price: Number(totalPrice.value || 0),
      old_price: Number(currentProduct.value.old_price || 0),
      quantity: Number(quantity.value || 1),
      size: `${userWidth1.value || 0}x${userLength1.value || 0}см`,
      image_preview: previewImage,
      details: currentDetails.value,

      // Добавляем отправку параметров в существующие колонки вашей таблицы:
      selected_color: selectedColor.value || null,
      frame_type: frameType.value || 'single',
      inner_frame_id: selectedInnerFrame.value ? String(selectedInnerFrame.value.id) : null,
      inner_frame_name: selectedInnerFrame.value ? selectedInnerFrame.value.title : null,
      inner_frame_color: innerFrameColor.value || null,
      is_paspartu_active: Boolean(isPaspartuActive.value),
      paspartu_layers: Number(paspartuLayers.value || 1),
      top_paspartu_name: isPaspartuActive.value ? selectedTopPaspartu.value?.name || null : null,
      bottom_paspartu_name: isPaspartuActive.value
        ? selectedBottomPaspartu.value?.name || null
        : null,
      has_kant: Boolean(isPaspartuActive.value ? hasKant.value : false),
      kant_name: isPaspartuActive.value ? selectedKant.value?.name || null : null,
      glass_type: selectedGlassType.value || null,
    }

    // 6. Передаем управление в Pinia (она сама обновит массив, localStorage и базу данных Supabase)
    await cartStore.addToCart(cartProduct)
  } finally {
    isSubmitting.value = false // Разблокируем кнопку после ответа БД
  }
}
/*
bus.on('quantity-changed', ({ productId: incomingId, qty }) => {
  if (incomingId === productId) {
    quantity.value = qty // Синхронизируем инпут на странице
  }
})*/

const cartStore = useCartStore()
const { cart } = storeToRefs(cartStore) // Включаем реактивность для карточки

const currentQuantity = ref(1) // Локальный счетчик, если товара еще нет в корзине

// Контроллер связи с Pinia
const cartItemIndex = computed(() => {
  if (!currentProduct.value) return -1
  return cart.value.findIndex(
    (item) =>
      String(item.product_id) === String(currentProduct.value.id) &&
      item.size === `${userWidth1.value || 0}x${userLength1.value || 0}см` &&
      item.details === currentDetails.value, // Точное сравнение параметров
  )
})

const quantityController = computed({
  get() {
    return cartItemIndex.value !== -1
      ? Number(cart.value[cartItemIndex.value].quantity)
      : Number(currentQuantity.value)
  },
  set(val) {
    const num = Number(val)
    if (isNaN(num) || num < 1) return

    if (cartItemIndex.value !== -1) {
      cartStore.updateQuantity(cartItemIndex.value, cart.value[cartItemIndex.value], num)
    } else {
      currentQuantity.value = num
    }
  },
})

// То самое имя, которое ищет ваш HTML-шаблон
const quantity = computed({
  get: () => quantityController.value,
  set: (val) => {
    quantityController.value = Number(val)
  },
})

// Функции кнопок плюс и минус с автоматической синхронизацией Pinia и Supabase

const increaseQty = async () => {
  console.log('Карточка:', currentDetails.value)
  console.log(
    'Корзина:',
    cart.value.map((i) => i.details),
  )
  if (cartItemIndex.value !== -1) {
    // Берём текущую цифру, приводим к числу и передаем строго +1
    const currentQty = Number(cart.value[cartItemIndex.value].quantity || 1)
    if (currentQty < 500) {
      await cartStore.updateQuantity(
        cartItemIndex.value,
        cart.value[cartItemIndex.value],
        currentQty + 1,
      )
    }
  } else if (quantity.value < 500) {
    quantity.value++
  }
}

const decreaseQty = async () => {
  if (cartItemIndex.value !== -1) {
    // Берём текущую цифру, приводим к числу и передаем строго -1
    const currentQty = Number(cart.value[cartItemIndex.value].quantity || 1)
    if (currentQty > 1) {
      await cartStore.updateQuantity(
        cartItemIndex.value,
        cart.value[cartItemIndex.value],
        currentQty - 1,
      )
    }
  } else if (quantity.value > 1) {
    quantity.value--
  }
}
const isSubmitting = ref(false)

const isFavoriteSubmitting = ref(false)

const addToFavorites = async () => {
  if (!currentProduct.value || isFavoriteSubmitting.value) return
  isFavoriteSubmitting.value = true

  try {
    // 1. Создаем скрытый холст в памяти для склеивания слоев
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = 600
    finalCanvas.height = 800
    const ctx = finalCanvas.getContext('2d')

    // 2. Находим 5 экранных canvas по их ID
    const c1 = document.getElementById('photoCanvas')
    const c2 = document.getElementById('paspartuCanvas')
    const c3 = document.getElementById('innerFrameCanvas')
    const c4 = document.getElementById('outerFrameCanvas')
    const c5 = document.getElementById('glassCanvas')

    // 3. Поочередно копируем графику на финальный холст
    if (c1) ctx.drawImage(c1, 0, 0, finalCanvas.width, finalCanvas.height)
    if (c2) ctx.drawImage(c2, 0, 0, finalCanvas.width, finalCanvas.height)
    if (c3) ctx.drawImage(c3, 0, 0, finalCanvas.width, finalCanvas.height)
    if (c4) ctx.drawImage(c4, 0, 0, finalCanvas.width, finalCanvas.height)
    if (c5) ctx.drawImage(c5, 0, 0, finalCanvas.width, finalCanvas.height)

    // 4. Делаем снимок получившейся сборки
    const previewImage = finalCanvas.toDataURL('image/jpeg', 0.8)

    const favoriteItem = {
      id: currentProduct.value.id,
      title: currentProduct.value.title,
      price: totalPrice.value,
      old_price: currentProduct.value.old_price || null,
      selectedSize: `${userWidth1.value.value}x${userLength1.value} см`,
      image_preview: previewImage,
      link: `/product/${currentProduct.value.id}`,
    }

    await favoritesStore.addToFavorites(favoriteItem)
  } finally {
    isFavoriteSubmitting.value = false
  }
}
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
              v-for="frame in filteredInnerFrames"
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
            <button class="close-btn" aria-label="Закрыть" @click="closeAllPanels()">
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
        <!-- ПЕРЕКЛЮЧАТЕЛЬ СЛОЕВ (1 ИЛИ 2) -->
        <div class="pasportu_div" v-if="isMenuOpen">
          <div class="layer-switcher" v-if="hasPaspartu">
            <button
              class="btn-option"
              :class="{ active: paspartuLayers === 1 }"
              @click="paspartuLayers = 1"
            >
              1 слой
            </button>
            <button
              class="btn-option"
              :class="{ active: paspartuLayers === 2 }"
              @click="setTwoLayers"
            >
              2 слоя
            </button>
            <button
              @click="closeAllPanels"
              v-if="hasPaspartu"
              style="
                padding-bottom: 10px;
                background: none;
                border: none;
                cursor: pointer;
                margin-top: -5px;
                margin-left: 70px;
                display: flex;
                align-items: center;
              "
              title="Скрыть настройки"
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="div_toggle" v-if="hasPaspartu">
            <!-- ТУМБЛЕР ДОБАВЛЕНИЯ КАНТА КАК КНОПКА -->
            <label class="btn-option" :class="{ active: hasKant }">
              <input type="checkbox" @click="toggleKant" />
              <span>Добавить слип</span>
            </label>
          </div>

          <!-- БЛОК РЕГУЛИРОВКИ РАЗМЕРОВ (sizes-block) -->
          <div class="sizes-block" v-if="hasPaspartu">
            <!-- Ползунок №1: Верхнее паспарту -->
            <div class="input-group" v-if="hasPaspartu">
              <input type="range" min="10" max="150" v-model="topPaspartuWidth" />
              <input
                type="number"
                min="10"
                max="150"
                v-model.number="topPaspartuWidth"
                class="custom-number-input"
              />
            </div>

            <!-- Ползунок №2: Появляется ТОЛЬКО при 2 слоях и ЕСЛИ выключен кант -->
            <div v-if="paspartuLayers === 2 && !hasKant" class="slider-row">
              <label>Ширина нижнего паспарту (мм):</label>
              <div class="input-group">
                <input type="range" min="1" max="149" v-model.number="bottomPaspartuWidth" />
                <input
                  type="number"
                  min="1"
                  max="149"
                  v-model.number="bottomPaspartuWidth"
                  class="custom-number-input"
                />
              </div>
            </div>

            <!-- Фиксированная планка вместо ползунка: Если включен кант -->
            <div v-if="hasKant" class="fixed-kant-row">
              <p>
                Ширина декоративного слипа:
                <strong>{{ KANT_FIXED_WIDTH }} мм</strong> (фиксированная)
              </p>
            </div>
          </div>
          <!-- Выбор картона для верхнего слоя -->
          <!-- Контейнер с горизонтальной прокруткой -->
          <div class="paspartu-scroll-wrapper">
            <div class="paspartu-grid-2rows" v-if="hasPaspartu">
              <div v-for="item in paspartuList" :key="item.id" class="paspartu-grid-cell">
                <button
                  class="paspartu-slide-btn"
                  :class="{ active: selectedTopPaspartu?.id === item.id }"
                  @click="
                    ((selectedTopPaspartu = selectedTopPaspartu?.id === item.id ? null : item),
                    renderAll())
                  "
                >
                  <img :src="item.image" :alt="item.name" />
                  <span>{{ item.name }}</span>
                </button>
              </div>
            </div>
          </div>
          <!-- ЛИНИЯ-РАЗДЕЛИТЕЛЬ МЕЖДУ ТОВАРАМИ -->
          <hr v-if="hasPaspartu && paspartuLayers === 2" class="product-separator" />
          <!-- Сетка выбора канта (показывается только при включенном канте) -->
          <div v-if="hasKant" class="paspartu-grid">
            <h4>Текстура декоративного слипа</h4>
            <button
              v-for="kant in kantList"
              :key="kant.id"
              :class="{ active: selectedKant?.id === kant.id }"
              @click="((selectedKant = selectedKant?.id === kant.id ? null : kant), renderAll())"
            >
              <img :src="kant.image" :alt="kant.name" />
              <span>{{ kant.name }}</span>
            </button>
          </div>

          <!-- Выбор картона для нижнего слоя (показывается только при 2 слоях и если выключен кант) -->

          <!-- ДЛЯ НИЖНЕЙ ПЛАНКИ ПАСПАРТУ -->
          <h4 v-if="hasPaspartu && paspartuLayers === 2 && !hasKant">Текстура нижнего паспарту</h4>

          <div class="paspartu-scroll-wrapper">
            <div class="paspartu-grid-2rows" v-if="hasPaspartu && paspartuLayers === 2 && !hasKant">
              <!-- Оставляем v-for ТОЛЬКО здесь -->
              <div v-for="item in paspartuList" :key="item.id" class="paspartu-grid-cell">
                <!-- С кнопки <button> полностью УДАЛЯЕМ v-for="item in paspartuList" -->
                <button
                  class="paspartu-slide-btn"
                  :class="{ active: selectedBottomPaspartu?.id === item.id }"
                  @click="
                    ((selectedBottomPaspartu =
                      selectedBottomPaspartu?.id === item.id ? null : item),
                    renderAll())
                  "
                >
                  <img :src="item.image" :alt="item.name" />
                  <span>{{ item.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Подменю с выбором типа стекла -->
        <div v-if="isMainActive" class="sub-buttons">
          <button
            @click="selectGlass('regular')"
            :class="['btn-sub', { active: selectedGlassType === 'regular' }]"
          >
            Стекло обычное ({{ priceRegular }} руб/м²)
          </button>

          <button
            @click="selectGlass('antiglare')"
            :class="['btn-sub', { active: selectedGlassType === 'antiglare' }]"
          >
            Стекло антиблик ({{ priceAntiglare }} руб/м²)
          </button>
          <button
            @click="closeAllPanels"
            v-if="isMainActive"
            class="btn-close-glass"
            style="
              padding-bottom: 10px;
              background: none;
              border: none;
              cursor: pointer;
              margin: 15px auto 0;
              width: 100%;
            "
            title="Скрыть настройки"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="container7">
          <h2 class="visually-hidden">product card</h2>

          <div class="card-container">
            <div class="card-content">
              <div class="card-content__top">
                <div class="card-top">
                  <div class="card-top__left">
                    <div
                      class="card-slider"
                      :class="{
                        'is-horizontal-column': isHorizontalMode && !currentInterior, // Выключаем боковой режим широкого конструктора при интерьере
                      }"
                    >
                      <div
                        class="card-slider__thumbs"
                        v-if="!isPaspartuActive && !isMainActive && !isPanelOpen"
                        :class="{
                          'is-square-shift': isSquare,
                          'is-horizontal-bottom':
                            !isSquare &&
                            Number(userWidth1) > Number(userLength1) * 1.15 &&
                            !currentInterior, // Оставляем нижний ряд только если интерьер ВЫКЛЮЧЕН
                        }"
                      >
                        <!-- Кнопка показывается только если интерьер выбран -->
                        <button
                          v-if="currentInterior"
                          @click="((currentInterior = null), renderAll())"
                          class="btn-reset-interior"
                        >
                          ✕ Сбросить интерьер
                        </button>
                        <div
                          v-for="interior in interiorsList"
                          :key="interior.id"
                          class="card-slider__thumb"
                          :class="{ 'is-active': currentInterior?.id === interior.id }"
                          @click="
                            currentInterior?.id === interior.id
                              ? ((currentInterior = null), renderAll())
                              : selectInterior(interior)
                          "
                          style="
                            width: 80px;
                            height: 100px;
                            overflow: hidden;
                            display: inline-block;
                            cursor: pointer;
                          "
                        >
                          <img
                            :src="`${interior.image_url}?width=80&resize=contain`"
                            alt="Интерьер"
                            style="width: 100%; height: 100%; object-fit: cover"
                          />
                        </div>
                      </div>

                      <div class="frame-constructor">
                        <!-- Внешний универсальный контейнер, который ВСЕГДА держит размер окна 574x759 -->
                        <div
                          class="canvas-container"
                          style="position: relative; overflow: hidden"
                          :style="{
                            width: isSquare
                              ? '574px'
                              : userWidth1 > userLength1 * 1.15 && !currentInterior
                                ? '677px'
                                : '574px',
                            height:
                              isSquare && !currentInterior
                                ? '600px'
                                : userWidth1 > userLength1 * 1.15 && !currentInterior
                                  ? '400px'
                                  : '759px',
                          }"
                        >
                          <!-- Картинка интерьера на самом заднем плане, заполняющая всё окно -->
                          <img
                            v-if="currentInterior"
                            ref="mainImageRef"
                            :src="currentInterior.image_url"
                            alt="Интерьер комнаты"
                            class="main-image"
                            style="
                              position: absolute;
                              left: 0;
                              top: 0;
                              width: 100%;
                              height: 100%;
                              object-fit: cover;
                              z-index: 1;
                            "
                          />

                          <!-- Внутренний контейнер, который динамически двигает и сжимает ТОЛЬКО холсты -->
                          <div
                            :style="
                              currentInterior
                                ? canvasContainerStyle
                                : {
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: '100%',
                                    height: '100%',
                                  }
                            "
                          >
                            <canvas
                              id="photoCanvas"
                              style="
                                position: absolute;
                                left: 0;
                                top: 0;
                                z-index: 2;
                                width: 100%;
                                height: 100%;
                              "
                            ></canvas>
                            <canvas
                              id="paspartuCanvas"
                              style="
                                position: absolute;
                                left: 0;
                                top: 0;
                                z-index: 3;
                                width: 100%;
                                height: 100%;
                              "
                            ></canvas>
                            <canvas
                              id="innerFrameCanvas"
                              style="
                                position: absolute;
                                left: 0;
                                top: 0;
                                z-index: 4;
                                width: 100%;
                                height: 100%;
                              "
                            ></canvas>
                            <canvas
                              id="outerFrameCanvas"
                              style="
                                position: absolute;
                                left: 0;
                                top: 0;
                                z-index: 5;
                                width: 100%;
                                height: 100%;
                              "
                            ></canvas>
                            <canvas
                              id="glassCanvas"
                              style="
                                position: absolute;
                                left: 0;
                                top: 0;
                                z-index: 6;
                                pointer-events: none;
                              "
                            ></canvas>
                          </div>
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
                        <p class="size-select__selected">
                          Размер:<span>{{ sizeText }}</span>
                        </p>
                        <form class="frame-form">
                          <div class="fake-single-input">
                            <input
                              v-model.number="userWidth1"
                              @change="validateSize('userWidth1')"
                              title="ширина от 5 до 200 см"
                              type="number"
                              min="5"
                              max="2000"
                              placeholder="Ширина"
                              required
                              aria-label="Ширина в мм"
                            />
                            <span class="fix-x">×</span>
                            <input
                              v-model.number="userLength1"
                              @change="validateSize('userLength1')"
                              title="высота от 5 до 200 см"
                              type="number"
                              min="5"
                              max="2000"
                              placeholder="Высота"
                              required
                              aria-label="Высота в мм"
                            />
                          </div>
                        </form>
                        <button
                          @click="clearSizes"
                          type="button"
                          class="btn-reset size-select__clear"
                        >
                          <img src="/images/cross.png" alt="" />

                          очистить
                        </button>
                      </div>
                      <div class="toggle-container" role="radiogroup" aria-label="Выбор рамы">
                        <!-- Кнопка: Одинарная рама -->
                        <button
                          class="toggle-btn"
                          data-value="single"
                          role="radio"
                          :aria-checked="frameType === 'single'"
                          :class="{ active: frameType === 'single' }"
                          @click="togglePanel('single')"
                        >
                          Одинарная рама
                        </button>

                        <!-- Кнопка: Двойная рама -->
                        <button
                          class="toggle-btn"
                          data-value="double"
                          role="radio"
                          :aria-checked="frameType === 'double'"
                          :class="{ active: frameType === 'double' }"
                          @click="togglePanel('double')"
                          :disabled="isDoubleFrameButtonDisabled"
                          title="Двойную раму можно добавить если размер 2 рамы оставляет минимум 10 см для картины "
                        >
                          Двойная рама
                        </button>
                      </div>
                      <!-- ГЛАВНЫЙ ТУМБЛЕР ПАСПАРТУ -->
                      <!-- Исправленная кнопка паспарту (без .prevent) -->
                      <button
                        class="btn-option toggle"
                        :class="{ active: isPaspartuActive }"
                        @click="togglePanel('paspartu')"
                        :disabled="isPaspartuDisabled"
                        title="Ширина паспарту от 5 до 60 см, высота от 5 до 100 см"
                      >
                        Добавить паспарту
                      </button>
                      <div>
                        <div class="calculator">
                          <!-- Главная кнопка -->
                          <button
                            @click="togglePanel('glass')"
                            :class="['btn-main', { active: isMainActive || selectedGlassType }]"
                          >
                            Добавить стекло
                          </button>
                        </div>
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
                          @click="decreaseQty"
                          class="btn-reset stepper__btn stepper__btn--minus"
                          aria-label="minus"
                        >
                          <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                            <rect fill="none" height="256" width="256" />
                            <path d="M216,136H40a8,8,0,0,1,0-16H216a8,8,0,0,1,0,16Z" />
                          </svg>
                        </button>

                        <input type="text" class="stepper__input" v-model.number="quantity" />

                        <button
                          @click="increaseQty"
                          class="btn-reset stepper__btn stepper__btn--plus"
                          aria-label="plus"
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
                      </div>
                      <button
                        class="btn-reset card-info__btn card-info__btn--tocart"
                        @click="addToCart"
                      >
                        {{ isSubmitting ? 'Добавление...' : 'Добавить в корзину' }}
                      </button>
                      <button
                        class="btn-reset card-info__btn card-info__btn--towishlist"
                        @click="addToFavorites"
                        :disabled="isFavoriteSubmitting"
                      >
                        {{ isFavoriteSubmitting ? 'Добавление...' : 'Добавить в Понравившиеся' }}
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
              </div>
              <!-- CONTAINER7 -->
            </div>
          </div>
        </div>
      </div>
      <div class="container10">
        <div class="description_bottom">
          <div class="description_bottom__text">Описание</div>
          <p class="card-info__descr">
            Эта стильная рама из качественных материалов надежно защитит ваше изображение от внешних
            воздействий. Её лаконичный и универсальный дизайн гармонично подчеркнет красоту любого
            постера, картины или холста. Изделие идеально впишется в любой стиль интерьера квартиры,
            студии или уютного офиса. Прочные встроенные крепления обеспечивают легкий монтаж и
            безупречную фиксацию на стене.
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

                        <img src="/images/works22 (1) (2) (3).png " class="no-visible" alt="" />
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
    </section>
  </main>
</template>

<style>
.parent {
  display: flex; /* Включаем Flexbox */
  justify-content: center; /* Центрируем по горизонтали */
  align-items: center; /* Центрируем по вертикали */
  height: 300px; /* Родителю нужна высота для вертикального центра */
}

.container10 {
  max-width: 1220px;
  margin: 0px auto;
  padding: 0px 10px;
  flex-shrink: 0;
  min-width: 0;
}
/* Правильное горизонтальное положение миниатюр без поломок */
.is-horizontal-column .card-slider__thumbs {
  position: absolute !important;
  left: 282px !important;
  top: 700px !important;
  display: flex !important;
  flex-direction: row !important;
  width: 574px !important;
  margin-top: 0 !important;
  gap: 10px;
  z-index: 10;
}

/* Изолируем вертикальную раму, чтобы thumbs не ломали холсты */
:not(.is-horizontal-column) > .card-slider__thumbs {
  position: static !important;
  display: flex !important;
  flex-direction: column !important; /* Возвращаем в левую колонку */
  width: 90px !important;
  margin-top: 60px !important;
}
.interior-canvas-container canvas {
  object-fit: fill !important;
}

/* Желтая рамка толщиной 1px со всех четырех сторон для активной иконки */
.card-slider__thumb.is-active {
  outline: 4px solid #ffd700;
}
.btn-reset-interior {
  width: 100%;
  padding: 8px 9px;
  padding-right: px;
  margin-bottom: 10px;
  background-color: #f1f1f1;
  border: 1px solid #000000;
  border-radius: 4px;
  margin-left: -1px;
  cursor: pointer;
  font-size: 14px;
}
.btn-reset-interior:hover {
  background-color: #e2e2e2;
}
button:disabled {
  background-color: #e0e0e0 !important;
  color: #a0a0a0 !important;
  border-color: #d0d0d0 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}
.fake-single-input {
  display: inline-flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 10px;
  background: white;
}

/* При клике внутрь имитируем фокус на всем "поле" */
.fake-single-input:focus-within {
  border-color: black;
}

/* Сами инпуты делаем невидимыми внутри блока */
.fake-single-input input {
  width: 120px;
  border: none;
  outline: none;
  padding: 0;
  text-align: center;
  font-size: 16px;
}

/* Фиксированный крестик, который нельзя стереть */
.fake-single-input .fix-x {
  color: #666;
  font-size: 16px;
  user-select: none;
  padding: 0 4px;
}
/* Для Chrome, Safari, Edge и Opera */
.fake-single-input input::-webkit-outer-spin-button,
.fake-single-input input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
Ы

/* Для Firefox */
.fake-single-input input[type='number'] {
  -moz-appearance: textfield;
}
/*
.calculator {
  max-width: 400px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}*/

.calculator.input-group {
  margin-bottom: 15px;
}

.calculator.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.calculator.input-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Базовый черный стиль для всех кнопок */

.sub-buttons button {
  background-color: #ffffff;
  color: #000000;
  border: 2px solid #000000;
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-bottom: 10px;
  flex: 1;
}

/* Белый стиль, когда кнопка активирована */

.sub-buttons button.active {
  background-color: #000000;
  color: #ffffff;
  border: 2px solid #000000;
}

.sub-buttons {
  display: flex;
  margin-top: 300px;
  padding-left: 2px;
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
}
.sub-buttons button.btn-close-glass {
  width: 100%; /* Растягивает крестик на всю строку, заставляя его упасть вниз */
  flex: none; /* Отменяет свойство flex: 1, которое растягивало его в ряд с кнопками */
  position: absolute;
  top: 60px; /* Двигает кнопку вверх на 80 пикселей относительно её позиции */
}
.btn-main {
  background-color: #ffffff;
  color: #000000;
  border: 2px solid #dfdfdf;
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 10px;
  width: 100%;
  max-width: 285px;
}
.btn-main:hover {
  border-color: #b5b5b5;
  background-color: #f9f9f9;
}
.btn-main.active {
  background-color: #000000;
  color: #ffffff;
  border: 2px solid #000000;
}
/* Картинка теперь занимает строго 70% высоты кнопки */
.paspartu-slide-btn img {
  width: 100% !important;
  height: 65% !important;
  object-fit: cover !important; /* Картинка масштабируется без искажений */
  border-top-left-radius: 6px; /* Скругляем верхние углы картинки под кнопку */
  border-top-right-radius: 6px;
}

/* Текст занимает оставшиеся 30% высоты кнопки */
.paspartu-slide-btn span {
  width: 100% !important;
  height: 30% !important;
  font-size: 11px !important; /* Компактный размер шрифта */
  line-height: 1.1 !important; /* Плотный межстрочный интервал */
  display: flex !important;
  align-items: center !important; /* Центруем текст по вертикале */
  justify-content: center !important; /* Центруем текст по горизонтале */
  text-align: center !important;
  padding: 2px 4px !important; /* Небольшие внутренние поля */
  box-sizing: border-box !important;
}
/* Общий контейнер, включающий скролл */
.paspartu-scroll-wrapper {
  width: 100%;
  max-width: 450px;
  overflow-x: auto; /* Включаем горизонтальную прокрутку */
  overflow-y: hidden; /* Прячем вертикальную прокрутку */
  padding-bottom: 10px;
  margin-top: 10px;
}

/* Двухрядная сетка на чистом CSS */
.paspartu-grid-2rows {
  display: grid !important;
  grid-template-rows: repeat(2, 90px); /* Строго 2 ряда по 90px */
  grid-auto-flow: column; /* Заполнение по колонкам (слева направо) */
  grid-auto-columns: calc((100% - 40px) / 4); /* Ровно 5 ячеек в видимой области экрана */
  gap: 10px; /* Отступы между ячейками */
}

/* Каждая ячейка сохраняет пропорции */
.paspartu-grid-cell {
  width: 100%;
  height: 100%;
}

/* Оформление кнопок-ячеек */
.paspartu-slide-btn {
  width: 100%;
  height: 100%;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  box-sizing: border-box;
}

.paspartu-slide-btn.active {
  border-color: #007aff;
  background-color: #f0f7ff;
}

/* Аккуратный тонкий скроллбару */
.paspartu-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}
.paspartu-scroll-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.paspartu-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

/* Оформление кнопок-ячеек внутри слайдов */
.paspartu-slide-btn {
  width: 100%;
  height: 90px; /* Фиксированная высота одной ячейки */
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}

.paspartu-slide-btn.active {
  border-color: #007aff; /* Цвет рамки активной ячейки */
}

/* Красивое оформление полосы прокрутки для современных браузеров */
.scroll-container::-webkit-scrollbar {
  height: 6px; /* Делаем полосу тонкой и аккуратной */
}
.scroll-container::-webkit-scrollbar-track {
  background: #282424;
  border-radius: 4px;
}
.scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
/* Базовые стили для поля ввода */
.custom-number-input {
  width: 300px;
  height: 10px;
  padding: 10px 0; /* Компенсируем высоту 10px для удобного отображения текста */
  text-align: center; /* Размещает цифры ровно посередине */
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-sizing: content-box; /* Гарантирует высоту контента ровно 10px */
  margin-top: 10px;
}

/* Убираем стрелочки справа в Chrome, Safari, Edge, Opera */
.custom-number-input::-webkit-outer-spin-button,
.custom-number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Убираем стрелочки справа в Firefox */
.custom-number-input[type='number'] {
  -moz-appearance: textfield;
}
/*паспорту*/
/* Делаем блок паспарту всплывающей боковой панелью */
.pasportu_div {
  width: 300px; /* Фиксированная ширина панели сбоку */
  flex-shrink: 0; /* Запрещает блоку сжиматься, если раме тесно */
  background: #ffffff;
  margin-top: 260px;
  margin-left: 1px;
}

/* Базовый класс для всех интерактивных кнопок-опций */
.btn-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  margin-bottom: 10px;
  width: 285px;
}

/* Скрываем стандартный системный квадрат чекбокса внутри кнопки */
.btn-option input[type='checkbox'] {
  display: none;
}

/* Эффект при наведении на любую кнопку */
.btn-option:hover {
  border-color: #b5b5b5;
  background-color: #f9f9f9;
}

/* Активное (нажатое) состояние кнопки */
.btn-option.active {
  border-color: #000000;
  background-color: #000000;
  color: #ffffff; /* Белый текст на черном фоне */
}

/* Контейнер для кнопок переключения слоев */
.layer-switcher {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.div_toggle {
  margin-top: 20px;
}
.toggle {
  margin-top: 20px;
}
/* --- ЧЕРНЫЕ ЧЕКБОКСЫ (ГАЛОЧКИ) --- */
.toggle input[type='checkbox'] {
  accent-color: #000000; /* Перекрашивает стандартную галочку браузера в черный цвет */
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* --- КРАСИВЫЕ ПОЛЗУНКИ (RANGE SLIDERS) --- */
.sizes-block input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
}

/* Круглый бегунок ползунка */
.sizes-block input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #000000; /* Черный бегунок */
  cursor: pointer;
  transition: transform 0.1s ease;
}

.sizes-block input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.2); /* Легкое увеличение при наведении */
}

/* --- СЕТКА КНОПОК ПАСПАРТУ --- */
.paspartu-grid {
  display: flex;
  gap: 10px;
  margin: 10px 0 20px 0;
  flex-wrap: wrap;
  max-width: 450px; /* Контролирует ширину блока с картоном */
}

/* Стилизация кнопок-текстур */
.paspartu-grid button {
  width: 90px;
  height: auto;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
  padding: 6px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.paspartu-grid button:hover {
  border-color: #b5b5b5;
}

/* Активное состояние выбранной текстуры */
.paspartu-grid button.active {
  border-color: #000000; /* Жирная черная рамка */
  transform: translateY(-2px); /* Эффект приподнимания */
}

/* Картинка внутри кнопки */
.paspartu-grid button img {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

/* Текст под картинкой картона */
.paspartu-grid button span {
  display: block;
  font-size: 11px;
  text-align: center;
  color: #333333;
  line-height: 1.2;
}

/* --- СТИЛИ ДЛЯ ЛИНИИ И ПЛАНКИ КАНТА --- */
.fixed-kant-row {
  background-color: #f9f9f9;
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 10px;
}

.fixed-kant-row p {
  margin: 0;
  font-size: 14px;
  color: #333333;
}

/* Тонкая линия-разделитель между товарами */
.product-separator {
  border: 0;
  height: 1px;
  background-color: #e0e0e0;
  margin: 30px 0;
}

/* Состояние активной выбранной текстуры */
.paspartu-grid button.active {
  border-color: #000; /* Черная рамка вокруг выбранного картона */
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

/*паспорту*/
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
  position: relative;
  padding: 20px;
}
/* Стили для интерьера, чтобы он намертво встал поверх рамы */
.interior-container.is-active-interior {
  position: absolute;
  top: 20px; /* Учитываем padding родителя */
  left: 20px;
  width: 574px;
  height: 759px;
  z-index: 10; /* Помещает интерьер на самый верхний слой */
  background: #fff;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Защищает картинку интерьера от искажения размеров */
  display: block;
}

.interior-canvas-container {
  position: absolute;
  /* Координаты маленькой рамы внутри интерьера прилетят из js через :style */
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
  flex-shrink: 0 !important;
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
  display: flex;
  background-color: #ff4405;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #dee2e6;
  margin-bottom: 15px;
  height: 44px;
  width: 280px;
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
  flex-shrink: 1; /* Разрешает картине немного уменьшаться, уступая место панели */
  min-width: 0; /* Корректно активирует сжатие флекс-элемента в браузере */
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
.card {
  display: flex !important;
  flex-direction: row !important; /* Выстраивает блоки строго в один горизонтальный ряд */
  align-items: flex-start !important; /* Выравнивает их по верхнему краю друг с другом */
  flex-wrap: nowrap !important; /* Запрещает блокам выдавливать друг друга на новые строки */
  overflow: hidden; /* Прячет вылезающие элементы внутри карточки */
  max-width: 100%; /* Запрещает карточке становиться шире экрана */
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
  transition: all 0.3s ease;
}
/* Поднимаем блок вверх на 20-30 пикселей, когда рама становится квадратной */
.card-slider__thumbs.is-square-shift {
  margin-top: 45px !important;
  transition: margin-top 0.3s ease;
}
/* Стандартное нижнее положение для горизонтальной рамы без интерьера */
/*
.card-slider__thumbs.is-horizontal-bottom {
  position: absolute !important;
  left: 0 !important;
  top: 800px !important;
  display: flex !important;
  flex-direction: row !important;
  width: 100% !important;
}*/

* При активации интерьера миниатюры уезжают вправо на свободное место */ .card-slider__thumb {
  cursor: pointer;
}

.card-top__right {
  padding-top: 10px;
  padding-top: 60px;
  padding-left: 10.7%;
  max-width: 33.3vw !important;
  flex-shrink: 0 !important; /* Запрещает элементам внутри сжиматься и деформироваться */
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
  display: block;
  margin-top: 10px;
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
.stepper__btn:hover svg {
  fill: rgb(0, 0, 0);
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
  background-color: rgb(242, 242, 242);
  color: rgb(3, 3, 3);
}

.card-info__btn--tocart:hover {
  background-color: #000000;
  color: #ffffff;

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
