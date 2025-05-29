import { Hono } from 'hono'
import { trpcHonoAdapter } from './utils/trpcHonoAdapter'

const app = new Hono()

app.all('/trpc/*', trpcHonoAdapter())

export default app
