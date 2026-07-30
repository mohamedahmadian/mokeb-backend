import {
  MawkibAcceptanceType,
  MawkibReservationStartMode,
  MawkibStayDurationMode,
} from '@prisma/client';
import {
  addDays,
  formatDateOnly,
  parseDateOnly,
  todayDateStringInAppTz,
} from '../common/utils/date.util';
import { effectiveMaxReservationDays } from './mawkib-reservation.constants';

export type MawkibAcceptancePatternSource = {
  acceptanceType: MawkibAcceptanceType;
  stayDurationMode: MawkibStayDurationMode;
  fixedStayDays: number | null;
  reservationStartMode: MawkibReservationStartMode;
  maleCapacity: number;
  femaleCapacity: number;
  maxReservationDays?: number | null;
  formShowNationalId?: boolean;
  formShowPassportNumber?: boolean;
  formShowReservationCode?: boolean;
  formShowCarPlate?: boolean;
  formShowGender?: boolean;
  formShowPassword?: boolean;
  formShowLocation?: boolean;
  formShowNationalIdCardImage?: boolean;
};

export type MawkibReservationFormConfig = {
  acceptanceType: MawkibAcceptanceType;
  stayDurationMode: MawkibStayDurationMode;
  fixedStayDays: number | null;
  reservationStartMode: MawkibReservationStartMode;
  showMaleGuestCount: boolean;
  showFemaleGuestCount: boolean;
  showGuestCountFields: boolean;
  showCompanionsSection: boolean;
  showReservationStartDatePicker: boolean;
  showReservationEndDatePicker: boolean;
  defaultMaleGuestCount: number | null;
  defaultFemaleGuestCount: number | null;
  showNationalIdField: boolean;
  showPassportNumberField: boolean;
  showReservationCodeField: boolean;
  showCarPlateField: boolean;
  showGenderField: boolean;
  showPasswordField: boolean;
  showLocationFields: boolean;
  showNationalIdCardImageField: boolean;
};

export function buildMawkibReservationFormConfig(
  mawkib: MawkibAcceptancePatternSource,
): MawkibReservationFormConfig {
  const isIndividual = mawkib.acceptanceType === MawkibAcceptanceType.Individual;
  const maleOnly = mawkib.maleCapacity > 0 && mawkib.femaleCapacity === 0;
  const femaleOnly = mawkib.femaleCapacity > 0 && mawkib.maleCapacity === 0;

  let defaultMaleGuestCount: number | null = null;
  let defaultFemaleGuestCount: number | null = null;

  if (isIndividual) {
    if (maleOnly) {
      defaultMaleGuestCount = 1;
      defaultFemaleGuestCount = 0;
    } else if (femaleOnly) {
      defaultMaleGuestCount = 0;
      defaultFemaleGuestCount = 1;
    }
  }

  const hideGuestCountForIndividual =
    isIndividual && (maleOnly || femaleOnly);
  const showGuestCountFields = !hideGuestCountForIndividual;
  const showMaleGuestCount =
    showGuestCountFields && mawkib.maleCapacity > 0;
  const showFemaleGuestCount =
    showGuestCountFields && mawkib.femaleCapacity > 0;

  const showReservationEndDatePicker =
    mawkib.stayDurationMode === MawkibStayDurationMode.Free;
  const showReservationStartDatePicker =
    mawkib.reservationStartMode === MawkibReservationStartMode.UserSelect;

  return {
    acceptanceType: mawkib.acceptanceType,
    stayDurationMode: mawkib.stayDurationMode,
    fixedStayDays: mawkib.fixedStayDays,
    reservationStartMode: mawkib.reservationStartMode,
    showMaleGuestCount,
    showFemaleGuestCount,
    showGuestCountFields,
    showCompanionsSection: !isIndividual,
    showReservationStartDatePicker,
    showReservationEndDatePicker,
    defaultMaleGuestCount,
    defaultFemaleGuestCount,
    showNationalIdField: mawkib.formShowNationalId === true,
    showPassportNumberField: mawkib.formShowPassportNumber === true,
    showReservationCodeField: mawkib.formShowReservationCode === true,
    showCarPlateField: mawkib.formShowCarPlate === true,
    showGenderField: mawkib.formShowGender === true,
    showPasswordField: mawkib.formShowPassword === true,
    showLocationFields: mawkib.formShowLocation === true,
    showNationalIdCardImageField: mawkib.formShowNationalIdCardImage === true,
  };
}

export function normalizeMawkibAcceptancePatternFields(input: {
  acceptanceType?: MawkibAcceptanceType;
  stayDurationMode?: MawkibStayDurationMode;
  fixedStayDays?: number | null;
  reservationStartMode?: MawkibReservationStartMode;
  maxReservationDays?: number | null;
  formShowNationalId?: boolean;
  formShowPassportNumber?: boolean;
  formShowReservationCode?: boolean;
  formShowCarPlate?: boolean;
  formShowGender?: boolean;
  formShowPassword?: boolean;
  formShowLocation?: boolean;
  formShowNationalIdCardImage?: boolean;
}): {
  acceptanceType: MawkibAcceptanceType;
  stayDurationMode: MawkibStayDurationMode;
  fixedStayDays: number | null;
  reservationStartMode: MawkibReservationStartMode;
  formShowNationalId: boolean;
  formShowPassportNumber: boolean;
  formShowReservationCode: boolean;
  formShowCarPlate: boolean;
  formShowGender: boolean;
  formShowPassword: boolean;
  formShowLocation: boolean;
  formShowNationalIdCardImage: boolean;
} {
  const acceptanceType =
    input.acceptanceType ?? MawkibAcceptanceType.Group;
  const stayDurationMode =
    input.stayDurationMode ?? MawkibStayDurationMode.Free;
  const reservationStartMode =
    input.reservationStartMode ?? MawkibReservationStartMode.UserSelect;

  const formFieldDefaults = {
    formShowNationalId: input.formShowNationalId ?? false,
    formShowPassportNumber: input.formShowPassportNumber ?? false,
    formShowReservationCode: input.formShowReservationCode ?? false,
    formShowCarPlate: input.formShowCarPlate ?? false,
    formShowGender: input.formShowGender ?? false,
    formShowPassword: input.formShowPassword ?? false,
    formShowLocation: input.formShowLocation ?? false,
    formShowNationalIdCardImage: input.formShowNationalIdCardImage ?? false,
  };

  if (stayDurationMode === MawkibStayDurationMode.Fixed) {
    const days = input.fixedStayDays;
    if (days == null || !Number.isInteger(days) || days < 1) {
      throw new Error('FIXED_STAY_DAYS_REQUIRED');
    }
    const maxDays = effectiveMaxReservationDays(input.maxReservationDays);
    if (days > maxDays) {
      throw new Error('FIXED_STAY_DAYS_EXCEEDS_MAX');
    }
    return {
      acceptanceType,
      stayDurationMode,
      fixedStayDays: days,
      reservationStartMode,
      ...formFieldDefaults,
    };
  }

  return {
    acceptanceType,
    stayDurationMode,
    fixedStayDays: null,
    reservationStartMode,
    ...formFieldDefaults,
  };
}

export function fixedStayEndDateString(
  startDate: string,
  fixedStayDays: number,
): string {
  return formatDateOnly(addDays(parseDateOnly(startDate), fixedStayDays));
}

export function resolveReservationDatesForAcceptancePattern(
  mawkib: MawkibAcceptancePatternSource,
  input: { reservationDate: string; reservationEndDate?: string },
): { reservationDate: string; reservationEndDate: string } {
  let reservationDate = input.reservationDate;

  if (
    mawkib.reservationStartMode === MawkibReservationStartMode.CurrentDay
  ) {
    reservationDate = todayDateStringInAppTz();
  }

  let reservationEndDate =
    input.reservationEndDate?.trim() || reservationDate;

  if (mawkib.stayDurationMode === MawkibStayDurationMode.Fixed) {
    const days = mawkib.fixedStayDays;
    if (days == null || days < 1) {
      throw new Error('MAWKIB_FIXED_STAY_NOT_CONFIGURED');
    }
    reservationEndDate = fixedStayEndDateString(reservationDate, days);
  }

  return { reservationDate, reservationEndDate };
}

export function normalizeGuestCountsForAcceptancePattern(
  mawkib: MawkibAcceptancePatternSource,
  maleGuestCount: number,
  femaleGuestCount: number,
): { maleGuestCount: number; femaleGuestCount: number } {
  if (mawkib.acceptanceType !== MawkibAcceptanceType.Individual) {
    return { maleGuestCount, femaleGuestCount };
  }

  const maleOnly = mawkib.maleCapacity > 0 && mawkib.femaleCapacity === 0;
  const femaleOnly = mawkib.femaleCapacity > 0 && mawkib.maleCapacity === 0;

  if (maleOnly) {
    return { maleGuestCount: 1, femaleGuestCount: 0 };
  }
  if (femaleOnly) {
    return { maleGuestCount: 0, femaleGuestCount: 1 };
  }

  return { maleGuestCount, femaleGuestCount };
}

export function assertReservationMatchesAcceptancePattern(
  mawkib: MawkibAcceptancePatternSource,
  params: {
    maleGuestCount: number;
    femaleGuestCount: number;
    companions?: string | null;
    reservationDate: string;
    reservationEndDate: string;
  },
): void {
  const companionsText = params.companions?.trim();

  if (mawkib.acceptanceType === MawkibAcceptanceType.Individual) {
    if (companionsText) {
      throw new Error('INDIVIDUAL_NO_COMPANIONS');
    }
    const total = params.maleGuestCount + params.femaleGuestCount;
    if (total !== 1) {
      throw new Error('INDIVIDUAL_GUEST_COUNT');
    }
    if (mawkib.femaleCapacity === 0 && params.femaleGuestCount !== 0) {
      throw new Error('INDIVIDUAL_MALE_ONLY');
    }
    if (mawkib.maleCapacity === 0 && params.maleGuestCount !== 0) {
      throw new Error('INDIVIDUAL_FEMALE_ONLY');
    }
  } else {
    if (mawkib.maleCapacity === 0 && params.maleGuestCount !== 0) {
      throw new Error('GROUP_MALE_CAPACITY_ZERO');
    }
    if (mawkib.femaleCapacity === 0 && params.femaleGuestCount !== 0) {
      throw new Error('GROUP_FEMALE_CAPACITY_ZERO');
    }
  }

  if (mawkib.stayDurationMode === MawkibStayDurationMode.Fixed) {
    const days = mawkib.fixedStayDays;
    if (days == null || days < 1) {
      throw new Error('MAWKIB_FIXED_STAY_NOT_CONFIGURED');
    }
    const expectedEnd = fixedStayEndDateString(
      params.reservationDate,
      days,
    );
    if (params.reservationEndDate !== expectedEnd) {
      throw new Error('FIXED_STAY_END_DATE_MISMATCH');
    }
  }
}

export function acceptancePatternErrorMessage(code: string): string {
  switch (code) {
    case 'FIXED_STAY_DAYS_REQUIRED':
      return 'برای مدت اقامت ثابت، تعداد روزها الزامی است';
    case 'FIXED_STAY_DAYS_EXCEEDS_MAX':
      return 'تعداد روزهای مدت اقامت ثابت نمی‌تواند بیشتر از حداکثر بازه رزرو باشد';
    case 'INDIVIDUAL_NO_COMPANIONS':
      return 'در پذیرش فردی امکان ثبت همراه وجود ندارد';
    case 'INDIVIDUAL_GUEST_COUNT':
      return 'در پذیرش فردی تعداد مهمان باید یک نفر باشد';
    case 'INDIVIDUAL_MALE_ONLY':
      return 'این موکب فقط ظرفیت آقایان دارد';
    case 'INDIVIDUAL_FEMALE_ONLY':
      return 'این موکب فقط ظرفیت بانوان دارد';
    case 'GROUP_MALE_CAPACITY_ZERO':
      return 'ظرفیت آقایان این موکب صفر است';
    case 'GROUP_FEMALE_CAPACITY_ZERO':
      return 'ظرفیت بانوان این موکب صفر است';
    case 'START_DATE_MUST_BE_TODAY':
      return 'تاریخ شروع رزرو باید روز جاری باشد';
    case 'FIXED_STAY_END_DATE_MISMATCH':
    case 'FIXED_STAY_DURATION_MISMATCH':
      return 'تاریخ پایان با مدت اقامت ثابت موکب همخوانی ندارد';
    case 'MAWKIB_FIXED_STAY_NOT_CONFIGURED':
      return 'مدت اقامت ثابت برای این موکب تنظیم نشده است';
    default:
      return 'تنظیمات الگوی پذیرش با اطلاعات رزرو سازگار نیست';
  }
}
