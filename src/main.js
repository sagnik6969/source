import './assets/styles.scss'
import { createApp } from 'vue'
import { i18n } from './locales/index.js'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(i18n)
app.use(createPinia())
app.use(router)

app.mount('#app')

// test file name is same as component name followed by .spec.js
// npm run test:unit => to run tests

// you can use reactive / ref inside tests
// const f = vi.fn => to create a mock function => mainly to pass to a component which is under test.
// we can assert different things in f like other vi.mocked() => functions.

// npm run test:int => to run only integration tests => vitest.int.config.js
// npm run test:unit => to run only unit tests => vitest.unit.config.js
// npm run test => to run all tests
