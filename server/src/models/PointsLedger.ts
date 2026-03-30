import mongoose, { Schema, Document, Model } from 'mongoose';

export type PointsEventType =
  | 'chapter_complete'
  | 'daily_complete'
  | 'custom_day_complete'
  | 'season_complete'
  | 'streak_7'
  | 'streak_30';

export type IPointsLedger = Document & {
  userId: mongoose.Types.ObjectId;
  eventType: PointsEventType;
  points: number;
  referenceId?: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
};

const pointsLedgerSchema = new Schema<IPointsLedger>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: {
    type: String,
    enum: [
      'chapter_complete',
      'daily_complete',
      'custom_day_complete',
      'season_complete',
      'streak_7',
      'streak_30',
    ],
    required: true,
  },
  points: { type: Number, required: true },
  referenceId: mongoose.Schema.Types.ObjectId,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

pointsLedgerSchema.index({ userId: 1, createdAt: -1 });

const PointsLedger: Model<IPointsLedger> = mongoose.model<IPointsLedger>(
  'PointsLedger',
  pointsLedgerSchema,
);

export default PointsLedger;
