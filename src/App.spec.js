vi.mock('@/views/activation/Activation.vue')
vi.mock('@/views/home/components/UserList.vue')
vi.mock('@/views/user/User.vue')
// The above will mock the functionality of Activation.vue
// => it will search for mock file in the __mocks__ folder
// in the actual file due to axios the test were
// failing because in the test we are not returning any response
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, router, screen, waitFor } from '../test/helper'
import App from './App.vue'
import userEvent from '@testing-library/user-event'
import LogIn from './views/log-in/LogIn.vue'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'

let requestBody
let counter = 0
let logoutCount = 0
const server = setupServer(
  http.post('/api/v1/auth', async ({ request }) => {
    requestBody = await request.json()
    counter += 1
    return HttpResponse.json({ id: 1, username: 'user1', email: 'user1@mail.com', image: null })
  }),
  http.post('/api/v1/logout', () => {
    logoutCount++
    return HttpResponse.json({})
  })
)

beforeEach(() => {
  counter = 0
  logoutCount = 0
  server.resetHandlers()
  // to reset server.use before every test
})

beforeAll(() => server.listen())

afterAll(() => server.close())

describe('Routing', () => {
  describe.each([
    { path: '/', pageId: 'home-page' },
    { path: '/signup', pageId: 'signup-page' },
    { path: '/activation/123', pageId: 'activation-page' },
    { path: '/password-reset/request', pageId: 'password-reset-request-page' },
    { path: '/password-reset/set', pageId: 'password-reset-set-page' },
    { path: '/user/1', pageId: 'user-page' },
    { path: '/user/2', pageId: 'user-page' },
    { path: '/login', pageId: 'login-page' }
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
      { initialPath: '/', clickingTo: 'link-login-page', visiblePage: 'login-page' },
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

  describe('when user is at the homepage', () => {
    describe('when user clicks user name in user list', () => {
      it('displays user page', async () => {
        const user = userEvent.setup()
        router.push('/')
        await router.isReady()
        render(App)
        const link = await screen.findByText('user1')
        await user.click(link)
        await waitFor(() => {
          expect(screen.getByTestId('user-page')).toBeInTheDocument()
        })
      })
    })
  })

  describe('when user is at login page', () => {
    describe('when user clicks forget password link', () => {
      it('displays password request page', async () => {
        const user = userEvent.setup()
        router.push('/login')
        await router.isReady()
        render(LogIn)
        const link = await screen.findByText('Forgot password?')
        await user.click(link)
        await waitFor(() => {
          expect(screen.getByTestId('login-page')).toBeInTheDocument()
        })
      })
    })
  })

  describe('when login is successFull', () => {
    it('it navigates to homepage', async () => {
      router.push('/login')
      await router.isReady()
      render(App)
      const user = userEvent.setup()
      const password = screen.getByLabelText('Password')
      const email = screen.getByLabelText('E-mail')
      const button = screen.getByRole('button', { name: 'Log In' })

      await user.type(password, 'abc')
      await user.type(email, 'a@b.com')
      expect(button).toBeEnabled()
      await user.click(button)

      await waitFor(() => {
        expect(screen.queryByTestId('home-page')).toBeInTheDocument()
      })
    })

    it('hides the login and signup links', async () => {
      router.push('/login')
      await router.isReady()
      render(App)
      const user = userEvent.setup()
      const password = screen.getByLabelText('Password')
      const email = screen.getByLabelText('E-mail')
      const button = screen.getByRole('button', { name: 'Log In' })

      await user.type(password, 'abc')
      await user.type(email, 'a@b.com')
      expect(button).toBeEnabled()
      await user.click(button)
      await screen.findByTestId('home-page')

      expect(screen.queryByTestId('link-signup-page')).not.toBeInTheDocument()
      expect(screen.queryByTestId('link-login-page')).not.toBeInTheDocument()
    })

    describe('when user clicks My Profile', () => {
      it('displays user page', async () => {
        router.push('/login')
        await router.isReady()
        render(App)
        const user = userEvent.setup()
        const password = screen.getByLabelText('Password')
        const email = screen.getByLabelText('E-mail')
        const button = screen.getByRole('button', { name: 'Log In' })

        await user.type(password, 'abc')
        await user.type(email, 'a@b.com')
        expect(button).toBeEnabled()
        await user.click(button)
        await screen.findByTestId('home-page')

        await user.click(screen.queryByTestId('link-my-profile'))
        await screen.findByTestId('user-page')
        expect(router.currentRoute.value.path).toBe('/user/1')
      })
    })

    it('stores logged in state in local storage', async () => {
      router.push('/login')
      await router.isReady()
      render(App)
      const user = userEvent.setup()
      const password = screen.getByLabelText('Password')
      const email = screen.getByLabelText('E-mail')
      const button = screen.getByRole('button', { name: 'Log In' })

      await user.type(password, 'abc')
      await user.type(email, 'a@b.com')
      expect(button).toBeEnabled()
      await user.click(button)
      await screen.findByTestId('home-page')

      const state = JSON.parse(localStorage.getItem('auth'))
      expect(state.id).toBe(1)
      expect(state.username).toBe('user1')
    })

    describe('when local storage has auth data', () => {
      it('displays logged in layout', async () => {
        localStorage.setItem(
          'auth',
          JSON.stringify({ id: 1, username: 'user1', email: 'user1@mail.com' })
        )

        const user = userEvent.setup()
        router.push('/')
        await router.isReady()
        render(App)

        await waitFor(() => {
          expect(screen.queryByTestId('link-signup-page')).not.toBeInTheDocument()
          expect(screen.queryByTestId('link-login-page')).not.toBeInTheDocument()
          expect(screen.queryByTestId('link-my-profile')).toBeInTheDocument()
        })
      })

      describe('when user clicks logout', () => {
        it('displays login and signup links', async () => {
          localStorage.setItem(
            'auth',
            JSON.stringify({ id: 1, username: 'user1', email: 'user1@mail.com' })
          )

          const user = userEvent.setup()
          router.push('/')
          await router.isReady()
          render(App)
          await user.click(screen.getByTestId('link-logout'))

          expect(screen.queryByTestId('link-signup-page')).toBeInTheDocument()
          expect(screen.queryByTestId('link-login-page')).toBeInTheDocument()
          expect(screen.queryByTestId('link-my-profile')).not.toBeInTheDocument()
        })

        it('sends logout request to server', async () => {
          localStorage.setItem(
            'auth',
            JSON.stringify({ id: 1, username: 'user1', email: 'user1@mail.com' })
          )

          const user = userEvent.setup()
          router.push('/')
          await router.isReady()
          render(App)
          await user.click(screen.getByTestId('link-logout'))

          await waitFor(() => {
            expect(logoutCount).toBe(1)
          })
        })
      })
    })
  })
})
