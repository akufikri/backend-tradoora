import { z } from "zod"

export const checkoutTransaction = z.object({
    userId: z.string().min(1, "User ID is required"),
    productId: z.string().min(1, "Product ID is required"),
    qty: z.number().int().positive("Quantity must be a positive integer"),
    orderId: z.string().min(1, "Order ID is required"),
    price: z.number().positive("Price must be a positive number"),
    status: z.string().nullable().optional(),
})