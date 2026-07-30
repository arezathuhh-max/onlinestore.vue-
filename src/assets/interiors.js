import { ref } from 'vue'
import { supabase } from '../router/supabase.js' // Проверьте, что этот путь к supabase.js тоже верный!

export const interiorsList = ref([])

export const loadInteriors = async () => {
  if (interiorsList.value.length > 0) return
  const { data } = await supabase.from('room_frames').select('*').order('id', { ascending: true })
  interiorsList.value = data || []
}
