import mongoose from 'mongoose';

const categoryLimitSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    limitPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} must be an integer in paise',
      },
    },
  },
  { _id: false }
);

const monthlyBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    monthlyAvailableFundsPaise: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (v) => v === null || Number.isInteger(v),
        message: '{VALUE} must be an integer in paise',
      },
    },
    flexibleBudgetPaise: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (v) => v === null || Number.isInteger(v),
        message: '{VALUE} must be an integer in paise',
      },
    },
    categoryLimits: {
      type: [categoryLimitSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

monthlyBudgetSchema.index({ userId: 1, month: 1 }, { unique: true });

export const MonthlyBudget = mongoose.model('MonthlyBudget', monthlyBudgetSchema);
