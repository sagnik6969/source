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

describe('Sign Up', () => {
  describe('when user sets same value for password inputs', () => {
    describe('when user submits form', () => {
      it('sends username, email, password to the backend', async () => {
        const user = userEvent.setup()
        render(SignUp)
        const usernameInput = screen.getByLabelText('Username')
        const emailInput = screen.getByLabelText('E-mail')
        const passwordInput = screen.getByLabelText('Password')
        const passwordRepeatInput = screen.getByLabelText('Password Repeat')
        await user.type(usernameInput, 'user1')
        await user.type(emailInput, 'user1@mail.com')
        await user.type(passwordInput, 'P4ssword')
        await user.type(passwordRepeatInput, 'P4ssword')
        const button = screen.getByRole('button', { name: 'Sign up' })
        await user.click(button)
        expect(axios.post).toHaveBeenCalledWith('/api/v1/users', {
          username: 'user1',
          email: 'user1@mail.com',
          password: 'P4ssword'
        })
      })

      describe('when there is an ongoing api call', () => {
        it('does not allow clicking the button', async () => {
          const user = userEvent.setup()

          render(SignUp)

          const userName = screen.getByLabelText('Username')
          const email = screen.getByLabelText('E-mail')
          const password = screen.getByLabelText('Password')
          const passwordRepeat = screen.getByLabelText('Password Repeat')
          const signUpButton = screen.getByRole('button', { name: 'Sign up' })

          await user.type(userName, 'test_user')
          await user.type(email, 'text@example.com')
          await user.type(password, 'asdf')
          await user.type(passwordRepeat, 'asdf')
          await user.click(signUpButton)
          await user.click(signUpButton)

          expect(axios.post).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
})
