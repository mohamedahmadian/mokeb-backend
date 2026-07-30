import { MawkibAcceptanceType, MawkibReservationStartMode, MawkibStayDurationMode, UserGender } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ServantMawkibAccessService } from '../users/servant-mawkib-access.service';
import { UpsertUserFastReceptionPatternDto } from './dto/upsert-user-fast-reception-pattern.dto';
export type UserFastReceptionPatternResponse = {
    acceptanceType: MawkibAcceptanceType;
    stayDurationMode: MawkibStayDurationMode;
    fixedStayDays: number | null;
    reservationStartMode: MawkibReservationStartMode;
    individualGuestGender: UserGender | null;
    defaultMawkibId: number | null;
    defaultMawkibName: string | null;
    formShowNationalId: boolean;
    formShowPassportNumber: boolean;
    formShowReservationCode: boolean;
    formShowCarPlate: boolean;
    formShowGender: boolean;
    formShowPassword: boolean;
    formShowLocation: boolean;
    formShowNationalIdCardImage: boolean;
    formShowBirthDate: boolean;
    formShowTravelOrigin: boolean;
    formShowDescription: boolean;
    updatedAt: string | null;
};
export declare class FastReceptionPatternService {
    private prisma;
    private servantMawkibAccess;
    constructor(prisma: PrismaService, servantMawkibAccess: ServantMawkibAccessService);
    private assertCanManagePattern;
    private assertMawkibAccess;
    private normalizeDto;
    private toResponse;
    private patternInclude;
    getMine(user: AuthUser): Promise<UserFastReceptionPatternResponse>;
    upsertMine(user: AuthUser, dto: UpsertUserFastReceptionPatternDto): Promise<UserFastReceptionPatternResponse>;
}
