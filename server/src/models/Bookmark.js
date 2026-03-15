const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    note: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

bookmarkSchema.index({ userId: 1, bookId: 1, chapter: 1, verse: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
