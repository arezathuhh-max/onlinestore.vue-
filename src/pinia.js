import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../src/router/supabase.js'

export const useCartStore = defineStore('cart', () => {
  const cart = ref(JSON.parse(localStorage.getItem('cart')) || [])

  const updateQuantity = async (index, item, newQty) => {
    if (newQty < 1) return
    cart.value[index].quantity = newQty
    localStorage.setItem('cart', JSON.stringify(cart.value))
    if (item.id) {
      await supabase.from('cart_items').update({ quantity: newQty }).eq('id', item.id)
    }
  }

  const addToCart = async (product) => {
    // Приведение к String решает проблему несовпадения типов, которую вернула база данных
    const existingIndex = cart.value.findIndex(
      (item) =>
        String(item.product_id) === String(product.product_id) && item.size === product.size,
    )

    if (existingIndex !== -1) {
      const newQty = Number(cart.value[existingIndex].quantity) + Number(product.quantity)
      await updateQuantity(existingIndex, cart.value[existingIndex], newQty)
    } else {
      const { data, error } = await supabase.from('cart_items').insert(product).select().single()
      if (!error && data) {
        cart.value.push(data)
      } else {
        cart.value.push(product)
      }
      localStorage.setItem('cart', JSON.stringify(cart.value))
    }
  }

  return { cart, updateQuantity, addToCart }
})
