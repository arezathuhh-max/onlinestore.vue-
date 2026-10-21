import { ref } from 'vue'
import { supabase } from './router/supabase.js' // или '../supabase.js', проверьте где лежит ваш файл

// Просто создаем пустой реактивный массив, который будет наполняться из БД Supabase
export const products = ref([])

// Функция загрузки, которая сразу наполняет массив
export const loadProducts = async (force = false) => {
  if (products.value.length > 0 && !force) return // Если данные уже есть, не качаем заново
  const { data } = await supabase.from('products').select('*').order('id', { ascending: true })
  products.value = data || []
}
