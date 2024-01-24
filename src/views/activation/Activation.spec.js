import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { render, router, screen, waitFor } from '../../../test/helper'
import Activation from './Activation.vue'
import { setupServer } from 'msw/node'
import { HttpResponse, delay, http } from 'msw'

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

  describe('when token changes', () => {
    it('sends request with new token', async () => {
      await setUp(`/activation/123`)

      await waitFor(() => expect(token).toBe('123'))

      router.push('/activation/456')

      await waitFor(() => expect(token).toBe('456'))
    })
  }),
    describe('when there is an ongoing api request', () => {
      it('displays spinner', async () => {
        server.use(
          http.patch('/api/v1/users/:token/active', async () => {
            await delay('infinite')
            return HttpResponse.json({})
          })
        )

        await setUp('/activation/123')

        await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
      })

      describe('when request is success', () => {
        it('hides the spinner', async () => {
          await setUp('/activation/123')
          await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
        })

        it('displays the message coming from backend', async () => {
          server.use(
            http.patch('/api/v1/users/:token/active', () => {
              return HttpResponse.json({
                message: 'Hi Sagnik'
              })
            })
          )
          await setUp('/activation/123')
          await waitFor(() => expect(screen.getByText('Hi Sagnik')).toBeInTheDocument())
        })
      })

      describe('When request fails', () => {
        describe('if the error is because of network', () => {
          it('displays generic error', async () => {
            server.use(
              http.patch('/api/v1/users/:token/active', () => {
                return HttpResponse.error()
              })
            )
            await setUp('/activation/123')
            waitFor(() =>
              expect(screen.getByText('something went wrong please try later')).toBeInTheDocument()
            )
          })
        })

        describe('if the backend responds with error', () => {
          it('display the message', async () => {
            server.use(
              http.patch('/api/v1/users/:token/active', () => {
                return HttpResponse.json(
                  {
                    message: 'asdf'
                  },
                  { status: 400 }
                )
              })
            )
            await setUp('/activation/123')
            await waitFor(() => expect(screen.getByText('asdf')).toBeInTheDocument())
          })
        })
      })
    })
})
