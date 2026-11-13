import mongoose from 'mongoose';

const authProviderSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: false, // nullable for future OAuth-only accounts
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    privileges: {
      type: [String],
      enum: ['advancedAnalytics', 'betaFeatures', 'customDashboard'],
      default: [],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      trim: true,
    },
    authProviders: {
      type: [authProviderSchema],
      default: [],
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Clean JSON response (never expose passwordHash)
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    displayName: this.displayName,
    email: this.email,
    role: this.role,
    status: this.status,
    privileges: this.privileges,
    currency: this.currency,
    timezone: this.timezone,
    lastActiveAt: this.lastActiveAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model('User', userSchema);
