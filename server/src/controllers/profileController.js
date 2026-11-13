import { AuthService } from '../services/authService.js';

export class ProfileController {
  static async getProfile(req, res, next) {
    try {
      res.json({
        success: true,
        data: req.user.toSafeObject(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const updated = await AuthService.updateProfile(req.user._id, req.body);
      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
