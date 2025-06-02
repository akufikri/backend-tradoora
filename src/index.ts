import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { StatusCode } from 'hono/utils/http-status'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './trpc/router'
import { createContext } from './trpc/context'
import { logger } from 'hono/logger'

const app = new Hono()

app.use(logger())
app.use(
  '/trpc/*',
  cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use('/trpc/*', async (c) => {
  const trpcResponse = await fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext,
  })

  const json = await trpcResponse.json()
  const payload = json.result?.data || json
  c.status(trpcResponse.status as StatusCode)
  c.header('Content-Type', 'application/json')
  return c.body(JSON.stringify({ data: payload }))
})

export default {
  port: 3000,
  fetch: app.fetch,
}
