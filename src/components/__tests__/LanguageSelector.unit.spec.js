vi.mock('vue-i18n')
import { describe, expect, it, vi } from 'vitest'
import LanguageSelector from '../LanguageSelector.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { useI18n } from 'vue-i18n'

const mockI18n = {
  locale: {
    value: 'en'
  }
}

vi.mocked(useI18n).mockReturnValue(mockI18n)

describe('language selector', () => {
  describe.each([{ language: 'tr' }, { language: 'en' }])(
    'when user select $language',
    ({ language }) => {
      it('displays expected text', async () => {
        const user = userEvent.setup()
        const i18n = {
          locale: 'en'
        }

        render(LanguageSelector, {
          global: {
            mocks: {
              $i18n: i18n
            }
          }
        })

        await user.click(screen.getByTestId(`language-${language}-selector`))
        expect(mockI18n.locale.value).toBe(language)
      })

      it('stores language in local storage', async () => {
        const mockSetItem = vi.spyOn(Storage.prototype, 'setItem')
        // we cant use vi.mock => vi.mocked() here because vi.mock requires a path and Storage.prototype
        // does not have a path
        // spy on does not need vi.mock('....)
        // can mock functions directly
        // first argument is the object name where function is located
        // second argument is the name of the function

        const user = userEvent.setup()
        const i18n = {
          locale: 'en'
        }

        render(LanguageSelector, {
          global: {
            mocks: {
              $i18n: i18n
            }
          }
        })

        await user.click(screen.getByTestId(`language-${language}-selector`))
        expect(mockSetItem).toHaveBeenCalledWith('app-lang', language)
      })
    }
  )
})
