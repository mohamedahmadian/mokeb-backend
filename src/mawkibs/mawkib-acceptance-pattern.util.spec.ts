import {
  MawkibAcceptanceType,
  MawkibReservationStartMode,
  MawkibStayDurationMode,
} from '@prisma/client';
import {
  buildMawkibReservationFormConfig,
  fixedStayEndDateString,
  normalizeGuestCountsForAcceptancePattern,
  resolveReservationDatesForAcceptancePattern,
} from './mawkib-acceptance-pattern.util';

describe('mawkib acceptance pattern', () => {
  const baseMawkib = {
    acceptanceType: MawkibAcceptanceType.Group,
    stayDurationMode: MawkibStayDurationMode.Free,
    fixedStayDays: null,
    reservationStartMode: MawkibReservationStartMode.UserSelect,
    maleCapacity: 10,
    femaleCapacity: 5,
    maxReservationDays: 7,
  };

  it('builds form config for individual male-only mawkib', () => {
    const config = buildMawkibReservationFormConfig({
      ...baseMawkib,
      acceptanceType: MawkibAcceptanceType.Individual,
      femaleCapacity: 0,
    });
    expect(config.showGuestCountFields).toBe(false);
    expect(config.showCompanionsSection).toBe(false);
    expect(config.defaultMaleGuestCount).toBe(1);
    expect(config.defaultFemaleGuestCount).toBe(0);
  });

  it('shows guest count for individual mixed-gender mawkib', () => {
    const config = buildMawkibReservationFormConfig({
      ...baseMawkib,
      acceptanceType: MawkibAcceptanceType.Individual,
    });
    expect(config.showGuestCountFields).toBe(true);
    expect(config.showMaleGuestCount).toBe(true);
    expect(config.showFemaleGuestCount).toBe(true);
    expect(config.defaultMaleGuestCount).toBe(null);
    expect(config.defaultFemaleGuestCount).toBe(null);
  });

  it('hides female count when female capacity is zero in group mode', () => {
    const config = buildMawkibReservationFormConfig({
      ...baseMawkib,
      femaleCapacity: 0,
    });
    expect(config.showMaleGuestCount).toBe(true);
    expect(config.showFemaleGuestCount).toBe(false);
  });

  it('computes fixed stay end date', () => {
    expect(fixedStayEndDateString('2026-07-01', 3)).toBe('2026-07-04');
  });

  it('normalizes individual counts for female-only mawkib', () => {
    const result = normalizeGuestCountsForAcceptancePattern(
      {
        ...baseMawkib,
        acceptanceType: MawkibAcceptanceType.Individual,
        maleCapacity: 0,
      },
      5,
      0,
    );
    expect(result).toEqual({ maleGuestCount: 0, femaleGuestCount: 1 });
  });

  it('resolves current day start and fixed stay end', () => {
    const dates = resolveReservationDatesForAcceptancePattern(
      {
        ...baseMawkib,
        stayDurationMode: MawkibStayDurationMode.Fixed,
        fixedStayDays: 2,
        reservationStartMode: MawkibReservationStartMode.CurrentDay,
      },
      { reservationDate: '2020-01-01', reservationEndDate: '2020-01-01' },
    );
    expect(dates.reservationEndDate).toBe(
      fixedStayEndDateString(dates.reservationDate, 2),
    );
  });
});
