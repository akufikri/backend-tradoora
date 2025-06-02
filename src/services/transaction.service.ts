import { TRPCError } from "@trpc/server";
import { transactionModel } from "../model/transaction.model";
import { checkoutTransaction } from "../schema/transaction.schema";
import { z } from "zod";

if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error("POLAR_ACCESS_TOKEN is not set in environment variables");
}
if (!process.env.POLAR_ORDER_ID) {
  throw new Error("POLAR_ORDER_ID is not set in environment variables");
}
if (!process.env.SUCCESS_URL) {
  throw new Error("SUCCESS_URL is not set in environment variables");
}

export const transactionService = {
  createCheckout: async (data: z.infer<typeof checkoutTransaction>) => {
    try {
      const parsedData = checkoutTransaction.safeParse(data);
      if (!parsedData.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid checkout data: ${JSON.stringify(parsedData.error.format())}`,
        });
      }

      const { userId, productId, qty, price } = parsedData.data;

      const orderId = `${process.env.POLAR_ORDER_ID}${Date.now()}-${userId}-${productId}`;

      const transaction = await transactionModel.checkout({
        userId,
        productId,
        qty,
        orderId,
        price: Number(price),
        status: "pending",
      });

      return {
        transaction,
        orderId,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to create checkout: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  },

  checkTransactionStatus: async (orderId: string) => {
    try {
      const transactions = await transactionModel.findByOrderId(orderId);
      if (!transactions || transactions.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      return {
        transaction: transactions[0],
        polarStatus: transactions[0].status,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to check transaction status: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  },

  updateTransactionStatus: async (orderId: string, status: string) => {
    try {
      const transactions = await transactionModel.findByOrderId(orderId);
      if (!transactions || transactions.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      const updatedTransaction = await transactionModel.update({
        id: transactions[0].id,
        status,
      });

      return updatedTransaction;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to update transaction status: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  },
};
