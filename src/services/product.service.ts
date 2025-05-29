import { db } from '../model/product.model';

export const ProductService = {
  list: () => db.findAll(),
  get: (id: string) => db.findById(id),
  create: (data: any) => db.create(data),
  update: (id: string, data: any) => db.update(id, data),
  delete: (id: string) => db.delete(id),
};
