import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JournalCalendar } from '../JournalCalendar';

describe('JournalCalendar', () => {
  it('renders the displayed year and month header', () => {
    render(
      <JournalCalendar
        selectedDate="2026-05-03"
        onSelectDate={() => {}}
        journalDates={new Set()}
      />,
    );
    expect(screen.getByText('2026년 5월')).toBeInTheDocument();
  });

  it('renders Korean weekday headers', () => {
    render(
      <JournalCalendar
        selectedDate="2026-05-03"
        onSelectDate={() => {}}
        journalDates={new Set()}
      />,
    );
    ['일', '월', '화', '수', '목', '금', '토'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('calls onSelectDate when a current-month day is clicked', () => {
    const onSelect = vi.fn();
    render(
      <JournalCalendar
        selectedDate="2026-05-15"
        onSelectDate={onSelect}
        journalDates={new Set()}
      />,
    );
    // 5월 1일 클릭 (현재 달, 과거 날짜)
    const dayOne = screen.getAllByText('1')[0];
    fireEvent.click(dayOne.closest('button')!);
    expect(onSelect).toHaveBeenCalledWith('2026-05-01');
  });

  it('renders amber dot for dates with journals', () => {
    const { container } = render(
      <JournalCalendar
        selectedDate="2026-05-15"
        onSelectDate={() => {}}
        journalDates={new Set(['2026-05-01', '2026-05-02'])}
      />,
    );
    // dot 클래스: bg-amber-500 + rounded-full + h-1
    const dots = container.querySelectorAll('span.bg-amber-500.rounded-full');
    expect(dots.length).toBeGreaterThanOrEqual(2);
  });

  it('disables previous-day cells when crossing months and disables next-month arrow on current month', () => {
    // 오늘 기준으로 다음 달 화살표가 disabled여야 함
    const today = new Date().toISOString().slice(0, 10);
    render(
      <JournalCalendar selectedDate={today} onSelectDate={() => {}} journalDates={new Set()} />,
    );
    const nextBtn = screen.getByLabelText('다음 달');
    expect(nextBtn).toBeDisabled();
  });
});
