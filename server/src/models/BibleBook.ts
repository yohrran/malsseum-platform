import mongoose, { Schema, Document, Model } from 'mongoose';

export type IBibleBook = Document & {
  bookIndex: number;
  abbrev: string;
  abbrKo: string;
  nameKo: string;
  chapterCount: number;
  chapters: string[][];
};

const bibleBookSchema = new Schema<IBibleBook>({
  bookIndex: { type: Number, required: true, unique: true },
  abbrev: { type: String, required: true, unique: true },
  abbrKo: { type: String, required: true, unique: true },
  nameKo: { type: String, required: true },
  chapterCount: { type: Number, required: true },
  chapters: [[String]],
});

const BibleBook: Model<IBibleBook> = mongoose.model<IBibleBook>('BibleBook', bibleBookSchema);

export default BibleBook;
