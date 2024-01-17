vi.mock('axios') // to test api calls
import { render, screen } from '@testing-library/vue'
import { describe, it, expect, vi } from 'vitest'

import SignUp from './SignUp.vue'
import userEvent from '@testing-library/user-event'
import axios from 'axios'

describe('sign up', () => {
  it('has signup header', () => {
    render(SignUp)
    // const element = screen.getByText('Sign Up')
    const header = screen.getByRole('heading', { name: 'Sign Up' })

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

      expect(axios.post).toHaveBeenCalledWith('api/vi/users', {
        username: 'test_user',
        email: 'text@example.com',
        password: 'asdf'
      })
    })
  })
})

// https://testing-library.com/docs/queries/about
// getBy vs queryBy
// must read
