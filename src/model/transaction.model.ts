// transaction.model.ts

import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { Transaction } from "../types/transaction.type"; // Make sure this type is correctly defined
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
      orderBy: { 
        createdAt: 'desc',
      }
    });
  },


  findByUserId: async (userId: string): Promise<Transaction[]> => {
    return prisma.transaction.findMany({
      where: { userId },
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
      orderBy: {
        createdAt: 'desc',
      }
    });
  },

  findByOrderId: async (orderId: string): Promise<Transaction | null> => { 
    return prisma.transaction.findUnique({ 
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
    rawData: z.infer<typeof checkoutTransaction> & { orderId: string, status: string }
  ): Promise<Transaction> => {

    const transaction = await prisma.transaction.create({
      data: {
        userId: rawData.userId,
        productId: rawData.productId,
        qty: rawData.qty,
        orderId: rawData.orderId,
        price: new Prisma.Decimal(rawData.price),
        status: rawData.status,
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