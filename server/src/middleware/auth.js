import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        error: 'User not found. Please log in again.',
      });
    }

    if (user.status === 'suspended') {
      req.session.destroy();
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient role permissions',
      });
    }
    next();
  };
}

export function requirePrivilege(requiredPrivilege) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    // Admins implicitly have all privileges
    if (req.user.role === 'admin' || (req.user.privileges && req.user.privileges.includes(requiredPrivilege))) {
      return next();
    }
    return res.status(403).json({
      success: false,
      error: `Forbidden: Missing required privilege '${requiredPrivilege}'`,
    });
  };
}
