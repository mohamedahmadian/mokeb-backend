import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    getIranLocations(): import("./locations.service").IranLocation[];
    getIranProvinces(): string[];
    getIranCities(province: string): string[];
}
