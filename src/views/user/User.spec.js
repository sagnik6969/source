import { screen, waitFor } from '@testing-library/vue'
import { HttpResponse, delay, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import User from './User.vue'
import App from '@/App.vue'
import { router, render } from '../../../test/helper'
import { i18n } from '@/locales'
import userEvent from '@testing-library/user-event'

let counter = 0
let id
let requestBody

let userDeleteId
let userDeleteCounter = 0

let userUpdateCounter = 0
let userUpdateId = 0
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
  }),
  http.put('/api/v1/users/:id', async ({ params, request }) => {
    userUpdateCounter++
    userUpdateId = params.id
    try {
      requestBody = await request.json()
    } catch {}
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
  requestBody = undefined
  userUpdateCounter = 0
  userUpdateId = undefined
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

  describe('when user is not logged in', () => {
    it('does not display the edit button', async () => {
      const user = userEvent.setup()
      router.push(`/user/1`)
      await router.isReady()
      render(User)
      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    })
  })

  describe('when user is logged in', () => {
    it('displays the edit button', async () => {
      localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

      const user = userEvent.setup()
      router.push(`/user/1`)
      await router.isReady()
      render(User)

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Edit' })).toBeInTheDocument()
      )
    })

    describe('when user clicks edit button', () => {
      it('hides username edit and delete button', async () => {
        localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

        const user = userEvent.setup()
        router.push(`/user/1`)
        await router.isReady()
        render(User)

        const editButton = await screen.findByRole('button', { name: 'Edit' })
        expect(editButton).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
        expect(screen.getByText('user1')).toBeInTheDocument()

        await user.click(editButton)

        expect(editButton).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
        expect(screen.queryByText('user1')).not.toBeInTheDocument()
      })

      it('display username input', async () => {
        localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

        const user = userEvent.setup()
        router.push(`/user/1`)
        await router.isReady()
        render(User)

        const editButton = await screen.findByRole('button', { name: 'Edit' })
        await user.click(editButton)

        expect(screen.getByLabelText('Username')).toBeInTheDocument()
      })

      it('displays username input with initial value of users name', async () => {
        localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

        const user = userEvent.setup()
        router.push(`/user/1`)
        await router.isReady()
        render(User)

        const editButton = await screen.findByRole('button', { name: 'Edit' })
        await user.click(editButton)
        expect(screen.getByLabelText('Username').value).toBe('user1')
      })

      it('displays save button', async () => {
        localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

        const user = userEvent.setup()
        router.push(`/user/1`)
        await router.isReady()
        render(User)
        const editButton = await screen.findByRole('button', { name: 'Edit' })
        await user.click(editButton)

        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })

      it('displays cancel button', async () => {
        localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

        const user = userEvent.setup()
        router.push(`/user/1`)
        await router.isReady()
        render(User)
        const editButton = await screen.findByRole('button', { name: 'Edit' })
        await user.click(editButton)

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      describe('Edit Page', () => {
        describe('when user clicks cancel', () => {
          it('removes the edit form', async () => {
            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)
            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await user.click(cancelButton)
            expect(cancelButton).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Username')).not.toBeInTheDocument()
            expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
            expect(screen.queryByRole('button', { name: 'Edit' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
            expect(screen.getByText('user1')).toBeInTheDocument()
          })
        })

        describe('when user changes the original username input and clicks cancel', () => {
          it('shows original username', async () => {
            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))

            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            await user.type(username, 'abcd')

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            expect(screen.queryByAltText('user1')).not.toBeInTheDocument()
            await user.click(cancelButton)
            expect(screen.getByText('user1')).toBeInTheDocument()
          })
        })

        describe('describe when user clicks save', () => {
          it('sends appropriate request to backend', async () => {
            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            await user.type(username, 'abcd')

            const saveButton = screen.getByRole('button', { name: 'Save' })

            await user.click(saveButton)

            await waitFor(() => {
              expect(userUpdateCounter).toBe(1)
              expect(userUpdateId).toBe('1')
            })
          })

          it('has request body having the value user entered', async () => {
            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            user.clear(username) // to clear username input
            await user.type(username, 'abcd')

            const saveButton = screen.getByRole('button', { name: 'Save' })
            await user.click(saveButton)

            await waitFor(() => {
              expect(requestBody?.username).toBe('abcd')
            })
          })

          describe('when api request in progress', () => {
            it('displays spinner', async () => {
              server.use(
                http.put('/api/v1/users/:id', async ({ params, request }) => {
                  await delay('infinite')
                })
              )

              localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
              const user = userEvent.setup()
              router.push(`/user/1`)
              await router.isReady()
              render(User)
              const editButton = await screen.findByRole('button', { name: 'Edit' })
              await user.click(editButton)

              const username = screen.getByLabelText('Username')
              user.clear(username) // to clear username input
              await user.type(username, 'abcd')

              const saveButton = screen.getByRole('button', { name: 'Save' })
              await user.click(saveButton)

              expect(screen.getByRole('status')).toBeInTheDocument()
            })

            it('disables the button', async () => {
              server.use(
                http.put('/api/v1/users/:id', async ({ params, request }) => {
                  await delay('infinite')
                })
              )

              localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
              const user = userEvent.setup()
              router.push(`/user/1`)
              await router.isReady()
              render(User)
              const editButton = await screen.findByRole('button', { name: 'Edit' })
              await user.click(editButton)

              const username = screen.getByLabelText('Username')
              user.clear(username) // to clear username input
              await user.type(username, 'abcd')

              const saveButton = screen.getByRole('button', { name: 'Save' })
              await user.click(saveButton)

              // expect(screen.getByRole('status')).toBeInTheDocument()
              expect(saveButton).toBeDisabled()
              expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
            })
          })

          describe('when user hits enter', () => {
            it('submits the form', async () => {
              localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
              const user = userEvent.setup()
              router.push(`/user/1`)
              await router.isReady()
              render(User)
              const editButton = await screen.findByRole('button', { name: 'Edit' })
              await user.click(editButton)

              const username = screen.getByLabelText('Username')
              user.clear(username) // to clear username input
              await user.type(username, 'abcd')

              // const saveButton = screen.getByRole('button', { name: 'Save' })
              await user.keyboard('{enter}')

              await waitFor(() => {
                expect(userUpdateCounter).toBe(1)
              })
            })
          })
        })

        describe('when backend returns success', () => {
          it('displays the non edit mode', async () => {
            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            user.clear(username) // to clear username input
            await user.type(username, 'abcd')

            const saveButton = screen.getByRole('button', { name: 'Save' })
            await user.click(saveButton)

            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument()
            })
          })

          it('shows updated username in profile section', async () => {
            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            user.clear(username) // to clear username input
            await user.type(username, 'abcd')

            const saveButton = screen.getByRole('button', { name: 'Save' })
            await user.click(saveButton)
            await waitFor(() => {
              expect(screen.getByText('abcd')).toBeInTheDocument()
            })
          })

          it('shows updated username in navbar', async () => {
            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(App)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            user.clear(username) // to clear username input
            await user.type(username, 'abcd')

            const saveButton = screen.getByRole('button', { name: 'Save' })
            await user.click(saveButton)
            await waitFor(() => {
              expect(screen.getByTestId('user-nav').innerHTML).toBe('abcd')
            })
          })
        })

        describe('when request fails with network error', () => {
          it('displays generic error message', async () => {
            server.use(
              http.put('/api/v1/users/:id', async ({ params, request }) => {
                return HttpResponse.error()
              })
            )

            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            user.clear(username) // to clear username input
            await user.type(username, 'abcd')

            const saveButton = screen.getByRole('button', { name: 'Save' })
            await user.click(saveButton)

            waitFor(() => {
              expect(
                screen.getByText('Unexpected error occurred, please try again')
              ).toBeInTheDocument()
            })
          })

          it('enables button', async () => {
            server.use(
              http.put('/api/v1/users/:id', async ({ params, request }) => {
                return HttpResponse.error()
              })
            )

            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            user.clear(username) // to clear username input
            await user.type(username, 'abcd')

            const saveButton = screen.getByRole('button', { name: 'Save' })
            await user.click(saveButton)

            await waitFor(() => {
              expect(saveButton).toBeEnabled()
            })
          })

          it('hides the spinner', async () => {
            server.use(
              http.put('/api/v1/users/:id', async ({ params, request }) => {
                await delay()
                return HttpResponse.error()
              })
            )

            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            user.clear(username) // to clear username input
            await user.type(username, 'abcd')

            const saveButton = screen.getByRole('button', { name: 'Save' })
            await user.click(saveButton)

            await waitFor(() => {
              expect(screen.queryByRole('status')).not.toBeInTheDocument()
            })
          })

          describe('when user submits again', () => {
            it('hides the errors', async () => {
              server.use(
                http.put('/api/v1/users/:id', async ({ params, request }) => {
                  await delay()
                  return HttpResponse.error()
                })
              )

              localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
              const user = userEvent.setup()
              router.push(`/user/1`)
              await router.isReady()
              render(User)
              const editButton = await screen.findByRole('button', { name: 'Edit' })
              await user.click(editButton)

              const username = screen.getByLabelText('Username')
              user.clear(username) // to clear username input
              await user.type(username, 'abcd')

              const saveButton = screen.getByRole('button', { name: 'Save' })
              await user.click(saveButton)

              const error = await screen.findByText('Unexpected error occurred, please try again')
              expect(saveButton).toBeEnabled()
              await user.click(saveButton)
              expect(error).not.toBeInTheDocument()
            })
          })
        })

        describe('when request fails with validation error', () => {
          it('it displays error received from backend', async () => {
            server.use(
              http.put('/api/v1/users/:id', async ({ params, request }) => {
                return HttpResponse.json(
                  {
                    validationErrors: {
                      username: 'username is not valid'
                    }
                  },
                  { status: 400 }
                )
              })
            )

            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)

            const username = screen.getByLabelText('Username')
            user.clear(username) // to clear username input
            await user.type(username, 'abcd')

            const saveButton = screen.getByRole('button', { name: 'Save' })
            await user.click(saveButton)
            await waitFor(() => {
              expect(screen.getByText('username is not valid')).toBeInTheDocument()
            })
          })

          describe('when user changes username', () => {
            it('hides the validation error', async () => {
              server.use(
                http.put('/api/v1/users/:id', async ({ params, request }) => {
                  return HttpResponse.json(
                    {
                      validationErrors: {
                        username: 'username is not valid'
                      }
                    },
                    { status: 400 }
                  )
                })
              )

              localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
              const user = userEvent.setup()
              router.push(`/user/1`)
              await router.isReady()
              render(User)
              const editButton = await screen.findByRole('button', { name: 'Edit' })
              await user.click(editButton)

              const username = screen.getByLabelText('Username')
              user.clear(username) // to clear username input
              await user.type(username, 'abcd')

              const saveButton = screen.getByRole('button', { name: 'Save' })
              await user.click(saveButton)
              const validationError = await screen.findByText('username is not valid')
              await user.type(username, 'mno')
              expect(validationError).not.toBeInTheDocument()
            })
          })
        })

        it('displays file upload input', async () => {
          localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
          const user = userEvent.setup()
          router.push(`/user/1`)
          await router.isReady()
          render(User)
          const editButton = await screen.findByRole('button', { name: 'Edit' })
          await user.click(editButton)
          const fileUploadInput = screen.getByLabelText('Select Image')
          expect(fileUploadInput).toBeInTheDocument()
          expect(fileUploadInput).toHaveAttribute('type', 'file')
        })

        describe('when user selects a photo', () => {
          it('displays it in existing profile image', async () => {
            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)
            const fileUploadInput = screen.getByLabelText('Select Image')

            await user.upload(
              fileUploadInput,
              new File(['hello'], 'hello.png', { type: 'image/png' })
            )
            const image = screen.getByAltText('user-image')
            await waitFor(() => {
              expect(image).toHaveAttribute('src', 'data:image/png;base64,aGVsbG8=')
            })
          })

          describe('when user clicks cancel button', () => {
            it('displays default image', async () => {
              localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
              const user = userEvent.setup()
              router.push(`/user/1`)
              await router.isReady()
              render(User)
              const editButton = await screen.findByRole('button', { name: 'Edit' })
              await user.click(editButton)
              const fileUploadInput = screen.getByLabelText('Select Image')

              await user.upload(
                fileUploadInput,
                new File(['hello'], 'hello.png', { type: 'image/png' })
              )
              await user.click(screen.getByRole('button', { name: 'Cancel' }))

              const image = screen.getByAltText('user-image')
              await waitFor(() => {
                expect(image).not.toHaveAttribute('src', 'data:image/png;base64,aGVsbG8=')
              })
            })
          })

          it('sends request with image', async () => {
            let requestBody
            server.use(
              http.put('/api/v1/users/:id', async ({ params, request }) => {
                requestBody = await request.json()
              })
            )

            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)
            const fileUploadInput = screen.getByLabelText('Select Image')

            await user.upload(
              fileUploadInput,
              new File(['hello'], 'hello.png', { type: 'image/png' })
            )
            await user.click(screen.getByRole('button', { name: 'Save' }))

            await waitFor(() => {
              // console.log(requestBody)
              expect(requestBody).toStrictEqual({
                username: 'user1',
                image: 'aGVsbG8='
              })
            })
          })
        })

        it('displays image served from backend', async () => {
          server.use(
            http.put('/api/v1/users/:id', async ({ params, request }) => {
              return HttpResponse.json({ username: 'user3', image: 'uploaded-image.png' })
            })
          )

          localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
          const user = userEvent.setup()
          router.push(`/user/1`)
          await router.isReady()
          render(User)
          const editButton = await screen.findByRole('button', { name: 'Edit' })
          await user.click(editButton)
          const fileUploadInput = screen.getByLabelText('Select Image')

          await user.upload(
            fileUploadInput,
            new File(['hello'], 'hello.png', { type: 'image/png' })
          )
          await user.click(screen.getByRole('button', { name: 'Save' }))

          await waitFor(() => {
            expect(screen.getByAltText('user-image')).toHaveAttribute('src', 'uploaded-image.png')
          })
        })
        describe('when image is invalid', () => {
          it('displays validation error', async () => {
            server.use(
              http.put('/api/v1/users/:id', () => {
                return HttpResponse.json(
                  {
                    validationErrors: {
                      image: 'Only png or jpeg files are allowed'
                    }
                  },
                  { status: 400 }
                )
              })
            )

            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)
            const fileUploadInput = screen.getByLabelText('Select Image')

            await user.upload(
              fileUploadInput,
              new File(['hello'], 'hello.png', { type: 'image/png' })
            )
            await user.click(screen.getByRole('button', { name: 'Save' }))

            await waitFor(() => {
              expect(screen.getByText('Only png or jpeg files are allowed')).toBeInTheDocument()
            })
          })

          it('clears validation error when user selects new image', async () => {
            server.use(
              http.put('/api/v1/users/:id', () => {
                return HttpResponse.json(
                  {
                    validationErrors: {
                      image: 'Only png or jpeg files are allowed'
                    }
                  },
                  { status: 400 }
                )
              })
            )

            localStorage.setItem('auth', JSON.stringify({ id: 1, username: 'user1' }))
            const user = userEvent.setup()
            router.push(`/user/1`)
            await router.isReady()
            render(User)
            const editButton = await screen.findByRole('button', { name: 'Edit' })
            await user.click(editButton)
            const fileUploadInput = screen.getByLabelText('Select Image')

            await user.upload(
              fileUploadInput,
              new File(['hello'], 'hello.png', { type: 'image/png' })
            )
            await user.click(screen.getByRole('button', { name: 'Save' }))

            const error = await screen.findByText('Only png or jpeg files are allowed')

            await user.upload(fileUploadInput, new File(['hi'], 'hi.png', { type: 'image/png' }))

            expect(error).not.toBeInTheDocument()
          })
        })
      })
    })
  })
})
