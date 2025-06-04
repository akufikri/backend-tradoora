import { db as transactionModel } from "../model/transaction.model";
import { snap } from "../lib/midtrans";
import { z } from "zod";
import { checkoutTransaction } from "../schema/transaction.schema";
import { ulid } from "ulid";
import crypto from "crypto";

export const transactionService = {
  checkout: async (
    data: z.infer<typeof checkoutTransaction>
  ): Promise<{
    transaction: Awaited<ReturnType<typeof transactionModel.findByOrderId>>[0],
    snapToken: string;
  }> => {
    const parsed = checkoutTransaction.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid checkout data: " + JSON.stringify(parsed.error.format()));
    }

    const orderId = `TRADOORA-ORDER-${ulid()}`;

    const transaction = await transactionModel.checkout({
      userId: parsed.data.userId,
      productId: parsed.data.productId,
      qty: parsed.data.qty,
      orderId,
      price: parsed.data.price,
      status: "PENDING",
    });

    const snapParams = {
      transaction_details: {
        order_id: transaction.orderId,
        gross_amount: Number(transaction.price),
      },
      customer_details: {
        first_name: transaction.user.name,
        email: transaction.user.email,
      },
      item_details: [
        {
          id: transaction.product.id,
          name: transaction.product.name,
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

    // Verifikasi signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      throw new Error("Invalid signature from Midtrans");
    }

    // Map Midtrans status ke status internal
    let newStatus = "PENDING";

    switch (transaction_status) {
      case "settlement":
        newStatus = "PAID";
        break;
      case "cancel":
      case "expire":
      case "failure":
        newStatus = "CANCELLED";
        break;
      case "pending":
        newStatus = "PENDING";
        break;
      default:
        newStatus = transaction_status.toUpperCase();
    }

    // Update ke DB
    await transactionModel.updateStatusByOrderId(order_id, newStatus);
  },
};
