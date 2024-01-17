import { render, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'

import SignUp from './SignUp.vue'

describe('sign up', () => {
  it('has signup header', () => {
    render(SignUp)
    // const element = screen.getByText('Sign Up')
    const header = screen.getByRole('heading', { name: 'Sign Up' })

    expect(header).toBeInTheDocument()
  })
})
