const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();

const BibleBook = require('../models/BibleBook');

const BIBLE_JSON_URL =
  'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_ko.json';

const BOOK_META = [
  { abbrev: 'gn', abbrKo: '창', nameKo: '창세기' },
  { abbrev: 'ex', abbrKo: '출', nameKo: '출애굽기' },
  { abbrev: 'lv', abbrKo: '레', nameKo: '레위기' },
  { abbrev: 'nm', abbrKo: '민', nameKo: '민수기' },
  { abbrev: 'dt', abbrKo: '신', nameKo: '신명기' },
  { abbrev: 'js', abbrKo: '수', nameKo: '여호수아' },
  { abbrev: 'jud', abbrKo: '삿', nameKo: '사사기' },
  { abbrev: 'rt', abbrKo: '룻', nameKo: '룻기' },
  { abbrev: '1sm', abbrKo: '삼상', nameKo: '사무엘상' },
  { abbrev: '2sm', abbrKo: '삼하', nameKo: '사무엘하' },
  { abbrev: '1kgs', abbrKo: '왕상', nameKo: '열왕기상' },
  { abbrev: '2kgs', abbrKo: '왕하', nameKo: '열왕기하' },
  { abbrev: '1ch', abbrKo: '대상', nameKo: '역대상' },
  { abbrev: '2ch', abbrKo: '대하', nameKo: '역대하' },
  { abbrev: 'ezr', abbrKo: '스', nameKo: '에스라' },
  { abbrev: 'ne', abbrKo: '느', nameKo: '느헤미야' },
  { abbrev: 'et', abbrKo: '에', nameKo: '에스더' },
  { abbrev: 'job', abbrKo: '욥', nameKo: '욥기' },
  { abbrev: 'ps', abbrKo: '시', nameKo: '시편' },
  { abbrev: 'prv', abbrKo: '잠', nameKo: '잠언' },
  { abbrev: 'ec', abbrKo: '전', nameKo: '전도서' },
  { abbrev: 'so', abbrKo: '아', nameKo: '아가' },
  { abbrev: 'is', abbrKo: '사', nameKo: '이사야' },
  { abbrev: 'jr', abbrKo: '렘', nameKo: '예레미야' },
  { abbrev: 'lm', abbrKo: '애', nameKo: '예레미야애가' },
  { abbrev: 'ez', abbrKo: '겔', nameKo: '에스겔' },
  { abbrev: 'dn', abbrKo: '단', nameKo: '다니엘' },
  { abbrev: 'ho', abbrKo: '호', nameKo: '호세아' },
  { abbrev: 'jl', abbrKo: '욜', nameKo: '요엘' },
  { abbrev: 'am', abbrKo: '암', nameKo: '아모스' },
  { abbrev: 'ob', abbrKo: '옵', nameKo: '오바댜' },
  { abbrev: 'jn', abbrKo: '욘', nameKo: '요나' },
  { abbrev: 'mi', abbrKo: '미', nameKo: '미가' },
  { abbrev: 'na', abbrKo: '나', nameKo: '나훔' },
  { abbrev: 'hk', abbrKo: '합', nameKo: '하박국' },
  { abbrev: 'zp', abbrKo: '습', nameKo: '스바냐' },
  { abbrev: 'hg', abbrKo: '학', nameKo: '학개' },
  { abbrev: 'zc', abbrKo: '슥', nameKo: '스가랴' },
  { abbrev: 'ml', abbrKo: '말', nameKo: '말라기' },
  { abbrev: 'mt', abbrKo: '마', nameKo: '마태복음' },
  { abbrev: 'mk', abbrKo: '막', nameKo: '마가복음' },
  { abbrev: 'lk', abbrKo: '눅', nameKo: '누가복음' },
  { abbrev: 'jo', abbrKo: '요', nameKo: '요한복음' },
  { abbrev: 'act', abbrKo: '행', nameKo: '사도행전' },
  { abbrev: 'rm', abbrKo: '롬', nameKo: '로마서' },
  { abbrev: '1co', abbrKo: '고전', nameKo: '고린도전서' },
  { abbrev: '2co', abbrKo: '고후', nameKo: '고린도후서' },
  { abbrev: 'gl', abbrKo: '갈', nameKo: '갈라디아서' },
  { abbrev: 'eph', abbrKo: '엡', nameKo: '에베소서' },
  { abbrev: 'ph', abbrKo: '빌', nameKo: '빌립보서' },
  { abbrev: 'cl', abbrKo: '골', nameKo: '골로새서' },
  { abbrev: '1ts', abbrKo: '살전', nameKo: '데살로니가전서' },
  { abbrev: '2ts', abbrKo: '살후', nameKo: '데살로니가후서' },
  { abbrev: '1tm', abbrKo: '딤전', nameKo: '디모데전서' },
  { abbrev: '2tm', abbrKo: '딤후', nameKo: '디모데후서' },
  { abbrev: 'tt', abbrKo: '딛', nameKo: '디도서' },
  { abbrev: 'phm', abbrKo: '몬', nameKo: '빌레몬서' },
  { abbrev: 'hb', abbrKo: '히', nameKo: '히브리서' },
  { abbrev: 'jm', abbrKo: '약', nameKo: '야고보서' },
  { abbrev: '1pe', abbrKo: '벧전', nameKo: '베드로전서' },
  { abbrev: '2pe', abbrKo: '벧후', nameKo: '베드로후서' },
  { abbrev: '1jo', abbrKo: '요일', nameKo: '요한일서' },
  { abbrev: '2jo', abbrKo: '요이', nameKo: '요한이서' },
  { abbrev: '3jo', abbrKo: '요삼', nameKo: '요한삼서' },
  { abbrev: 'jd', abbrKo: '유', nameKo: '유다서' },
  { abbrev: 're', abbrKo: '계', nameKo: '요한계시록' },
];

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
        resolve(JSON.parse(text));
      });
      res.on('error', reject);
    });
  });

const seed = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  console.log('Downloading Korean Bible data...');
  const bibleData = await fetchJson(BIBLE_JSON_URL);
  console.log(`Downloaded ${bibleData.length} books`);

  const metaByAbbrev = Object.fromEntries(
    BOOK_META.map((m) => [m.abbrev, m])
  );

  const docs = bibleData.map((book, idx) => {
    const meta = metaByAbbrev[book.abbrev];
    if (!meta) {
      throw new Error(`No metadata for abbreviation: ${book.abbrev}`);
    }
    return {
      bookIndex: idx,
      abbrev: book.abbrev,
      abbrKo: meta.abbrKo,
      nameKo: meta.nameKo,
      chapterCount: book.chapters.length,
      chapters: book.chapters,
    };
  });

  await BibleBook.deleteMany({});
  await BibleBook.insertMany(docs);
  console.log(`Seeded ${docs.length} books into BibleBook collection`);

  await mongoose.disconnect();
  console.log('Done');
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
