import { initTRPC } from '@trpc/server'
import { Context } from './context'
import { trpcUserRouter } from "../trpc/router/user"
import { trpcProductRouter } from "../trpc/router/product"


const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
    user: trpcUserRouter,
    product: trpcProductRouter
})

export type AppRouter = typeof appRouter