import { screen, waitFor } from '@testing-library/vue'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import User from './User.vue'
import { router, render } from '../../../test/helper'
import { i18n } from '@/locales'

let counter = 0
let id
const server = setupServer(
  http.get('/api/v1/users/:id', ({ params }) => {
    id = params.id
    counter++

    return HttpResponse.json({
      id: 1,
      username: 'user1',
      email: 'user1@mail.com',
      image: null
    })
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

beforeEach(() => server.resetHandlers())

describe('user page', () => {
  it('sends request to the server', async () => {
    router.push('/user/1')
    await router.isReady()
    render(User)
    await waitFor(() => {
      expect(counter).toBe(1)
    })
  })

  describe.each([{ UserId: '123' }, { UserId: '456' }])('when id is $UserId', ({ UserId }) => {
    it(`sends id ${UserId} in request`, async () => {
      router.push(`/user/${UserId}`)
      await router.isReady()
      render(User)
      await waitFor(() => {
        expect(id).toBe(id)
      })
    })
  })

  describe('when id is changed', () => {
    it('sends request with new id', async () => {
      router.push(`/user/1`)
      await router.isReady()
      render(User)
      await waitFor(() => {
        expect(id).toBe('1')
      })
      router.push('/user/2')
      await waitFor(() => {
        expect(id).toBe('2')
      })
    })
  })

  describe('when there is a network error', () => {
    it('displays generic error message', async () => {
      server.use(
        http.get('/api/v1/users/:id', ({ params }) => {
          return HttpResponse.error()
        })
      )

      router.push(`/user/1`)
      await router.isReady()
      render(User)
      await waitFor(() => {
        expect(screen.getByText('Unexpected error occurred, please try again')).toBeInTheDocument()
      })
    })
  })

  describe('when user is not found', () => {
    it('displays error message received in response', async () => {
      server.use(
        http.get('/api/v1/users/:id', ({ params }) => {
          return HttpResponse.json({ message: 'User not found' }, { status: 404 })
        })
      )

      router.push(`/user/1`)
      await router.isReady()
      render(User)
      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument()
      })
    })
  })

  describe('when user is found', () => {
    it('it displays user name', async () => {
      server.use(
        http.get('/api/v1/users/:id', ({ params }) => {
          return HttpResponse.json({
            id: 1,
            username: 'user1',
            email: 'user1@mail.com',
            image: null
          })
        })
      )

      router.push(`/user/1`)
      await router.isReady()
      render(User)
      await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument()
      })
    })
  })

  describe('when there is an on going api call', () => {
    it('displays spinner', async () => {
      let resolveFunc

      const promise = new Promise((resolve) => {
        resolveFunc = resolve
      })
      server.use(
        http.get('/api/v1/users/:id', async ({ params }) => {
          await resolveFunc()
          return HttpResponse.json({
            id: 1,
            username: 'user1',
            email: 'user1@mail.com',
            image: null
          })
        })
      )

      router.push(`/user/1`)
      await router.isReady()
      render(User)
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
      await resolveFunc()
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      })
    })
  })

  describe.each([{ language: 'en' }, { language: 'tr' }])(
    'when language is $language',
    ({ language }) => {
      it(`sends language = ${language} in request header`, async () => {
        let receivedLanguage
        server.use(
          http.get('/api/v1/users/:id', async ({ request }) => {
            receivedLanguage = request.headers.get('Accept-Language')

            return HttpResponse.json({
              id: 1,
              username: 'user1',
              email: 'user1@mail.com',
              image: null
            })
          })
        )

        router.push(`/user/1`)
        await router.isReady()
        i18n.global.locale = language
        render(User)

        await waitFor(() => {
          expect(receivedLanguage).toBe(language)
        })
      })
    }
  )
})
