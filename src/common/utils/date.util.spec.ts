import {
  eachMealPlanDayInStay,
  eachOccupancyDayInStay,
  formatDateOnly,
  parseDateOnly,
} from './date.util';

describe('stay day ranges', () => {
  it('occupancy excludes checkout day', () => {
    const days = eachOccupancyDayInStay('2026-07-01', '2026-07-04');
    expect(days.map(formatDateOnly)).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
    ]);
  });

  it('meal plans include checkout day', () => {
    const days = eachMealPlanDayInStay('2026-07-01', '2026-07-04');
    expect(days.map(formatDateOnly)).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
    ]);
  });

  it('meal plans include same-day stay', () => {
    const days = eachMealPlanDayInStay('2026-07-05', '2026-07-05');
    expect(days.map(formatDateOnly)).toEqual(['2026-07-05']);
    expect(
      eachOccupancyDayInStay(
        parseDateOnly('2026-07-05'),
        parseDateOnly('2026-07-05'),
      ),
    ).toHaveLength(0);
  });
});
