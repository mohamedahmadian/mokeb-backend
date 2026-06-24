import { randomBytes } from 'crypto';

export function generateHonoraryVolunteerTrackingCode(): string {
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase();
  return `KHD-${stamp}-${suffix}`;
}
