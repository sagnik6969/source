vi.mock('@/views/activation/Activation.vue')
// The above will mock the functionality of Activation.vue
// => it will search for mock file in the __mocks__ folder
// in the actual file due to axios the test were
// failing because in the test we are not returning any response
import { describe, expect, it, vi } from 'vitest'
import { render, router, screen, waitFor } from '../test/helper'
import App from './App.vue'
import userEvent from '@testing-library/user-event'

describe('Routing', () => {
  describe.each([
    { path: '/', pageId: 'home-page' },
    { path: '/signup', pageId: 'signup-page' },
    { path: '/activation/123', pageId: 'activation-page' }
  ])('when path is $path', ({ path, pageId }) => {
    it(`displays ${pageId}`, async () => {
      router.push(path)
      await router.isReady() //Returns a Promise that resolves when
      //the router has completed the initial navigation
      render(App)

      expect(screen.getByTestId(pageId)).toBeInTheDocument()
    })
  }),
    describe.each([
      { initialPath: '/', clickingTo: 'link-signup-page', visiblePage: 'signup-page' },
      { initialPath: '/signup', clickingTo: 'link-home-page', visiblePage: 'home-page' }
    ])('when path is $initialPath', ({ initialPath, clickingTo, visiblePage }) => {
      describe(`when user clicks ${clickingTo}`, () => {
        it(`displays ${visiblePage}`, async () => {
          router.push(initialPath)
          await router.isReady()
          render(App)
          const user = userEvent.setup()
          await user.click(screen.getByTestId(clickingTo))

          await waitFor(() => {
            expect(screen.getByTestId(visiblePage)).toBeInTheDocument()
          })
        })
      })
    })
})
