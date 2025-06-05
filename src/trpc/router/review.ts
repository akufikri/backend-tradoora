// reviewRouter.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { reviewService } from '../../services/review.service';
import { createReviewSchema } from '../../types/review.type';

const t = initTRPC.context<Context>().create();

export const reviewRouter = t.router({
  create: t.procedure
    .input(createReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const review = await reviewService.create(input);
        return review;
      } catch (error: any) {
        console.error("[TRPC_ERROR] Gagal membuat review:", {
          input: input,
          errorMessage: error.message,
          errorStack: error.stack,
          originalError: error,
        });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Gagal membuat review',
          cause: error,
        });
      }
    }),

  getByProductId: t.procedure
    .input(z.object({ productId: z.string().min(1, "Product ID tidak boleh kosong") }))
    .query(async ({ input }) => {
      try {
        const reviews = await reviewService.findByProductId(input.productId);
        return reviews;
      } catch (error: any) {
        console.error(`[TRPC_ERROR] Gagal mengambil review untuk productId: ${input.productId}:`, {
          errorMessage: error.message,
          errorStack: error.stack,
          originalError: error,
        });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Gagal mengambil review',
          cause: error,
        });
      }
    }),

  listAll: t.procedure
    .query(async () => { 
      try {
        const reviews = await reviewService.findAll();
        return reviews;
      } catch (error: any) {
        console.error(`[TRPC_ERROR] Gagal mengambil semua review:`, {
          errorMessage: error.message,
          errorStack: error.stack,
          originalError: error,
        });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Gagal mengambil semua review',
          cause: error,
        });
      }
    }),
});