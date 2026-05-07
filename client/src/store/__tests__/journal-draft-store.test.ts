import { describe, it, expect, beforeEach } from 'vitest';
import { useJournalDraftStore } from '../journal-draft-store';

const sampleVerse = {
  bookAbbr: 'Gen',
  bookName: '창세기',
  chapter: 1,
  verse: 1,
  text: '태초에 하나님이 천지를 창조하시니라',
};

describe('journal-draft-store', () => {
  beforeEach(() => {
    useJournalDraftStore.setState({ verses: [] });
  });

  it('initial state has empty verses', () => {
    expect(useJournalDraftStore.getState().verses).toEqual([]);
  });

  it('pushVerse adds a new verse', () => {
    useJournalDraftStore.getState().pushVerse(sampleVerse);
    expect(useJournalDraftStore.getState().verses).toEqual([sampleVerse]);
  });

  it('pushVerse deduplicates by bookAbbr+chapter+verse', () => {
    useJournalDraftStore.getState().pushVerse(sampleVerse);
    useJournalDraftStore.getState().pushVerse({ ...sampleVerse, text: '다른 번역본' });
    expect(useJournalDraftStore.getState().verses).toHaveLength(1);
    expect(useJournalDraftStore.getState().verses[0].text).toBe(sampleVerse.text);
  });

  it('pushVerse adds different verses', () => {
    const v2 = { ...sampleVerse, verse: 2, text: '땅이 혼돈하고 공허하며' };
    const v3 = { ...sampleVerse, chapter: 2, verse: 1, text: '천지와 만물이 다 이루어지니라' };
    useJournalDraftStore.getState().pushVerse(sampleVerse);
    useJournalDraftStore.getState().pushVerse(v2);
    useJournalDraftStore.getState().pushVerse(v3);
    expect(useJournalDraftStore.getState().verses).toHaveLength(3);
  });

  it('clearDraft empties verses', () => {
    useJournalDraftStore.getState().pushVerse(sampleVerse);
    useJournalDraftStore.getState().clearDraft();
    expect(useJournalDraftStore.getState().verses).toEqual([]);
  });
});
