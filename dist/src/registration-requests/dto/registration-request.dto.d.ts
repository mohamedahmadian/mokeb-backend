export declare class CreateRegistrationRequestDto {
    ownerName: string;
    phoneNumber: string;
    mawkibName: string;
    address: string;
    latitude?: number;
    longitude?: number;
    capacity: number;
    description?: string;
}
export declare class ReviewRegistrationRequestDto {
    status: 'Approved' | 'Rejected';
}
