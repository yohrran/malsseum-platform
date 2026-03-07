const mongoose = require('mongoose');

const bibleBookSchema = new mongoose.Schema({
  bookIndex: { type: Number, required: true, unique: true },
  abbrev: { type: String, required: true, unique: true },
  abbrKo: { type: String, required: true, unique: true },
  nameKo: { type: String, required: true },
  chapterCount: { type: Number, required: true },
  chapters: [[String]],
});

module.exports = mongoose.model('BibleBook', bibleBookSchema);
