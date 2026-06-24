import { HonoraryVolunteerServiceType } from '@prisma/client';
export declare class CreateAuthenticatedVolunteerApplicationDto {
    mawkibId?: number;
    description?: string;
    serviceTypes: HonoraryVolunteerServiceType[];
    serviceDescription?: string;
    availabilityStartDate: string;
    availabilityEndDate: string;
    availabilityDescription?: string;
}
