// be-tradoora/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.categories.createMany({
    data: [
      { name: 'Electronics' },
      { name: 'Fashion' },
      { name: 'Books' },
    ],
    skipDuplicates: true,
  });

  const electronicsCategory = await prisma.categories.findFirst({ where: { name: 'Electronics' } });
  if (electronicsCategory) {
    await prisma.product.updateMany({
      where: { slug: 'iphone-14-pro' }, 
      data: { categoryId: electronicsCategory.id },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });