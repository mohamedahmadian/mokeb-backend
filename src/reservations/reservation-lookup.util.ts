export function trackingCodeSequence(trackingCode: string): string | null {
  const dash = trackingCode.lastIndexOf('-');
  if (dash < 0) return null;
  return trackingCode.slice(dash + 1);
}

export function scoreReservationLookupMatch(
  reservation: {
    id: number;
    trackingCode: string;
    pilgrimMobile: string;
    pilgrim: { mobileNumber: string; nationalId?: string | null };
  },
  query: string,
): number {
  const q = query.trim();
  if (!q) return 0;

  const code = reservation.trackingCode;
  const lowerQ = q.toLowerCase();
  const lowerCode = code.toLowerCase();

  if (lowerCode === lowerQ) return 1000;

  const suffix = trackingCodeSequence(code);
  if (suffix === q) return 950;
  if (lowerCode.endsWith(`-${q}`)) return 900;

  const id = Number.parseInt(q, 10);
  if (Number.isFinite(id) && id > 0 && reservation.id === id) return 850;

  if (lowerCode.includes(lowerQ)) return 100;

  const mobile = reservation.pilgrimMobile ?? '';
  const pilgrimMobile = reservation.pilgrim?.mobileNumber ?? '';
  const nationalId = reservation.pilgrim?.nationalId ?? '';

  if (mobile === q || pilgrimMobile === q) return 500;
  if (nationalId === q) return 500;

  if (mobile.includes(q) || pilgrimMobile.includes(q)) return 50;
  if (nationalId?.includes(q)) return 50;

  return 0;
}

/** Prefer exact / sequence matches over fuzzy contains (e.g. 2003 vs 2004). */
export function rankReservationsByLookupQuery<
  T extends {
    id: number;
    trackingCode: string;
    pilgrimMobile: string;
    pilgrim: { mobileNumber: string; nationalId?: string | null };
  },
>(reservations: T[], query: string): T[] {
  const q = query.trim();
  if (!q || reservations.length === 0) return reservations;

  const scored = reservations.map((reservation) => ({
    reservation,
    score: scoreReservationLookupMatch(reservation, q),
  }));

  const maxScore = Math.max(...scored.map((item) => item.score));
  const threshold = maxScore >= 800 ? 800 : 1;

  return scored
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.reservation);
}
