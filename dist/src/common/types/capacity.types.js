"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalCapacity = totalCapacity;
exports.totalAvailable = totalAvailable;
function totalCapacity(snapshot) {
    return snapshot.maleCapacity + snapshot.femaleCapacity;
}
function totalAvailable(snapshot) {
    return snapshot.availableMale + snapshot.availableFemale;
}
//# sourceMappingURL=capacity.types.js.map