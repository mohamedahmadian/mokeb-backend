import { OnModuleInit } from '@nestjs/common';
export interface IranLocation {
    province: string;
    cities: string[];
}
export declare class LocationsService implements OnModuleInit {
    private readonly logger;
    private locations;
    onModuleInit(): void;
    getIranLocations(): IranLocation[];
    getIranProvinces(): string[];
    getCitiesByProvince(province: string): string[];
    private loadLocations;
}
