import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 80,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    countsTowardFlexibleBudget: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ userId: 1, isArchived: 1, sortOrder: 1 });

export const Category = mongoose.model('Category', categorySchema);

export const DEFAULT_CATEGORIES = [
  { name: 'Canteen / Meals', countsTowardFlexibleBudget: true, sortOrder: 1 },
  { name: 'Tea / Coffee', countsTowardFlexibleBudget: true, sortOrder: 2 },
  { name: 'Late-night Snacks', countsTowardFlexibleBudget: true, sortOrder: 3 },
  { name: 'Groceries / Hostel Snacks', countsTowardFlexibleBudget: true, sortOrder: 4 },
  { name: 'Quick Commerce', countsTowardFlexibleBudget: true, sortOrder: 5 },
  { name: 'Transport', countsTowardFlexibleBudget: false, sortOrder: 6 },
  { name: 'Laundry', countsTowardFlexibleBudget: false, sortOrder: 7 },
  { name: 'Personal Care / Toiletries', countsTowardFlexibleBudget: false, sortOrder: 8 },
  { name: 'Haircut / Grooming', countsTowardFlexibleBudget: false, sortOrder: 9 },
  { name: 'Miscellaneous', countsTowardFlexibleBudget: true, sortOrder: 10 },
];
