// be-tradoora/src/trpc/router/product.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { prisma } from '../../lib/prisma';

const t = initTRPC.context<Context>().create();

export const trpcProductRouter = t.router({
  list: t.procedure
    .input(
      z
        .object({
          searchTerm: z.string().optional(),
          categoryId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
    return await prisma.product.findMany({
      where: {
        ...(input?.searchTerm && {
          OR: [
            { name: { contains: input.searchTerm, mode: 'insensitive' } },
            { description: { contains: input.searchTerm, mode: 'insensitive' } },
          ],
        }),
        ...(input?.categoryId && { categoryId: input.categoryId }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    }),
  getBySlug: t.procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const product = await prisma.product.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          sku: true,
          slug: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
          stockQuantity: true,
          minimumOrderQuantity: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }
      return product;
    }),
});