import { describe, it, expect } from 'vitest';
import {
  BOOK_NAMES_KO,
  BOOK_ID_TO_ABBR_KO,
  groupChapterRefs,
  parseBibleRef,
} from '../bible-abbr-map';

describe('BOOK_NAMES_KO', () => {
  it('should have 66 books', () => {
    expect(Object.keys(BOOK_NAMES_KO)).toHaveLength(66);
  });

  it('should map abbreviation to full Korean name', () => {
    expect(BOOK_NAMES_KO['창']).toBe('창세기');
    expect(BOOK_NAMES_KO['계']).toBe('요한계시록');
    expect(BOOK_NAMES_KO['마']).toBe('마태복음');
  });
});

describe('BOOK_ID_TO_ABBR_KO', () => {
  it('should have 66 entries', () => {
    expect(Object.keys(BOOK_ID_TO_ABBR_KO)).toHaveLength(66);
  });

  it('should map server book IDs to Korean abbreviations', () => {
    expect(BOOK_ID_TO_ABBR_KO['GEN']).toBe('창');
    expect(BOOK_ID_TO_ABBR_KO['REV']).toBe('계');
    expect(BOOK_ID_TO_ABBR_KO['MAT']).toBe('마');
    expect(BOOK_ID_TO_ABBR_KO['1CO']).toBe('고전');
  });
});

describe('groupChapterRefs', () => {
  it('should group consecutive chapters of the same book', () => {
    const refs = ['GEN.1', 'GEN.2', 'GEN.3'];
    const groups = groupChapterRefs(refs);

    expect(groups).toHaveLength(1);
    expect(groups[0].bookAbbr).toBe('창');
    expect(groups[0].bookName).toBe('창세기');
    expect(groups[0].chapters).toEqual([1, 2, 3]);
    expect(groups[0].label).toBe('창세기 1-3장');
  });

  it('should create separate groups for different books', () => {
    const refs = ['GEN.50', 'EXO.1', 'EXO.2'];
    const groups = groupChapterRefs(refs);

    expect(groups).toHaveLength(2);
    expect(groups[0].bookName).toBe('창세기');
    expect(groups[0].label).toBe('창세기 50장');
    expect(groups[1].bookName).toBe('출애굽기');
    expect(groups[1].label).toBe('출애굽기 1-2장');
  });

  it('should handle single chapter', () => {
    const refs = ['PSA.23'];
    const groups = groupChapterRefs(refs);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('시편 23장');
  });

  it('should skip invalid refs', () => {
    const refs = ['INVALID', 'GEN.1', 'BAD.FORMAT'];
    const groups = groupChapterRefs(refs);

    expect(groups).toHaveLength(1);
    expect(groups[0].bookAbbr).toBe('창');
  });

  it('should return empty array for empty input', () => {
    expect(groupChapterRefs([])).toEqual([]);
  });
});

describe('parseBibleRef', () => {
  it('should parse server format (e.g., GEN.1)', () => {
    const result = parseBibleRef('GEN.1');

    expect(result).not.toBeNull();
    expect(result!.bookAbbr).toBe('창');
    expect(result!.chapters).toEqual([1]);
  });

  it('should parse Korean abbreviation format', () => {
    const result = parseBibleRef('창 1');

    expect(result).not.toBeNull();
    expect(result!.bookAbbr).toBe('창');
    expect(result!.chapters).toEqual([1]);
  });

  it('should parse full Korean name format', () => {
    const result = parseBibleRef('창세기 1');

    expect(result).not.toBeNull();
    expect(result!.bookAbbr).toBe('창');
    expect(result!.chapters).toEqual([1]);
  });

  it('should return null for invalid input', () => {
    expect(parseBibleRef('INVALID')).toBeNull();
    expect(parseBibleRef('')).toBeNull();
  });

  it('should handle multi-character book IDs', () => {
    const result = parseBibleRef('1CO.13');

    expect(result).not.toBeNull();
    expect(result!.bookAbbr).toBe('고전');
    expect(result!.chapters).toEqual([13]);
  });
});
