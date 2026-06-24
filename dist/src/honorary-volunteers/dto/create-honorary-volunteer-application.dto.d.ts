import { HonoraryVolunteerServiceType } from '@prisma/client';
export declare class CreateHonoraryVolunteerApplicationDto {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    password: string;
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
