import {
  parseReservationIdLookup,
  rankReservationsByLookupQuery,
  scoreReservationLookupMatch,
} from './reservation-lookup.util';

function reservation(
  id: number,
  trackingCode: string,
  overrides: Partial<{
    pilgrimMobile: string;
    mobileNumber: string;
    nationalId: string;
  }> = {},
) {
  return {
    id,
    trackingCode,
    pilgrimMobile: overrides.pilgrimMobile ?? '09159103070',
    pilgrim: {
      mobileNumber: overrides.mobileNumber ?? '09159103070',
      nationalId: overrides.nationalId ?? '1234567890',
    },
  };
}

describe('reservation lookup ranking', () => {
  it('does not treat Iranian mobile numbers as reservation id lookups', () => {
    expect(parseReservationIdLookup('09159103071')).toBeNull();
    expect(parseReservationIdLookup('9159103071')).toBeNull();
    expect(parseReservationIdLookup('1234567890')).toBeNull();
    expect(parseReservationIdLookup('121')).toBe(121);
    expect(parseReservationIdLookup('2003')).toBe(2003);
  });

  it('prefers tracking sequence 2003 over 2004 when searching 2003', () => {
    const items = [reservation(2, '50415-2004'), reservation(1, '50415-2003')];

    const ranked = rankReservationsByLookupQuery(items, '2003');
    expect(ranked[0].trackingCode).toBe('50415-2003');
    expect(ranked).toHaveLength(1);
  });

  it('scores suffix match higher than fuzzy contains in date prefix', () => {
    const exact = scoreReservationLookupMatch(
      reservation(1, '50415-2003'),
      '2003',
    );
    const other = scoreReservationLookupMatch(
      reservation(2, '50415-2004'),
      '2003',
    );
    expect(exact).toBeGreaterThan(other);
  });
});
