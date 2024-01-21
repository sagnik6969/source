import { describe, expect, it } from 'vitest'
import { render, router, screen } from '../test/helper'
import App from './App.vue'

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
  })
})
