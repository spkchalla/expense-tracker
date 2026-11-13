import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';

export class CategoryService {
  static async getCategories(userId, includeArchived = false) {
    const filter = { userId };
    if (!includeArchived) {
      filter.isArchived = false;
    }
    return Category.find(filter).sort({ sortOrder: 1, name: 1 });
  }

  static async createCategory(userId, data) {
    return Category.create({
      userId,
      ...data,
    });
  }

  static async updateCategory(userId, categoryId, data) {
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    Object.assign(category, data);
    await category.save();
    return category;
  }

  static async deleteOrArchiveCategory(userId, categoryId) {
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    // Check if transactions exist referencing this category
    const count = await Transaction.countDocuments({ userId, categoryId });
    if (count > 0) {
      // Historical references exist -> archive
      category.isArchived = true;
      await category.save();
      return { action: 'archived', category };
    } else {
      // No historical references -> delete permanently
      await Category.deleteOne({ _id: categoryId, userId });
      return { action: 'deleted', id: categoryId };
    }
  }
}
