export function drawFullFrame(
  canvasId,
  textureUrl,
  frameW,
  photoUrl,
  frameH,
  s,
  isStretch,
  colorName,
) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  // Устанавливаем размер холста равным размеру рамы
  Object.assign(canvas, { width: frameW, height: frameH })

  const img = new Image()
  img.src = textureUrl

  img.onload = () => {
    const pattern = ctx.createPattern(img, 'repeat')
    // ВСТАВИТЬ СЮДА:
    pattern.setTransform(new DOMMatrix().scale(s / 270, s / 270))
    /* const matrix = new DOMMatrix().scale(s / /*img.height270)*/

    /*   pattern.setTransform(matrix)*/

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
      ctx.moveTo(points[0], points[1])
      for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1])
      ctx.closePath()

      ctx.clip()

      if (isStretch) {
        // Если лепнина: поворачиваем и тянем
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
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, len, s)
      } else {
        const ctx = canvas.getContext('2d')

        // Если дерево: твой привычный метод заливки
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

        ctx.fillRect(0, 0, len, s)
        ctx.fillRect(0, 0, len + 1, s)
        /*  ctx.globalCompositeOperation = 'overlay'
        ctx.fillStyle = ' #wee'
        ctx.globalCompositeOperation = 'color'
        ctx.globalAlpha = 1
        ctx.fillStyle = '#0077'
        ctx.fillRect(0, 0, len, s)
        ctx.fillRect(0, 0, len, s)
        ctx.globalCompositeOperation = 'source-over'*/
        // 1. Устанавливаем режим наложения
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = 0.9
        // 2. Выбираем цвет по названию
        if (colorName === 'Черный матовый') ctx.fillStyle = '#222222'

        if (colorName === 'Белый') ctx.fillStyle = '#FFFFFF'
        if (colorName === 'Золотой антик') ctx.fillStyle = '#997945'
        if (colorName === 'Светлый дуб') ctx.fillStyle = '#e3c6a3'
        if (colorName === 'Венге') ctx.fillStyle = '#3b2f2b'
        if (colorName === 'Серебряный') ctx.fillStyle = '#c0c0c0'
        if (colorName === 'Графит') ctx.fillStyle = '#4b4b4b'
        if (colorName === 'Слоновая кость') ctx.fillStyle = '#fffaf0'
        if (colorName === 'Бордовый с позолотой') ctx.fillStyle = '#800000'
        if (colorName === 'Шалфейный') ctx.fillStyle = '#9ca998'
        if (colorName === 'Медный') ctx.fillStyle = '#b87333'
        if (colorName === 'Антрацит') ctx.fillStyle = '#2f353b'
        if (colorName === 'Темный орех') ctx.fillStyle = '#5d4037'
        if (colorName === 'Бежевый песок') ctx.fillStyle = '#d2b48c'
        if (colorName === 'Темно-синий (Нави)') ctx.fillStyle = '#000080'
        if (colorName === 'Шампань') ctx.fillStyle = '#f7e7ce'
        if (colorName === 'Оливковый') ctx.fillStyle = '#808000'
        if (colorName === 'Сталь (Сатин)') ctx.fillStyle = '#8e8e93'
        if (colorName === 'Терракотовый') ctx.fillStyle = '#e2725b'
        if (colorName === 'Пыльная роза') ctx.fillStyle = '#c08081'

        if (colorName === 'желтый') ctx.fillStyle = '#FFFF00'
        if (colorName === 'синий') ctx.fillStyle = '#0000FF'
        if (colorName === 'зеленый') ctx.fillStyle = '#008000'
        if (colorName === 'оранджевый') ctx.fillStyle = '#FFA500'
        if (colorName === 'красный') ctx.fillStyle = '#FF0000'
        if (colorName === 'розовый') ctx.fillStyle = '#FF69B4'
        if (colorName === 'фиолетовый') ctx.fillStyle = '#800080'
        if (colorName === 'коричневый') ctx.fillStyle = '#964B00'
        // 3. Красим поверх текстуры

        ctx.fillRect(0, 0, len, s)

        // 4. Сбрасываем режим назад
        ctx.globalCompositeOperation = 'source-over'
      }

      ctx.restore()
    })

    // 1. Создаем объект для внутреннего фото
    const photo = new Image()
    photo.src = photoUrl // Замените на нужный URL
    photo.onload = () => {
      // 2. Рисуем фото строго в границах внутреннего проема

      ctx.drawImage(
        photo,
        0,
        0,
        photo.width,
        photo.height,
        s - 13,
        s - 13,
        frameW - 2 * s + 26,
        frameH - 2 * s + 26,
      )

      const g = ctx.createLinearGradient(s, s, frameW, frameH)
      g.addColorStop(0, 'rgba(255,255,255,0.9)')
      g.addColorStop(0.5, 'rgba(255,255,255,0)')
      g.addColorStop(1, 'rgba(255,255,255,0.1)')
      ctx.fillStyle = g
      ctx.fillRect(s - 13, s - 13, frameW - 2 * s + 26, frameH - 2 * s + 26)

      // Финальный штрих: внутренняя тень строго внутри проема
      ctx.save()
      ctx.beginPath()
      ctx.rect(s, s, frameW - 2 * s, frameH - 2 * s) // Ограничиваем область "окном"
      ctx.clip()

      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(0,0,0,0.7)'
      /* ctx.strokeRect(s, s, frameW - 2 * s, frameH - 2 * s) // Тень ляжет только внутрь*/
      ctx.strokeRect(s - 13, s - 13, frameW - 2 * s + 26, frameH - 2 * s + 26)
      ctx.restore()
    }
    /*   незабыть сделать функционал по условию if можно через кнопку создать двойную раму в конструкторе    и в польшекгда начнем прдавать  програмист чтобы зашифровал код и  и сделал эффеекты как у обложки vogue     */
  }
}
