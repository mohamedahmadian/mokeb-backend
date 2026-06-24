import { HonoraryVolunteerServiceType } from '@prisma/client';
export declare class UpdateHonoraryVolunteerApplicationDto {
    firstName?: string;
    lastName?: string;
    mobileNumber?: string;
    province?: string;
    city?: string;
    mawkibId?: number | null;
    description?: string;
    serviceTypes?: HonoraryVolunteerServiceType[];
    serviceDescription?: string;
    availabilityStartDate?: string;
    availabilityEndDate?: string;
    availabilityDescription?: string;
}
