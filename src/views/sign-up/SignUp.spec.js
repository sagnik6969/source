import { render, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'

import SignUp from './SignUp.vue'
import userEvent from '@testing-library/user-event'

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
})

// https://testing-library.com/docs/queries/about
// getBy vs queryBy
// must read
