export const BOOK_NAMES_KO: Record<string, string> = {
  창: '창세기', 출: '출애굽기', 레: '레위기', 민: '민수기', 신: '신명기',
  수: '여호수아', 삿: '사사기', 룻: '룻기', 삼상: '사무엘상', 삼하: '사무엘하',
  왕상: '열왕기상', 왕하: '열왕기하', 대상: '역대상', 대하: '역대하',
  스: '에스라', 느: '느헤미야', 에: '에스더', 욥: '욥기', 시: '시편',
  잠: '잠언', 전: '전도서', 아: '아가', 사: '이사야', 렘: '예레미야',
  애: '예레미야애가', 겔: '에스겔', 단: '다니엘', 호: '호세아', 욜: '요엘',
  암: '아모스', 옵: '오바댜', 욘: '요나', 미: '미가', 나: '나훔',
  합: '하박국', 습: '스바냐', 학: '학개', 슥: '스가랴', 말: '말라기',
  마: '마태복음', 막: '마가복음', 눅: '누가복음', 요: '요한복음', 행: '사도행전',
  롬: '로마서', 고전: '고린도전서', 고후: '고린도후서', 갈: '갈라디아서', 엡: '에베소서',
  빌: '빌립보서', 골: '골로새서', 살전: '데살로니가전서', 살후: '데살로니가후서',
  딤전: '디모데전서', 딤후: '디모데후서', 딛: '디도서', 몬: '빌레몬서',
  히: '히브리서', 약: '야고보서', 벧전: '베드로전서', 벧후: '베드로후서',
  요일: '요한일서', 요이: '요한이서', 요삼: '요한삼서', 유: '유다서', 계: '요한계시록',
};

// Mapping from server book IDs (e.g., "GEN") to Korean abbreviations (e.g., "창")
export const BOOK_ID_TO_ABBR_KO: Record<string, string> = {
  GEN: '창', EXO: '출', LEV: '레', NUM: '민', DEU: '신',
  JOS: '수', JDG: '삿', RUT: '룻', '1SA': '삼상', '2SA': '삼하',
  '1KI': '왕상', '2KI': '왕하', '1CH': '대상', '2CH': '대하',
  EZR: '스', NEH: '느', EST: '에', JOB: '욥', PSA: '시',
  PRO: '잠', ECC: '전', SNG: '아', ISA: '사', JER: '렘',
  LAM: '애', EZK: '겔', DAN: '단', HOS: '호', JOL: '욜',
  AMO: '암', OBA: '옵', JON: '욘', MIC: '미', NAM: '나',
  HAB: '합', ZEP: '습', HAG: '학', ZEC: '슥', MAL: '말',
  MAT: '마', MRK: '막', LUK: '눅', JHN: '요', ACT: '행',
  ROM: '롬', '1CO': '고전', '2CO': '고후', GAL: '갈', EPH: '엡',
  PHP: '빌', COL: '골', '1TH': '살전', '2TH': '살후',
  '1TI': '딤전', '2TI': '딤후', TIT: '딛', PHM: '몬',
  HEB: '히', JAS: '약', '1PE': '벧전', '2PE': '벧후',
  '1JN': '요일', '2JN': '요이', '3JN': '요삼', JUD: '유', REV: '계',
};

export type ParsedChapterGroup = {
  bookAbbr: string;
  bookName: string;
  chapters: number[];
  label: string;
};

/**
 * Parses an array of server chapterRefs (e.g., ["GEN.1", "GEN.2", "EXO.1"])
 * and groups them by book into ParsedChapterGroup[].
 */
export const groupChapterRefs = (refs: string[]): ParsedChapterGroup[] => {
  const groups: ParsedChapterGroup[] = [];

  for (const ref of refs) {
    const dotIdx = ref.lastIndexOf('.');
    if (dotIdx === -1) continue;
    const bookId = ref.slice(0, dotIdx);
    const chapter = parseInt(ref.slice(dotIdx + 1), 10);
    if (isNaN(chapter)) continue;

    const bookAbbr = BOOK_ID_TO_ABBR_KO[bookId];
    if (!bookAbbr) continue;

    const last = groups[groups.length - 1];
    if (last && last.bookAbbr === bookAbbr) {
      last.chapters.push(chapter);
    } else {
      const bookName = BOOK_NAMES_KO[bookAbbr] ?? bookAbbr;
      groups.push({
        bookAbbr,
        bookName,
        chapters: [chapter],
        label: `${bookAbbr} ${chapter}`,
      });
    }
  }

  for (const group of groups) {
    const first = group.chapters[0];
    const last = group.chapters[group.chapters.length - 1];
    group.label =
      group.chapters.length === 1
        ? `${group.bookAbbr} ${first}장`
        : `${group.bookAbbr} ${first}-${last}장`;
  }

  return groups;
};

/**
 * Parses a single chapterRef string like "GEN.1" into bookAbbr and chapters.
 * Used for CustomPlan refs which already use Korean abbreviations.
 */
export const parseBibleRef = (
  ref: string
): { bookAbbr: string; chapters: number[] } | null => {
  // Handle server format: "GEN.1"
  const dotIdx = ref.lastIndexOf('.');
  if (dotIdx !== -1) {
    const bookId = ref.slice(0, dotIdx);
    const chapter = parseInt(ref.slice(dotIdx + 1), 10);
    const bookAbbr = BOOK_ID_TO_ABBR_KO[bookId];
    if (bookAbbr && !isNaN(chapter)) {
      return { bookAbbr, chapters: [chapter] };
    }
  }

  // Handle Korean format: "창 1" or "창세기 1"
  const parts = ref.trim().split(/\s+/);
  if (parts.length >= 2) {
    const bookPart = parts.slice(0, -1).join('');
    const chapterPart = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(chapterPart)) {
      const abbr = Object.keys(BOOK_NAMES_KO).find(
        (k) => k === bookPart || BOOK_NAMES_KO[k] === bookPart
      );
      if (abbr) return { bookAbbr: abbr, chapters: [chapterPart] };
    }
  }

  return null;
};
