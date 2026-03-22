import mongoose, { Schema, Document, Model } from 'mongoose'

export type IBookmark = Document & {
  userId: mongoose.Types.ObjectId
  bookId: string
  chapter: number
  verse: number
  note: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    note: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
)

bookmarkSchema.index({ userId: 1, bookId: 1, chapter: 1, verse: 1 }, { unique: true })

const Bookmark: Model<IBookmark> = mongoose.model<IBookmark>('Bookmark', bookmarkSchema)

export default Bookmark
