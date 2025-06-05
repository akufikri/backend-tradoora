import { prisma } from "../lib/prisma"; 

interface CreateReviewData {
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
}

export const reviewModel = {
  create: async (data: CreateReviewData) => {
    try {
      return await prisma.review.create({ data });
    } catch (error: any) {
      console.error("[MODEL_ERROR] Gagal membuat review di model (database):", {
        inputData: data,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack,
        originalError: error,
      });
      throw new Error(`Database error saat membuat review: ${error.message}`);
    }
  },

  findByProductId: async (productId: string) => {
    try {
      return await prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error: any) {
      console.error(`[MODEL_ERROR] Gagal mengambil review untuk productId ${productId} di model (database):`, {
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack,
        originalError: error,
      });
      throw new Error(`Database error saat mengambil review: ${error.message}`);
    }
  },

  
  findAll: async () => {
    try {
      return await prisma.review.findMany({
        include: {
          user: {
            select: { id: true, name: true }, 
          },
          product: { 
            select: { id: true, name: true, slug: true }
          }
        },
        orderBy: { createdAt: "desc" }, 
      });
    } catch (error: any) {
      console.error(`[MODEL_ERROR] Gagal mengambil semua review di model (database):`, {
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack,
        originalError: error,
      });
      throw new Error(`Database error saat mengambil semua review: ${error.message}`);
    }
  },
};