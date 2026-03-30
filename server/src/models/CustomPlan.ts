import mongoose, { Schema, Document, Model } from 'mongoose';

export type ICustomPlanDay = {
  date?: string;
  bookAbbr?: string;
  chapters: number[];
  isCompleted: boolean;
  completedAt?: Date;
};

export type ICustomPlanSeason = Document & {
  seasonNumber?: number;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  label?: string;
  days: ICustomPlanDay[];
  isCompleted: boolean;
  completedAt?: Date;
};

export type ICustomPlan = Document & {
  userId: mongoose.Types.ObjectId;
  title: string;
  seasons: ICustomPlanSeason[];
  createdAt: Date;
  updatedAt: Date;
};

const daySchema = new Schema<ICustomPlanDay>(
  {
    date: String,
    bookAbbr: String,
    chapters: [Number],
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  },
  { _id: false },
);

const seasonSchema = new Schema<ICustomPlanSeason>({
  seasonNumber: Number,
  name: String,
  startDate: Date,
  endDate: Date,
  label: String,
  days: [daySchema],
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
});

const customPlanSchema = new Schema<ICustomPlan>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  seasons: [seasonSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

customPlanSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// M-1: userId 기준 목록 조회 최적화
customPlanSchema.index({ userId: 1, createdAt: -1 });

const CustomPlan: Model<ICustomPlan> = mongoose.model<ICustomPlan>('CustomPlan', customPlanSchema);

export default CustomPlan;
