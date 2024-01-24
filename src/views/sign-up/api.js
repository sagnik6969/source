import axios from 'axios'
import { i18n } from '@/locales/index.js'
import http from '@/lib/http'

export const signUp = (body) =>
  http.post('/api/v1/users', body, {
    headers: {
      'Accept-Language': i18n.global.locale
    }
  })
