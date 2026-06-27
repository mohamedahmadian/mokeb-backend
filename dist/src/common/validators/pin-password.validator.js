"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIN_PASSWORD_MESSAGE = exports.PIN_PASSWORD_REGEX = void 0;
exports.IsPinPassword = IsPinPassword;
const class_validator_1 = require("class-validator");
exports.PIN_PASSWORD_REGEX = /^\d{4}$/;
exports.PIN_PASSWORD_MESSAGE = 'رمز عبور باید ۴ رقم باشد';
function IsPinPassword() {
    return (0, class_validator_1.Matches)(exports.PIN_PASSWORD_REGEX, { message: exports.PIN_PASSWORD_MESSAGE });
}
//# sourceMappingURL=pin-password.validator.js.map