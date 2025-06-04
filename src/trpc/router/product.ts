import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context'; 
import { prisma } from '../../lib/prisma'; 
import { Prisma } from '@prisma/client'; 

const t = initTRPC.context<Context>().create();

export const trpcProductRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        searchTerm: z.string().optional(),
        categoryId: z.string().optional(),
        minPrice: z.number().optional(), 
        maxPrice: z.number().optional(), 
      }).optional() 
    )
    .query(async ({ input }) => {
      const { searchTerm, categoryId, minPrice, maxPrice } = input ?? {};

      const whereConditions: Prisma.ProductWhereInput = {};

      if (searchTerm) {
        whereConditions.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      if (categoryId) {
        whereConditions.categoryId = categoryId;
      }

      if (typeof minPrice === 'number') {
        if (!whereConditions.price) {
          whereConditions.price = {};
        }
        (whereConditions.price as Prisma.DecimalFilter).gte = new Prisma.Decimal(minPrice);
      }

      if (typeof maxPrice === 'number') {
        if (!whereConditions.price) {
          whereConditions.price = {};
        }
        
        if (typeof minPrice === 'number' && maxPrice < minPrice) {
          
          
        }
        (whereConditions.price as Prisma.DecimalFilter).lte = new Prisma.Decimal(maxPrice);
      }
      
      const products = await prisma.product.findMany({
        where: whereConditions,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { 
            createdAt: 'desc',
        }
      });

      return products.map((p) => ({
        ...p,
        price: p.price.toString(), 
      }));
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