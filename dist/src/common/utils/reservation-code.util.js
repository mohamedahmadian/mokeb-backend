"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReservationTrackingCode = generateReservationTrackingCode;
const crypto_1 = require("crypto");
function generateReservationTrackingCode() {
    const suffix = (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase();
    const stamp = Date.now().toString(36).toUpperCase();
    return `MKB-${stamp}-${suffix}`;
}
//# sourceMappingURL=reservation-code.util.js.map