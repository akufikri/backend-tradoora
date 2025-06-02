import { prisma } from '../lib/prisma';

export const categoryModel = {
  findAll: () => {
    return prisma.categories.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  },
};