import { AuthService } from '../services/authService.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      // Auto login session on register
      req.session.userId = user.id;
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const user = await AuthService.login(req.body);
      req.session.userId = user.id;
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req, res, next) {
    try {
      res.json({
        success: true,
        data: req.user.toSafeObject(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const result = await AuthService.changePassword(req.user._id, req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
