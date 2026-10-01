import { hoursFromMinutes } from './course-totals';

describe('hoursFromMinutes (TotalHoras)', () => {
  it.each([
    [0, '0.00'],
    [30, '0.50'],
    [90, '1.50'],
    [200, '3.33'], // 3,333... → 3,33
    [205, '3.42'], // 3,41666... → 3,42
    [10_000, '166.67'],
  ])('%i min = %s h', (minutes, hours) => {
    expect(hoursFromMinutes(minutes).toFixed(2)).toBe(hours);
  });
});
