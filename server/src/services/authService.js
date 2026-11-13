import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Category, DEFAULT_CATEGORIES } from '../models/Category.js';
import { config } from '../config/env.js';

export class AuthService {
  static async register({ displayName, email, password }) {
    if (!config.allowPublicRegistration) {
      const err = new Error('Public registration is currently disabled.');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Bootstrap admin check
    const isBootstrapAdmin =
      Boolean(config.bootstrapAdminEmail) && normalizedEmail === config.bootstrapAdminEmail;
    const role = isBootstrapAdmin ? 'admin' : 'user';

    const user = await User.create({
      displayName: displayName.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      status: 'active',
      privileges: isBootstrapAdmin ? ['advancedAnalytics', 'betaFeatures', 'customDashboard'] : [],
      lastActiveAt: new Date(),
    });

    // Seed default categories for this user
    const categoriesToSeed = DEFAULT_CATEGORIES.map((cat) => ({
      userId: user._id,
      name: cat.name,
      countsTowardFlexibleBudget: cat.countsTowardFlexibleBudget,
      sortOrder: cat.sortOrder,
    }));
    await Category.insertMany(categoriesToSeed);

    return user.toSafeObject();
  }

  static async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Use constant-time comparison or dummy hash to prevent timing attacks
    const dummyHash = '$2a$12$e8V9/8kX4wW7s7tZfXGg1erjHqXJ0L1w6L2/3rLhWj4U5I7X/6J2a';
    const hashToCompare = user ? user.passwordHash || dummyHash : dummyHash;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    if (user.status === 'suspended') {
      const err = new Error('Your account has been suspended. Please contact an administrator.');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    // Auto-elevate to admin if user matches config.bootstrapAdminEmail
    if (
      config.bootstrapAdminEmail &&
      normalizedEmail === config.bootstrapAdminEmail &&
      user.role !== 'admin'
    ) {
      user.role = 'admin';
      if (!user.privileges.includes('advancedAnalytics')) {
        user.privileges.push('advancedAnalytics', 'betaFeatures', 'customDashboard');
      }
    }

    user.lastActiveAt = new Date();
    await user.save();

    return user.toSafeObject();
  }

  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Current password is incorrect.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password updated successfully' };
  }

  static async updateProfile(userId, { displayName, currency, timezone }) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    if (displayName !== undefined) user.displayName = displayName;
    if (currency !== undefined) user.currency = currency;
    if (timezone !== undefined) user.timezone = timezone;

    await user.save();
    return user.toSafeObject();
  }
}
