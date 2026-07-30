import { PrismaService } from '../prisma/prisma.service';
export declare class ServantMawkibAccessService {
    private prisma;
    constructor(prisma: PrismaService);
    getAccessibleMawkibIds(servantUserId: number): Promise<number[]>;
    hasAccess(servantUserId: number, mawkibId: number): Promise<boolean>;
}
