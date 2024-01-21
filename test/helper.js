import router from '@/router/index.js'
import { i18n } from '../src/locales/index.js'
import { render } from '@testing-library/vue'

const customRender = (component, options) =>
  render(component, {
    global: {
      plugins: [i18n, router]
    },
    ...options
  })

export * from '@testing-library/vue'
export { customRender as render }
export { router }
