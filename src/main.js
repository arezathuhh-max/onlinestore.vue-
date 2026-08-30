import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Добавить импорт

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia() // 2. Создать экземпляр

app.use(pinia) // 3. Подключить к приложению ДО роутера
app.use(router)

app.mount('#app')
