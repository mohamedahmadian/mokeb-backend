import { Matches } from 'class-validator';

export const PIN_PASSWORD_REGEX = /^\d{4}$/;

export const PIN_PASSWORD_MESSAGE = 'رمز عبور باید ۴ رقم باشد';

export function IsPinPassword() {
  return Matches(PIN_PASSWORD_REGEX, { message: PIN_PASSWORD_MESSAGE });
}
