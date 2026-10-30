/*import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../src/router/supabase.js'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref(JSON.parse(localStorage.getItem('favorites')) || [])

  const addToFavorites1 = async (product) => {
    // Проверяем дубликаты по product_id
    const exists = favorites.value.some(
      (item) => String(item.product_id || item.id) === String(product.id),
    )
    if (exists) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Подготавливаем объект строго под колонки нашей SQL-таблицы
      const dbItem = {
        user_id: user.id,
        product_id: product.id, // Мапим id из компонента в product_id для базы
        title: product.title,
        price: product.price,
        old_price: product.old_price,
        size: product.selectedSize, // Переименовываем selectedSize в size для SQL
        image_preview: product.image_preview,
        details: product.details,
        selected_color: product.selected_color,
        frame_type: product.frame_type,
        inner_frame_name: product.inner_frame_name,
        inner_frame_color: product.inner_frame_color,
        is_paspartu_active: product.is_paspartu_active,
        paspartu_layers: product.paspartu_layers,
        top_paspartu_name: product.top_paspartu_name,
        bottom_paspartu_name: product.bottom_paspartu_name,
        has_kant: product.has_kant,
        kant_name: product.kant_name,
        glass_type: product.glass_type,
        // Поля inner_frame_id, link, image_url сюда НЕ пишем, чтобы база не ругалась!
      }

      const { data, error } = await supabase
        .from('favourites_items')
        .insert(dbItem)
        .select()
        .single()

      if (!error && data) {
        favorites.value.push(data)
      } else {
        console.error('Ошибка сохранения в базу:', error)
      }
    } else {
      // Для гостей сохраняем объект как есть
      favorites.value.push(product)
    }

    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  const removeFromFavorites = async (productId) => {
    // Удаляем из локального массива (проверяем оба варианта ID, так как из базы приходит структура с product_id)
    favorites.value = favorites.value.filter(
      (item) => String(item.product_id || item.id) !== String(productId),
    )
    localStorage.setItem('favorites', JSON.stringify(favorites.value))

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('favourites_items')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id)

      if (error) console.error('Ошибка удаления из базы:', error)
    }
  }

  const isFavorite = (productId) => {
    return favorites.value.some((item) => String(item.product_id || item.id) === String(productId))
  }

  return { favorites, addToFavorites1, removeFromFavorites, isFavorite }
})
*/
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../src/router/supabase.js'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref(JSON.parse(localStorage.getItem('favorites')) || [])

  const addToFavorites1 = async (product) => {
    // ИСПРАВЛЕНО: Проверяем дубликаты строго по product_id
    const exists = favorites.value.some(
      (item) =>
        String(item.product_id) === String(product.product_id) && item.details === product.details,
    )
    if (exists) return

    // Подготавливаем объект строго под колонки нашей SQL-таблицы
    const dbItem = {
      user_id: null,
      product_id: Number(product.product_id),
      title: product.title,
      price: product.price,
      old_price: product.old_price,
      // ИСПРАВЛЕНО: берем правильное поле size из объекта карточки
      size: product.size || product.selectedSize,
      image_preview: product.image_preview,
      details: product.details,
      selected_color: product.selected_color,
      frame_type: product.frame_type,
      inner_frame_name: product.inner_frame_name,
      inner_frame_color: product.inner_frame_color,
      is_paspartu_active: product.is_paspartu_active,
      paspartu_layers: product.paspartu_layers,
      top_paspartu_name: product.top_paspartu_name,
      bottom_paspartu_name: product.bottom_paspartu_name,
      has_kant: product.has_kant,
      kant_name: product.kant_name,
      glass_type: product.glass_type,
    }

    // Принудительно отправляем в базу данных Supabase
    const { data, error } = await supabase.from('favourites_items').insert(dbItem).select().single()

    if (!error && data) {
      favorites.value.push(data)
    } else {
      console.error('Ошибка сохранения в базу:', error)
    }

    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  const removeFromFavorites = async (productId, currentDetails = null) => {
    favorites.value = favorites.value.filter((item) => {
      if (currentDetails) {
        return !(String(item.product_id) === String(productId) && item.details === currentDetails)
      }
      return String(item.product_id) !== String(productId)
    })
    localStorage.setItem('favorites', JSON.stringify(favorites.value))

    let query = supabase.from('favourites_items').delete().eq('product_id', productId)

    if (currentDetails) {
      query = query.eq('details', currentDetails)
    }

    const { error } = await query
    if (error) console.error('Ошибка удаления из базы:', error)
  }

  const isFavorite = (productId) => {
    // ИСПРАВЛЕНО: проверка активности сердечка строго по product_id
    return favorites.value.some((item) => String(item.product_id) === String(productId))
  }

  const loadFavoritesFromDb = async () => {
    const { data, error } = await supabase.from('favourites_items').select('*')

    if (error) return console.error('Ошибка загрузки:', error)
    if (data) favorites.value = data
  }

  return { favorites, addToFavorites1, loadFavoritesFromDb, removeFromFavorites, isFavorite }
})
