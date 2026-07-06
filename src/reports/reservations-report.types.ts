import type { ReportCountItem } from './reports.service';

export interface ReservationsReportMawkibRow {
  mawkibId: number;
  mawkibName: string;
  capacity: number;
  reservationCount: number;
  confirmedCount: number;
  occupancyPercent: number;
  presentMaleGuests: number;
  presentFemaleGuests: number;
  presentTotalGuests: number;
}

export interface ReservationsReportPresence {
  presentMaleGuests: number;
  presentFemaleGuests: number;
  presentTotalGuests: number;
  temporarilyOutMaleGuests: number;
  temporarilyOutFemaleGuests: number;
  temporarilyOutTotalGuests: number;
  presentReservationCount: number;
  temporarilyOutReservationCount: number;
}

export interface ReservationsReportHighlights {
  mostReserved: ReservationsReportMawkibRow | null;
  leastReserved: ReservationsReportMawkibRow | null;
  mostPresent: ReservationsReportMawkibRow | null;
  fullCapacityMawkibs: ReservationsReportMawkibRow[];
  noReservationMawkibs: ReservationsReportMawkibRow[];
}

export interface ReservationsReportResponse {
  scope: 'all' | 'mine';
  summary: {
    total: number;
    confirmedCount: number;
    pendingCount: number;
    rejectedCount: number;
    cancelledCount: number;
    completedCount: number;
    expiredCount: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
    monthGrowthPercent: number | null;
    totalMaleGuests: number;
    totalFemaleGuests: number;
    todayMaleGuests: number;
    todayFemaleGuests: number;
    averageStayDays: number;
    pendingActionCount: number;
  };
  capacity: {
    totalCapacity: number;
    occupiedCapacity: number;
    remainingCapacity: number;
    occupancyPercent: number;
  };
  presence: ReservationsReportPresence;
  presenceBreakdown: ReportCountItem[];
  statusBreakdown: ReportCountItem[];
  genderBreakdown: ReportCountItem[];
  todayGenderBreakdown: ReportCountItem[];
  mawkibRows: ReservationsReportMawkibRow[];
  highlights: ReservationsReportHighlights;
  busyDays: ReportCountItem[];
  monthlyReservations: ReportCountItem[];
}
