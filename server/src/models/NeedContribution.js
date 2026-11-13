import mongoose from 'mongoose';

const needContributionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    needId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Need',
      required: [true, 'Need ID is required'],
      index: true,
    },
    amountPaise: {
      type: Number,
      required: [true, 'Contribution amount is required'],
      min: [1, 'Contribution amount must be greater than zero'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} must be an integer in paise',
      },
    },
    contributedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 250,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

needContributionSchema.index({ userId: 1, needId: 1, contributedAt: -1 });
needContributionSchema.index({ userId: 1, contributedAt: -1 });

export const NeedContribution = mongoose.model('NeedContribution', needContributionSchema);
