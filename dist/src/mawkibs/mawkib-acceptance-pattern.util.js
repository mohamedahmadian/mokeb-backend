"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMawkibReservationFormConfig = buildMawkibReservationFormConfig;
exports.normalizeMawkibAcceptancePatternFields = normalizeMawkibAcceptancePatternFields;
exports.fixedStayEndDateString = fixedStayEndDateString;
exports.resolveReservationDatesForAcceptancePattern = resolveReservationDatesForAcceptancePattern;
exports.normalizeGuestCountsForAcceptancePattern = normalizeGuestCountsForAcceptancePattern;
exports.assertReservationMatchesAcceptancePattern = assertReservationMatchesAcceptancePattern;
exports.acceptancePatternErrorMessage = acceptancePatternErrorMessage;
const client_1 = require("@prisma/client");
const date_util_1 = require("../common/utils/date.util");
const mawkib_reservation_constants_1 = require("./mawkib-reservation.constants");
function buildMawkibReservationFormConfig(mawkib) {
    const isIndividual = mawkib.acceptanceType === client_1.MawkibAcceptanceType.Individual;
    const maleOnly = mawkib.maleCapacity > 0 && mawkib.femaleCapacity === 0;
    const femaleOnly = mawkib.femaleCapacity > 0 && mawkib.maleCapacity === 0;
    let defaultMaleGuestCount = null;
    let defaultFemaleGuestCount = null;
    if (isIndividual) {
        if (maleOnly) {
            defaultMaleGuestCount = 1;
            defaultFemaleGuestCount = 0;
        }
        else if (femaleOnly) {
            defaultMaleGuestCount = 0;
            defaultFemaleGuestCount = 1;
        }
    }
    const hideGuestCountForIndividual = isIndividual && (maleOnly || femaleOnly);
    const showGuestCountFields = !hideGuestCountForIndividual;
    const showMaleGuestCount = showGuestCountFields && mawkib.maleCapacity > 0;
    const showFemaleGuestCount = showGuestCountFields && mawkib.femaleCapacity > 0;
    const showReservationEndDatePicker = mawkib.stayDurationMode === client_1.MawkibStayDurationMode.Free;
    const showReservationStartDatePicker = mawkib.reservationStartMode === client_1.MawkibReservationStartMode.UserSelect;
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
function normalizeMawkibAcceptancePatternFields(input) {
    const acceptanceType = input.acceptanceType ?? client_1.MawkibAcceptanceType.Group;
    const stayDurationMode = input.stayDurationMode ?? client_1.MawkibStayDurationMode.Free;
    const reservationStartMode = input.reservationStartMode ?? client_1.MawkibReservationStartMode.UserSelect;
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
    if (stayDurationMode === client_1.MawkibStayDurationMode.Fixed) {
        const days = input.fixedStayDays;
        if (days == null || !Number.isInteger(days) || days < 1) {
            throw new Error('FIXED_STAY_DAYS_REQUIRED');
        }
        const maxDays = (0, mawkib_reservation_constants_1.effectiveMaxReservationDays)(input.maxReservationDays);
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
function fixedStayEndDateString(startDate, fixedStayDays) {
    return (0, date_util_1.formatDateOnly)((0, date_util_1.addDays)((0, date_util_1.parseDateOnly)(startDate), fixedStayDays));
}
function resolveReservationDatesForAcceptancePattern(mawkib, input) {
    let reservationDate = input.reservationDate;
    if (mawkib.reservationStartMode === client_1.MawkibReservationStartMode.CurrentDay) {
        reservationDate = (0, date_util_1.todayDateStringInAppTz)();
    }
    let reservationEndDate = input.reservationEndDate?.trim() || reservationDate;
    if (mawkib.stayDurationMode === client_1.MawkibStayDurationMode.Fixed) {
        const days = mawkib.fixedStayDays;
        if (days == null || days < 1) {
            throw new Error('MAWKIB_FIXED_STAY_NOT_CONFIGURED');
        }
        reservationEndDate = fixedStayEndDateString(reservationDate, days);
    }
    return { reservationDate, reservationEndDate };
}
function normalizeGuestCountsForAcceptancePattern(mawkib, maleGuestCount, femaleGuestCount) {
    if (mawkib.acceptanceType !== client_1.MawkibAcceptanceType.Individual) {
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
function assertReservationMatchesAcceptancePattern(mawkib, params) {
    const companionsText = params.companions?.trim();
    if (mawkib.acceptanceType === client_1.MawkibAcceptanceType.Individual) {
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
    }
    else {
        if (mawkib.maleCapacity === 0 && params.maleGuestCount !== 0) {
            throw new Error('GROUP_MALE_CAPACITY_ZERO');
        }
        if (mawkib.femaleCapacity === 0 && params.femaleGuestCount !== 0) {
            throw new Error('GROUP_FEMALE_CAPACITY_ZERO');
        }
    }
    if (mawkib.stayDurationMode === client_1.MawkibStayDurationMode.Fixed) {
        const days = mawkib.fixedStayDays;
        if (days == null || days < 1) {
            throw new Error('MAWKIB_FIXED_STAY_NOT_CONFIGURED');
        }
        const expectedEnd = fixedStayEndDateString(params.reservationDate, days);
        if (params.reservationEndDate !== expectedEnd) {
            throw new Error('FIXED_STAY_END_DATE_MISMATCH');
        }
    }
}
function acceptancePatternErrorMessage(code) {
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
//# sourceMappingURL=mawkib-acceptance-pattern.util.js.map