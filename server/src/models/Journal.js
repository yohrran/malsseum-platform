const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
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

module.exports = mongoose.model('Journal', journalSchema);
