import { render, screen, waitFor } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import SignUp from './SignUp.vue'
import userEvent from '@testing-library/user-event'
import { delay, http } from 'msw'
import { setup, requestBody, counter, server } from './SignUp.spec'

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

  it('does not have spinner', () => {
    render(SignUp)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    // spinner has a role attribute.
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
            // if we don't add the delay form will vanish immediately after
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
    })
  })
})
