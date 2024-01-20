import { afterEach, describe, expect, it, vi } from 'vitest'
import { createInstance } from './index.js'

const mockNavigatorLanguage = vi.spyOn(window.navigator, 'language', 'get')
// language is getter function.
// 'get' => tels vi that language is a getter function

afterEach(() => {
  mockNavigatorLanguage.mockReset()
})

describe('createInstance', () => {
  describe('app-lang is not set in local storage', () => {
    describe('when browser language is undefined', () => {
      it('sets language to en', () => {
        mockNavigatorLanguage.mockReturnValue(undefined)
        const i18n = createInstance()
        expect(i18n.global.locale).toBe('en')
      })
    })

    describe('when browser language is set', () => {
      it('sets the language to browser language', () => {
        mockNavigatorLanguage.mockReturnValue('beng')
        const i18n = createInstance()
        expect(i18n.global.locale).toBe('beng')
      })
    })
  })

  describe('when app language is set in local storage', () => {
    it('sets the language from local storage', () => {
      localStorage.setItem('app-lang', 'asdf')
      const i18n = createInstance()
      expect(i18n.global.locale).toBe('asdf')
    })
  })
})
