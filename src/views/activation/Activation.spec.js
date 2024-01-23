import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, router, waitFor } from '../../../test/helper'
import Activation from './Activation.vue'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'

let counter = 0
let token

const server = setupServer(
  http.patch('/api/v1/users/:token/active', ({ params }) => {
    counter++
    token = params.token
    return HttpResponse.json({})
  })
)

beforeEach(() => {
  counter = 0
  token = undefined
  server.resetHandlers()
})

beforeAll(() => {
  server.listen()
})

afterAll(() => {
  server.close()
})

const setUp = async (path) => {
  router.push(path)
  await router.isReady()
  render(Activation)
}

describe('Activation', () => {
  it('sends activation request to the server', async () => {
    setUp('/')
    await waitFor(() => {
      expect(counter).toBe(1)
    })
  })

  describe.each([{ ActivationToken: '12345' }, { ActivationToken: '12332' }])(
    'When token is $ActivationToken',
    ({ ActivationToken }) => {
      it(`sends request with token ${ActivationToken}`, async () => {
        await setUp(`/activation/${ActivationToken}`)
        await waitFor(() => expect(token).toBe(ActivationToken))
      })
    }
  )

  describe('when token is changes', () => {
    it('sends request with new token', async () => {
      await setUp(`/activation/123`)

      await waitFor(() => expect(token).toBe('123'))

      router.push('/activation/456')

      await waitFor(() => expect(token).toBe('456'))
    })
  })
})
