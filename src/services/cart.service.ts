import { TRPCError } from "@trpc/server";
import { cartModel } from "../model/cart.model";
import { prisma } from "../lib/prisma";
import {
  addToCartSchema,
  updateQtySchema,
  removeCartItemSchema,
  userIdSchema,
} from "../schema/cart.schema";

export const cartService = {
  async addToCart(input: unknown) {
    const { userId, productId, qty } = addToCartSchema.parse(input);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        stockQuantity: true,
        minimumOrderQuantity: true,
      },
    });

    if (!product) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    }

    if (qty < product.minimumOrderQuantity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Minimum order quantity is ${product.minimumOrderQuantity}`,
      });
    }

    if (qty > product.stockQuantity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Not enough stock available",
      });
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      const newQty = existing.qty + qty;

      if (newQty > product.stockQuantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Total quantity exceeds available stock",
        });
      }

      return cartModel.update(existing.id, {
        qty: { set: newQty },
      });
    }

    return cartModel.store({
      user: { connect: { id: userId } },
      product: { connect: { id: productId } },
      qty,
    });
  },

  async listCart(input: unknown) {
    const { userId } = userIdSchema.parse(input);

    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            sku: true,
            slug: true,
            stockQuantity: true,
            minimumOrderQuantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.qty,
      0
    );

    return {
      items,
      summary: {
        totalItems,
        totalPrice,
        itemCount: items.length,
      },
    };
  },

  async updateQuantity(input: unknown) {
    const { cartItemId, qty } = updateQtySchema.parse(input);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });

    if (!cartItem) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
    }

    if (qty < cartItem.product.minimumOrderQuantity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Minimum order quantity is ${cartItem.product.minimumOrderQuantity}`,
      });
    }

    if (qty > cartItem.product.stockQuantity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Not enough stock available",
      });
    }

    return cartModel.update(cartItemId, { qty: { set: qty } });
  },

  async remove(input: unknown) {
    const { cartItemId } = removeCartItemSchema.parse(input);

    const existing = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
    }

    await cartModel.delete(cartItemId);

    return {
      success: true,
      message: "Item removed from cart",
    };
  },

  async clear(input: unknown) {
    const { userId } = userIdSchema.parse(input);

    const result = await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      message: `Cleared ${result.count} items from cart`,
      deletedCount: result.count,
    };
  },

  async count(input: unknown) {
    const { userId } = userIdSchema.parse(input);

    const items = await prisma.cartItem.findMany({
      where: { userId },
      select: { qty: true },
    });

    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

    return {
      itemCount: items.length,
      totalItems,
    };
  },

  async checkExists(input: unknown) {
    const { userId, productId } = addToCartSchema.parse(input); // same fields

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      select: {
        id: true,
        qty: true,
      },
    });

    return {
      exists: !!cartItem,
      cartItem: cartItem ?? null,
    };
  },
};
