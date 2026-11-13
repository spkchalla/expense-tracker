import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      default: 'expense',
      required: true,
    },
    amountPaise: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than zero'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} must be an integer in paise',
      },
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: function () {
        return this.type === 'expense';
      },
    },
    needId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Need',
      default: null,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    merchant: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    source: {
      type: String,
      enum: ['Blinkit', 'Instamart', 'Zepto', 'Other', null, ''],
      default: null,
    },
    mealPeriod: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Late Night', null, ''],
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Other'],
      default: 'UPI',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    clientTransactionId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index on userId and clientTransactionId for idempotent sync
transactionSchema.index({ userId: 1, clientTransactionId: 1 }, { unique: true });
transactionSchema.index({ userId: 1, occurredAt: -1 });
transactionSchema.index({ userId: 1, categoryId: 1, occurredAt: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
