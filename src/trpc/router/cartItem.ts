import { initTRPC } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';

import { cartService } from '../../services/cart.service'; 
import {
  updateQtySchema,
  removeCartItemSchema,
} from "../../schema/cart.schema";

const t = initTRPC.context<Context>().create();

const requireAuth = (ctx: Context) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }
  return ctx.user;
};

export const cartItemRouter = t.router({
  add: t.procedure
    .input(z.object({
      productId: z.string(),
      qty: z.number().positive(),
    }))
    .mutation(({ input, ctx }) => {
      const user = requireAuth(ctx);
      
      return cartService.addToCart({
        userId: user.id,
        productId: input.productId,
        qty: input.qty,
      });
    }),

  list: t.procedure
    .query(({ ctx }) => {
      const user = requireAuth(ctx);
      
      return cartService.listCart({
        userId: user.id,
      });
    }),

  updateQty: t.procedure
    .input(updateQtySchema)
    .mutation(({ input, ctx }) => {
      const user = requireAuth(ctx);
      
      return cartService.updateQuantity(input);
    }),

  remove: t.procedure
    .input(removeCartItemSchema)
    .mutation(({ input, ctx }) => {
      const user = requireAuth(ctx);
      
      return cartService.remove(input);
    }),

  clear: t.procedure
    .mutation(({ ctx }) => {
      const user = requireAuth(ctx);
      
      return cartService.clear({
        userId: user.id,
      });
    }),

  count: t.procedure
    .query(({ ctx }) => {
      const user = requireAuth(ctx);
      
      return cartService.count({
        userId: user.id,
      });
    }),

  checkExists: t.procedure
    .input(z.object({
      productId: z.string(),
    }))
    .query(({ input, ctx }) => {
      const user = requireAuth(ctx);
      
      return cartService.checkExists({
        userId: user.id,
        productId: input.productId,
      });
    }),
});