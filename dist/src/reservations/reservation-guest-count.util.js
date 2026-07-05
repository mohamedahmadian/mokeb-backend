"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAS_GUEST_COUNT_MESSAGE = void 0;
exports.hasGuestCount = hasGuestCount;
exports.assertHasGuestCount = assertHasGuestCount;
const common_1 = require("@nestjs/common");
exports.HAS_GUEST_COUNT_MESSAGE = 'حداقل یک نفر (آقا یا بانو) باید برای رزرو وارد شود';
function hasGuestCount(maleGuestCount, femaleGuestCount) {
    return (maleGuestCount ?? 0) + (femaleGuestCount ?? 0) > 0;
}
function assertHasGuestCount(maleGuestCount, femaleGuestCount) {
    if (!hasGuestCount(maleGuestCount, femaleGuestCount)) {
        throw new common_1.BadRequestException(exports.HAS_GUEST_COUNT_MESSAGE);
    }
}
//# sourceMappingURL=reservation-guest-count.util.js.map