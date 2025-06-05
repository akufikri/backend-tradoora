// review.service.ts
import { reviewModel } from "../model/review.model";
import { createReviewSchema } from "../types/review.type";
import { TRPCError } from '@trpc/server';

export const reviewService = {
  create: async (input: unknown) => {
    try {
      const validatedInput = createReviewSchema.parse(input); 
      return await reviewModel.create(validatedInput);
    } catch (error: any) {
      console.error("[SERVICE_ERROR] Gagal memvalidasi atau membuat review di service:", {
        inputData: input,
        errorMessage: error.message,
        errorStack: error.stack,
        zodError: error.issues,
        originalError: error,
      });
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: error.issues ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Gagal memproses data review di service',
        cause: error,
      });
    }
  },

  findByProductId: async (productId: string) => {
    try {
      if (!productId || productId.trim() === "") {
        throw new Error("Product ID tidak boleh kosong di service.");
      }
      const reviews = await reviewModel.findByProductId(productId);
      return reviews;
    } catch (error: any) {
      console.error(`[SERVICE_ERROR] Gagal mengambil review untuk productId ${productId} di service:`, {
        errorMessage: error.message,
        errorStack: error.stack,
        originalError: error,
      });
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || `Gagal mengambil review di service untuk produk ${productId}`,
        cause: error,
      });
    }
  },

  findAll: async () => {
    try {
      const reviews = await reviewModel.findAll();
      return reviews;
    } catch (error: any) {
      console.error(`[SERVICE_ERROR] Gagal mengambil semua review di service:`, {
        errorMessage: error.message,
        errorStack: error.stack,
        originalError: error,
      });
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Gagal mengambil semua review dari service',
        cause: error,
      });
    }
  },
};