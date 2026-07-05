import { ReportsService } from './reports.service';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getPilgrimsReport(user: AuthUser): Promise<import("./reports.service").PilgrimReportResponse>;
    getMawkibOwnersReport(user: AuthUser): Promise<import("./reports.service").MawkibOwnersReportResponse>;
    getMawkibsReport(user: AuthUser): Promise<import("./reports.service").MawkibsReportResponse>;
    getReservationsReport(user: AuthUser): Promise<import("./reservations-report.types").ReservationsReportResponse>;
}
