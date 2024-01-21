vi.mock('axios')
import { describe, expect, vi } from 'vitest'
import { i18n } from '@/locales/index.js'
import { signUp } from './api'
import axios from 'axios'

// vi.spyOn(i18n.global, 'locale', 'get').mockReturnValue('ab')
// the above and bellow implementation works exactly the same
// the second argument to vi.mock is a factory for the referred file
vi.mock('@/locales/index.js', () => {
  return {
    i18n: {
      global: {
        locale: 'ab'
      }
    }
  }
})
describe('signUp', () => {
  it('calls axios with expected params', () => {
    const body = { key: 'Value' }
    signUp(body)

    expect(axios.post).toHaveBeenCalledWith('/api/v1/users', body, {
      headers: {
        'Accept-Language': 'ab'
      }
    })
  })
})
