import { HonoraryVolunteerServiceType } from '@prisma/client';
export declare class CreateMawkibNeedDto {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    province?: string;
    city?: string;
    mawkibId?: number;
    description?: string;
    serviceTypes: HonoraryVolunteerServiceType[];
    serviceDescription?: string;
    availabilityStartDate: string;
    availabilityEndDate: string;
    availabilityDescription?: string;
}
