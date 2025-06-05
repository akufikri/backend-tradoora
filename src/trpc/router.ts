import { initTRPC } from '@trpc/server'
import { Context } from './context'
import { trpcUserRouter } from "../trpc/router/user"
import { trpcProductRouter } from "../trpc/router/product"
import { categoryRouter } from './router/category'
import { cartItemRouter } from './router/cartItem'
import { transactionRouter } from './router/transaction'
import { reviewRouter } from './router/review'


const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
    user: trpcUserRouter,
    product: trpcProductRouter,
    category: categoryRouter,
    cart: cartItemRouter,
    transaction: transactionRouter,
    review: reviewRouter
})

export type AppRouter = typeof appRouter