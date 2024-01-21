import { describe, expect, it } from 'vitest'
import { render, router, screen, waitFor } from '../test/helper'
import App from './App.vue'
import userEvent from '@testing-library/user-event'

describe('Routing', () => {
  describe.each([
    { path: '/', pageId: 'home-page' },
    { path: '/signup', pageId: 'signup-page' }
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
