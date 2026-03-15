const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema(
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
);

highlightSchema.index({ userId: 1, bookId: 1, chapter: 1, verse: 1 }, { unique: true });

module.exports = mongoose.model('Highlight', highlightSchema);
