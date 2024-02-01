import * as matchers from '@testing-library/jest-dom/matchers'
import { i18n } from './src/locales/index.js'
// import { afterEach } from 'vitest'
expect.extend(matchers)

afterEach(() => {
  i18n.global.locale = 'en'
  localStorage.clear()
})
// vi.resetModules()
