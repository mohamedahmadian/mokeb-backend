"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHonoraryVolunteerTrackingCode = generateHonoraryVolunteerTrackingCode;
const crypto_1 = require("crypto");
function generateHonoraryVolunteerTrackingCode() {
    const suffix = (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase();
    const stamp = Date.now().toString(36).toUpperCase();
    return `KHD-${stamp}-${suffix}`;
}
//# sourceMappingURL=honorary-volunteer-code.util.js.map