vi.mock('axios')
import { render, screen, waitFor } from '@testing-library/vue'
import SignUp from './SignUp.vue'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { beforeEach, expect, vi } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()
  // to clear the mock axios before each test.
  // if we don't clear the mock we will see unexpected results
  // expect(axios.post).toHaveBeenCalledTimes(1) => this test will fail because axios is called twice in the 2 tests.
})

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

describe('Sign Up', () => {
  describe('when user sets same value for password inputs', () => {
    describe('when user submits form', () => {
      it('sends username, email, password to the backend', async () => {
        axios.post.mockResolvedValue({ data: {} })
        // returns a response then axios calls post method during testing
        const {
          user,
          elements: { signUpButton }
        } = await setup()

        await user.click(signUpButton)
        expect(axios.post).toHaveBeenCalledWith('/api/v1/users', {
          username: 'test_user',
          email: 'text@example.com',
          password: 'asdf'
        })
      })

      describe('when there is an ongoing api call', () => {
        it('does not allow clicking the button', async () => {
          // axios.post.mockResolvedValue({ data: {} })
          axios.post.mockImplementation(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({ data: {} })
              }, 1000)
            })
          })

          // If we return immediately from axios.post button will bee enabled immediately
          // which will allow user to click it again.

          const {
            user,
            elements: { signUpButton }
          } = await setup()

          await user.click(signUpButton)
          await user.click(signUpButton)

          expect(axios.post).toHaveBeenCalledTimes(1)
        })
        it('displays spinner', async () => {
          axios.post.mockImplementation(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({ data: {} })
              }, 1000)
            })
          })

          const {
            user,
            elements: { signUpButton }
          } = await setup()

          await user.click(signUpButton)

          expect(screen.getByRole('status')).toBeInTheDocument()
        })
      })

      describe('when success response is received', () => {
        beforeEach(() => {
          axios.post.mockResolvedValue({ data: { message: 'User create success' } })
        })

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
        beforeEach(() => {
          axios.post.mockRejectedValue({})
        })

        it('displays Unexpected error occurred, please try again', async () => {
          const {
            user,
            elements: { signUpButton }
          } = await setup()

          await user.click(signUpButton)

          const text = await screen.findByText('Unexpected error occurred, please try again')
          expect(text).toBeInTheDocument()
        })

        it('hides the spinner', async () => {
          const {
            user,
            elements: { signUpButton }
          } = await setup()

          await user.click(signUpButton)

          expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })

        describe('when user submits again', () => {
          it('hides the error when api request in progress', async () => {
            axios.post.mockRejectedValueOnce({}).mockResolvedValue({ data: {} })
            // first time it will reject the promise after that it will resolve the promise
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
        it(`displays ${message}`, async () => {
          axios.post.mockRejectedValue({
            response: {
              status: 400,
              data: {
                validationErrors: {
                  [field]: message
                }
              }
            }
          })

          const {
            user,
            elements: { signUpButton }
          } = await setup()

          await user.click(signUpButton)

          const error = await screen.findByText(message)

          expect(error).toBeInTheDocument()
        })

        it(`clears the error after user updates ${field}`, async () => {
          axios.post.mockRejectedValue({
            response: {
              status: 400,
              data: {
                validationErrors: {
                  [field]: message
                }
              }
            }
          })

          const { user, elements } = await setup()

          await user.click(elements.signUpButton)

          const error = await screen.findByText(message)

          await user.type(elements[`${field}`], 'updated')
          expect(error).not.toBeInTheDocument()
        })
      })
    })
  })
})
