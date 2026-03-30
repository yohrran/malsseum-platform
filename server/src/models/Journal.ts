import mongoose, { Schema, Document, Model } from 'mongoose';

export type ILinkedVerse = {
  bookAbbr: string;
  bookName: string;
  chapter: number;
  verse: number;
};

export type IJournal = Document & {
  userId: mongoose.Types.ObjectId;
  date: string;
  content: string;
  linkedVerses: ILinkedVerse[];
  createdAt: Date;
  updatedAt: Date;
};

const journalSchema = new Schema<IJournal>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    content: { type: String, required: true, maxlength: 5000 },
    linkedVerses: [
      {
        bookAbbr: { type: String, required: true },
        bookName: { type: String, required: true },
        chapter: { type: Number, required: true },
        verse: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);

journalSchema.index({ userId: 1, date: -1 }, { unique: true });

const Journal: Model<IJournal> = mongoose.model<IJournal>('Journal', journalSchema);

export default Journal;
