import { HonoraryVolunteerApplicantType, HonoraryVolunteerApplicationStatus, HonoraryVolunteerServiceType } from '@prisma/client';
export declare class HonoraryVolunteerFiltersDto {
    status?: HonoraryVolunteerApplicationStatus;
    applicantType?: HonoraryVolunteerApplicantType;
    serviceType?: HonoraryVolunteerServiceType;
    mawkibId?: number;
    search?: string;
    availabilityFrom?: string;
    availabilityTo?: string;
    createdFrom?: string;
    createdTo?: string;
}
