import { describe, expect, it } from 'vitest'
import LanguageSelector from '../LanguageSelector.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '../../../test/helper.js'

describe('language selector', () => {
  describe.each([
    { language: 'tr', text: 'Kayt Ol' },
    { language: 'en', text: 'Sign up' }
  ])('when user select $language', ({ language, text }) => {
    it('displays expected text', async () => {
      const user = userEvent.setup()
      const TestComponent = {
        components: {
          LanguageSelector
        },
        template: `<span>{{$t('signUp')}}</span>
        <LanguageSelector />`
      }

      render(TestComponent)

      await user.click(screen.getByTestId(`language-${language}-selector`))
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })
})
