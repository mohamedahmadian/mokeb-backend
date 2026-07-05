import type { MawkibInventoryService } from '../mawkibs/mawkib-inventory.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { ReservationsReportResponse } from './reservations-report.types';
export declare function buildReservationsReport(prisma: PrismaService, inventoryService: MawkibInventoryService, ownerUserId?: number): Promise<ReservationsReportResponse>;
