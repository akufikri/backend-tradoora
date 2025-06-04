import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { Transaction } from "../types/transaction.type";
import { checkoutTransaction } from "../schema/transaction.schema";
import { z } from "zod";
import { ulid } from "ulid";

export const db = {
  findAll: async (): Promise<Transaction[]> => {
    return prisma.transaction.findMany({
      select: {
        id: true,
        orderId: true,
        userId: true,
        productId: true,
        qty: true,
        price: true,
        status: true,
        user: true,
        product: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  findByOrderId: async (orderId: string): Promise<Transaction[]> => {
    return prisma.transaction.findMany({
      where: { orderId },
      select: {
        id: true,
        orderId: true,
        userId: true,
        productId: true,
        qty: true,
        price: true,
        status: true,
        user: true,
        product: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  checkout: async (
    rawData: z.infer<typeof checkoutTransaction>
  ): Promise<Transaction> => {
    const parsed = checkoutTransaction.safeParse(rawData);
    if (!parsed.success) {
      throw new Error("Invalid checkout data: " + JSON.stringify(parsed.error.format()));
    }

    const orderId = `TRADOORA-ORDER-${ulid()}`;

    const transaction = await prisma.transaction.create({
      data: {
        userId: parsed.data.userId,
        productId: parsed.data.productId,
        qty: parsed.data.qty,
        orderId, // ← auto-generated
        price: new Prisma.Decimal(parsed.data.price),
        status: parsed.data.status ?? null,
      },
      include: {
        user: true,
        product: true,
      },
    });

    return transaction;
  },

  update: async (data: { id: string; status: string }): Promise<Transaction> => {
    const transaction = await prisma.transaction.update({
      where: { id: data.id },
      data: { status: data.status },
      include: {
        user: true,
        product: true,
      },
    });
    return transaction;
  },
  updateStatusByOrderId: async (orderId: string, status: string): Promise<void> => {
  await prisma.transaction.updateMany({
    where: { orderId },
    data: { status },
  });
}
};
