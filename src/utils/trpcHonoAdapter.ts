import type { Context } from 'hono'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../trpc/router'
import { createContext } from '../trpc/context'

export function trpcHonoAdapter() {
  return async (c: Context) => {
    const endpoint = '/trpc'

    const response = await fetchRequestHandler({
      endpoint,
      req: c.req.raw,
      router: appRouter,
      createContext: (opts) =>
        createContext({
          req: opts.req,
          resHeaders: opts.resHeaders,
          info: opts.info,
        }),
      onError({ error }) {
        console.error('[tRPC Error]', error)
      },
    })

    const originalJson = await response.json()
    const data = originalJson.result?.data
    const error = originalJson.error

    if (error) {
      return c.json({
        success: false,
        message: error.message,
        data: null,
      }, Number(response.status) as 400 | 401 | 403 | 404 | 500)
    }

    return c.json(data, Number(response.status) as 200 | 201)
  }
}
