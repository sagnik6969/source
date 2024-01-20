// vi.mock('axios') // to test api calls
// if the above line is not commented the test with msw will fail
import { findByText, render, screen, waitFor } from '../../../test/helper.js'
import { describe, it, expect, vi, assert, beforeEach, beforeAll, afterAll } from 'vitest'
import SignUp from './SignUp.vue'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { HttpResponse, delay, http } from 'msw'

let requestBody
let counter = 0
const server = setupServer(
  http.post('/api/v1/users', async ({ request }) => {
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
  const result = render(SignUp)
  const userName = screen.getByLabelText('Username')
  const email = screen.getByLabelText('E-mail')
  const password = screen.getByLabelText('Password')
  const passwordRepeat = screen.getByLabelText('Password Repeat')
  const signUpButton = screen.getByRole('button', { name: 'Sign up' })

  await user.type(userName, 'test_user')
  await user.type(email, 'text@example.com')
  await user.type(password, 'asdf')
  await user.type(passwordRepeat, 'asdf')

  return {
    ...result,
    user,
    elements: {
      username: userName,
      email,
      signUpButton,
      password,
      passwordRepeat
    }
  }
}

describe('sign up', () => {
  it('has signup header', () => {
    render(SignUp)
    // const element = screen.getByText('Sign Up')
    const header = screen.getByRole('heading', { name: 'Sign up' })

    expect(header).toBeInTheDocument()
  })

  it('has username input', () => {
    const { container } = render(SignUp)

    // expect(container.querySelector('input')).toBeInTheDocument()
    // querySelector => same way as css

    // expect(screen.queryByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.queryByLabelText('Username')).toBeInTheDocument()
  })

  it('has email input', () => {
    const { container } = render(SignUp)

    // expect(container.querySelector('input[type="email"]')).toBeInTheDocument()
    // querySelector => same way as css

    // expect(screen.queryByPlaceholderText('E-mail')).toBeInTheDocument()
    expect(screen.queryByLabelText('E-mail')).toBeInTheDocument()
  })

  it('has password input', () => {
    render(SignUp)
    expect(screen.queryByLabelText('Password')).toBeInTheDocument()
  })

  it('has password type for password input', () => {
    render(SignUp)
    expect(screen.queryByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('has password type for password repeat input', () => {
    render(SignUp)
    expect(screen.queryByLabelText('Password Repeat')).toHaveAttribute('type', 'password')
  })

  it('has sign up button', () => {
    render(SignUp)
    const signUpButton = screen.getByRole('button', { name: 'Sign up' })
    expect(signUpButton).toBeInTheDocument()
  })

  it('has sign up button disabled initially', () => {
    render(SignUp)
    const signUpButton = screen.getByRole('button', { name: 'Sign up' })
    expect(signUpButton).toBeDisabled()
  })

  it('does not have spinner', () => {
    render(SignUp)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    // spinner has a role attribute.
  })

  describe('when passwords do not match', () => {
    it('displays error', async () => {
      const {
        user,
        elements: { signUpButton, password, passwordRepeat }
      } = await setup()

      await user.type(password, 'abc')
      await user.type(passwordRepeat, 'def')

      expect(screen.getByText('Password mismatch')).toBeInTheDocument()
    })
  })

  describe('when user sets same value for passwords inputs', () => {
    it('enable buttons', async () => {
      const user = userEvent.setup()
      render(SignUp)

      const password = screen.queryByLabelText('Password')
      const passwordRepeat = screen.queryByLabelText('Password Repeat')

      await user.type(password, 'asdf')
      await user.type(passwordRepeat, 'asdf')

      const signUpButton = screen.getByRole('button', { name: 'Sign up' })
      expect(signUpButton).toBeEnabled()
    })
  })

  describe('when user submits form', () => {
    it('sends username email and password to the backend', async () => {
      const {
        user,
        elements: { signUpButton }
      } = await setup()

      await user.click(signUpButton)

      await waitFor(() => {
        expect(requestBody).toEqual({
          username: 'test_user',
          email: 'text@example.com',
          password: 'asdf'
        })
      })
    })

    describe('when there is an ongoing api call', () => {
      it('does not allow clicking the button', async () => {
        const {
          user,
          elements: { signUpButton }
        } = await setup()

        await user.click(signUpButton)
        await user.click(signUpButton)

        await waitFor(() => {
          expect(counter).toBe(1)
        })
      })

      it('displays spinner', async () => {
        server.use(
          http.post('/api/v1/users', async ({ request }) => {
            // if we don't add the delay form will vanish immediately after completion of the request
            // and we wont be able to capture the loading spinner.
            await delay('infinite')
          })
        )

        const {
          user,
          elements: { signUpButton }
        } = await setup()

        await user.click(signUpButton)

        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    describe('when success response is received', () => {
      it('displays message received from backend', async () => {
        const {
          user,
          elements: { signUpButton }
        } = await setup()

        await user.click(signUpButton)
        const text = await screen.findByText('User create success')
        // findByText => asynchronous function
        // by default waits for 1s for the element to appear.
        expect(text).toBeInTheDocument()
      })

      it('hides signup form', async () => {
        const {
          user,
          elements: { signUpButton }
        } = await setup()

        await user.click(signUpButton)

        await waitFor(() => {
          expect(screen.queryByTestId('form-sign-up')).not.toBeInTheDocument()
        })
      })
    })

    describe('when there is a network error', () => {
      it('displays Unexpected error occurred, please try again', async () => {
        server.use(
          http.post('/api/v1/users', ({ request }) => {
            return HttpResponse.error()
          })
        )

        const {
          user,
          elements: { signUpButton }
        } = await setup()

        await user.click(signUpButton)

        const text = await screen.findByText('Unexpected error occurred, please try again')
        expect(text).toBeInTheDocument()
      })

      it('hides the spinner', async () => {
        server.use(
          http.post('/api/v1/users', ({ request }) => {
            return HttpResponse.error()
          })
        )

        const {
          user,
          elements: { signUpButton }
        } = await setup()

        await user.click(signUpButton)

        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      })

      describe('when user submits again', () => {
        it('hides the error when api request in progress', async () => {
          let processedFirstRequest = false

          server.use(
            http.post('/api/v1/users', ({ request }) => {
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
            elements: { signUpButton }
          } = await setup()

          user.click(signUpButton)
          const text = await screen.findByText('Unexpected error occurred, please try again')

          user.click(signUpButton)

          await waitFor(() => {
            expect(text).not.toBeInTheDocument()
          })
        })
      })
    })

    describe.each([
      { field: 'username', message: 'username cant be null' },
      { field: 'email', message: 'E-mail cant be null' },
      { field: 'password', message: 'Password cant be null' }
    ])('when $field is invalid', ({ field, message }) => {
      // $field will be replaced by actual field value => done automatically be vitest
      it(`displays ${message}`, async () => {
        server.use(
          http.post('/api/v1/users', ({ request }) => {
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
          elements: { signUpButton }
        } = await setup()

        await user.click(signUpButton)

        const error = await screen.findByText(message)

        expect(error).toBeInTheDocument()
      })

      it(`clears the error after user updates ${field}`, async () => {
        server.use(
          http.post('/api/v1/users', ({ request }) => {
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

        await user.click(elements.signUpButton)

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
