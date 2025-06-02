import { categoryModel } from '../model/category.model';

export const categoryService = {
  getAllCategories: async () => {
    const categories = await categoryModel.findAll();
    return categories;
  },
};