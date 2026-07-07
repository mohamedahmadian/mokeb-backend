import { ReservationPresenceState } from '@prisma/client';
import { appLocalDateTimeToUtc } from '../common/utils/date.util';
import { resolveAbsentRosterContext } from './attendance-roster.util';

describe('attendance roster absence duration reference', () => {
  it('interprets planned check-in in Tehran timezone (14:00 local = 10:30 UTC)', () => {
    const reference = appLocalDateTimeToUtc('2026-07-07', '14:00');
    expect(reference.toISOString()).toBe('2026-07-07T10:30:00.000Z');
  });

  it('uses reservation createdAt when later than planned check-in for NOT_ARRIVED', () => {
    const reservationDate = new Date('2026-07-07T00:00:00.000Z');
    const createdAt = new Date('2026-07-07T18:39:00.000Z');

    const context = resolveAbsentRosterContext(
      {
        reservationDate,
        plannedCheckInTime: '14:00',
        createdAt,
        presenceState: ReservationPresenceState.NOT_ARRIVED,
      },
      [],
    );

    expect(context?.absenceKind).toBe('NOT_ARRIVED');
    expect(context?.referenceAt?.toISOString()).toBe(createdAt.toISOString());
  });

  it('uses planned check-in when it is after reservation creation', () => {
    const reservationDate = new Date('2026-07-07T00:00:00.000Z');
    const createdAt = new Date('2026-07-07T08:00:00.000Z');

    const context = resolveAbsentRosterContext(
      {
        reservationDate,
        plannedCheckInTime: '14:00',
        createdAt,
        presenceState: ReservationPresenceState.NOT_ARRIVED,
      },
      [],
    );

    expect(context?.referenceAt?.toISOString()).toBe('2026-07-07T10:30:00.000Z');
  });
});
