vi.mock('axios')
import { render, screen } from '@testing-library/vue'
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
      signUpButton
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
      })
    })
  })
})
