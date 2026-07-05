import { BadRequestException } from '@nestjs/common';

export const HAS_GUEST_COUNT_MESSAGE =
  'حداقل یک نفر (آقا یا بانو) باید برای رزرو وارد شود';

export function hasGuestCount(
  maleGuestCount: number | null | undefined,
  femaleGuestCount: number | null | undefined,
): boolean {
  return (maleGuestCount ?? 0) + (femaleGuestCount ?? 0) > 0;
}

export function assertHasGuestCount(
  maleGuestCount: number | null | undefined,
  femaleGuestCount: number | null | undefined,
): void {
  if (!hasGuestCount(maleGuestCount, femaleGuestCount)) {
    throw new BadRequestException(HAS_GUEST_COUNT_MESSAGE);
  }
}
