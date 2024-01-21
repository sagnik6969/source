import './assets/styles.scss'
import { createApp } from 'vue'
import { i18n } from './locales/index.js'
// import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(i18n)
// app.use(createPinia())
app.use(router)

app.mount('#app')

// test file name is same as component name followed by .spec.js
// npm run test:unit => to run tests
