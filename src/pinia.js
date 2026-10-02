import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../src/router/supabase.js'

export const useCartStore = defineStore('cart', () => {
  const cart = ref(JSON.parse(localStorage.getItem('cart')) || [])

  // Глубокое отслеживание всех мутаций для localStorage
  watch(
    cart,
    (newCart) => {
      localStorage.setItem('cart', JSON.stringify(newCart))
    },
    { deep: true },
  )

  // Реактивный подсчет суммы
  const totalCartPrice = computed(() => {
    return cart.value
      .reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
      .toFixed(2)
  })
  /*
  const updateQuantity = async (index, item, newQty) => {
    if (newQty < 1) return
    cart.value[index].quantity = newQty

    // В ОБОИХ СЛУЧАЯХ: обновляем локальный localStorage
    localStorage.setItem('cart', JSON.stringify(cart.value))

    // ПРОВЕРКА АВТОРИЗАЦИИ ДЛЯ ОБНОВЛЕНИЯ: проверяем залогинен ли юзер перед обновлением в БД
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user && item.id) {
      await supabase.from('cart_items').update({ quantity: newQty }).eq('id', item.id)
    }
  }*/
  const updateQuantity = async (index, item, newQty) => {
    if (newQty < 1) return
    cart.value[index].quantity = newQty

    // Обновляем локальный localStorage
    localStorage.setItem('cart', JSON.stringify(cart.value))

    // Отправляем изменённое количество напрямую в базу данных
    if (item.id) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', item.id)
      if (error) console.error('Ошибка изменения количества в БД:', error)
    }
  }
  /*
  const addToCart = async (product) => {
    // Поиск существующего товара по совпадению полей
    const existingIndex = cart.value.findIndex(
      (item) =>
        String(item.product_id) === String(product.product_id) &&
        item.size === product.size &&
        item.details === product.details,
    )

    if (existingIndex !== -1) {
      // Если товар найден — увеличиваем его количество
      const newQty = Number(cart.value[existingIndex].quantity) + Number(product.quantity)
      await updateQuantity(existingIndex, cart.value[existingIndex], newQty)
    } else {
      // ПРОВЕРКА АВТОРИЗАЦИИ ДЛЯ ДОБАВЛЕНИЯ: запрашиваем данные текущего пользователя
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // ЕСЛИ ЗАРЕГИСТРИРОВАН: отправляем в базу данных Supabase с привязкой к user_id
        const { data, error } = await supabase
          .from('cart_items')
          .insert({ ...product, user_id: user.id }) // подмешиваем user_id к продукту
          .select()
          .single()

        if (!error && data) {
          cart.value.push(data) // сохраняем полноценный объект из базы в реактивный массив
        } else {
          cart.value.push(product) // запасной вариант на случай ошибки базы
        }
      } else {
        // ЕСЛИ НЕ ЗАРЕГИСТРИРОВАН (ГОСТЬ): сохраняем только локально в массив стора
        cart.value.push(product)
      }

      // В ОБОИХ СЛУЧАЯХ: обязательно дублируем данные в локальную память браузера localStorage
      localStorage.setItem('cart', JSON.stringify(cart.value))
    }
  }*/

  const addToCart = async (product) => {
    // Поиск существующего товара по совпадению полей
    const existingIndex = cart.value.findIndex(
      (item) =>
        String(item.product_id) === String(product.product_id) &&
        item.size === product.size &&
        item.details === product.details,
    )

    if (existingIndex !== -1) {
      // Если товар найден — увеличиваем его количество
      const newQty = Number(cart.value[existingIndex].quantity) + Number(product.quantity)
      await updateQuantity(existingIndex, cart.value[existingIndex], newQty)
    } else {
      // УДАЛЕНО: const { data: { user } } = await supabase.auth.getUser()
      // УДАЛЕНО: if (user) { ... } else { ... }

      // ТЕПЕРЬ ДЛЯ ВСЕХ: принудительно отправляем в базу данных Supabase с user_id: null
      const { data, error } = await supabase
        .from('cart_items')

        .insert({
          user_id: null,
          product_id: Number(product.product_id || product.id),
          title: String(product.title),
          price: Number(product.price),
          quantity: Number(product.quantity || 1),
          size: String(product.size || product.selectedSize || '21x30см'),
          image_preview: String(product.image_preview || product.image_url || ''),
          details: String(product.details || ''), // <=== ДОБАВИТЬ ЭТУ СТРОКУ СЮДА
        })
        .select()
        .single()

      if (!error && data) {
        cart.value.push(data) // сохраняем полноценный объект из базы в реактивный массив
      } else {
        cart.value.push(product) // запасной вариант на случай ошибки базы
        if (error) console.error('Ошибка добавления в корзину БД:', error)
      }

      // В ОБОИХ СЛУЧАЯХ: обязательно дублируем данные в локальную память браузера localStorage
      localStorage.setItem('cart', JSON.stringify(cart.value))
    }
  }
  const loadCartFromDb = async () => {
    const { data, error } = await supabase.from('cart_items').select('*')

    if (error) return console.error('Ошибка загрузки корзины:', error)
    if (data) cart.value = data
  }
  const removeFromCart = async (index, item) => {
    // 1. Мгновенно удаляем товар из локального реактивного массива стора
    cart.value.splice(index, 1)

    // 2. Синхронизируем изменения с локальной памятью браузера
    localStorage.setItem('cart', JSON.stringify(cart.value))

    // 3. Если у товара есть ID из базы данных, точечно удаляем строку из Supabase
    if (item.id) {
      const { error } = await supabase.from('cart_items').delete().eq('id', item.id)
      if (error) console.error('Ошибка удаления товара из БД корзины:', error)
    }
  }
  return { cart, totalCartPrice, updateQuantity, removeFromCart, addToCart, loadCartFromDb }
})
