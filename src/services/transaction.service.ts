import { db as transactionModel } from "../model/transaction.model";
import { snap } from "../lib/midtrans";
import { z } from "zod";
import { checkoutTransaction } from "../schema/transaction.schema";
import { ulid } from "ulid";
import crypto from "crypto";
import { Transaction } from "../types/transaction.type";
import { prisma } from "../lib/prisma";

export const transactionService = {
  checkout: async (
    data: z.infer<typeof checkoutTransaction>
  ): Promise<{
    transaction: Transaction,
    snapToken: string;
  }> => {
    const parsed = checkoutTransaction.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid checkout data: " + JSON.stringify(parsed.error.format()));
    }

    const orderId = `TRADOORA-ORDER-${ulid()}`;
    const status = "PENDING";

    const transactionDataForCreate = {
      ...parsed.data,
      orderId,
      status,
    };

    const transaction = await transactionModel.checkout(transactionDataForCreate);

    if (!transaction.user || !transaction.product) {
      throw new Error("User or Product data missing in transaction object after creation.");
    }

    const snapParams = {
      transaction_details: {
        order_id: transaction.orderId,
        gross_amount: Number(transaction.price) * transaction.qty,
      },
      customer_details: {
        first_name: transaction.user.name ?? "Customer",
        email: transaction.user.email,
      },
      item_details: [
        {
          id: transaction.product.id,
          name: transaction.product.name ?? "Product",
          quantity: transaction.qty,
          price: Number(transaction.price),
        },
      ],
    };

    const snapResponse = await snap.createTransaction(snapParams);

    return {
      transaction,
      snapToken: snapResponse.token,
    };
  },

  handleCallback: async (midtransPayload: any): Promise<void> => {
    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = midtransPayload;

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY is not configured.");
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      console.warn(`Invalid signature for order_id: ${order_id}.`);
      throw new Error("Invalid signature from Midtrans");
    }

    let newStatus = "PENDING";

    switch (transaction_status) {
      case "settlement":
        newStatus = "PAID";
        break;
      case "capture":
        newStatus = fraud_status === "accept" ? "PAID" : "CHALLENGED";
        break;
      case "cancel":
      case "deny":
      case "expire":
      case "failure":
        newStatus = "CANCELLED";
        break;
      case "pending":
        newStatus = "PENDING";
        break;
    }

    await transactionModel.updateStatusByOrderId(order_id, newStatus);
    console.log(`Transaction status for ${order_id} updated to ${newStatus}`);

    if (newStatus === "PAID") {
      const transaction = await prisma.transaction.findUnique({
        where: { orderId: order_id },
        include: {
          product: true,
        },
      });

      if (!transaction) {
        console.warn(`Transaction with order_id ${order_id} not found`);
        return;
      }

      // Kurangi stok produk
      await prisma.product.update({
        where: { id: transaction.productId },
        data: {
          stockQuantity: {
            decrement: transaction.qty,
          },
        },
      });

      // Hapus cart item terkait
      await prisma.cartItem.deleteMany({
        where: {
          userId: transaction.userId,
          productId: transaction.productId,
        },
      });

      console.log(
        `Stock updated & cart item deleted for user ${transaction.userId} on product ${transaction.productId}`
      );
    }
  },

  getTransactionsByUserId: async (userId: string): Promise<Transaction[]> => {
    if (!userId) {
      throw new Error("User ID is required to fetch transactions.");
    }
    return transactionModel.findByUserId(userId);
  },
};