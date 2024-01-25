import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import Request from './Request.vue'
import { render, screen, waitFor } from '../../../../test/helper'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import { i18n } from '@/locales'

let requestBody

const server = setupServer(
  http.post('/api/v1/users/password-reset', async ({ request }) => {
    requestBody = await request.json()
    return HttpResponse.json({})
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

beforeEach(() => {
  requestBody = undefined
  server.resetHandlers()
})

describe('password reset request page', () => {
  it('has E-mail input', () => {
    render(Request)
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('has password Reset button', () => {
    render(Request)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  describe('button', () => {
    it('is initially disabled', () => {
      render(Request)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('when user fills the input', () => {
    describe('Button', () => {
      it('is enabled', async () => {
        render(Request)
        const email = screen.getByLabelText('E-mail')
        const button = screen.getByRole('button')

        const user = userEvent.setup()
        await user.type(email, 'abc@def.com')
        expect(button).toBeEnabled()
      })
    })
  })

  describe('when user submits form', () => {
    it('has request body with specified email', async () => {
      render(Request)
      const email = screen.getByLabelText('E-mail')
      const button = screen.getByRole('button')
      const user = userEvent.setup()
      await user.type(email, 'abc@def.com')
      await user.click(button)

      await waitFor(() => {
        expect(requestBody.email).toBe('abc@def.com')
      })
    })

    describe('when request fails with validation', () => {
      it('displays validation error to the user', async () => {
        server.use(
          http.post('/api/v1/users/password-reset', ({ request }) => {
            return HttpResponse.json(
              {
                validationErrors: {
                  email: 'email is not valid'
                }
              },
              { status: 400 }
            )
          })
        )

        render(Request)
        const email = screen.getByLabelText('E-mail')
        const button = screen.getByRole('button')
        const user = userEvent.setup()
        await user.type(email, 'abc@def.com')
        await user.click(button)

        await waitFor(() => {
          expect(screen.getByText('email is not valid')).toBeInTheDocument()
        })
      })

      it('clears the error after user changes input value', async () => {
        server.use(
          http.post('/api/v1/users/password-reset', ({ request }) => {
            return HttpResponse.json(
              {
                validationErrors: {
                  email: 'email is not valid'
                }
              },
              { status: 400 }
            )
          })
        )

        render(Request)
        const email = screen.getByLabelText('E-mail')
        const button = screen.getByRole('button')
        const user = userEvent.setup()
        await user.type(email, 'abc@def.com')
        await user.click(button)

        await waitFor(async () => await user.type(email, 'abc@def.com'))
        expect(screen.queryByText('email is not valid')).not.toBeInTheDocument()
      })
    })

    describe('when request fails with 404 not found error', () => {
      it('displays message returned from backend', async () => {
        server.use(
          http.post('/api/v1/users/password-reset', ({ request }) => {
            return HttpResponse.json(
              {
                message: 'abcd'
              },
              { status: 404 }
            )
          })
        )

        render(Request)
        const email = screen.getByLabelText('E-mail')
        const button = screen.getByRole('button')
        const user = userEvent.setup()
        await user.type(email, 'abc@def.com')
        await user.click(button)

        await waitFor(() => expect(screen.getByText('abcd')).toBeInTheDocument())
      })
    })

    describe('when request fails with network error', () => {
      it('displays generic error message', async () => {
        server.use(
          http.post('/api/v1/users/password-reset', ({ request }) => {
            return HttpResponse.error()
          })
        )

        render(Request)
        const email = screen.getByLabelText('E-mail')
        const button = screen.getByRole('button')
        const user = userEvent.setup()
        await user.type(email, 'abc@def.com')
        await user.click(button)
        expect(screen.getByText('Unexpected error occurred, please try again')).toBeInTheDocument()
      })
    })

    describe('when user submits the form again after failure', () => {
      it('hides the error', async () => {
        server.use(
          http.post('/api/v1/users/password-reset', ({ request }) => {
            return HttpResponse.error()
          })
        )

        render(Request)
        const email = screen.getByLabelText('E-mail')
        const button = screen.getByRole('button')
        const user = userEvent.setup()
        await user.type(email, 'abc@def.com')
        await user.click(button)

        const error = await screen.findByText('Unexpected error occurred, please try again')
        expect(error).toBeInTheDocument()
        await user.click(button)

        await waitFor(() => expect(error).not.toBeInTheDocument())
      })
    })

    describe('when request is successful', () => {
      it('display the message returned from backend', async () => {
        server.use(
          http.post('/api/v1/users/password-reset', ({ request }) => {
            return HttpResponse.json({
              message: 'abcd'
            })
          })
        )

        render(Request)
        const email = screen.getByLabelText('E-mail')
        const button = screen.getByRole('button')
        const user = userEvent.setup()
        await user.type(email, 'abc@def.com')
        await user.click(button)

        await waitFor(() => {
          expect(screen.getByText('abcd')).toBeInTheDocument()
        })
      })
    })

    describe.each([{ language: 'tr' }, { language: 'en' }])(
      'when language is $language',
      ({ language }) => {
        it(`it sends request with language ${language} in header`, async () => {
          let requestLang
          server.use(
            http.post('/api/v1/users/password-reset', ({ request }) => {
              requestLang = request.headers.get('Accept-Language')
              return HttpResponse.json({})
            })
          )

          render(Request)
          i18n.global.locale = language

          const email = screen.getByLabelText('E-mail')
          const button = screen.getByRole('button')
          const user = userEvent.setup()
          await user.type(email, 'abc@def.com')
          await user.click(button)

          await waitFor(() => {
            expect(requestLang).toBe(language)
          })
        })
      }
    )
  })
})
