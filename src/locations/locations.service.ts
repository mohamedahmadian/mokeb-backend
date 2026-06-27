import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface IranLocation {
  province: string;
  cities: string[];
}

@Injectable()
export class LocationsService implements OnModuleInit {
  private readonly logger = new Logger(LocationsService.name);
  private locations: IranLocation[] = [];

  onModuleInit() {
    this.locations = this.loadLocations();
    this.logger.log(`Loaded ${this.locations.length} Iran provinces`);
  }

  getIranLocations(): IranLocation[] {
    return this.locations;
  }

  getIranProvinces(): string[] {
    return [...this.locations.map((item) => item.province)].sort((a, b) =>
      a.localeCompare(b, 'fa'),
    );
  }

  getCitiesByProvince(province: string): string[] {
    const found = this.locations.find((item) => item.province === province);
    if (!found) return [];
    return [...found.cities].sort((a, b) => a.localeCompare(b, 'fa'));
  }

  private loadLocations(): IranLocation[] {
    const candidates = [
      join(process.cwd(), 'data', 'iran-locations.json'),
      join(__dirname, '..', '..', 'data', 'iran-locations.json'),
    ];

    for (const filePath of candidates) {
      if (!existsSync(filePath)) continue;

      const raw = readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as unknown;

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error(`Invalid iran-locations.json at ${filePath}`);
      }

      return parsed as IranLocation[];
    }

    throw new Error(
      'iran-locations.json not found. Expected at backend/data/iran-locations.json',
    );
  }
}
