import { createI18n } from 'vue-i18n'
import en from './translations/en.json'
import tr from './translations/tr.json'

export const createInstance = () =>
  createI18n({
    locale: localStorage.getItem('app-lang') || navigator.language || 'en',
    messages: {
      'en-US': en,
      en,
      tr
    }
  })

export const i18n = createInstance()
