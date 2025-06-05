import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { StatusCode } from 'hono/utils/http-status'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './trpc/router'
import { createContext } from './trpc/context'
import { logger } from 'hono/logger'
import { transactionService } from './services/transaction.service'

const app = new Hono()

app.use(logger())

app.all("/midtrans/callback", async (c) => {
  if (c.req.method === "POST") {
    const payload = await c.req.json();
    try {
      await transactionService.handleCallback(payload);
      return c.json({ message: "Callback processed" }, 200);
    } catch (err) {
      console.error("Callback error:", err);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  } else if (c.req.method === "GET") {
    return c.text("Callback endpoint reached with GET. Expecting POST from Midtrans.");
  }
  return c.text("Method not allowed for callback", 405);
});

app.use(
  '/trpc/*',
  cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'trpc-batch-mode'],
  })
)

app.all('/trpc/*', async (c) => {
  const response = await fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext,
  });

  return response;
})

export default {
  port: 3000,
  fetch: app.fetch,
}
