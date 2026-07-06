"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const reservation_event_util_1 = require("../src/reservations/reservation-event.util");
const prisma = new client_1.PrismaClient();
async function main() {
    const reservations = await prisma.reservation.findMany({
        select: { id: true },
        orderBy: { id: 'asc' },
    });
    let updated = 0;
    for (const reservation of reservations) {
        const before = await prisma.reservation.findUniqueOrThrow({
            where: { id: reservation.id },
            select: { presenceState: true },
        });
        const next = await (0, reservation_event_util_1.syncReservationPresenceState)(prisma, reservation.id);
        if (before.presenceState !== next) {
            updated += 1;
        }
    }
    console.log(`Backfilled presenceState for ${reservations.length} reservations (${updated} updated).`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=backfill-presence-state.js.map