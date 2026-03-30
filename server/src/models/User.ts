import mongoose, { Schema, Document, Model } from 'mongoose'

export type IUser = Document & {
  googleId: string
  email: string
  displayName: string
  picture?: string
  preferredLanguage: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastReadDate: Date | null
  graceDaysRemaining: number
  graceDaysUsedDates: Date[]
  graceDayResetDate: Date | null
  createdAt: Date
}

const userSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  picture: { type: String },
  preferredLanguage: { type: String, default: 'ko' },
  totalPoints: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastReadDate: { type: Date, default: null },
  graceDaysRemaining: { type: Number, default: 2 },
  graceDaysUsedDates: { type: [Date], default: [] },
  graceDayResetDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
})

// M-1: 리더보드 쿼리 최적화
userSchema.index({ totalPoints: -1 })

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema)

export default User
