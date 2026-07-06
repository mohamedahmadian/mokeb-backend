import { PrismaClient } from '@prisma/client';
import { syncReservationPresenceState } from '../src/reservations/reservation-event.util';

const prisma = new PrismaClient();

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

    const next = await syncReservationPresenceState(prisma, reservation.id);

    if (before.presenceState !== next) {
      updated += 1;
    }
  }

  console.log(
    `Backfilled presenceState for ${reservations.length} reservations (${updated} updated).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
