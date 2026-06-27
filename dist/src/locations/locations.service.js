"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LocationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
let LocationsService = LocationsService_1 = class LocationsService {
    logger = new common_1.Logger(LocationsService_1.name);
    locations = [];
    onModuleInit() {
        this.locations = this.loadLocations();
        this.logger.log(`Loaded ${this.locations.length} Iran provinces`);
    }
    getIranLocations() {
        return this.locations;
    }
    getIranProvinces() {
        return [...this.locations.map((item) => item.province)].sort((a, b) => a.localeCompare(b, 'fa'));
    }
    getCitiesByProvince(province) {
        const found = this.locations.find((item) => item.province === province);
        if (!found)
            return [];
        return [...found.cities].sort((a, b) => a.localeCompare(b, 'fa'));
    }
    loadLocations() {
        const candidates = [
            (0, path_1.join)(process.cwd(), 'data', 'iran-locations.json'),
            (0, path_1.join)(__dirname, '..', '..', 'data', 'iran-locations.json'),
        ];
        for (const filePath of candidates) {
            if (!(0, fs_1.existsSync)(filePath))
                continue;
            const raw = (0, fs_1.readFileSync)(filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                throw new Error(`Invalid iran-locations.json at ${filePath}`);
            }
            return parsed;
        }
        throw new Error('iran-locations.json not found. Expected at backend/data/iran-locations.json');
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = LocationsService_1 = __decorate([
    (0, common_1.Injectable)()
], LocationsService);
//# sourceMappingURL=locations.service.js.map