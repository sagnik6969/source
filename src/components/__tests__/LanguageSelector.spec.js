import { describe, expect, it } from 'vitest'
import LanguageSelector from '../LanguageSelector.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '../../../test/helper.js'

// the state of language selector is preserved in between tests.
// in the bellow tests if there are tests after the given tests the value of the
// language selector will be tr.
// to solve this issue
// afterEach(() => {
// i18n.global.locale = 'en'
// })

describe('language selector', () => {
  describe.each([
    { language: 'en', text: 'Sign up' },
    { language: 'tr', text: 'Kayt Ol' }
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
