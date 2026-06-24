import { randomBytes } from 'crypto';

/**
 * Generates a human-readable reservation tracking code.
 * Formula may change in the future — keep generation isolated here.
 */
export function generateReservationTrackingCode(): string {
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase();
  return `MKB-${stamp}-${suffix}`;
}
