const { calculateReadingPlan, BIBLE_BOOKS, TOTAL_CHAPTERS } = require('../reading-plan-calculator');

describe('reading-plan-calculator', () => {
  describe('BIBLE_BOOKS', () => {
    it('should have 66 books', () => {
      expect(BIBLE_BOOKS).toHaveLength(66);
    });

    it('should have a total of 1189 chapters', () => {
      expect(TOTAL_CHAPTERS).toBe(1189);
    });

    it('should start with Genesis and end with Revelation', () => {
      expect(BIBLE_BOOKS[0].id).toBe('GEN');
      expect(BIBLE_BOOKS[65].id).toBe('REV');
    });
  });

  describe('calculateReadingPlan', () => {
    it('should create a plan covering all 1189 chapters', () => {
      const start = '2025-01-01';
      const end = '2025-12-31';
      const { days, chaptersPerDay } = calculateReadingPlan(start, end);

      const totalChapters = days.reduce((sum, d) => sum + d.chapterRefs.length, 0);
      expect(totalChapters).toBe(1189);
    });

    it('should set correct chaptersPerDay for a year plan', () => {
      const start = '2025-01-01';
      const end = '2025-12-31';
      const { chaptersPerDay } = calculateReadingPlan(start, end);

      // 1189 chapters / 365 days = ~3.26 -> ceil = 4
      expect(chaptersPerDay).toBe(Math.ceil(1189 / 365));
    });

    it('should assign correct day numbers and scheduled dates', () => {
      const start = '2025-01-01';
      const end = '2025-01-10';
      const { days } = calculateReadingPlan(start, end);

      expect(days[0].dayNumber).toBe(1);
      expect(days[1].dayNumber).toBe(2);

      const firstDate = new Date(days[0].scheduledDate);
      expect(firstDate.getFullYear()).toBe(2025);
      expect(firstDate.getMonth()).toBe(0);
      expect(firstDate.getDate()).toBe(1);
    });

    it('should mark all days as not completed', () => {
      const { days } = calculateReadingPlan('2025-01-01', '2025-06-30');

      for (const day of days) {
        expect(day.isCompleted).toBe(false);
      }
    });

    it('should use valid book.chapter format for refs', () => {
      const { days } = calculateReadingPlan('2025-01-01', '2025-12-31');

      for (const day of days) {
        for (const ref of day.chapterRefs) {
          expect(ref).toMatch(/^[A-Z0-9]+\.\d+$/);
        }
      }
    });

    it('should handle short duration (1 day)', () => {
      const { days, chaptersPerDay } = calculateReadingPlan('2025-01-01', '2025-01-01');

      expect(days).toHaveLength(1);
      expect(chaptersPerDay).toBe(1189);
      expect(days[0].chapterRefs).toHaveLength(1189);
    });
  });
});
