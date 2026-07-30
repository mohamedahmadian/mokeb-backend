import type { AuthUser } from '../common/decorators/current-user.decorator';
import { UpsertUserFastReceptionPatternDto } from './dto/upsert-user-fast-reception-pattern.dto';
import { FastReceptionPatternService } from './fast-reception-pattern.service';
export declare class FastReceptionPatternController {
    private service;
    constructor(service: FastReceptionPatternService);
    getMine(user: AuthUser): Promise<import("./fast-reception-pattern.service").UserFastReceptionPatternResponse>;
    upsertMine(user: AuthUser, dto: UpsertUserFastReceptionPatternDto): Promise<import("./fast-reception-pattern.service").UserFastReceptionPatternResponse>;
}
