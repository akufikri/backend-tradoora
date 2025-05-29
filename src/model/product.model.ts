import { prisma } from '../lib/prisma';

export const db = {
  findAll: () => prisma.product.findMany(),
  findById: (id: string) => prisma.product.findUnique({ where: { id } }),
  create: (data: any) => prisma.product.create({ data }),
  update: (id: string, data: any) => prisma.product.update({ where: { id }, data }),
  delete: (id: string) => prisma.product.delete({ where: { id } }),
};