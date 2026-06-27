import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('iran')
  getIranLocations() {
    return this.locationsService.getIranLocations();
  }

  @Get('iran/provinces')
  getIranProvinces() {
    return this.locationsService.getIranProvinces();
  }

  @Get('iran/provinces/:province/cities')
  getIranCities(@Param('province') province: string) {
    return this.locationsService.getCitiesByProvince(decodeURIComponent(province));
  }
}
