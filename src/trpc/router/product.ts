import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { ProductService } from '../../services/product.service'
import type { Context } from '../context'

const t = initTRPC.context<Context>().create()

export const trpcProductRouter = t.router({
  list: t.procedure.query(() => ProductService.list()),
  get: t.procedure.input(z.string()).query(({ input }) => ProductService.get(input)),
  create: t.procedure
    .input(
      z.object({
        sku: z.string(),
        slug: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number(),
        imageUrl: z.string().optional(),
        stockQuantity: z.number(),
        minimumOrderQuantity: z.number(),
      })
    )
    .mutation(({ input }) => ProductService.create(input)),
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          sku: z.string().optional(),
          slug: z.string().optional(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          imageUrl: z.string().optional(),
          stockQuantity: z.number().optional(),
          minimumOrderQuantity: z.number().optional(),
        }),
      })
    )
    .mutation(({ input }) => ProductService.update(input.id, input.data)),
  delete: t.procedure.input(z.string()).mutation(({ input }) => ProductService.delete(input)),
})
