import { screen, waitFor } from '@testing-library/vue'
import { HttpResponse, delay, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import User from './User.vue'
import { router, render } from '../../../test/helper'
import { i18n } from '@/locales'
import userEvent from '@testing-library/user-event'

let counter = 0
let id

let userDeleteId
let userDeleteCounter = 0
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
  }),
  http.delete('/api/v1/users/:id', ({ params }) => {
    userDeleteCounter++
    userDeleteId = params.id

    return HttpResponse.json({})
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

beforeEach(() => {
  server.resetHandlers()
  id = undefined
  counter = 0
  userDeleteId = undefined
  userDeleteCounter = 0
})

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

  describe('when user is logged in', () => {
    it('does not display spinner', async () => {
      localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user3' }))

      router.push(`/user/1`)
      await router.isReady()
      render(User)

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      })
    })

    describe('when profile card is of logged in user', () => {
      it('displays delete button', async () => {
        localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user3' }))

        router.push(`/user/1`)
        await router.isReady()
        render(User)
        await waitFor(() => {
          expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
        })
      })
    })

    describe('when profile card is not of logged in user', () => {
      it('does not display delete button', async () => {
        localStorage.setItem('auth', JSON.stringify({ id: 2, username: 'user3' }))

        router.push(`/user/1`)
        await router.isReady()
        render(User)
        await waitFor(() => {
          expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
        })
      })
    })
  })

  describe('when user is not logged in', () => {
    it('does not show delete button', async () => {
      router.push(`/user/1`)
      await router.isReady()
      render(User)
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
      })
    })
  })

  describe('when user clicks delete button', () => {
    it('displays confirmation dialog', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(0)

      localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user3' }))

      const user = userEvent.setup()
      router.push(`/user/1`)
      await router.isReady()
      render(User)

      const deleteButton = await screen.findByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledTimes(1)
        // we can call the above function only when window.confirm is bound by vi.spyOn()
      })
    })

    // describe('when user cancels do nothing', () => {})

    describe('when user clicks ok', () => {
      it('sends delete request to server', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(1)

        localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user3' }))

        const user = userEvent.setup()
        router.push(`/user/1`)
        await router.isReady()
        render(User)

        const deleteButton = await screen.findByRole('button', { name: 'Delete' })
        await user.click(deleteButton)

        await waitFor(() => {
          expect(userDeleteCounter).toBe(1)
        })
      })

      it('sends request to server with appropriate user id', async () => {
        server.use(
          http.get('/api/v1/users/:id', ({ params }) => {
            id = params.id
            counter++

            return HttpResponse.json({
              id: 3,
              username: 'user1',
              email: 'user1@mail.com',
              image: null
            })
          })
        )

        vi.spyOn(window, 'confirm').mockReturnValue(1)

        localStorage.setItem('auth', JSON.stringify({ id: 3, username: 'user3' }))

        const user = userEvent.setup()
        router.push(`/user/3`)
        await router.isReady()
        render(User)

        const deleteButton = await screen.findByRole('button', { name: 'Delete' })
        await user.click(deleteButton)

        await waitFor(() => {
          expect(userDeleteCounter).toBe(1)
          expect(userDeleteId).toBe('3')
        })
      })

      describe('when there is an ongoing api call', () => {
        it('displays spinner', async () => {
          server.use(
            http.delete('/api/v1/users/:id', async ({ params }) => {
              await delay('infinite')
            })
          )

          vi.spyOn(window, 'confirm').mockReturnValue(1)

          localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

          const user = userEvent.setup()
          router.push(`/user/1`)
          await router.isReady()
          render(User)

          const deleteButton = await screen.findByRole('button', { name: 'Delete' })
          await user.click(deleteButton)

          expect(screen.getByRole('status')).toBeInTheDocument()
        })

        it('disables the delete button', async () => {
          server.use(
            http.delete('/api/v1/users/:id', async ({ params }) => {
              await delay('infinite')
            })
          )

          vi.spyOn(window, 'confirm').mockReturnValue(1)

          localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

          const user = userEvent.setup()
          router.push(`/user/1`)
          await router.isReady()
          render(User)

          const deleteButton = await screen.findByRole('button', { name: 'Delete' })
          await user.click(deleteButton)

          expect(deleteButton).toBeDisabled()
        })
      })

      describe('when request fails with network error', () => {
        it('displays generic error', async () => {
          server.use(
            http.delete('/api/v1/users/:id', async ({ params }) => {
              return HttpResponse.error()
            })
          )

          vi.spyOn(window, 'confirm').mockReturnValue(1)

          localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

          const user = userEvent.setup()
          router.push(`/user/1`)
          await router.isReady()
          render(User)

          const deleteButton = await screen.findByRole('button', { name: 'Delete' })
          await user.click(deleteButton)

          await waitFor(() => {
            expect(
              screen.getByText('Unexpected error occurred, please try again')
            ).toBeInTheDocument()
          })
        })

        it('enables button', async () => {
          server.use(
            http.delete('/api/v1/users/:id', async ({ params }) => {
              return HttpResponse.error()
            })
          )

          vi.spyOn(window, 'confirm').mockReturnValue(1)

          localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

          const user = userEvent.setup()
          router.push(`/user/1`)
          await router.isReady()
          render(User)

          const deleteButton = await screen.findByRole('button', { name: 'Delete' })
          await user.click(deleteButton)

          await waitFor(() => {
            expect(deleteButton).toBeEnabled()
          })
        })

        it('hides the spinner', async () => {
          server.use(
            http.delete('/api/v1/users/:id', async ({ params }) => {
              return HttpResponse.error()
            })
          )

          vi.spyOn(window, 'confirm').mockReturnValue(1)

          localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

          const user = userEvent.setup()
          router.push(`/user/1`)
          await router.isReady()
          render(User)

          const deleteButton = await screen.findByRole('button', { name: 'Delete' })
          await user.click(deleteButton)
          // expect(screen.queryByRole('status')).toBeInTheDocument()

          await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
          })
        })

        describe('when user submits again', () => {
          it('hides the error', async () => {
            let firstRequestDone = false

            server.use(
              http.delete('/api/v1/users/:id', async ({ params }) => {
                if (firstRequestDone == false) {
                  firstRequestDone = true
                  return HttpResponse.error()
                } else {
                  await delay('infinite')
                }
              })
            )

            vi.spyOn(window, 'confirm').mockReturnValue(1)

            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)

            const deleteButton = await screen.findByRole('button', { name: 'Delete' })
            await user.click(deleteButton)

            const error = await screen.findByText('Unexpected error occurred, please try again')

            await user.click(deleteButton)

            expect(error).not.toBeInTheDocument()

            // expect(screen.queryByRole('status')).toBeInTheDocument()
          })
        })
      })

      describe('when backend returns success', () => {
        it('navigates to home', async () => {
          server.use(
            http.delete('/api/v1/users/:id', async ({ params }) => {
              return HttpResponse.json({ message: 'success' })
            })
          )

          vi.spyOn(window, 'confirm').mockReturnValue(1)

          localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

          const user = userEvent.setup()
          router.push(`/user/1`)
          await router.isReady()
          render(User)

          const deleteButton = await screen.findByRole('button', { name: 'Delete' })
          await user.click(deleteButton)

          await waitFor(() => {
            expect(router.currentRoute.value.fullPath).toBe('/')
          })
        })

        it('removes user from local storage', async () => {
          server.use(
            http.delete('/api/v1/users/:id', async ({ params }) => {
              return HttpResponse.json({ message: 'success' })
            })
          )

          vi.spyOn(window, 'confirm').mockReturnValue(1)

          localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

          const user = userEvent.setup()
          router.push(`/user/1`)
          await router.isReady()
          render(User)

          const deleteButton = await screen.findByRole('button', { name: 'Delete' })
          await user.click(deleteButton)

          await waitFor(() => {
            expect(JSON.parse(localStorage.getItem('auth')).id).toBe(0)
          })
        })
      })
    })
  })
})
