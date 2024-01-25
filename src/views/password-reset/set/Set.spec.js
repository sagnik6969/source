import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import Set from './Set.vue'
import { render, router, screen, waitFor } from '../../../../test/helper'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import { i18n } from '@/locales'

let requestBody
let requestToken
const server = setupServer(
  http.patch('/api/v1/users/:token/password-reset', async ({ request, params }) => {
    requestBody = await request.json()
    requestToken = params.token

    return HttpResponse.json({})
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

beforeEach(() => server.resetHandlers())

describe('password reset set page', () => {
  it('has password input', () => {
    render(Set)
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })
  it('has password repeat input', () => {
    render(Set)
    expect(screen.getByLabelText('Password Repeat')).toBeInTheDocument()
  })
  it('has password reset button', () => {
    render(Set)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  describe('Button', () => {
    it('is initially disabled', () => {
      render(Set)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('when there is mismatch in password and passwordRepeat fields', () => {
    it('displays password mismatch error', async () => {
      const user = userEvent.setup()
      render(Set)

      const password = screen.getByLabelText('Password')
      const passwordRepeat = screen.getByLabelText('Password Repeat')
      const button = screen.getByRole('button')

      await user.type(password, 'abc')
      await user.type(passwordRepeat, 'def')

      expect(screen.getByText('Password mismatch')).toBeInTheDocument()
    })
  })

  describe('when password are matching', () => {
    it('enables the button', async () => {
      const user = userEvent.setup()

      render(Set)
      const password = screen.getByLabelText('Password')
      const passwordRepeat = screen.getByLabelText('Password Repeat')
      const button = screen.getByRole('button')

      await user.type(password, 'abc')
      await user.type(passwordRepeat, 'abc')

      expect(button).toBeEnabled()
    })
  })

  describe('when user submits form', () => {
    it('sends patch request to backend with password field', async () => {
      const user = userEvent.setup()

      render(Set)
      router.push('/password-reset/set?tk=1234')
      const password = screen.getByLabelText('Password')
      const passwordRepeat = screen.getByLabelText('Password Repeat')
      const button = screen.getByRole('button')

      await user.type(password, 'abc')
      await user.type(passwordRepeat, 'abc')
      await user.click(button)

      await waitFor(() => {
        expect(requestBody?.password).toBe('abc')
        expect(requestToken).toBe('1234')
      })
    })

    describe('when request fails with validation error', () => {
      it('displays validation error to the user', async () => {
        server.use(
          http.patch('/api/v1/users/:token/password-reset', ({ request }) => {
            return HttpResponse.json(
              {
                validationErrors: {
                  password: 'password is not valid'
                }
              },
              { status: 400 }
            )
          })
        )

        render(Set)
        const user = userEvent.setup()
        const password = screen.getByLabelText('Password')
        const passwordRepeat = screen.getByLabelText('Password Repeat')
        const button = screen.getByRole('button')

        await user.type(password, 'abc')
        await user.type(passwordRepeat, 'abc')
        await user.click(button)

        await waitFor(() => {
          expect(screen.getByText('password is not valid')).toBeInTheDocument()
        })
      })

      it('clears the error after user changes password value', async () => {
        server.use(
          http.patch('/api/v1/users/:token/password-reset', ({ request }) => {
            return HttpResponse.json(
              {
                validationErrors: {
                  password: 'password is not valid'
                }
              },
              { status: 400 }
            )
          })
        )

        render(Set)
        const user = userEvent.setup()
        const password = screen.getByLabelText('Password')
        const passwordRepeat = screen.getByLabelText('Password Repeat')
        const button = screen.getByRole('button')

        await user.type(password, 'abc')
        await user.type(passwordRepeat, 'abc')
        await user.click(button)

        const errorMessage = await screen.findByText('password is not valid')
        expect(errorMessage).toBeInTheDocument()
        await user.type(password, 'abcde')

        expect(errorMessage).not.toBeInTheDocument()
      })
    })

    describe('when request fails with invalid token (400 bad request)', () => {
      it('displays message returned from backend', async () => {
        server.use(
          http.patch('/api/v1/users/:token/password-reset', ({ request }) => {
            return HttpResponse.json(
              {
                message: 'token is not valid'
              },
              { status: 400 }
            )
          })
        )

        render(Set)
        const user = userEvent.setup()
        const password = screen.getByLabelText('Password')
        const passwordRepeat = screen.getByLabelText('Password Repeat')
        const button = screen.getByRole('button')

        await user.type(password, 'abc')
        await user.type(passwordRepeat, 'abc')
        await user.click(button)
        await waitFor(() => expect(screen.getByText('token is not valid')).toBeInTheDocument())
      })
    })

    describe('when request fails with network error', () => {
      it('displays generic error', async () => {
        server.use(
          http.patch('/api/v1/users/:token/password-reset', ({ request }) => {
            return HttpResponse.error()
          })
        )

        render(Set)
        const user = userEvent.setup()
        const password = screen.getByLabelText('Password')
        const passwordRepeat = screen.getByLabelText('Password Repeat')
        const button = screen.getByRole('button')

        await user.type(password, 'abc')
        await user.type(passwordRepeat, 'abc')
        await user.click(button)
        await waitFor(() =>
          expect(
            screen.getByText('Unexpected error occurred, please try again')
          ).toBeInTheDocument()
        )
      })
    })

    describe('when form is submitted again', () => {
      it('hides all the errors', async () => {
        server.use(
          http.patch('/api/v1/users/:token/password-reset', ({ request }) => {
            return HttpResponse.error()
          })
        )

        render(Set)
        const user = userEvent.setup()
        const password = screen.getByLabelText('Password')
        const passwordRepeat = screen.getByLabelText('Password Repeat')
        const button = screen.getByRole('button')

        await user.type(password, 'abc')
        await user.type(passwordRepeat, 'abc')
        await user.click(button)

        const error = await screen.findByText('Unexpected error occurred, please try again')
        expect(error).toBeInTheDocument()
        await user.click(button)
        expect(error).not.toBeInTheDocument()
      })
    })

    describe.each([{ language: 'tr' }, { language: 'en' }])(
      'when language is $language',
      ({ language }) => {
        it(`it sends request with language ${language} in header`, async () => {
          let requestLang
          server.use(
            http.patch('/api/v1/users/:token/password-reset', ({ request }) => {
              requestLang = request.headers.get('Accept-Language')
              return HttpResponse.json({})
            })
          )

          render(Set)
          i18n.global.locale = language

          const user = userEvent.setup()
          const password = screen.getByLabelText('Password')
          const passwordRepeat = screen.getByLabelText('Password Repeat')
          const button = screen.getByRole('button')

          await user.type(password, 'abc')
          await user.type(passwordRepeat, 'abc')
          await user.click(button)

          await waitFor(() => {
            expect(requestLang).toBe(language)
          })
        })
      }
    )
  })
})
