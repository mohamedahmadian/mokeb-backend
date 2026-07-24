/** How many days ahead inventory rows are maintained and queryable. */
export const MAWKIB_INVENTORY_HORIZON_DAYS = Number(
  process.env.MAWKIB_INVENTORY_HORIZON_DAYS ?? 90,
);

/** Bump when reservation day-occupancy rules change (triggers one-time inventory rebuild). */
export const MAWKIB_INVENTORY_OCCUPANCY_REVISION = 5;

/** Interactive transaction timeout for bulk inventory rebuilds (ms). */
export const MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS = Number(
  process.env.MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS ?? 60_000,
);
