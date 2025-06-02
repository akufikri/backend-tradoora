import { prisma } from "../lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CartItem } from "../types/cart.type";

export const cartModel = {
  findAll: async (): Promise<CartItem[]> => {
    return prisma.cartItem.findMany({
      select: {
        id: true,
        userId: true,
        productId: true,
        qty: true,
        user: true,
        product: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  store: (data: Prisma.CartItemCreateInput): Promise<CartItem> => {
    return prisma.cartItem.create({
      data,
      include: {
        user: true,
        product: true,
      },
    });
  },

  update: (id: string, data: Prisma.CartItemUpdateInput): Promise<CartItem> => {
    return prisma.cartItem.update({
      where: { id },
      data,
      include: {
        user: true,
        product: true,
      },
    });
  },

  delete: (id: string): Promise<CartItem> => {
    return prisma.cartItem.delete({
      where: { id },
      include: {
        user: true,
        product: true,
      },
    });
  },
};
