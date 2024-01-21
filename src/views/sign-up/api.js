import axios from 'axios'
import { i18n } from '@/locales/index.js'

export const signUp = (body) =>
  axios.post('/api/v1/users', body, {
    headers: {
      'Accept-Language': i18n.global.locale
    }
  })
