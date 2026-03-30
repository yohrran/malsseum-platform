import mongoose, { Schema, Document, Model } from 'mongoose'

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple'

export type IHighlight = Document & {
  userId: mongoose.Types.ObjectId
  bookId: string
  chapter: number
  verse: number
  color: HighlightColor
  createdAt: Date
  updatedAt: Date
}

const highlightSchema = new Schema<IHighlight>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    color: {
      type: String,
      required: true,
      enum: ['yellow', 'green', 'blue', 'pink', 'purple'],
    },
  },
  { timestamps: true },
)

highlightSchema.index({ userId: 1, bookId: 1, chapter: 1, verse: 1 }, { unique: true })

const Highlight: Model<IHighlight> = mongoose.model<IHighlight>('Highlight', highlightSchema)

export default Highlight
