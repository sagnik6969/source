vi.mock('@/lib/http')
vi.mock('vue-i18n')
vi.mock('vue-router')
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, router, screen, waitFor } from '../../../test/helper'
import Activation from './Activation.vue'
import { i18n } from '@/locales'
import http from '@/lib/http'
import { useI18n } from 'vue-i18n'
import en from '@/locales/translations/en.json'
import { useRoute } from 'vue-router'
import { reactive } from 'vue'

vi.mocked(useI18n).mockReturnValue({
  t: (key) => en[key]
})

vi.mocked(useRoute).mockReturnValue({
  params: {
    token: '123'
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

const setUp = async (token) => {
  const result = render(Activation, {
    global: {
      mocks: {}
    }
  })
}

describe('Activation', () => {
  it('sends activation request to the server', async () => {
    setUp('/')
    await waitFor(() => {
      expect(http.patch).toHaveBeenCalledTimes(1)
    })
  })

  describe.each([{ ActivationToken: '12345' }, { ActivationToken: '12332' }])(
    'When token is $ActivationToken',
    ({ ActivationToken }) => {
      it(`sends request with token ${ActivationToken}`, async () => {
        vi.mocked(useRoute).mockReturnValue({
          params: {
            token: `${ActivationToken}`
          }
        })

        await setUp()
        await waitFor(() =>
          expect(http.patch).toHaveBeenCalledWith(`/api/v1/users/${ActivationToken}/active`)
        )
      })
    }
  )

  describe('when token changes', () => {
    it('sends request with new token', async () => {
      const route = reactive({
        params: {
          token: `654`
        }
      })

      vi.mocked(useRoute).mockReturnValue(route)

      await setUp()

      await waitFor(() => expect(http.patch).toHaveBeenCalledWith(`/api/v1/users/654/active`))

      route.params.token = '12345'
      await waitFor(() => expect(http.patch).toHaveBeenCalledWith(`/api/v1/users/12345/active`))
    })
  }),
    describe('when there is an ongoing api request', () => {
      it('displays spinner', async () => {
        let resolveFunc
        vi.mocked(http.patch).mockReturnValue(
          new Promise((resolve, reject) => {
            resolveFunc = resolve
          })
        )
        setUp()
        const spinner = await screen.findByRole('status')
        expect(spinner).toBeInTheDocument()
        resolveFunc({})
        waitFor(() => expect(spinner).not.toBeInTheDocument())

        // await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
      })

      describe('when request is success', () => {
        it('displays the message coming from backend', async () => {
          //   server.use(
          //     http.patch('/api/v1/users/:token/active', () => {
          //       return HttpResponse.json({
          //         message: 'Hi Sagnik'
          //       })
          //     })
          //   )

          vi.mocked(http.patch).mockResolvedValue({
            data: {
              message: 'Hi Sagnik'
            }
          })
          await setUp()
          await waitFor(() => expect(screen.getByText('Hi Sagnik')).toBeInTheDocument())
        })
      })

      describe('When request fails', () => {
        describe('if the error is because of network', () => {
          it('displays generic error', async () => {
            vi.mocked(http.patch).mockRejectedValue({})

            await setUp()
            await waitFor(() =>
              expect(
                screen.getByText('Unexpected error occurred, please try again')
              ).toBeInTheDocument()
            )
          })
        })

        describe('if the backend responds with error', () => {
          it('display the message', async () => {
            vi.mocked(http.patch).mockRejectedValue({
              response: {
                status: 400,
                data: {
                  message: 'asdf'
                }
              }
            })
            await setUp()
            await waitFor(() => expect(screen.getByText('asdf')).toBeInTheDocument())
          })
        })
      })
    })
})
