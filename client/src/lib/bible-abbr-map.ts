// Maps Korean Bible book abbreviations to API.Bible book IDs
export const KOREAN_ABBR_TO_BIBLE_ID: Record<string, string> = {
  창: 'GEN', 출: 'EXO', 레: 'LEV', 민: 'NUM', 신: 'DEU',
  수: 'JOS', 삿: 'JDG', 룻: 'RUT', 삼상: '1SA', 삼하: '2SA',
  왕상: '1KI', 왕하: '2KI', 대상: '1CH', 대하: '2CH',
  스: 'EZR', 느: 'NEH', 에: 'EST', 욥: 'JOB', 시: 'PSA',
  잠: 'PRO', 전: 'ECC', 아: 'SNG', 사: 'ISA', 렘: 'JER',
  애: 'LAM', 겔: 'EZK', 단: 'DAN', 호: 'HOS', 욜: 'JOL',
  암: 'AMO', 옵: 'OBA', 욘: 'JON', 미: 'MIC', 나: 'NAM',
  합: 'HAB', 습: 'ZEP', 학: 'HAG', 슥: 'ZEC', 말: 'MAL',
  마: 'MAT', 막: 'MRK', 눅: 'LUK', 요: 'JHN', 행: 'ACT',
  롬: 'ROM', 고전: '1CO', 고후: '2CO', 갈: 'GAL', 엡: 'EPH',
  빌: 'PHP', 골: 'COL', 살전: '1TH', 살후: '2TH',
  딤전: '1TI', 딤후: '2TI', 딛: 'TIT', 몬: 'PHM',
  히: 'HEB', 약: 'JAS', 벧전: '1PE', 벧후: '2PE',
  요일: '1JN', 요이: '2JN', 요삼: '3JN', 유: 'JUD', 계: 'REV',
};

// Build a passage ref like "GEN.1-GEN.2" from bookAbbr + chapters array
export const buildPassageRef = (bookAbbr: string, chapters: number[]): string | null => {
  const bookId = KOREAN_ABBR_TO_BIBLE_ID[bookAbbr];
  if (!bookId || chapters.length === 0) return null;
  if (chapters.length === 1) return `${bookId}.${chapters[0]}`;
  return `${bookId}.${chapters[0]}-${bookId}.${chapters[chapters.length - 1]}`;
};
