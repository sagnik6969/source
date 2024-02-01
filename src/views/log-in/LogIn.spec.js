// vi.mock('axios') // to test api calls
// if the above line is not commented the test with msw will fail
import { findByText, render, screen, waitFor } from '../../../test/helper.js'
import { describe, it, expect, vi, assert, beforeEach, beforeAll, afterAll } from 'vitest'
// import SignUp from './SignUp.vue'
import LogIn from './LogIn.vue'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { HttpResponse, delay, http } from 'msw'
import { i18n } from '@/locales/index.js'

let requestBody
let counter = 0
const server = setupServer(
  http.post('/api/v1/auth', async ({ request }) => {
    requestBody = await request.json()
    counter += 1
    return HttpResponse.json({ message: 'User create success' })
  })
)

beforeEach(() => {
  counter = 0
  server.resetHandlers()
  // to reset server.use before every test
})

beforeAll(() => server.listen())

afterAll(() => server.close())

const setup = async () => {
  const user = userEvent.setup()
  const result = render(LogIn)
  //   const userName = screen.getByLabelText('Username')
  const email = screen.getByLabelText('E-mail')
  const password = screen.getByLabelText('Password')
  //   const passwordRepeat = screen.getByLabelText('Password Repeat')
  const loginButton = screen.getByRole('button', { name: 'Log In' })

  //   await user.type(userName, 'test_user')
  await user.type(email, 'text@example.com')
  await user.type(password, 'asdf')
  //   await user.type(passwordRepeat, 'asdf')

  return {
    ...result,
    user,
    elements: {
      //   username: userName,
      email,
      loginButton,
      password
      //   passwordRepeat
    }
  }
}

describe('sign up', () => {
  it('has login header', () => {
    render(LogIn)
    // const element = screen.getByText('Sign Up')
    const header = screen.getByRole('heading', { name: 'Log In' })

    expect(header).toBeInTheDocument()
  })

  it('has email input', () => {
    const { container } = render(LogIn)

    expect(screen.queryByLabelText('E-mail')).toBeInTheDocument()
  })

  it('has password input', () => {
    render(LogIn)
    expect(screen.queryByLabelText('Password')).toBeInTheDocument()
  })

  it('has password type for password input', () => {
    render(LogIn)
    expect(screen.queryByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('has log in button', () => {
    render(LogIn)
    const loginButton = screen.getByRole('button', { name: 'Log In' })
    expect(loginButton).toBeInTheDocument()
  })

  it('has log in button disabled initially', () => {
    render(LogIn)
    const loginButton = screen.getByRole('button', { name: 'Log In' })
    expect(loginButton).toBeDisabled()
  })

  it('does not have spinner', () => {
    render(LogIn)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    // spinner has a role attribute.
  })

  describe('when user enters email and password', () => {
    it('enable buttons', async () => {
      const user = userEvent.setup()
      render(LogIn)

      const password = screen.queryByLabelText('Password')
      // const passwordRepeat = screen.queryByLabelText('Password Repeat')
      const email = screen.getByLabelText('E-mail')

      await user.type(password, 'asdf')
      // await user.type(passwordRepeat, 'asdf')
      await user.type(email, 'a@b')
      const logInButton = screen.getByRole('button', { name: 'Log In' })
      expect(logInButton).toBeEnabled()
    })
  })

  describe('when user submits form', () => {
    it('sends email and password to the backend', async () => {
      const {
        user,
        elements: { loginButton }
      } = await setup()

      await user.click(loginButton)

      await waitFor(() => {
        expect(requestBody).toStrictEqual({
          email: 'text@example.com',
          password: 'asdf'
        })
      })
    })

    describe.each([{ language: 'tr' }, { language: 'en' }])(
      'when $language is language',
      ({ language }) => {
        it('sends expected language in accept language header', async () => {
          let acceptLanguage

          server.use(
            http.post('/api/v1/auth', ({ request }) => {
              acceptLanguage = request.headers.get('Accept-Language')
              return HttpResponse.json({})
            })
          )

          const {
            user,
            elements: { loginButton }
          } = await setup()

          i18n.global.locale = 'en'

          await user.click(loginButton)

          await waitFor(() => {
            expect(acceptLanguage).toBe('en')
          })
        })
      }
    )

    describe('when there is an ongoing api call', () => {
      it('does not allow clicking the button', async () => {
        const {
          user,
          elements: { loginButton }
        } = await setup()

        await user.click(loginButton)
        await user.click(loginButton)

        await waitFor(() => {
          expect(counter).toBe(1)
        })
      })

      it('displays spinner', async () => {
        server.use(
          http.post('/api/v1/auth', async ({ request }) => {
            await delay('infinite')
          })
        )

        const {
          user,
          elements: { loginButton }
        } = await setup()

        await user.click(loginButton)

        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    // describe('when success response is received', () => {
    //   it('displays message received from backend', async () => {
    //     const {
    //       user,
    //       elements: { loginButton }
    //     } = await setup()

    //     await user.click(loginButton)
    //     const text = await screen.findByText('User create success')
    //     // findByText => asynchronous function
    //     // by default waits for 1s for the element to appear.
    //     expect(text).toBeInTheDocument()
    //   })

    //   it('hides signup form', async () => {
    //     const {
    //       user,
    //       elements: { signUpButton }
    //     } = await setup()

    //     await user.click(signUpButton)

    //     await waitFor(() => {
    //       expect(screen.queryByTestId('form-sign-up')).not.toBeInTheDocument()
    //     })
    //   })
    // })

    describe('when there is a network error', () => {
      it('displays Unexpected error occurred, please try again', async () => {
        server.use(
          http.post('/api/v1/auth', ({ request }) => {
            return HttpResponse.error()
          })
        )

        const {
          user,
          elements: { loginButton }
        } = await setup()

        await user.click(loginButton)

        const text = await screen.findByText('Unexpected error occurred, please try again')
        expect(text).toBeInTheDocument()
      })

      it('hides the spinner', async () => {
        server.use(
          http.post('/api/v1/auth', ({ request }) => {
            return HttpResponse.error()
          })
        )

        const {
          user,
          elements: { loginButton }
        } = await setup()

        await user.click(loginButton)

        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      })

      describe('when user submits again', () => {
        it('hides the error when api request in progress', async () => {
          let processedFirstRequest = false

          server.use(
            http.post('/api/v1/auth', ({ request }) => {
              if (!processedFirstRequest) {
                processedFirstRequest = true
                return HttpResponse.error()
              } else {
                return HttpResponse.json({})
              }
            })
          )

          const {
            user,
            elements: { loginButton }
          } = await setup()

          user.click(loginButton)
          const text = await screen.findByText('Unexpected error occurred, please try again')

          user.click(loginButton)

          await waitFor(() => {
            expect(text).not.toBeInTheDocument()
          })
        })
      })
    })

    describe.each([
      { field: 'email', message: 'E-mail cant be null' },
      { field: 'password', message: 'Password cant be null' }
    ])('when $field is invalid', ({ field, message }) => {
      // $field will be replaced by actual field value => done automatically be vitest
      it(`displays ${message}`, async () => {
        server.use(
          http.post('/api/v1/auth', ({ request }) => {
            return HttpResponse.json(
              {
                validationErrors: {
                  [field]: message
                }
              },
              { status: 400 }
            )
          })
        )

        const {
          user,
          elements: { loginButton }
        } = await setup()

        await user.click(loginButton)

        const error = await screen.findByText(message)

        expect(error).toBeInTheDocument()
      })

      it(`clears the error after user updates ${field}`, async () => {
        server.use(
          http.post('/api/v1/auth', ({ request }) => {
            return HttpResponse.json(
              {
                validationErrors: {
                  [field]: message
                }
              },
              { status: 400 }
            )
          })
        )

        const { user, elements } = await setup()

        await user.click(elements.loginButton)

        const error = await screen.findByText(message)

        await user.type(elements[`${field}`], 'updated')
        expect(error).not.toBeInTheDocument()
      })
    })
  })
})

// https://testing-library.com/docs/queries/about
// getBy vs queryBy
// must read

// if we use any library other than axios for api call the this test wont work for this we need
// mock service worker. => sets up a mock server for testing.
