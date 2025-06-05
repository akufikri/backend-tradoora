// types/review.type.ts
import { z } from "zod";

export const createReviewSchema = z.object({
  userId: z.string().min(1, "User ID wajib diisi"),
  productId: z.string().min(1, "Product ID wajib diisi"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;