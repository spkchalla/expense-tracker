import mongoose from 'mongoose';

const needSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Need name is required'],
      trim: true,
      maxlength: 100,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    monthlyReserveAmountPaise: {
      type: Number,
      required: [true, 'Monthly reserve amount is required'],
      min: [0, 'Reserve amount cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} must be an integer in paise',
      },
    },
    expectedCostPaise: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (v) => v === null || Number.isInteger(v),
        message: '{VALUE} must be an integer in paise',
      },
    },
    frequency: {
      type: String,
      enum: ['monthly', 'weekly', 'quarterly', 'yearly', 'irregular'],
      default: 'monthly',
    },
    nextDueDate: {
      type: Date,
      default: null,
    },
    openingBalancePaise: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} must be an integer in paise',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

needSchema.index({ userId: 1, isActive: 1, isArchived: 1 });

export const Need = mongoose.model('Need', needSchema);
