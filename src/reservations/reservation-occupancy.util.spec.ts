import { parseDateOnly } from '../common/utils/date.util';
import {
  lastPlannedOccupiedDay,
  occupancyDaysDeltaOnEndDateChange,
  reservationOccupiedDays,
  reservationOccupiesDay,
} from './reservation-occupancy.util';

describe('reservation occupancy (checkout day exclusive)', () => {
  const guest1 = {
    reservationDate: parseDateOnly('2026-07-01'),
    reservationEndDate: parseDateOnly('2026-07-02'),
  };

  const guest2 = {
    reservationDate: parseDateOnly('2026-07-02'),
    reservationEndDate: parseDateOnly('2026-07-03'),
  };

  it('occupies only nights, not checkout day', () => {
    expect(reservationOccupiedDays(guest1).map((d) => d.toISOString())).toEqual([
      parseDateOnly('2026-07-01').toISOString(),
    ]);
    expect(reservationOccupiedDays(guest2).map((d) => d.toISOString())).toEqual([
      parseDateOnly('2026-07-02').toISOString(),
    ]);
  });

  it('counts only one guest on turnover day', () => {
    const day = parseDateOnly('2026-07-02');
    const occupied = [guest1, guest2].filter((r) =>
      reservationOccupiesDay(r, day),
    );
    expect(occupied).toHaveLength(1);
    expect(occupied[0]).toBe(guest2);
  });

  it('releases nights when end date moves earlier (early checkout)', () => {
    const reservationDate = parseDateOnly('2026-07-01');
    const previousEndDate = parseDateOnly('2026-07-04');
    const newEndDate = parseDateOnly('2026-07-02');

    const { released, occupied } = occupancyDaysDeltaOnEndDateChange(
      reservationDate,
      previousEndDate,
      newEndDate,
    );

    expect(released.map((d) => d.toISOString())).toEqual([
      parseDateOnly('2026-07-02').toISOString(),
      parseDateOnly('2026-07-03').toISOString(),
    ]);
    expect(occupied).toHaveLength(0);
    expect(
      lastPlannedOccupiedDay(reservationDate, previousEndDate).toISOString(),
    ).toBe(parseDateOnly('2026-07-03').toISOString());
  });

  it('releases check-in day when checkout happens on the same calendar day', () => {
    const reservationDate = parseDateOnly('2026-07-05');
    const previousEndDate = parseDateOnly('2026-07-06');
    const newEndDate = parseDateOnly('2026-07-05');

    const { released, occupied } = occupancyDaysDeltaOnEndDateChange(
      reservationDate,
      previousEndDate,
      newEndDate,
    );

    expect(released.map((d) => d.toISOString())).toEqual([
      parseDateOnly('2026-07-05').toISOString(),
    ]);
    expect(occupied).toHaveLength(0);
  });

  it('same-day checkout span occupies no inventory days', () => {
    const sameDay = {
      reservationDate: parseDateOnly('2026-07-05'),
      reservationEndDate: parseDateOnly('2026-07-05'),
    };

    expect(reservationOccupiedDays(sameDay)).toHaveLength(0);
    expect(reservationOccupiesDay(sameDay, parseDateOnly('2026-07-05'))).toBe(
      false,
    );
  });
});
