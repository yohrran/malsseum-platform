import mongoose, { Schema, Document, Model } from 'mongoose'

export type IDayPlan = {
  dayNumber?: number
  scheduledDate?: Date
  chapterRefs: string[]
  isCompleted: boolean
  completedAt?: Date
}

export type IReadingPlan = Document & {
  userId: mongoose.Types.ObjectId
  planType: 'yearly' | 'custom'
  startDate: Date
  endDate: Date
  chaptersPerDay?: number
  isActive: boolean
  days: IDayPlan[]
  createdAt: Date
}

const dayPlanSchema = new Schema<IDayPlan>({
  dayNumber: Number,
  scheduledDate: Date,
  chapterRefs: [String],
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
})

const readingPlanSchema = new Schema<IReadingPlan>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planType: { type: String, enum: ['yearly', 'custom'], default: 'yearly' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  chaptersPerDay: Number,
  isActive: { type: Boolean, default: true },
  days: [dayPlanSchema],
  createdAt: { type: Date, default: Date.now },
})

// M-1: userId + isActive 복합 조건으로 자주 조회
readingPlanSchema.index({ userId: 1, isActive: 1 })

const ReadingPlan: Model<IReadingPlan> = mongoose.model<IReadingPlan>('ReadingPlan', readingPlanSchema)

export default ReadingPlan
