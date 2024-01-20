import { describe, expect, it } from 'vitest'
import LanguageSelector from '../LanguageSelector.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

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
        expect(i18n.locale).toBe(language)
      })
    }
  )
})
