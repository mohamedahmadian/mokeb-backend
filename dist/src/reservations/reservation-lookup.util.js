"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSTGRES_INT4_MAX = void 0;
exports.trackingCodeSequence = trackingCodeSequence;
exports.parseReservationIdLookup = parseReservationIdLookup;
exports.scoreReservationLookupMatch = scoreReservationLookupMatch;
exports.rankReservationsByLookupQuery = rankReservationsByLookupQuery;
function trackingCodeSequence(trackingCode) {
    const dash = trackingCode.lastIndexOf('-');
    if (dash < 0)
        return null;
    return trackingCode.slice(dash + 1);
}
exports.POSTGRES_INT4_MAX = 2_147_483_647;
function parseReservationIdLookup(query) {
    const q = query.trim();
    if (!/^\d+$/.test(q))
        return null;
    if (q.length >= 10)
        return null;
    const id = Number.parseInt(q, 10);
    if (!Number.isFinite(id) || id <= 0 || id > exports.POSTGRES_INT4_MAX) {
        return null;
    }
    return id;
}
function scoreReservationLookupMatch(reservation, query) {
    const q = query.trim();
    if (!q)
        return 0;
    const code = reservation.trackingCode;
    const lowerQ = q.toLowerCase();
    const lowerCode = code.toLowerCase();
    if (lowerCode === lowerQ)
        return 1000;
    const suffix = trackingCodeSequence(code);
    if (suffix === q)
        return 950;
    if (lowerCode.endsWith(`-${q}`))
        return 900;
    const id = parseReservationIdLookup(q);
    if (id != null && reservation.id === id)
        return 850;
    if (lowerCode.includes(lowerQ))
        return 100;
    const mobile = reservation.pilgrimMobile ?? '';
    const pilgrimMobile = reservation.pilgrim?.mobileNumber ?? '';
    const nationalId = reservation.pilgrim?.nationalId ?? '';
    if (mobile === q || pilgrimMobile === q)
        return 500;
    if (nationalId === q)
        return 500;
    if (mobile.includes(q) || pilgrimMobile.includes(q))
        return 50;
    if (nationalId?.includes(q))
        return 50;
    return 0;
}
function rankReservationsByLookupQuery(reservations, query, exact = false) {
    const q = query.trim();
    if (!q || reservations.length === 0)
        return reservations;
    const scored = reservations.map((reservation) => ({
        reservation,
        score: scoreReservationLookupMatch(reservation, q),
    }));
    const isExactScore = (score) => score === 1000 || score === 850 || score === 500;
    const maxScore = Math.max(...scored.map((item) => item.score));
    const threshold = exact
        ? 500
        : maxScore >= 800
            ? 800
            : 1;
    return scored
        .filter((item) => item.score >= threshold && (!exact || isExactScore(item.score)))
        .sort((a, b) => b.score - a.score)
        .map((item) => item.reservation);
}
//# sourceMappingURL=reservation-lookup.util.js.map