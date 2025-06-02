import { initTRPC } from '@trpc/server';
import { categoryService } from '../../services/category.service';

const t = initTRPC.create();

export const categoryRouter = t.router({
  list: t.procedure.query(async () => {
    return await categoryService.getAllCategories();
  }),
});
