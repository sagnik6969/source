import { afterAll, beforeAll, beforeEach, describe, expect } from 'vitest'
import { render, waitFor } from '../../../test/helper'
import Activation from './Activation.vue'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'

let counter = 0

const server = setupServer(
  http.patch('/api/v1/users/:token/active', () => {
    counter++
    return HttpResponse.json({})
  })
)

beforeEach(() => {
  counter = 0
  server.resetHandlers()
})

beforeAll(() => {
  server.listen()
})

afterAll(() => {
  server.close()
})

describe('Activation', () => {
  it('sends activation request to the server', async () => {
    render(Activation)

    await waitFor(() => {
      expect(counter).toBe(1)
    })
  })
})
