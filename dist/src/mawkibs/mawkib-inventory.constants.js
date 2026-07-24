"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS = exports.MAWKIB_INVENTORY_OCCUPANCY_REVISION = exports.MAWKIB_INVENTORY_HORIZON_DAYS = void 0;
exports.MAWKIB_INVENTORY_HORIZON_DAYS = Number(process.env.MAWKIB_INVENTORY_HORIZON_DAYS ?? 90);
exports.MAWKIB_INVENTORY_OCCUPANCY_REVISION = 5;
exports.MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS = Number(process.env.MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS ?? 60_000);
//# sourceMappingURL=mawkib-inventory.constants.js.map