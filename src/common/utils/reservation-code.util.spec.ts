import {
  formatJalaliYearPrefix,
  formatReservationTrackingCode,
  parseReservationTrackingCode,
  RESERVATION_TRACKING_SEQUENCE_MIN,
} from './reservation-code.util';

describe('reservation tracking code', () => {
  it('formats variable-width year prefix with yearly sequence from 1', () => {
    expect(formatJalaliYearPrefix(1405)).toBe('5');
    expect(formatJalaliYearPrefix(1412)).toBe('12');

    expect(
      formatReservationTrackingCode(
        { year: 1405, month: 1, day: 1 },
        RESERVATION_TRACKING_SEQUENCE_MIN,
      ),
    ).toBe('50101-1');

    expect(
      formatReservationTrackingCode(
        { year: 1405, month: 4, day: 15 },
        RESERVATION_TRACKING_SEQUENCE_MIN,
      ),
    ).toBe('50415-1');

    expect(
      formatReservationTrackingCode(
        { year: 1412, month: 1, day: 1 },
        42,
      ),
    ).toBe('120101-42');
  });

  it('parses codes using generation rules', () => {
    expect(parseReservationTrackingCode('50101-1', 1405)).toEqual({
      jalaliYear: 1405,
      month: 1,
      day: 1,
      sequence: 1,
    });

    expect(parseReservationTrackingCode('120415-7', 1412)).toEqual({
      jalaliYear: 1412,
      month: 4,
      day: 15,
      sequence: 7,
    });
  });

  it('rejects sequence below minimum', () => {
    expect(() =>
      formatReservationTrackingCode({ year: 1405, month: 1, day: 1 }, 0),
    ).toThrow();
  });
});
