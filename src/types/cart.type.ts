import type { Users, Product } from "@prisma/client";

export type CartItem = {
  id: string;
  userId: string;
  productId: string;
  qty: number;
  createdAt: Date;
  updatedAt: Date;

  user: Users;
  product: Product;
};
