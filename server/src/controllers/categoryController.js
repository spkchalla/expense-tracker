import { CategoryService } from '../services/categoryService.js';

export class CategoryController {
  static async getCategories(req, res, next) {
    try {
      const includeArchived = req.query.includeArchived === 'true';
      const categories = await CategoryService.getCategories(req.user._id, includeArchived);
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.user._id, req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(req.user._id, req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const result = await CategoryService.deleteOrArchiveCategory(req.user._id, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
