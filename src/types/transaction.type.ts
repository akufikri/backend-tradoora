import type { Users, Product } from "@prisma/client";
import { Decimal } from '@prisma/client/runtime/library'

export type Transaction = {
    id: string
    orderId: string
    userId: string
    productId: string
    qty: number
    price: Decimal
    status?: string | null
    createdAt: Date
    updatedAt: Date
    user: Users
    product: Product
}