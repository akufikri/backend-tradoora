import { z } from "zod";

export const addToCartSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  qty: z.number().int().positive("Quantity must be a positive integer"),
});

export const updateQtySchema = z.object({
  cartItemId: z.string().min(1, "Cart Item ID is required"),
  qty: z.number().int().positive("Quantity must be a positive integer"),
});

export const removeCartItemSchema = z.object({
  cartItemId: z.string().min(1, "Cart Item ID is required"),
});

export const userIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});
